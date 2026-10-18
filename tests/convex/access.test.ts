import { describe, expect, it } from "vitest";
import { ADMIN, api, as, backend, seedBoard } from "./setup";

describe("claiming admin", () => {
  it("only the designated email may claim admin on an empty board", async () => {
    const t = backend();
    expect(await as(t, "stranger@gmail.com").query(api.board.myRole, {})).toBeNull();
    await expect(as(t, "stranger@gmail.com").mutation(api.board.bootstrapAdmin, {})).rejects.toThrow(
      /designated admin/,
    );
    expect(await as(t, ADMIN).query(api.board.myRole, {})).toBe("bootstrap_eligible");
    await as(t, ADMIN).mutation(api.board.bootstrapAdmin, {});
    expect(await as(t, ADMIN).query(api.board.myRole, {})).toBe("admin");
  });

  it("fails closed when BOOTSTRAP_ADMIN_EMAIL is missing", async () => {
    const t = backend();
    delete process.env.BOOTSTRAP_ADMIN_EMAIL;
    await expect(as(t, ADMIN).mutation(api.board.bootstrapAdmin, {})).rejects.toThrow();
  });

  it("an unverified email never matches", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "dir@x.org" }]);
    const unverified = t.withIdentity({ email: "dir@x.org", emailVerified: false, subject: "u" });
    await expect(unverified.query(api.board.listMembers, {})).rejects.toThrow(/Unauthorized/);
  });
});

describe("access requests", () => {
  it("request, approve with a role, then access", async () => {
    const t = backend();
    await seedBoard(t, []);
    const newcomer = as(t, "new@x.org");
    await expect(newcomer.query(api.board.listMembers, {})).rejects.toThrow(/Unauthorized/);
    expect(await newcomer.mutation(api.board.requestAccess, {})).toBe("pending");
    expect(await newcomer.mutation(api.board.requestAccess, {})).toBe("pending");
    await expect(newcomer.query(api.board.listAccessRequests, {})).rejects.toThrow(/Unauthorized/);

    const [req] = await as(t, ADMIN).query(api.board.listAccessRequests, {});
    await as(t, ADMIN).mutation(api.board.decideAccessRequest, { id: req.id, approve: true, role: "secretary" });
    expect(await newcomer.query(api.board.myRole, {})).toBe("secretary");
    await expect(
      as(t, ADMIN).mutation(api.board.decideAccessRequest, { id: req.id, approve: false }),
    ).rejects.toThrow(/already handled/);
  });

  it("deny keeps them out; they may ask again", async () => {
    const t = backend();
    await seedBoard(t, []);
    await as(t, "no@x.org").mutation(api.board.requestAccess, {});
    const [req] = await as(t, ADMIN).query(api.board.listAccessRequests, {});
    await as(t, ADMIN).mutation(api.board.decideAccessRequest, { id: req.id, approve: false });
    expect(await as(t, "no@x.org").query(api.board.myAccessRequest, {})).toBe("denied");
    expect(await as(t, "no@x.org").query(api.board.myRole, {})).toBeNull();
    expect(await as(t, "no@x.org").mutation(api.board.requestAccess, {})).toBe("pending");
  });
});

describe("members", () => {
  it("removing a member revokes access; the last admin is protected", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "gone@x.org" }]);
    await as(t, ADMIN).mutation(api.board.removeMember, { email: "gone@x.org" });
    await expect(as(t, "gone@x.org").query(api.board.listMembers, {})).rejects.toThrow(/Unauthorized/);
    await expect(as(t, ADMIN).mutation(api.board.removeMember, { email: ADMIN })).rejects.toThrow(
      /at least one admin/,
    );
    await expect(
      as(t, ADMIN).mutation(api.board.upsertMember, { email: ADMIN, role: "chair" }),
    ).rejects.toThrow(/at least one admin/);
  });

  it("only admins manage the allowlist", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "sec@x.org", role: "secretary" }]);
    await expect(
      as(t, "sec@x.org").mutation(api.board.upsertMember, { email: "x@x.org" }),
    ).rejects.toThrow(/insufficient board role/);
    await expect(as(t, "sec@x.org").mutation(api.board.removeMember, { email: ADMIN })).rejects.toThrow(
      /insufficient board role/,
    );
  });
});
