// Site check against `next start -p 43139` (or SITE_URL; CHROME_PATH for the browser). Exits 1 on any failure. Run from the repo root: node scripts/checks/r01.mjs
import { tmpdir } from "node:os";
const { chromium } = await import((process.argv[2] ?? process.cwd()) + "/node_modules/playwright-core/index.mjs");
const S = (process.argv[3] ?? tmpdir());
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const motion of ["no-preference", "reduce"]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: motion });
  await p.goto("http://127.0.0.1:43139/", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let worst = [];
  for (let y = 0; y < H; y += 360) {
    await p.mouse.wheel(0, 360); await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const vh = innerHeight; const hits = [];
      for (const el of document.querySelectorAll("main *")) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
        if (!own) continue;
        const rect = el.getBoundingClientRect(); if (rect.bottom < 80 || rect.top > vh - 20 || rect.width === 0) continue;
        let o = 1, n = el; while (n && n !== document.body) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
        if (o < 0.35) hits.push(`${(el.innerText||"").trim().slice(0,30)} (${o.toFixed(2)})`);
      }
      return { y: scrollY, hits };
    });
    if (r.hits.length) worst.push(`y=${r.y}: ${r.hits.length} faint — ${r.hits.slice(0,4).join(" | ")}`);
    if ([1440, 2880, 4320].includes(y)) await p.screenshot({ path: `${S}/r01-${motion}-${y}.png` });
  }
  // Mid-scrub fades are expected with motion on; under reduced motion nothing may be faint.
  if (motion === "reduce" && worst.length) process.exitCode = 1;
  console.log(`== ${motion}: ${worst.length} positions with faint in-view text`); worst.slice(0, 8).forEach((l) => console.log("  " + l));
  await p.close();
}
await b.close();
