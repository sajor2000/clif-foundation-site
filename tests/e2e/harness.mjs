// Browser-level test harness: serves the production build (`npm run build`
// first) and drives system Chrome through playwright-core. Set BASE_URL to
// test an already-running site instead, e.g. the live domain.
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "/usr/local/bin/google-chrome");
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
let baseUrl = process.env.BASE_URL;

async function responds(url) {
  try {
    await fetch(url);
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(url, child, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `next start exited early (${child.exitCode ?? child.signalCode})`,
      );
    }
    if (await responds(url)) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server at ${url} did not start`);
}

export async function setup() {
  if (!baseUrl) {
    const url = `http://127.0.0.1:${PORT}`;
    // Never test against whatever else happens to hold the port.
    if (await responds(url)) {
      throw new Error(
        `port ${PORT} is already in use; set E2E_PORT or BASE_URL`,
      );
    }
    server = spawn("npx", ["next", "start", "--port", String(PORT)], {
      stdio: "ignore",
      detached: true,
    });
    await waitForServer(url, server);
    baseUrl = url;
  }
  browser = await chromium.launch({ executablePath: CHROME, headless: true });
}

export async function teardown() {
  await browser?.close();
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  const exited = new Promise((r) => server.once("exit", r));
  process.kill(-server.pid);
  await exited;
}

/** Opens a page at `path` and waits for the ScrollCraft engine (home only). */
export async function open(path, viewport = DESKTOP, opts = {}) {
  const { isMobile, hasTouch, ...size } = viewport;
  const context = await browser.newContext({
    viewport: size,
    isMobile: !!isMobile,
    hasTouch: !!hasTouch,
    reducedMotion: opts.reducedMotion ?? "no-preference",
    colorScheme: opts.colorScheme ?? "light",
    javaScriptEnabled: opts.javaScriptEnabled ?? true,
  });
  if (opts.permissions) {
    await context.grantPermissions(opts.permissions, { origin: baseUrl });
  }
  const page = await context.newPage();
  if (opts.initScript) await page.addInitScript(opts.initScript);
  // Portal pages load Clerk's bot-protection script, which can hold a request
  // open indefinitely; their tests pass waitUntil "load" and wait for content.
  await page.goto(baseUrl + path, { waitUntil: opts.waitUntil ?? "networkidle" });
  if (path === "/" && opts.javaScriptEnabled !== false) {
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
