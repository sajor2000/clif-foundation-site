import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { PHONE, open, scrollIntoAct, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

test("federation lattice text is at least 11px and fits on a phone", async () => {
  const page = await open("/", PHONE);
  await scrollIntoAct(page, "ch-federation", 0.97);
  const { tooSmall, overflowing } = await page.evaluate(() => {
    const fed = document.querySelector(".fed");
    // Measure what is rendered: on phones the cards hide their body and keep
    // the word "Hospital" for screen readers only.
    const textEls = [...fed.querySelectorAll("*")].filter(
      (el) =>
        el.getClientRects().length &&
        getComputedStyle(el).clipPath !== "inset(50%)" &&
        [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
    );
    return {
      tooSmall: textEls
        .map((el) => ({
          text: el.textContent.trim().slice(0, 30),
          px: parseFloat(getComputedStyle(el).fontSize),
        }))
        .filter((t) => t.px < 11),
      overflowing: textEls
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => el.textContent.trim().slice(0, 30)),
    };
  });
  assert.deepEqual(
    tooSmall,
    [],
    `text under 11px: ${JSON.stringify(tooSmall)}`,
  );
  assert.deepEqual(
    overflowing,
    [],
    `text overflowing its box: ${JSON.stringify(overflowing)}`,
  );
  await page.context().close();
});
