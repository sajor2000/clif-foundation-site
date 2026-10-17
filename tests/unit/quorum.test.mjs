import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Mirrors convex/lib/quorum.ts — keep in sync. */
function quorumRequired(directorCount, fraction = 0.5) {
  if (directorCount <= 0) return 1;
  return Math.max(1, Math.ceil(directorCount * fraction));
}

function quorumMet(present, required) {
  return present >= required;
}

describe("quorum helpers", () => {
  it("requires majority for even and odd boards", () => {
    assert.equal(quorumRequired(0), 1);
    assert.equal(quorumRequired(1), 1);
    assert.equal(quorumRequired(4), 2);
    assert.equal(quorumRequired(5), 3);
    assert.equal(quorumRequired(9), 5);
  });

  it("detects quorum met", () => {
    assert.equal(quorumMet(3, 3), true);
    assert.equal(quorumMet(2, 3), false);
  });
});
