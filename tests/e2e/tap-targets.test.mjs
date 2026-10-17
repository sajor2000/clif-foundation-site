import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { PHONE, open, setup, teardown } from "./harness.mjs";

const TABLET = { width: 820, height: 1180, isMobile: true, hasTouch: true };

before(setup);
after(teardown);

for (const [name, viewport] of [
  ["phone", PHONE],
  ["tablet", TABLET],
]) {
  test(`research publication links are at least 44px tall on a ${name}`, async () => {
    const page = await open("/research", viewport);
    const small = await page.$$eval("main a[target='_blank']", (links) =>
      links
        .map((a) => ({
          text: a.textContent.trim().slice(0, 40),
          h: a.getBoundingClientRect().height,
        }))
        .filter((l) => l.h < 44),
    );
    assert.deepEqual(
      small,
      [],
      `undersized tap targets: ${JSON.stringify(small)}`,
    );
    await page.context().close();
  });
}
