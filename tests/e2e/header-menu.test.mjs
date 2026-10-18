import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { DESKTOP, PHONE, open, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

// Next keeps visited pages mounted (hidden), so every locator targets the
// header that is actually on screen.
const button = (page) => page.locator("header:visible button.site-menu-btn");
const panel = (page) => page.locator("header:visible nav.site-menu-panel");
const panelOpen = async (page) => (await page.locator(".site-menu-panel:visible").count()) > 0;

test("the phone menu is a button that controls its own panel", async () => {
  const page = await open("/", PHONE);
  const btn = button(page);
  assert.equal(await btn.getAttribute("type"), "button");
  assert.equal(await panel(page).getAttribute("id"), await btn.getAttribute("aria-controls"));
  assert.equal(await btn.getAttribute("aria-expanded"), "false");
  assert.equal(await panel(page).isVisible(), false);
  await page.context().close();
});

test("Enter and Space open the menu, Escape closes it and returns focus", async () => {
  const page = await open("/", PHONE);
  const btn = button(page);
  await btn.focus();
  await page.keyboard.press("Enter");
  assert.equal(await btn.getAttribute("aria-expanded"), "true");
  assert.equal(await panel(page).isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await btn.getAttribute("aria-expanded"), "false");
  assert.equal(
    await page.evaluate(() => document.activeElement?.classList.contains("site-menu-btn")),
    true,
  );
  await btn.focus();
  await page.keyboard.press("Space");
  assert.equal(await btn.getAttribute("aria-expanded"), "true");
  await page.context().close();
});

test("a menu link to the current page closes the menu", async () => {
  const page = await open("/support", PHONE);
  await button(page).click();
  await page.locator(".site-menu-panel:visible a[href='/support']").first().click();
  await page.waitForTimeout(500);
  assert.equal(await panelOpen(page), false);
  await page.context().close();
});

test("a menu left open, then leaving by the logo and going Back, comes back closed", async () => {
  const page = await open("/support", PHONE);
  await button(page).click();
  await page.locator("header:visible .site-header-brand a").click();
  await page.waitForURL((url) => url.pathname === "/");
  await page.goBack();
  await page.waitForURL("**/support");
  await page.waitForTimeout(500);
  assert.equal(await panel(page).isVisible(), false);
  await page.context().close();
});

test("Escape after navigating does not move focus out of page content", async () => {
  const page = await open("/support", PHONE);
  await button(page).click();
  await page.locator(".site-menu-panel:visible a[href='/mission']").first().click();
  await page.waitForURL("**/mission");
  await page.waitForTimeout(500);
  await page.locator("main a").first().focus();
  const before = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80));
  await page.keyboard.press("Escape");
  const after = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80));
  assert.equal(after, before);
  await page.context().close();
});

test("widening the window with focus in the open menu keeps focus on the page", async () => {
  const page = await open("/support", PHONE);
  await button(page).click();
  await panel(page).locator("a").first().focus();
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.waitForTimeout(400);
  const visible = await page.evaluate(
    () =>
      !!document.activeElement &&
      document.activeElement !== document.body &&
      document.activeElement.getClientRects().length > 0,
  );
  assert.equal(visible, true);
  await page.context().close();
});

test("no phone menu panel shows on desktop after opening it on a phone", async () => {
  const page = await open("/", PHONE);
  await button(page).click();
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.locator("header:visible a[href='/board']").first().click();
  await page.waitForURL("**/board");
  await page.locator("header:visible label.clif-theme-btn").click();
  await page.locator("header:visible label.clif-theme-btn").click();
  await page.locator("header:visible a[href='/']").first().click();
  await page.waitForTimeout(600);
  const shown = await page.evaluate(() =>
    [...document.querySelectorAll("nav.site-menu-panel")].some((m) => m.offsetHeight > 0),
  );
  assert.equal(shown, false);
  await page.context().close();
});
