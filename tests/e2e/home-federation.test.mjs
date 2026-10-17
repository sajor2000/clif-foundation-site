import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import {
  DESKTOP,
  PHONE,
  open,
  scrollIntoAct,
  setup,
  teardown,
} from "./harness.mjs";

before(setup);
after(teardown);

const opacity = (page, selector) =>
  page.$eval(selector, (el) => Number(getComputedStyle(el).opacity));

for (const viewport of [DESKTOP, PHONE]) {
  const size = viewport === DESKTOP ? "desktop" : "phone";

  test(`01 headline and explanation stay readable at the end of the act (${size})`, async () => {
    const page = await open("/", viewport);
    await scrollIntoAct(page, "ch-federation", 0.97);
    assert.ok((await opacity(page, "#fig-fed")) >= 0.9, "headline faded out");
    assert.ok(
      (await opacity(page, "#ch-federation p[data-sc-cue]")) >= 0.9,
      "explanation faded out",
    );
    assert.ok(
      (await opacity(page, ".fed__aggregate")) >= 0.9,
      "aggregate bar missing",
    );
    await page.context().close();
  });
}
