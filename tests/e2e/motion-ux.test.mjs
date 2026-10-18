import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { DESKTOP, PHONE, open, scrollIntoAct, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

const PUBLIC_PAGES = ["/", "/mission", "/our-work", "/research", "/board", "/support"];

/** Resolves a CSS custom property to the computed colour it paints. */
async function cssColor(page, variable) {
  return page.evaluate((v) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${v})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }, variable);
}

// R1: hover only on devices whose primary pointer can hover finely.
test("every public hover rule is gated to fine pointers", async () => {
  for (const path of PUBLIC_PAGES) {
    const page = await open(path, DESKTOP);
    const ungated = await page.evaluate(() => {
      const out = [];
      const walk = (rules, gated) => {
        for (const r of rules) {
          if (r instanceof CSSMediaRule) {
            const c = r.conditionText || r.media.mediaText;
            walk(r.cssRules, gated || (/hover:\s*hover/.test(c) && /pointer:\s*fine/.test(c)));
          } else if (r.cssRules && !(r instanceof CSSStyleRule)) {
            walk(r.cssRules, gated);
          } else if (r instanceof CSSStyleRule && r.selectorText.includes(":hover")) {
            // Portal and Clerk rules are owned elsewhere and never render here.
            if (/\.portal-|\.cl-|file-selector-button/.test(r.selectorText)) continue;
            if (!gated) out.push(r.selectorText);
          }
        }
      };
      for (const sheet of document.styleSheets) {
        if (!sheet.href || !sheet.href.includes("/_next/")) continue;
        walk(sheet.cssRules, false);
      }
      return out;
    });
    assert.deepEqual(ungated, [], `${path}: ungated hover rules ${JSON.stringify(ungated)}`);
    await page.context().close();
  }
});

// R2: publication rows use the shared row-link hover, driven by CSS.
test("publication row titles take the link colour on hover", async () => {
  const page = await open("/research", DESKTOP);
  const title = page.locator(".sc-row-link__t").first();
  const duration = await title.evaluate((el) => getComputedStyle(el).transitionDuration);
  assert.notEqual(duration, "0s", "row-link transition tokens must resolve outside the home page");
  await title.hover();
  await page.waitForTimeout(350);
  assert.equal(
    await title.evaluate((el) => getComputedStyle(el).color),
    await cssColor(page, "--link"),
  );
  await page.context().close();
});

// R9: press feedback does not scale under reduced motion.
test("pressed controls do not scale under reduced motion", async () => {
  for (const [path, selector] of [
    ["/support", ".btn"],
    ["/support", ".copy-btn"],
    ["/research", ".chip"],
  ]) {
    const page = await open(path, DESKTOP, { reducedMotion: "reduce" });
    const el = page.locator(selector).first();
    await el.scrollIntoViewIfNeeded();
    await el.hover();
    await page.mouse.down();
    await page.waitForTimeout(50);
    const transform = await el.evaluate((e) => getComputedStyle(e).transform);
    await page.mouse.up();
    assert.equal(transform, "none", `${path} ${selector} scaled while pressed`);
    await page.context().close();
  }
});

// R5: the phone menu fades in, closes instantly, and works without JavaScript.
test("phone menu fades in on open and closes instantly", async () => {
  const page = await open("/mission", PHONE);
  const panel = page.locator(".site-menu-panel").first();
  await page.locator(".site-menu-btn").first().click();
  const early = await panel.evaluate(
    (el) => new Promise((r) => requestAnimationFrame(() => r(parseFloat(getComputedStyle(el).opacity)))),
  );
  assert.ok(early < 1, `panel was already at opacity ${early} on the first frame`);
  await page.waitForTimeout(400);
  assert.equal(await panel.evaluate((el) => getComputedStyle(el).opacity), "1");
  await page.keyboard.press("Escape");
  const display = await panel.evaluate(
    (el) => new Promise((r) => requestAnimationFrame(() => r(getComputedStyle(el).display))),
  );
  assert.equal(display, "none");
  await page.context().close();
});

test("Escape closes the phone menu after focus leaves the header", async () => {
  const page = await open("/mission", PHONE);
  await page.locator(".site-menu-btn").first().click();
  await page.locator("main a, main button").first().focus();
  await page.keyboard.press("Escape");
  const display = await page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() =>
          r([...document.querySelectorAll(".site-menu-panel")].some((el) => getComputedStyle(el).display !== "none")),
        ),
      ),
  );
  assert.equal(display, false, "a menu panel stayed open after Escape");
  await page.context().close();
});

test("phone menu links show at full opacity without JavaScript", async () => {
  const page = await open("/mission", PHONE, { javaScriptEnabled: false });
  const panel = page.locator(".site-menu-panel").first();
  assert.notEqual(await panel.evaluate((el) => getComputedStyle(el).display), "none");
  assert.equal(await panel.evaluate((el) => getComputedStyle(el).opacity), "1");
  await page.context().close();
});

test("phone menu is closed after navigating and going Back", async () => {
  const page = await open("/mission", PHONE);
  await page.locator(".site-menu-btn").first().click();
  await page.locator('.site-menu-panel a[href="/our-work"]').first().click();
  await page.waitForURL("**/our-work");
  await page.goBack();
  await page.waitForURL("**/mission");
  await page.waitForTimeout(300);
  const states = await page.$$eval(".site-menu-panel", (els) =>
    els
      .filter((el) => el.offsetParent !== null || getComputedStyle(el).display !== "none")
      .map((el) => el.getAttribute("data-open")),
  );
  assert.deepEqual(states, [], `a menu panel is still open: ${JSON.stringify(states)}`);
  await page.context().close();
});

// R3: chips keep their pressed fill while hovered.
test("a pressed filter chip keeps its fill on hover", async () => {
  const page = await open("/research", DESKTOP);
  const chip = page.locator(".chip").nth(1);
  await chip.click();
  assert.equal(await chip.getAttribute("aria-pressed"), "true");
  await chip.hover();
  await page.waitForTimeout(250);
  const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
  const probe = await page.evaluate(() => {
    const p = document.createElement("span");
    p.style.background = "var(--action-primary-bg)";
    document.body.append(p);
    const c = getComputedStyle(p).backgroundColor;
    p.remove();
    return c;
  });
  assert.equal(bg, probe);
  await page.context().close();
});

// R4: stable width, constant name, one announcement, no false success.
test("copy button keeps its width and name and announces the result", async () => {
  const page = await open("/support", DESKTOP, {
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const btn = page.getByRole("button", { name: "Copy email address" });
  const width = async () => (await btn.boundingBox()).width;
  const before = await width();
  await btn.click();
  await page.waitForTimeout(200);
  assert.equal(await width(), before);
  assert.equal(await page.getByRole("button", { name: "Copy email address" }).count(), 1);
  assert.equal((await page.locator(".copy-btn-status").textContent()).trim(), "Email address copied");
  // A second click restarts the reset window instead of being cut short.
  await page.waitForTimeout(1200);
  await btn.click();
  await page.waitForTimeout(1200);
  // 2400ms after the first click: past its window, inside the second one.
  const active = page.locator('.copy-btn__label[data-active="true"]');
  assert.equal((await active.textContent()).trim(), "Copied");
  assert.equal((await page.locator(".copy-btn-status").textContent()).trim(), "Email address copied");
  await page.waitForTimeout(900);
  assert.equal((await active.textContent()).trim(), "Copy email address");
  await page.context().close();
});

test("copy button resets after navigating away and back", async () => {
  const page = await open("/support", DESKTOP, {
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await page.getByRole("button", { name: "Copy email address" }).click();
  await page.waitForTimeout(100);
  await page.locator('header a[href="/mission"]').first().click();
  await page.waitForURL("**/mission");
  await page.goBack();
  await page.waitForURL("**/support");
  await page.waitForTimeout(2200);
  const active = page.locator('.copy-btn__label[data-active="true"]').first();
  assert.equal((await active.textContent()).trim(), "Copy email address");
  await page.context().close();
});

test("copy button reports a failed copy without claiming success", async () => {
  const page = await open("/support", DESKTOP, {
    initScript: () => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.reject(new Error("denied")) },
      });
    },
  });
  const btn = page.getByRole("button", { name: "Copy email address" });
  const before = (await btn.boundingBox()).width;
  await btn.click();
  await page.waitForTimeout(200);
  const status = (await page.locator(".copy-btn-status").textContent()).trim();
  assert.ok(!/copied/i.test(status), `status claimed success: ${status}`);
  assert.match(status, /failed/i);
  assert.equal((await btn.boundingBox()).width, before);
  await page.context().close();
});

// R6: inquiry status, one draft per submit, stable button.
async function inquiryPage(response) {
  const page = await open("/support", DESKTOP);
  let calls = 0;
  await page.route("**/api/inquiry", (route) => {
    calls += 1;
    route.fulfill({
      status: response.status,
      contentType: "application/json",
      body: JSON.stringify(response.body),
    });
  });
  await page.fill('input[name="name"]', "Test Person");
  return { page, calls: () => calls };
}

test("inquiry submit shows a status line and opens one draft", async () => {
  const { page, calls } = await inquiryPage({
    status: 200,
    body: { ok: true, mailto: "mailto:info@clificufoundation.org" },
  });
  const submit = page.getByRole("button", { name: /email draft|Preparing/ });
  const before = (await submit.boundingBox()).width;
  await submit.dblclick();
  await page.waitForTimeout(500);
  assert.equal(calls(), 1, "double click sent two inquiries");
  const status = page.locator('form [role="status"]');
  assert.match(await status.textContent(), /email app/i);
  assert.ok(!(await status.textContent()).includes(";"), "no semicolons in site copy");
  assert.equal((await submit.boundingBox()).width, before);
  await submit.click({ force: true });
  await page.waitForTimeout(300);
  assert.equal(calls(), 1, "a second click without an edit sent another inquiry");
  await page.fill('input[name="name"]', "Test Person 2");
  assert.equal((await status.textContent()).trim(), "");
  await page.context().close();
});

test("inquiry error shows without a status line", async () => {
  const { page } = await inquiryPage({ status: 400, body: { message: "Invalid inquiry" } });
  await page.getByRole("button", { name: /email draft/ }).click();
  await page.waitForTimeout(400);
  assert.match(await page.locator('form [role="alert"]').textContent(), /Invalid inquiry/);
  assert.equal((await page.locator('form [role="status"]').textContent()).trim(), "");
  await page.context().close();
});

// R7: no per-frame engine work at rest.
test("the home page schedules no animation frames while idle", async () => {
  const page = await open("/", DESKTOP, {
    initScript: () => {
      window.__raf = 0;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => {
        window.__raf += 1;
        return raf(cb);
      };
    },
  });
  await page.waitForTimeout(1500);
  const start = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(1000);
  const frames = (await page.evaluate(() => window.__raf)) - start;
  assert.ok(frames < 5, `${frames} animation frames requested in one idle second`);
  await page.context().close();
});

test("the ICU time cursor spans 0h to 72h", async () => {
  for (const viewport of [DESKTOP, PHONE]) {
    const page = await open("/", viewport);
    await page.locator(".icu-scrub").scrollIntoViewIfNeeded();
    const at = (p) =>
      page.evaluate((p) => {
        const fig = document.querySelector(".icu-scrub");
        fig.style.setProperty("--sc-p", String(p));
        const cursor = fig.querySelector(".icu-cursor").getBoundingClientRect();
        const ticks = [...fig.querySelectorAll("span")].filter((s) => /^\d+h$/.test(s.textContent.trim()));
        const first = ticks[0].getBoundingClientRect();
        const last = ticks[ticks.length - 1].getBoundingClientRect();
        return { x: cursor.left, start: first.left, end: last.right };
      }, p);
    const zero = await at(0);
    assert.ok(Math.abs(zero.x - zero.start) <= 2, `0h: cursor ${zero.x} vs tick ${zero.start}`);
    const full = await at(1);
    assert.ok(Math.abs(full.x - full.end) <= 2, `72h: cursor ${full.x} vs tick ${full.end}`);
    await page.context().close();
  }
});

// R8: reduced motion follows the OS setting live.
test("turning reduced motion on and off applies without a reload", async () => {
  const page = await open("/", DESKTOP);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(400);
  const reduced = await page.evaluate(() => ({
    p: getComputedStyle(document.getElementById("ch-federation")).getPropertyValue("--sc-p").trim(),
    unrevealed: document.querySelectorAll(".sc-home [data-sc-in]:not(.sc-in)").length,
    instances: window.ScrollCraft.instances.length,
  }));
  assert.equal(reduced.p, "1.000");
  assert.equal(reduced.unrevealed, 0);
  assert.equal(reduced.instances, 1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(200);
  await scrollIntoAct(page, "ch-federation", 0.3);
  const p = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.getElementById("ch-federation")).getPropertyValue("--sc-p")),
  );
  assert.ok(p > 0 && p < 1, `--sc-p ${p} does not follow scroll after turning reduced motion off`);
  assert.equal(await page.evaluate(() => window.ScrollCraft.instances.length), 1);
  await page.context().close();
});
