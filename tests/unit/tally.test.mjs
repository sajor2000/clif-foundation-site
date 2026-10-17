import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tallyBallots } from "../../convex/lib/tally.ts";

const directors = new Set(["a@x.org", "b@x.org", "c@x.org"]);
const ballot = (voterEmail, choice) => ({ voterEmail, choice });

describe("tallyBallots", () => {
  it("counts only current directors' ballots", () => {
    const t = tallyBallots(
      [ballot("a@x.org", "yes"), ballot("outsider@x.org", "yes"), ballot("b@x.org", "no")],
      directors,
      "standard",
      "open",
    );
    assert.equal(t.yes, 1);
    assert.equal(t.no, 1);
    assert.equal(t.voted, 2);
    assert.equal(t.eligible, 3);
  });

  it("matches director emails case-insensitively", () => {
    const t = tallyBallots([ballot("A@X.org", "yes")], directors, "standard", "open");
    assert.equal(t.yes, 1);
  });

  it("does not report a result until the motion is closed", () => {
    const t = tallyBallots([ballot("a@x.org", "yes")], directors, "standard", "open");
    assert.equal(t.passed, false);
  });

  it("passes a standard motion on more yes than no", () => {
    const yes = tallyBallots(
      [ballot("a@x.org", "yes"), ballot("b@x.org", "yes"), ballot("c@x.org", "no")],
      directors, "standard", "closed",
    );
    assert.equal(yes.passed, true);
    const tie = tallyBallots(
      [ballot("a@x.org", "yes"), ballot("b@x.org", "no")],
      directors, "standard", "closed",
    );
    assert.equal(tie.passed, false);
  });

  it("requires every non-recused director to vote yes on consent", () => {
    const all = tallyBallots(
      [ballot("a@x.org", "yes"), ballot("b@x.org", "yes"), ballot("c@x.org", "recuse")],
      directors, "consent", "closed",
    );
    assert.equal(all.eligible, 2);
    assert.equal(all.passed, true);
    const missing = tallyBallots(
      [ballot("a@x.org", "yes"), ballot("b@x.org", "yes")],
      directors, "consent", "closed",
    );
    assert.equal(missing.passed, false);
  });

  it("an outsider's recuse cannot shrink the consent denominator", () => {
    const t = tallyBallots(
      [ballot("a@x.org", "yes"), ballot("b@x.org", "yes"), ballot("outsider@x.org", "recuse")],
      directors, "consent", "closed",
    );
    assert.equal(t.eligible, 3);
    assert.equal(t.passed, false);
  });

  it("never passes with no directors", () => {
    const t = tallyBallots([], new Set(), "consent", "closed");
    assert.equal(t.passed, false);
  });
});
