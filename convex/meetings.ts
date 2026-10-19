import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity, requireOfficer } from "./lib/auth";
import { isDirector, loadDirectorEmails } from "./lib/directors";
import { minutesTransitionError } from "./lib/minutes";
import { buildMinutesText } from "./lib/minutesText";
import { meetingStatus, minutesStatus, motionStatus } from "./lib/vocab";
import { quorumMet, quorumRequired } from "./lib/quorum";
import schema from "./schema";

// Raw rows are returned, so these validators must match the tables exactly.
const meetingReturn = v.object({
  _id: v.id("meetings"),
  _creationTime: v.number(),
  ...schema.tables.meetings.validator.fields,
});

const minutesReturn = v.object({
  _id: v.id("minutes"),
  _creationTime: v.number(),
  ...schema.tables.minutes.validator.fields,
});

export const listMeetings = query({
  args: {},
  returns: v.array(meetingReturn),
  handler: async (ctx) => {
    await requireBoardIdentity(ctx);
    return await ctx.db
      .query("meetings")
      .withIndex("by_scheduled")
      .order("desc")
      .take(100);
  },
});

export const getMeeting = query({
  // Accepts any string (it comes from the URL); an unknown ID returns null.
  args: { meetingId: v.string() },
  returns: v.union(
    v.object({
      meeting: meetingReturn,
      minutes: v.union(minutesReturn, v.null()),
      items: v.array(
        v.object({
          _id: v.id("minutesItems"),
          _creationTime: v.number(),
          ...schema.tables.minutesItems.validator.fields,
        }),
      ),
      /** The attached minutes file, if any. */
      minutesFile: v.union(v.object({ title: v.string(), url: v.union(v.string(), v.null()) }), v.null()),
      /** The motion that puts these minutes to the board, if one exists. */
      approvalMotion: v.union(v.object({ id: v.id("motions"), status: motionStatus }), v.null()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const meetingId = ctx.db.normalizeId("meetings", args.meetingId);
    const meeting = meetingId ? await ctx.db.get(meetingId) : null;
    if (!meeting) return null;
    const minutes = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
      .order("desc")
      .first();
    const items = minutes
      ? await ctx.db
          .query("minutesItems")
          .withIndex("by_minutes", (q) => q.eq("minutesId", minutes._id))
          .take(200)
      : [];
    const doc = minutes?.documentId ? await ctx.db.get(minutes.documentId) : null;
    const minutesFile = doc ? { title: doc.title, url: await ctx.storage.getUrl(doc.storageId) } : null;
    let approvalMotion = null;
    if (minutes) {
      const motions = await ctx.db
        .query("motions")
        .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
        .order("desc")
        .take(50);
      const m = motions.find((x) => x.minutesId === minutes._id);
      if (m) approvalMotion = { id: m._id, status: m.status };
    }
    return { meeting, minutes, items, minutesFile, approvalMotion };
  },
});

export const createMeeting = mutation({
  args: {
    title: v.string(),
    scheduledAt: v.number(),
    quorumRequired: v.optional(v.number()),
    committeeLabel: v.optional(v.string()),
  },
  returns: v.id("meetings"),
  handler: async (ctx, args) => {
    const identity = await requireOfficer(ctx);
    const members = await ctx.db.query("boardMembers").take(200);
    const directorCount = members.filter(isDirector).length;
    const computedQuorum = quorumRequired(Math.max(1, directorCount));
    const id = await ctx.db.insert("meetings", {
      title: args.title.trim(),
      scheduledAt: args.scheduledAt,
      status: "scheduled",
      committeeLabel: args.committeeLabel,
      quorumRequired: args.quorumRequired ?? computedQuorum,
      attendeeEmails: [],
      createdBy: identity.identity.subject,
      createdAt: Date.now(),
    });
    await logAudit(ctx, {
      kind: "meeting.create",
      summary: `Scheduled meeting: ${args.title}`,
      actorSubject: identity.identity.subject,
      actorEmail: identity.identity.email,
    });
    return id;
  },
});

export const updateAttendance = mutation({
  args: {
    meetingId: v.id("meetings"),
    attendeeEmails: v.array(v.string()),
    status: v.optional(meetingStatus),
    heldAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("Meeting not found");
    const unique = [
      ...new Set(
        args.attendeeEmails.map((e) => e.trim().toLowerCase()).filter(Boolean),
      ),
    ];
    const members = await ctx.db.query("boardMembers").take(200);
    const directorEmails = new Set(
      members.filter(isDirector).map((m) => m.email.trim().toLowerCase()),
    );
    const directorPresent = unique.filter((e) => directorEmails.has(e));
    await ctx.db.patch(args.meetingId, {
      attendeeEmails: unique,
      quorumMet: quorumMet(directorPresent.length, meeting.quorumRequired),
      status: args.status ?? meeting.status,
      heldAt: args.heldAt ?? meeting.heldAt,
    });
    await logAudit(ctx, {
      kind: "meeting.attendance",
      summary: `Updated attendance for ${meeting.title}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});

export const upsertMinutes = mutation({
  args: {
    meetingId: v.id("meetings"),
    body: v.optional(v.string()),
    status: v.optional(minutesStatus),
  },
  returns: v.id("minutes"),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
    const existing = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .order("desc")
      .first();

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("Meeting not found");
    if (args.status && args.status !== "draft") {
      throw new Error("Use “Send to board for approval” to put minutes to a vote.");
    }
    if (existing?.status === "published_for_review") {
      throw new Error("These minutes are out for a vote. Close the vote before editing them.");
    }
    const nextStatus = args.status ?? existing?.status ?? "draft";
    const blocked = minutesTransitionError(
      existing?.status ?? null,
      nextStatus,
      meeting.status === "held",
    );
    if (blocked) throw new Error(blocked);

    let id;
    if (existing) {
      await ctx.db.patch(existing._id, {
        body: args.body ?? existing.body,
        status: nextStatus,
        updatedAt: Date.now(),
        certifiedBy: nextStatus === "approved" ? identity.subject : existing.certifiedBy,
        certifiedAt: nextStatus === "approved" ? Date.now() : existing.certifiedAt,
      });
      id = existing._id;
    } else {
      id = await ctx.db.insert("minutes", {
        meetingId: args.meetingId,
        body: args.body,
        status: nextStatus,
        version: 1,
        createdBy: identity.subject,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    if (nextStatus !== (existing?.status ?? null)) {
      await logAudit(ctx, {
        kind: "minutes.status",
        summary: `Minutes for ${meeting.title} → ${nextStatus}`,
        actorSubject: identity.subject,
        actorEmail: identity.email,
      });
    }
    return id;
  },
});

/** Attach the minutes file (PDF or Word, already in the library) to a meeting's current draft. */
export const attachMinutesFile = mutation({
  args: { meetingId: v.id("meetings"), documentId: v.id("documents") },
  returns: v.id("minutes"),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("Meeting not found");
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    const latest = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
      .order("desc")
      .first();
    if (latest?.status === "approved") {
      throw new Error("These minutes are approved. Start a new version to replace the file.");
    }
    if (latest?.status === "published_for_review") {
      throw new Error("These minutes are out for a vote. Close the vote before changing the file.");
    }
    let id;
    if (latest) {
      await ctx.db.patch(latest._id, { documentId: doc._id, updatedAt: Date.now() });
      id = latest._id;
    } else {
      id = await ctx.db.insert("minutes", {
        meetingId: meeting._id,
        documentId: doc._id,
        status: "draft",
        version: 1,
        createdBy: identity.subject,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    await logAudit(ctx, {
      kind: "minutes.file",
      summary: `Attached minutes file "${doc.title}" to ${meeting.title}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return id;
  },
});

/**
 * Put a meeting's draft minutes to the board: opens a motion "Approve minutes"
 * that approves them when it passes (see closeMotion in motions.ts).
 */
export const sendMinutesForApproval = mutation({
  args: { meetingId: v.id("meetings") },
  returns: v.id("motions"),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("Meeting not found");
    const minutes = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
      .order("desc")
      .first();
    if (!minutes) throw new Error("Add the minutes (file or text) first");
    if (!minutes.documentId && !minutes.body?.trim()) {
      throw new Error("Attach the minutes file or enter the minutes text first");
    }
    const blocked = minutesTransitionError(minutes.status, "published_for_review", meeting.status === "held");
    if (blocked) throw new Error(blocked);
    if (minutes.status === "published_for_review") {
      throw new Error("These minutes are already out for a vote");
    }
    await ctx.db.patch(minutes._id, { status: "published_for_review", updatedAt: Date.now() });
    const motionId = await ctx.db.insert("motions", {
      meetingId: meeting._id,
      minutesId: minutes._id,
      title: `Approve minutes: ${meeting.title}${minutes.version > 1 ? ` (v${minutes.version})` : ""}`,
      // Minutes are approved by unanimous written consent: every director must vote yes.
      description: "Approve the minutes as recorded. Written consent: every director must vote yes.",
      motionType: "consent",
      status: "open",
      openedAt: Date.now(),
      createdBy: identity.subject,
      createdAt: Date.now(),
    });
    await logAudit(ctx, {
      kind: "minutes.sent_for_approval",
      summary: `Minutes of ${meeting.title} sent to the board for approval`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return motionId;
  },
});

/** Start a new draft version after minutes were approved. */
export const reviseMinutes = mutation({
  args: {
    meetingId: v.id("meetings"),
    body: v.optional(v.string()),
  },
  returns: v.id("minutes"),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
    const existing = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .order("desc")
      .first();
    if (!existing || existing.status !== "approved") {
      throw new Error("Only approved minutes can be revised into a new version");
    }
    const id = await ctx.db.insert("minutes", {
      meetingId: args.meetingId,
      body: args.body ?? existing.body,
      status: "draft",
      version: existing.version + 1,
      createdBy: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const priorItems = await ctx.db
      .query("minutesItems")
      .withIndex("by_minutes", (q) => q.eq("minutesId", existing._id))
      .take(200);
    for (const item of priorItems) {
      await ctx.db.insert("minutesItems", {
        minutesId: id,
        title: item.title,
        discussion: item.discussion,
        motionId: item.motionId,
        sortOrder: item.sortOrder,
        coiRecusals: item.coiRecusals,
      });
    }
    await logAudit(ctx, {
      kind: "minutes.revise",
      summary: `Started minutes v${existing.version + 1}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return id;
  },
});

export const addMinutesItem = mutation({
  args: {
    minutesId: v.id("minutes"),
    title: v.string(),
    discussion: v.optional(v.string()),
    sortOrder: v.number(),
    /** Directors who recused from this item for a conflict of interest. */
    coiRecusals: v.optional(v.array(v.string())),
  },
  returns: v.id("minutesItems"),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
    const minutes = await ctx.db.get(args.minutesId);
    if (!minutes) throw new Error("Minutes not found");
    if (minutes.status !== "draft") {
      throw new Error(
        minutes.status === "approved"
          ? "Cannot edit approved minutes"
          : "These minutes are out for a vote. Close the vote before editing them.",
      );
    }
    if (!args.title.trim()) throw new Error("Item title is required");
    const directors = await loadDirectorEmails(ctx);
    const recusals = [...new Set((args.coiRecusals ?? []).map((e) => e.trim().toLowerCase()))];
    const unknown = recusals.filter((e) => !directors.has(e));
    if (unknown.length) {
      throw new Error(`Only directors can recuse: ${unknown.join(", ")}`);
    }
    const id = await ctx.db.insert("minutesItems", {
      minutesId: args.minutesId,
      title: args.title.trim(),
      discussion: args.discussion,
      sortOrder: args.sortOrder,
      coiRecusals: recusals,
    });
    await logAudit(ctx, {
      kind: "minutes.item_add",
      summary: `Added minutes item: ${args.title.trim()}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return id;
  },
});

export const getMinutesExport = query({
  args: { meetingId: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const meetingId = ctx.db.normalizeId("meetings", args.meetingId);
    const meeting = meetingId ? await ctx.db.get(meetingId) : null;
    if (!meeting) return "";
    const minutes = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
      .order("desc")
      .first();
    return buildMinutesText(ctx, meeting, minutes);
  },
});
