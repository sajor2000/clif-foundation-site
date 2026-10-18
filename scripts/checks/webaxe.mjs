// Site check against `next start -p 43139` (or SITE_URL; CHROME_PATH for the browser). Exits 1 on any failure. Run from the repo root: node scripts/checks/webaxe.mjs
import { readFileSync } from "node:fs";
const { chromium } = await import((process.argv[2] ?? process.cwd()) + "/node_modules/playwright-core/index.mjs");
const AXE = readFileSync((process.argv[2] ?? process.cwd()) + "/node_modules/axe-core/axe.min.js", "utf8");
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let total = 0;
for (const vp of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) for (const scheme of ["light", "dark"]) for (const path of ["/", "/mission", "/our-work", "/research", "/board", "/support"]) {
  const p = await b.newPage({ viewport: vp, colorScheme: scheme }); await p.goto((process.env.SITE_URL ?? "http://127.0.0.1:43139") + path); await p.waitForTimeout(1200);
  const v = await p.evaluate(async (src) => { const s = document.createElement("script"); s.textContent = src; document.head.appendChild(s); const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }); return r.violations.map((x) => `${x.id}(${x.nodes.length}) ${x.nodes[0]?.target.join(" ")}`); }, AXE);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (v.length || overflow > 0) { total++; console.log(vp.width, scheme, path, v.join("; "), overflow > 0 ? `overflow ${overflow}` : ""); }
  await p.close();
}
console.log("pages with issues:", total); await b.close();
if (total) process.exitCode = 1;
