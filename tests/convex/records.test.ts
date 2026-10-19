import { describe, expect, it } from "vitest";
import { ADMIN, api, as, backend, seedBoard } from "./setup";

describe("minutes", () => {
  it("are approved only by a board vote on a held meeting", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }]);
    const meetingId = await as(t, ADMIN).mutation(api.meetings.createMeeting, { title: "Q4", scheduledAt: Date.now() });
    await as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "Call to order." });
    await expect(
      as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, status: "approved" }),
    ).rejects.toThrow(/Send to board/);
    await expect(as(t, ADMIN).mutation(api.meetings.sendMinutesForApproval, { meetingId })).rejects.toThrow(/held/);
    await as(t, ADMIN).mutation(api.meetings.updateAttendance, { meetingId, attendeeEmails: [ADMIN, "d1@x.org"], status: "held" });
    const motionId = await as(t, ADMIN).mutation(api.meetings.sendMinutesForApproval, { meetingId });
    await expect(as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "edit" })).rejects.toThrow(/out for a vote/);
    await as(t, ADMIN).mutation(api.motions.castBallot, { motionId, choice: "yes" });
    await as(t, "d1@x.org").mutation(api.motions.castBallot, { motionId, choice: "yes" });
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId, status: "closed" });
    const detail = await as(t, ADMIN).query(api.meetings.getMeeting, { meetingId });
    expect(detail?.minutes?.status).toBe("approved");
    expect(detail?.approvalMotion?.status).toBe("closed");
    await expect(as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "edit" })).rejects.toThrow(/read-only/);
  });

  it("a failed approval vote sends the minutes back to draft", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }]);
    const meetingId = await as(t, ADMIN).mutation(api.meetings.createMeeting, { title: "Q4", scheduledAt: Date.now() });
    await as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "x" });
    await as(t, ADMIN).mutation(api.meetings.updateAttendance, { meetingId, attendeeEmails: [ADMIN], status: "held" });
    const motionId = await as(t, ADMIN).mutation(api.meetings.sendMinutesForApproval, { meetingId });
    await as(t, ADMIN).mutation(api.motions.recordVote, {
      motionId,
      votes: [{ email: ADMIN, choice: "no" }, { email: "d1@x.org", choice: "no" }],
    });
    const detail = await as(t, ADMIN).query(api.meetings.getMeeting, { meetingId });
    expect(detail?.minutes?.status).toBe("draft");
  });

  it("need every director's yes: a missing vote fails the approval", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }, { email: "d2@x.org" }]);
    const meetingId = await as(t, ADMIN).mutation(api.meetings.createMeeting, { title: "Q4", scheduledAt: Date.now() });
    await as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "x" });
    await as(t, ADMIN).mutation(api.meetings.updateAttendance, { meetingId, attendeeEmails: [ADMIN], status: "held" });
    const motionId = await as(t, ADMIN).mutation(api.meetings.sendMinutesForApproval, { meetingId });
    // Two of three directors approve; a majority, but not unanimous.
    await as(t, ADMIN).mutation(api.motions.recordVote, {
      motionId,
      votes: [{ email: ADMIN, choice: "yes" }, { email: "d1@x.org", choice: "yes" }],
    });
    const detail = await as(t, ADMIN).query(api.meetings.getMeeting, { meetingId });
    expect(detail?.minutes?.status).toBe("draft");
    const motion = await as(t, ADMIN).query(api.motions.getMotion, { motionId });
    expect(motion?.motion.motionType).toBe("consent");
    expect(motion?.tally.passed).toBe(false);
  });

  it("an attached minutes file is enough to send for approval", async () => {
    const t = backend();
    await seedBoard(t, []);
    const meetingId = await as(t, ADMIN).mutation(api.meetings.createMeeting, { title: "First", scheduledAt: Date.now() });
    await as(t, ADMIN).mutation(api.meetings.updateAttendance, { meetingId, attendeeEmails: [ADMIN], status: "held" });
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["%PDF-1.4"], { type: "application/pdf" })));
    const saved = await as(t, ADMIN).mutation(api.documents.saveDocument, {
      storageId, title: "Minutes: First", category: "meeting", contentType: "application/pdf",
    });
    if (!saved.ok) throw new Error(saved.error);
    await as(t, ADMIN).mutation(api.meetings.attachMinutesFile, { meetingId, documentId: saved.id });
    const motionId = await as(t, ADMIN).mutation(api.meetings.sendMinutesForApproval, { meetingId });
    const detail = await as(t, ADMIN).query(api.meetings.getMeeting, { meetingId });
    expect(detail?.minutesFile?.title).toBe("Minutes: First");
    expect(detail?.approvalMotion?.id).toBe(motionId);
  });

  it("an unknown meeting ID from the URL returns null instead of throwing", async () => {
    const t = backend();
    await seedBoard(t, []);
    expect(await as(t, ADMIN).query(api.meetings.getMeeting, { meetingId: "not-a-real-id" })).toBeNull();
  });
});

describe("documents", () => {
  async function upload(t: ReturnType<typeof backend>, body: string, type: string) {
    return t.run((ctx) => ctx.storage.store(new Blob([body], { type })));
  }

  it("rejected uploads are deleted, not kept", async () => {
    const t = backend();
    await seedBoard(t, []);
    const storageId = await upload(t, "<html></html>", "text/html");
    const res = await as(t, ADMIN).mutation(api.documents.saveDocument, {
      storageId,
      title: "bad",
      category: "other",
      // convex-test does not record a stored file's type, so pass the real one;
      // in production Convex records it from the upload and that value wins.
      contentType: "text/html",
    });
    expect(res).toMatchObject({ ok: false });
    expect(await t.run((ctx) => ctx.storage.getUrl(storageId))).toBeNull();
  });

  it("archive hides a document from the library and pack; restore brings it back", async () => {
    const t = backend();
    await seedBoard(t, []);
    const storageId = await upload(t, "%PDF-1.4", "application/pdf");
    const saved = await as(t, ADMIN).mutation(api.documents.saveDocument, {
      storageId,
      title: "990",
      category: "tax",
      contentType: "application/pdf",
    });
    if (!saved.ok) throw new Error(saved.error);
    await as(t, ADMIN).mutation(api.documents.archiveDocument, { documentId: saved.id });
    expect(await as(t, ADMIN).query(api.documents.listDocuments, {})).toHaveLength(0);
    expect(await as(t, ADMIN).query(api.documents.listDocuments, { archived: true })).toHaveLength(1);
    const pack = await as(t, ADMIN).query(api.reporting.getReportingPack, {});
    expect(pack.sections.flatMap((s) => s.documents)).toHaveLength(0);
    await as(t, ADMIN).mutation(api.documents.restoreDocument, { documentId: saved.id });
    expect(await as(t, ADMIN).query(api.documents.listDocuments, {})).toHaveLength(1);
  });
});

describe("compliance", () => {
  it("COI counts directors only; the 990 review defaults to the prior year", async () => {
    const t = backend();
    await seedBoard(t, [
      { email: "d1@x.org" },
      { email: "officer@x.org", role: "secretary", isDirector: false },
    ]);
    await as(t, "officer@x.org").mutation(api.coi.submitDisclosure, { year: 2026, hasConflict: false });
    await as(t, "d1@x.org").mutation(api.coi.submitDisclosure, { year: 2026, hasConflict: false });
    const dash = await as(t, ADMIN).query(api.compliance.getDashboard, { year: 2026 });
    expect(dash.coi).toEqual({ submitted: 1, eligible: 2, missing: [ADMIN], complete: false });
    expect(dash.form990.taxYear).toBe(2025);
  });
});

describe("deferred gaps", () => {
  it("minutes items record COI recusals for directors only, and exports show them", async () => {
    const t = backend();
    await seedBoard(t, [{ email: "d1@x.org" }, { email: "officer@x.org", isDirector: false }]);
    const meetingId = await as(t, ADMIN).mutation(api.meetings.createMeeting, { title: "Q1", scheduledAt: Date.now() });
    const minutesId = await as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "notes" });
    await expect(
      as(t, ADMIN).mutation(api.meetings.addMinutesItem, {
        minutesId, title: "Lease", sortOrder: 1, coiRecusals: ["officer@x.org"],
      }),
    ).rejects.toThrow(/Only directors/);
    await as(t, ADMIN).mutation(api.meetings.addMinutesItem, {
      minutesId, title: "Lease", sortOrder: 1, coiRecusals: ["D1@x.org"],
    });
    const text = await as(t, ADMIN).query(api.meetings.getMinutesExport, { meetingId });
    expect(text).toContain("Recused: d1@x.org");
  });

  it("the reporting pack carries vote results and honors the date range", async () => {
    const t = backend();
    await seedBoard(t, []);
    const meetingId = await as(t, ADMIN).mutation(api.meetings.createMeeting, { title: "Annual", scheduledAt: Date.UTC(2025, 5, 1) });
    const motionId = await as(t, ADMIN).mutation(api.motions.createMotion, { title: "Adopt COI policy", motionType: "standard", meetingId });
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId, status: "open" });
    await as(t, ADMIN).mutation(api.motions.castBallot, { motionId, choice: "yes" });
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId, status: "closed" });
    await as(t, ADMIN).mutation(api.meetings.upsertMinutes, { meetingId, body: "x" });
    await as(t, ADMIN).mutation(api.meetings.updateAttendance, { meetingId, attendeeEmails: [ADMIN], status: "held", heldAt: Date.UTC(2025, 5, 1) });
    const approval = await as(t, ADMIN).mutation(api.meetings.sendMinutesForApproval, { meetingId });
    await as(t, ADMIN).mutation(api.motions.recordVote, { motionId: approval, votes: [{ email: ADMIN, choice: "yes" }] });

    const all = await as(t, ADMIN).query(api.reporting.getReportingPack, {});
    expect(all.approvedMinutesExports[0].exportText).toContain("Passed");
    const later = await as(t, ADMIN).query(api.reporting.getReportingPack, { from: Date.UTC(2026, 0, 1) });
    expect(later.approvedMinutesExports).toHaveLength(0);
  });

  it("a policy can only be linked to a motion that passed", async () => {
    const t = backend();
    await seedBoard(t, []);
    const draft = await as(t, ADMIN).mutation(api.motions.createMotion, { title: "x", motionType: "standard" });
    await expect(
      as(t, ADMIN).mutation(api.policies.registerPolicy, {
        policyType: "conflict_of_interest", title: "COI", version: 1, motionId: draft,
      }),
    ).rejects.toThrow(/passed/);
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId: draft, status: "open" });
    await as(t, ADMIN).mutation(api.motions.castBallot, { motionId: draft, choice: "yes" });
    await as(t, ADMIN).mutation(api.motions.setMotionStatus, { motionId: draft, status: "closed" });
    await as(t, ADMIN).mutation(api.policies.registerPolicy, {
      policyType: "conflict_of_interest", title: "COI", version: 1, motionId: draft,
    });
    const [p] = await as(t, ADMIN).query(api.policies.listPolicies, {});
    expect(p.motionId).toBe(draft);
  });
});
