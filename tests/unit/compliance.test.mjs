import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coiCompletion, form990TaxYear } from "../../convex/lib/compliance.ts";

describe("coiCompletion", () => {
  const directors = new Set(["a@x.org", "b@x.org"]);

  it("is complete only when every current director has filed", () => {
    assert.deepEqual(coiCompletion(directors, ["a@x.org", "b@x.org"]), {
      submitted: 2, eligible: 2, missing: [], complete: true,
    });
    const partial = coiCompletion(directors, ["a@x.org"]);
    assert.equal(partial.complete, false);
    assert.deepEqual(partial.missing, ["b@x.org"]);
  });

  it("ignores disclosures from people who are not current directors", () => {
    const t = coiCompletion(directors, ["a@x.org", "departed@x.org", "officer@x.org"]);
    assert.equal(t.submitted, 1);
    assert.equal(t.complete, false);
  });

  it("matches emails case-insensitively and counts each director once", () => {
    const t = coiCompletion(directors, ["A@x.org", "a@x.org", "b@X.org"]);
    assert.equal(t.submitted, 2);
    assert.equal(t.complete, true);
  });

  it("is never complete with no directors", () => {
    assert.equal(coiCompletion(new Set(), []).complete, false);
  });
});

describe("form990TaxYear", () => {
  it("reviews the prior calendar year's return", () => {
    assert.equal(form990TaxYear(new Date("2026-10-17T12:00:00Z")), 2025);
    assert.equal(form990TaxYear(new Date("2027-01-02T12:00:00Z")), 2026);
  });
});
