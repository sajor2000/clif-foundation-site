import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { minutesTransitionError } from "../../convex/lib/minutes.ts";

describe("minutesTransitionError", () => {
  it("allows drafting and publishing for review", () => {
    assert.equal(minutesTransitionError(null, "draft", false), null);
    assert.equal(minutesTransitionError(null, "published_for_review", true), null);
    assert.equal(minutesTransitionError("draft", "draft", false), null);
    assert.equal(minutesTransitionError("draft", "published_for_review", true), null);
    assert.equal(minutesTransitionError("published_for_review", "draft", true), null);
  });

  it("sends minutes for approval only for a held meeting", () => {
    assert.match(minutesTransitionError("draft", "published_for_review", false), /held/i);
  });

  it("never approves directly: approval comes from a board vote", () => {
    assert.match(minutesTransitionError(null, "approved", true), /vote/i);
    assert.match(minutesTransitionError("draft", "approved", true), /vote/i);
    assert.match(minutesTransitionError("published_for_review", "approved", true), /vote/i);
  });

  it("keeps approved minutes read-only", () => {
    assert.match(minutesTransitionError("approved", "draft", true), /read-only/i);
    assert.match(minutesTransitionError("approved", "approved", true), /read-only/i);
  });
});
