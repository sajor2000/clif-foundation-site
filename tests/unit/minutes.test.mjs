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

  it("approves only minutes that were published for review", () => {
    assert.match(minutesTransitionError(null, "approved", true), /review/i);
    assert.match(minutesTransitionError("draft", "approved", true), /review/i);
    assert.equal(minutesTransitionError("published_for_review", "approved", true), null);
  });

  it("approves only after the meeting is marked held", () => {
    assert.match(minutesTransitionError("published_for_review", "approved", false), /held/i);
  });

  it("keeps approved minutes read-only", () => {
    assert.match(minutesTransitionError("approved", "draft", true), /read-only/i);
    assert.match(minutesTransitionError("approved", "approved", true), /read-only/i);
  });
});
