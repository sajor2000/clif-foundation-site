// Site check against `next start -p 43139` (or SITE_URL; CHROME_PATH for the browser). Exits 1 on any failure. Run from the repo root: node scripts/checks/review-checks.mjs
const { chromium } = await import((process.argv[2] ?? process.cwd()) + "/node_modules/playwright-core/index.mjs");
const B = (process.env.SITE_URL ?? "http://127.0.0.1:43139"); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"}  ${n}${x ? " — " + x : ""}`);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const btn = (p) => p.locator(".site-menu-btn:visible");
const panelOpen = async (p) => (await p.locator(".site-menu-panel:visible").count()) > 0;
let p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await p.goto(B + "/board"); await p.waitForTimeout(800);
await btn(p).click(); await p.locator(".site-menu-panel:visible a[href='/support']").first().click(); await p.waitForURL(/support/); await p.waitForTimeout(800);
await p.goBack(); await p.waitForURL(/board/); await p.waitForTimeout(1000);
ok("Back to the page where the menu was opened does not reopen it", !(await panelOpen(p)) && (await btn(p).getAttribute("aria-expanded")) === "false");
await p.goto(B + "/support"); await p.waitForTimeout(800);
await btn(p).click(); await p.locator(".site-menu-panel:visible a[href='/support']").first().click(); await p.waitForTimeout(800);
ok("A link to the current page closes the menu", !(await panelOpen(p)));
await btn(p).click(); await p.locator(".site-menu-panel:visible a[href='/mission']").first().click(); await p.waitForURL(/mission/); await p.waitForTimeout(800);
await p.locator("a").filter({ hasText: /./ }).nth(5).focus(); const before = await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 60));
await p.keyboard.press("Escape"); await p.waitForTimeout(200);
const after = await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 60));
ok("Escape after navigating does not move focus", before === after, `${before} → ${after}`);
// No-JS: links reachable on mobile
const nojs = await (await b.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false })).newPage();
await nojs.goto(B + "/board"); await nojs.waitForTimeout(500);
ok("Without JavaScript the mobile nav links are visible", (await nojs.locator(".site-menu-panel a").first().isVisible()));
// Roster emphasis (desktop + stacked)
for (const w of [1280, 390]) {
  const t = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage(); await t.goto(B + "/board"); await t.waitForTimeout(600);
  const m = await t.evaluate(() => { const seat = getComputedStyle(document.querySelector(".board-roster__seat")); const name = getComputedStyle(document.querySelector(".board-roster__name")); return { seatW: seat.fontWeight, seatSize: seat.fontSize, nameW: name.fontWeight, nameSize: name.fontSize }; });
  ok(`Roster emphasis applies at ${w}px`, m.seatW === "500" && (w === 1280 ? m.seatSize === "18px" : m.nameSize === "17px" && m.nameW === "500"), JSON.stringify(m));
}
// Inquiry hint read once: outside label, referenced by aria-describedby
const f = await (await b.newContext()).newPage(); await f.goto(B + "/support"); await f.waitForTimeout(600);
const h = await f.evaluate(() => { const ta = document.getElementById("inquiry-message"); const hint = document.getElementById("inquiry-message-hint"); return { describedby: ta?.getAttribute("aria-describedby"), hintInsideLabel: !!hint?.closest("label"), labelText: ta?.labels?.[0]?.textContent?.trim() }; });
ok("Inquiry hint is announced once", h.describedby === "inquiry-message-hint" && !h.hintInsideLabel && h.labelText === "Message (optional)", JSON.stringify(h));
await b.close(); console.log(res.join("\n"));
if (res.some((l) => l.startsWith("FAIL"))) process.exitCode = 1;
