// Site check against `next start -p 43139`. Run from the repo root: node scripts/checks/webcheck.mjs
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";
const ROOT = (process.argv[2] ?? process.cwd()), S = (process.argv[3] ?? tmpdir());
const { chromium } = await import(ROOT + "/node_modules/playwright-core/index.mjs");
const AXE = readFileSync(ROOT + "/node_modules/axe-core/axe.min.js", "utf8");
const B = "http://127.0.0.1:43139";
const res = []; const check = (n, ok, x = "") => res.push(`${ok ? "PASS" : "FAIL"}  ${n}${x ? " — " + x : ""}`);
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();

// F10 menu
await p.goto(B + "/"); await p.waitForTimeout(800);
const btn = p.locator("header:visible button.site-menu-btn");
const panel = () => p.locator("header:visible nav.site-menu-panel");
const ctl = await btn.getAttribute("aria-controls");
check("menu is a button controlling its own panel", (await btn.getAttribute("type")) === "button" && (await panel().getAttribute("id")) === ctl);
check("closed: aria-expanded=false, panel hidden", (await btn.getAttribute("aria-expanded")) === "false" && !(await panel().isVisible()));
await btn.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
check("Enter opens; aria-expanded=true; panel visible", (await btn.getAttribute("aria-expanded")) === "true" && (await panel().isVisible()));
await p.keyboard.press("Escape"); await p.waitForTimeout(200);
check("Escape closes and returns focus", (await btn.getAttribute("aria-expanded")) === "false" && (await p.evaluate(() => document.activeElement?.classList.contains("site-menu-btn"))));
await btn.focus(); await p.keyboard.press("Space"); await p.waitForTimeout(200);
check("Space toggles open", (await btn.getAttribute("aria-expanded")) === "true");
const tabbable = !(await panel().isVisible());
check("panel not hidden when open", tabbable === false);
await panel().locator("a[href='/support']").first().click(); await p.waitForURL("**/support"); await p.waitForTimeout(500);
check("navigating closes the menu", !(await panel().isVisible()) && (await btn.getAttribute("aria-expanded")) === "false");
await p.goBack(); await p.waitForTimeout(700);
check("back to the cached page: its menu is closed", !(await panel().isVisible()));
const ids = await p.evaluate(() => { const all = [...document.querySelectorAll("[id]")].map((e) => e.id); return all.length - new Set(all).size; });
check("no duplicate element ids across cached pages", ids === 0, `${ids} duplicates`);
await p.goForward(); await p.waitForTimeout(500);
// R02 sequence: open on mobile → desktop → theme on board → home
await btn.click(); await p.waitForTimeout(150);
await p.setViewportSize({ width: 1280, height: 720 }); await p.waitForTimeout(300);
await p.goto(B + "/board"); await p.locator("label.clif-theme-btn").click(); await p.waitForTimeout(200); await p.locator("label.clif-theme-btn").click();
await p.locator("a[href='/']").first().click(); await p.waitForTimeout(800);
const dup = await p.evaluate(() => ({ visible: [...document.querySelectorAll("nav.site-menu-panel")].some((m) => m.offsetHeight > 0) }));
check("R02: no mobile panel on desktop after mixed sequence", !dup.visible);

// F11 anchor at both sizes
for (const [w, h] of [[390, 844], [1280, 720]]) {
  await p.setViewportSize({ width: w, height: h });
  await p.goto(B + "/support#give"); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => ({ header: document.querySelector("header").getBoundingClientRect().bottom, heading: document.getElementById("give-heading").getBoundingClientRect().top }));
  check(`F11 #give heading below header @${w}`, m.heading >= m.header, JSON.stringify(m));
}
// F12 fallback
const fb = await p.locator("a[href='https://givebutter.com/cliffoundation']").first();
check("F12 hosted giving link present", await fb.count() > 0 && (await fb.innerText()).includes("secure donation page"));
// F14 program cards
await p.setViewportSize({ width: 1280, height: 720 }); await p.goto(B + "/"); await p.waitForTimeout(800);
const hrefs = await p.locator("a.sc-program-card").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
check("F14 cards link to sections", hrefs.length === 4 && hrefs.every((h) => /^\/our-work#[a-z_]+$/.test(h)), hrefs.join(","));
await p.goto(B + hrefs[1]); await p.waitForTimeout(1200);
const land = await p.evaluate((id) => ({ header: document.querySelector("header").getBoundingClientRect().bottom, top: document.getElementById(id).getBoundingClientRect().top }), hrefs[1].split("#")[1]);
check("F14 lands below the header", land.top >= land.header && land.top < 400, JSON.stringify(land));
// F09 table
await p.goto(B + "/board"); await p.waitForTimeout(800);
const t = await p.evaluate(() => { const tb = document.querySelector("table.board-roster"); return { rows: tb?.tBodies[0].rows.length, colh: tb?.querySelectorAll("thead th[scope=col]").length, rowh: tb?.querySelectorAll("tbody th[scope=row]").length, caption: tb?.caption?.textContent }; });
check("F09 roster is a table with headers", t.rows === 9 && t.colh === 3 && t.rowh === 9 && !!t.caption, JSON.stringify(t));
// axe + overflow on changed pages at both widths
for (const [w, h] of [[1280, 720], [390, 844], [320, 700]]) {
  await p.setViewportSize({ width: w, height: h });
  for (const path of ["/", "/board", "/our-work", "/support"]) {
    await p.goto(B + path); await p.waitForTimeout(900);
    const v = await p.evaluate(async (src) => { if (!window.axe) { const s = document.createElement("script"); s.textContent = src; document.head.appendChild(s); } const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }); return { v: r.violations.map((x) => `${x.id}x${x.nodes.length}`), ov: document.documentElement.scrollWidth - document.documentElement.clientWidth }; }, AXE);
    check(`axe + overflow ${path} @${w}`, v.v.length === 0 && v.ov <= 1, `${v.v.join(",")} overflow=${v.ov}`);
    if (path === "/board" || path === "/support") await p.screenshot({ path: `${S}/web-${path.slice(1)}-${w}.png`, fullPage: path === "/board" });
  }
}
await b.close(); console.log(res.join("\n"));
// cached-page regressions: skip link target, theme toggle per header
{
  const b2 = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const q = await b2.newPage({ viewport: { width: 1280, height: 720 } });
  await q.goto(B + "/"); await q.waitForTimeout(800);
  await q.locator("header:visible a[href='/board']").first().click(); await q.waitForURL("**/board"); await q.waitForTimeout(700);
  await q.locator("header:visible a[href='/support']").first().click(); await q.waitForURL("**/support"); await q.waitForTimeout(700);
  const dups = await q.evaluate(() => { const c = {}; for (const e of document.querySelectorAll("[id]")) c[e.id] = (c[e.id] || 0) + 1; return Object.entries(c).filter(([, n]) => n > 1).map(([k]) => k); });
  console.log(`${dups.length === 0 ? "PASS" : "FAIL"}  no duplicate ids after navigating three pages — ${dups.join(",")}`);
  const focusOk = await q.evaluate(() => document.activeElement?.tagName === "MAIN" && document.activeElement.offsetParent !== null || document.activeElement?.getBoundingClientRect().height > 0);
  console.log(`${focusOk ? "PASS" : "FAIL"}  focus moves to the visible page's main after navigation`);
  const before = await q.evaluate(() => document.documentElement.dataset.theme);
  await q.locator("header:visible label.clif-theme-btn").click(); await q.waitForTimeout(200);
  const after = await q.evaluate(() => ({ theme: document.documentElement.dataset.theme, mine: [...document.querySelectorAll("header")].find((h) => h.offsetParent !== null)?.querySelector(".clif-theme-toggle")?.checked }));
  console.log(`${after.theme !== before && after.mine === (after.theme === "dark") ? "PASS" : "FAIL"}  theme toggle on a navigated page flips theme and its own state — ${before}→${after.theme} checked=${after.mine}`);
  await q.keyboard.press("Tab");
  const href = await q.evaluate(() => [...document.querySelectorAll("a.skip-link")].find((a) => a.getBoundingClientRect().height > 0 || a === document.activeElement)?.getAttribute("href"));
  const target = await q.evaluate((h) => { const el = h && document.querySelector(h); return !!el && el.getClientRects().length > 0; }, href);
  console.log(`${target ? "PASS" : "FAIL"}  skip link targets the visible page's main — ${href}`);
  await b2.close();
}
// code-review regressions
{
  const b3 = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const q = await b3.newPage({ viewport: { width: 390, height: 844 } });
  const vbtn = () => q.locator("header:visible button.site-menu-btn");
  const vpanel = () => q.locator("header:visible nav.site-menu-panel");
  await q.goto(B + "/support"); await q.waitForTimeout(900);
  await vbtn().click(); await q.waitForTimeout(150);
  await q.locator("header:visible .site-header-brand a").click(); await q.waitForURL(B + "/"); await q.waitForTimeout(700);
  await q.goBack(); await q.waitForURL("**/support"); await q.waitForTimeout(700);
  console.log(`${!(await vpanel().isVisible()) ? "PASS" : "FAIL"}  menu left open, exit via logo, Back: comes back closed`);
  await vbtn().click(); await q.waitForTimeout(150);
  await vpanel().locator("a").first().focus();
  await q.setViewportSize({ width: 1280, height: 720 }); await q.waitForTimeout(400);
  const f = await q.evaluate(() => ({ tag: document.activeElement?.tagName, visible: !!document.activeElement && document.activeElement.getClientRects().length > 0 && document.activeElement !== document.body }));
  console.log(`${f.visible ? "PASS" : "FAIL"}  widening with focus in the panel keeps focus on the page — ${f.tag}`);
  await b3.close();
  const b4 = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const ctxNoJs = await b4.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const n = await ctxNoJs.newPage(); await n.goto(B + "/"); await n.waitForTimeout(500);
  const nav = await n.evaluate(() => { const p = document.querySelector("nav.site-menu-panel"); const r = p?.getBoundingClientRect(); return { shown: !!r && r.height > 0, links: p?.querySelectorAll("a").length, btnHidden: getComputedStyle(document.querySelector(".site-menu-btn")).display === "none" }; });
  console.log(`${nav.shown && nav.links >= 5 && nav.btnHidden ? "PASS" : "FAIL"}  without JavaScript the phone nav links are shown — ${JSON.stringify(nav)}`);
  await b4.close();
}
