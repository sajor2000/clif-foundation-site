import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { DESKTOP, PHONE, open, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

async function visitThreePages(page) {
  await page.locator("header:visible a[href='/board']").first().click();
  await page.waitForURL("**/board");
  await page.locator("header:visible a[href='/support']").first().click();
  await page.waitForURL("**/support");
  await page.waitForTimeout(500);
}

test("element ids stay unique while visited pages stay mounted", async () => {
  const page = await open("/", DESKTOP);
  await visitThreePages(page);
  const dups = await page.evaluate(() => {
    const count = {};
    for (const el of document.querySelectorAll("[id]")) count[el.id] = (count[el.id] || 0) + 1;
    return Object.keys(count).filter((id) => count[id] > 1);
  });
  assert.deepEqual(dups, []);
  await page.context().close();
});

test("the skip link targets the visible page's main", async () => {
  const page = await open("/", DESKTOP);
  await visitThreePages(page);
  await page.keyboard.press("Tab");
  const href = await page.evaluate(
    () =>
      [...document.querySelectorAll("a.skip-link")]
        .find((a) => a === document.activeElement || a.getBoundingClientRect().height > 0)
        ?.getAttribute("href"),
  );
  assert.ok(href, "no skip link received focus");
  const visible = await page.evaluate(
    (h) => !!document.querySelector(h)?.getClientRects().length,
    href,
  );
  assert.equal(visible, true, `${href} is not the visible main`);
  await page.context().close();
});

test("the theme toggle on a navigated page flips the theme and its own state", async () => {
  const page = await open("/", DESKTOP);
  await visitThreePages(page);
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator("header:visible label.clif-theme-btn").click();
  const after = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    checked: [...document.querySelectorAll("header")]
      .find((h) => h.offsetParent !== null)
      ?.querySelector(".clif-theme-toggle")?.checked,
  }));
  assert.notEqual(after.theme, before);
  assert.equal(after.checked, after.theme === "dark");
  await page.context().close();
});

for (const [name, viewport] of [
  ["phone", PHONE],
  ["desktop", DESKTOP],
]) {
  test(`/support#give lands below the sticky header on a ${name}`, async () => {
    const page = await open("/support#give", viewport);
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => ({
      header: document.querySelector("header").getBoundingClientRect().bottom,
      heading: document.getElementById("give-heading").getBoundingClientRect().top,
    }));
    assert.ok(m.heading >= m.header, JSON.stringify(m));
    await page.context().close();
  });
}

test("program cards link to their sections and land below the header", async () => {
  const page = await open("/", DESKTOP);
  const hrefs = await page
    .locator("a.sc-program-card")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  assert.equal(hrefs.length, 4);
  for (const h of hrefs) assert.match(h, /^\/our-work#[a-z_]+$/);
  await page.goto(new URL(hrefs[1], page.url()).href);
  await page.waitForTimeout(800);
  const land = await page.evaluate(
    (id) => ({
      header: document.querySelector("header").getBoundingClientRect().bottom,
      top: document.getElementById(id).getBoundingClientRect().top,
    }),
    hrefs[1].split("#")[1],
  );
  assert.ok(land.top >= land.header && land.top < 400, JSON.stringify(land));
  await page.context().close();
});

test("the board roster is a table with a caption and headers", async () => {
  const page = await open("/board", DESKTOP);
  const t = await page.evaluate(() => {
    const table = document.querySelector("table.board-roster");
    return {
      rows: table?.tBodies[0].rows.length,
      colHeaders: table?.querySelectorAll("thead th[scope=col]").length,
      rowHeaders: table?.querySelectorAll("tbody th[scope=row]").length,
      caption: !!table?.caption?.textContent,
    };
  });
  assert.deepEqual(t, { rows: 9, colHeaders: 3, rowHeaders: 9, caption: true });
  await page.context().close();
});

for (const [name, viewport] of [
  ["desktop", DESKTOP],
  ["phone", PHONE],
]) {
  test(`roster seat and name emphasis applies on a ${name}`, async () => {
    const page = await open("/board", viewport);
    const m = await page.evaluate(() => {
      const seat = getComputedStyle(document.querySelector(".board-roster__seat"));
      const nameEl = getComputedStyle(document.querySelector(".board-roster__name"));
      return { seatWeight: seat.fontWeight, nameWeight: nameEl.fontWeight, nameSize: nameEl.fontSize };
    });
    assert.equal(m.seatWeight, "500");
    if (viewport === PHONE) assert.deepEqual([m.nameWeight, m.nameSize], ["500", "17px"]);
    await page.context().close();
  });
}

test("the inquiry hint sits outside the label and is announced once", async () => {
  const page = await open("/support", DESKTOP);
  const h = await page.evaluate(() => {
    const field = document.getElementById("inquiry-message");
    const hint = document.getElementById("inquiry-message-hint");
    return {
      describedby: field?.getAttribute("aria-describedby"),
      hintInsideLabel: !!hint?.closest("label"),
      label: field?.labels?.[0]?.textContent?.trim(),
    };
  });
  assert.deepEqual(h, {
    describedby: "inquiry-message-hint",
    hintInsideLabel: false,
    label: "Message (optional)",
  });
  await page.context().close();
});
