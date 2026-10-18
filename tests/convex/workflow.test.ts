import { describe, expect, it } from "vitest";
import { ADMIN, api, as, backend, seedBoard } from "./setup";

describe("recording a vote taken in a meeting", () => {
  it("records each director's vote and closes with that result", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }, { email: "d2@x.org" }]);
    const motionId = await as(t, ADMIN).mutation(api.motions.createMotion, { title: "Adopt bylaws", motionType: "standard" });
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId, status: "open" });
    await as(t, "d1@x.org").mutation(api.motions.castBallot, { motionId, choice: "no" });
    await as(t, ADMIN).mutation(api.motions.recordVote, {
      motionId,
      votes: [
        { email: ADMIN, choice: "yes" },
        { email: "D1@x.org", choice: "yes" }, // replaces their earlier portal ballot
      ],
    });
    const got = await as(t, ADMIN).query(api.motions.getMotion, { motionId });
    expect(got?.motion.status).toBe("closed");
    expect(got?.motion.recordedBy).toBe(ADMIN);
    expect(got?.tally).toMatchObject({ yes: 2, no: 0, voted: 2, eligible: 3, passed: true });
  });

  it("only officers record, only for current directors, only on open motions", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }]);
    const motionId = await as(t, ADMIN).mutation(api.motions.createMotion, { title: "x", motionType: "standard" });
    await expect(
      as(t, ADMIN).mutation(api.motions.recordVote, { motionId, votes: [{ email: ADMIN, choice: "yes" }] }),
    ).rejects.toThrow(/Open the motion/);
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId, status: "open" });
    await expect(
      as(t, "d1@x.org").mutation(api.motions.recordVote, { motionId, votes: [{ email: "d1@x.org", choice: "yes" }] }),
    ).rejects.toThrow(/insufficient board role/);
    await expect(
      as(t, ADMIN).mutation(api.motions.recordVote, { motionId, votes: [{ email: "stranger@x.org", choice: "yes" }] }),
    ).rejects.toThrow(/Not a current director/);
  });
});

describe("permissions", () => {
  it("directors read documents but cannot upload or schedule", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }]);
    await expect(as(t, "d1@x.org").mutation(api.documents.generateUploadUrl, {})).rejects.toThrow(/insufficient board role/);
    await expect(
      as(t, "d1@x.org").mutation(api.meetings.createMeeting, { title: "x", scheduledAt: Date.now() }),
    ).rejects.toThrow(/insufficient board role/);
    expect(await as(t, "d1@x.org").query(api.documents.listDocuments, {})).toEqual([]);
  });
});

describe("your to-dos", () => {
  it("directors see COI and votes; officers also see board tasks", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }]);
    const motionId = await as(t, ADMIN).mutation(api.motions.createMotion, { title: "Budget", motionType: "standard" });
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId, status: "open" });
    await as(t, "new@x.org").mutation(api.board.requestAccess, {});

    const mine = await as(t, "d1@x.org").query(api.todos.myTodos, {});
    expect(mine.map((x) => x.kind)).toEqual(["coi", "vote"]);

    const officer = await as(t, ADMIN).query(api.todos.myTodos, {});
    expect(officer.map((x) => x.kind)).toEqual(["coi", "vote", "requests", "policies", "form990"]);

    await as(t, "d1@x.org").mutation(api.coi.submitDisclosure, { year: new Date().getUTCFullYear(), hasConflict: false });
    await as(t, "d1@x.org").mutation(api.motions.castBallot, { motionId, choice: "yes" });
    expect(await as(t, "d1@x.org").query(api.todos.myTodos, {})).toEqual([]);
  });
});

describe("review fixes", () => {
  it("agenda items are locked while minutes are out for a vote", async () => {
    const t = backend();
    await seedBoard(t, []);
    const meetingId = await as(t, ADMIN).mutation(api.meetings.createMeeting, { title: "Q1", scheduledAt: Date.now() });
    const minutesId = await as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "x" });
    await as(t, ADMIN).mutation(api.meetings.updateAttendance, { meetingId, attendeeEmails: [ADMIN], status: "held" });
    await as(t, ADMIN).mutation(api.meetings.sendMinutesForApproval, { meetingId });
    await expect(
      as(t, ADMIN).mutation(api.meetings.addMinutesItem, { minutesId, title: "Late item", sortOrder: 1 }),
    ).rejects.toThrow(/out for a vote/);
  });

  it("updating a member without a title keeps their title", async () => {
    const t = backend();
    await seedBoard(t, []);
    await as(t, ADMIN).mutation(api.board.upsertMember, { email: "sec@x.org", role: "admin", title: "Secretary" });
    await as(t, ADMIN).mutation(api.board.upsertMember, { email: "sec@x.org", displayName: "Pat" });
    await as(t, ADMIN).mutation(api.board.upsertMember, { email: "new@x.org" });
    const members = await as(t, ADMIN).query(api.board.listMembers, {});
    expect(members.find((m) => m.email === "sec@x.org")).toMatchObject({ title: "Secretary", role: "admin", displayName: "Pat" });
    expect(members.find((m) => m.email === "new@x.org")).toMatchObject({ title: "Director", role: "member" });
  });
});
