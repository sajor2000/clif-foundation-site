import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { DESKTOP, open, scrollIntoAct, setup, teardown } from "./harness.mjs";

before(setup);
after(teardown);

// The chapter folio only shows at >= 1400px wide.
for (const id of ["ch-federation", "ch-programs"]) {
  test(`chapter folio never covers the ${id} stage`, async () => {
    const page = await open("/", DESKTOP);
    await scrollIntoAct(page, id, 0.5);
    const { folioRight, stageLeft, pageScrollsSideways } = await page.evaluate(
      (id) => {
        const folio = document
          .querySelector(".sc-folio")
          .getBoundingClientRect();
        // Pinned chapters have a stage; the programs chapter is a plain grid.
        const stage = document
          .querySelector(`#${id} [data-sc-stage], #${id} .page-wrap`)
          .getBoundingClientRect();
        return {
          folioRight: folio.right,
          stageLeft: stage.left,
          pageScrollsSideways:
            document.documentElement.scrollWidth > innerWidth,
        };
      },
      id,
    );
    assert.ok(
      folioRight + 8 <= stageLeft,
      `folio right edge ${folioRight}px overlaps stage starting at ${stageLeft}px`,
    );
    assert.equal(pageScrollsSideways, false);
    await page.context().close();
  });
}
