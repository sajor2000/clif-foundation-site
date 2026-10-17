// Browser-level test harness: serves the production build (`npm run build`
// first) and drives system Chrome through playwright-core. Set BASE_URL to
// test an already-running site instead, e.g. the live domain.
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.E2E_PORT ?? 43199);

export const DESKTOP = { width: 1440, height: 900 };
export const PHONE = {
  width: 390,
  height: 844,
  isMobile: true,
  hasTouch: true,
};

let server;
let browser;
export let baseUrl = process.env.BASE_URL;

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server at ${url} did not start`);
}

export async function setup() {
  if (!baseUrl) {
    server = spawn("npx", ["next", "start", "--port", String(PORT)], {
      stdio: "ignore",
      detached: true,
    });
    baseUrl = `http://127.0.0.1:${PORT}`;
    await waitForServer(baseUrl);
  }
  browser = await chromium.launch({ executablePath: CHROME, headless: true });
}

export async function teardown() {
  await browser?.close();
  if (server) process.kill(-server.pid);
}

/** Opens a page at `path` and waits for the ScrollCraft engine (home only). */
export async function open(path, viewport = DESKTOP, opts = {}) {
  const { isMobile, hasTouch, ...size } = viewport;
  const context = await browser.newContext({
    viewport: size,
    isMobile: !!isMobile,
    hasTouch: !!hasTouch,
    reducedMotion: opts.reducedMotion ?? "no-preference",
  });
  const page = await context.newPage();
  await page.goto(baseUrl + path, { waitUntil: "networkidle" });
  if (path === "/") {
    await page.waitForFunction(() =>
      document.querySelector(".sc-home")?.classList.contains("sc-ready"),
    );
  }
  return page;
}

/** Scrolls so a pinned act is `fraction` (0–1) of the way through its run. */
export async function scrollIntoAct(page, id, fraction) {
  await page.evaluate(
    ([id, f]) => {
      const act = document.getElementById(id);
      const run = act.offsetHeight - innerHeight;
      window.scrollTo(0, act.offsetTop + run * f);
    },
    [id, fraction],
  );
  await page.waitForTimeout(500);
}
