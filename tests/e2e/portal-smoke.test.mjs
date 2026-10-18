import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { DESKTOP, open, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

/**
 * Portal smoke: without Clerk keys the "unavailable" message appears.
 * Full auth flows require secrets and are not run in CI by default.
 */
test("/portal shows configure, sign-in, or workspace without crashing", async () => {
  const page = await open("/portal", DESKTOP);
  const expected =
    /Board portal unavailable|Board sign-in|Board workspace|Connecting|Board sign-in is not available/;
  // Wait for the portal to settle (Clerk loads client-side) instead of
  // reading the body before it has rendered.
  const settled = await page
    .waitForFunction((re) => new RegExp(re).test(document.body.innerText), expected.source, {
      timeout: 15000,
    })
    .then(() => true, () => false);
  const body = await page.locator("body").innerText();
  assert.ok(settled, `unexpected portal body: ${body.slice(0, 240)}`);
  await page.context().close();
});

test("/portal/reporting renders, or sends signed-out visitors to portal sign-in", async () => {
  const page = await open("/portal/reporting", DESKTOP);
  // A signed-out redirect may land after the first load event.
  await page
    .waitForURL((u) => u.pathname === "/portal/reporting" || u.pathname.startsWith("/portal/sign-in"), {
      timeout: 15000,
    })
    .catch(() => {});
  const url = new URL(page.url());
  // Without Clerk keys the route renders the configure notice in place; with
  // Clerk, signed-out visitors land on our sign-in page (not Clerk-hosted).
  const ok =
    url.pathname === "/portal/reporting" ||
    (url.pathname.startsWith("/portal/sign-in") &&
      url.searchParams.get("redirect_url")?.includes("/portal/reporting"));
  assert.ok(ok, `unexpected landing URL: ${page.url()}`);
  await page.context().close();
});
