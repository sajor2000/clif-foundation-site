import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { DESKTOP, PHONE, open, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

const AXE = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const PAGES = ["/", "/mission", "/our-work", "/research", "/board", "/support"];
const NARROW = { width: 320, height: 700, isMobile: true, hasTouch: true };

for (const [name, viewport] of [
  ["desktop", DESKTOP],
  ["phone", PHONE],
  ["320px phone", NARROW],
]) {
  for (const scheme of ["light", "dark"]) {
    test(`no WCAG 2.1 A/AA violations or sideways scroll on a ${name} in ${scheme} mode`, async () => {
      const problems = [];
      for (const path of PAGES) {
        const page = await open(path, viewport, { colorScheme: scheme });
        const r = await page.evaluate(async (src) => {
          if (!window.axe) {
            const s = document.createElement("script");
            s.textContent = src;
            document.head.appendChild(s);
          }
          const res = await window.axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
          });
          return {
            violations: res.violations.map((v) => `${v.id}(${v.nodes.length})`),
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        }, AXE);
        if (r.violations.length || r.overflow > 1) problems.push({ path, ...r });
        await page.context().close();
      }
      assert.deepEqual(problems, []);
    });
  }
}

test("under reduced motion no in-view text on the home page is faint at any scroll position", async () => {
  const page = await open("/", { width: 1280, height: 720 }, { reducedMotion: "reduce" });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const faint = [];
  for (let y = 0; y < height; y += 360) {
    await page.mouse.wheel(0, 360);
    await page.waitForTimeout(300);
    const hits = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("main *")) {
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 80 || rect.top > innerHeight - 20 || rect.width === 0) continue;
        let opacity = 1;
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          opacity *= parseFloat(getComputedStyle(n).opacity);
        }
        if (opacity < 0.35) out.push(`${el.textContent.trim().slice(0, 30)} (${opacity.toFixed(2)})`);
      }
      return out;
    });
    if (hits.length) faint.push(`y=${y}: ${hits.slice(0, 3).join(" | ")}`);
  }
  assert.deepEqual(faint, []);
  await page.context().close();
});
