import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";
import { isDirector, loadDirectorEmails } from "./lib/directors";
import { minutesTransitionError } from "./lib/minutes";
import { tallyBallots } from "./lib/tally";
import { meetingStatus, minutesStatus } from "./lib/vocab";
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
    return { meeting, minutes, items };
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
    const identity = await requireBoardRole(ctx, [
      "secretary",
      "chair",
      "admin",
    ]);
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
    const { identity } = await requireBoardRole(ctx, [
      "secretary",
      "chair",
      "admin",
    ]);
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
    const { identity } = await requireBoardRole(ctx, [
      "secretary",
      "admin",
    ]);
    const existing = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .order("desc")
      .first();

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("Meeting not found");
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

/** Start a new draft version after minutes were approved. */
export const reviseMinutes = mutation({
  args: {
    meetingId: v.id("meetings"),
    body: v.optional(v.string()),
  },
  returns: v.id("minutes"),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["secretary", "admin"]);
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
  },
  returns: v.id("minutesItems"),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["secretary", "admin"]);
    const minutes = await ctx.db.get(args.minutesId);
    if (!minutes) throw new Error("Minutes not found");
    if (minutes.status === "approved") {
      throw new Error("Cannot edit approved minutes");
    }
    const id = await ctx.db.insert("minutesItems", {
      minutesId: args.minutesId,
      title: args.title.trim(),
      discussion: args.discussion,
      sortOrder: args.sortOrder,
      coiRecusals: [],
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
    const items = minutes
      ? await ctx.db
          .query("minutesItems")
          .withIndex("by_minutes", (q) => q.eq("minutesId", minutes._id))
          .take(200)
      : [];
    const lines = [
      `# ${meeting.title}`,
      ``,
      `Scheduled: ${new Date(meeting.scheduledAt).toISOString()}`,
      `Status: ${meeting.status}`,
      `Quorum required: ${meeting.quorumRequired}`,
      `Present (${meeting.attendeeEmails.length}): ${meeting.attendeeEmails.join(", ") || "—"}`,
      `Quorum met: ${meeting.quorumMet ? "yes" : "no"}`,
      ``,
    ];
    if (minutes) {
      lines.push(`## Minutes (v${minutes.version}, ${minutes.status})`, ``);
      if (minutes.body) lines.push(minutes.body, ``);
      for (const item of items) {
        lines.push(`### ${item.title}`);
        if (item.discussion) lines.push(item.discussion);
        if (item.coiRecusals.length) {
          lines.push(`Recused: ${item.coiRecusals.join(", ")}`);
        }
        lines.push(``);
      }
    }

    const motions = await ctx.db
      .query("motions")
      .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
      .take(50);
    if (motions.length) {
      const directorEmails = await loadDirectorEmails(ctx);
      lines.push(`## Motions and votes`, ``);
      for (const motion of motions) {
        const ballots = await ctx.db
          .query("ballots")
          .withIndex("by_motion", (q) => q.eq("motionId", motion._id))
          .take(200);
        const t =
          motion.status === "closed" && motion.finalTally
            ? motion.finalTally
            : tallyBallots(ballots, directorEmails, motion.motionType, motion.status);
        lines.push(
          `### ${motion.title} (${motion.status}, ${motion.motionType})`,
          `Yes ${t.yes} · No ${t.no} · Abstain ${t.abstain} · Recuse ${t.recuse}` +
            (motion.status === "closed" ? ` · ${t.passed ? "Passed" : "Not passed"}` : ""),
          ``,
        );
      }
    }

    return lines.join("\n");
  },
});
