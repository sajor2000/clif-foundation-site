import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { DESKTOP, open, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

/**
 * Portal smoke: without Clerk keys the configure message appears.
 * Full auth flows require secrets and are not run in CI by default.
 */
test("/portal shows configure, sign-in, or workspace without crashing", async () => {
  const page = await open("/portal", DESKTOP);
  const body = await page.locator("body").innerText();
  const ok =
    body.includes("Clerk not configured") ||
    body.includes("Board sign-in") ||
    body.includes("Board workspace") ||
    body.includes("Connecting") ||
    body.includes("Convex not configured");
  assert.ok(ok, `unexpected portal body: ${body.slice(0, 240)}`);
  await page.context().close();
});

test("/portal/reporting is reachable", async () => {
  const page = await open("/portal/reporting", DESKTOP);
  const status = page.url();
  assert.ok(status.includes("/portal/reporting"));
  await page.context().close();
});
