import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { DESKTOP, open, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

test("keyboard focus moves to the new page's main content after in-site navigation", async () => {
  const page = await open("/support", DESKTOP);
  await page.locator("header a[href='/mission']").first().focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/mission");
  await page.waitForTimeout(300);
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, insideMain: !!el?.closest("main"), id: el?.id };
  });
  assert.ok(focus.insideMain, `focus stayed on ${JSON.stringify(focus)}`);
  await page.context().close();
});
