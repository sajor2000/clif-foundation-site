import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canBootstrapAdmin,
  requestAccessOutcome,
} from "../../convex/lib/access.ts";

describe("canBootstrapAdmin", () => {
  it("allows any verified email when no bootstrap email is configured", () => {
    assert.equal(canBootstrapAdmin("someone@example.org", undefined), true);
    assert.equal(canBootstrapAdmin("someone@example.org", ""), true);
  });

  it("only allows the configured email, case-insensitively", () => {
    const required = "info@clificufoundation.org";
    assert.equal(canBootstrapAdmin("info@clificufoundation.org", required), true);
    assert.equal(canBootstrapAdmin("Info@CLIFICUFoundation.org", required), true);
    assert.equal(canBootstrapAdmin("stranger@gmail.com", required), false);
  });

  it("refuses a missing email", () => {
    assert.equal(canBootstrapAdmin(undefined, undefined), false);
    assert.equal(canBootstrapAdmin(undefined, "info@clificufoundation.org"), false);
  });
});

describe("requestAccessOutcome", () => {
  it("is a no-op for existing members", () => {
    assert.equal(requestAccessOutcome(null, true), "already_member");
    assert.equal(requestAccessOutcome("pending", true), "already_member");
  });

  it("creates a request the first time", () => {
    assert.equal(requestAccessOutcome(null, false), "create");
  });

  it("keeps a pending request as is", () => {
    assert.equal(requestAccessOutcome("pending", false), "keep");
  });

  it("reopens a decided request when the person is not a member", () => {
    assert.equal(requestAccessOutcome("denied", false), "reopen");
    assert.equal(requestAccessOutcome("approved", false), "reopen");
  });
});
