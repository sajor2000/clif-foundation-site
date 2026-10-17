import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canBootstrapAdmin,
  leavesNoAdmin,
  requestAccessOutcome,
} from "../../convex/lib/access.ts";

describe("canBootstrapAdmin", () => {
  it("fails closed when no bootstrap email is configured", () => {
    assert.equal(canBootstrapAdmin("someone@example.org", undefined), false);
    assert.equal(canBootstrapAdmin("someone@example.org", ""), false);
    assert.equal(canBootstrapAdmin("someone@example.org", "   "), false);
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

describe("leavesNoAdmin", () => {
  const members = [
    { email: "a@x.org", role: "admin" },
    { email: "b@x.org", role: "member" },
  ];

  it("blocks removing the only admin", () => {
    assert.equal(leavesNoAdmin(members, "a@x.org", null), true);
  });

  it("blocks demoting the only admin", () => {
    assert.equal(leavesNoAdmin(members, "A@x.org", "chair"), true);
  });

  it("allows removing or changing non-admins", () => {
    assert.equal(leavesNoAdmin(members, "b@x.org", null), false);
    assert.equal(leavesNoAdmin(members, "b@x.org", "admin"), false);
  });

  it("allows removing an admin when another admin remains", () => {
    const two = [...members, { email: "c@x.org", role: "admin" }];
    assert.equal(leavesNoAdmin(two, "a@x.org", null), false);
  });
});
