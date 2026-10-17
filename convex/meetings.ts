import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";
import { quorumMet } from "./lib/quorum";

const meetingReturn = v.object({
  _id: v.id("meetings"),
  title: v.string(),
  scheduledAt: v.number(),
  heldAt: v.optional(v.number()),
  status: v.string(),
  committeeLabel: v.optional(v.string()),
  quorumRequired: v.number(),
  attendeeEmails: v.array(v.string()),
  quorumMet: v.optional(v.boolean()),
});

const minutesReturn = v.object({
  _id: v.id("minutes"),
  meetingId: v.id("meetings"),
  body: v.optional(v.string()),
  status: v.string(),
  version: v.number(),
  certifiedAt: v.optional(v.number()),
  updatedAt: v.number(),
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
  args: { meetingId: v.id("meetings") },
  returns: v.union(
    v.object({
      meeting: meetingReturn,
      minutes: v.union(minutesReturn, v.null()),
      items: v.array(
        v.object({
          _id: v.id("minutesItems"),
          sortOrder: v.number(),
          title: v.string(),
          discussion: v.optional(v.string()),
          coiRecusals: v.array(v.string()),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) return null;
    const minutes = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .order("desc")
      .first();
    const items = minutes
      ? await ctx.db
          .query("minutesItems")
          .withIndex("by_minutes", (q) => q.eq("minutesId", minutes._id))
          .collect()
      : [];
    return { meeting, minutes, items };
  },
});

export const createMeeting = mutation({
  args: {
    title: v.string(),
    scheduledAt: v.number(),
    quorumRequired: v.number(),
    committeeLabel: v.optional(v.string()),
  },
  returns: v.id("meetings"),
  handler: async (ctx, args) => {
    const identity = await requireBoardRole(ctx, [
      "secretary",
      "chair",
      "admin",
    ]);
    const id = await ctx.db.insert("meetings", {
      title: args.title.trim(),
      scheduledAt: args.scheduledAt,
      status: "scheduled",
      committeeLabel: args.committeeLabel,
      quorumRequired: args.quorumRequired,
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
    status: v.optional(
      v.union(v.literal("scheduled"), v.literal("held"), v.literal("cancelled")),
    ),
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
    const present = args.attendeeEmails.length;
    await ctx.db.patch(args.meetingId, {
      attendeeEmails: args.attendeeEmails.map((e) => e.toLowerCase()),
      quorumMet: quorumMet(present, meeting.quorumRequired),
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
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published_for_review"),
        v.literal("approved"),
      ),
    ),
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

    if (existing?.status === "approved") {
      throw new Error("Approved minutes are read-only. Create a new version.");
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        body: args.body ?? existing.body,
        status: args.status ?? existing.status,
        updatedAt: Date.now(),
        certifiedBy:
          args.status === "approved" ? identity.subject : existing.certifiedBy,
        certifiedAt:
          args.status === "approved" ? Date.now() : existing.certifiedAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("minutes", {
      meetingId: args.meetingId,
      body: args.body,
      status: args.status ?? "draft",
      version: 1,
      createdBy: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
    await requireBoardRole(ctx, ["secretary", "admin"]);
    const minutes = await ctx.db.get(args.minutesId);
    if (!minutes) throw new Error("Minutes not found");
    if (minutes.status === "approved") {
      throw new Error("Cannot edit approved minutes");
    }
    return await ctx.db.insert("minutesItems", {
      minutesId: args.minutesId,
      title: args.title.trim(),
      discussion: args.discussion,
      sortOrder: args.sortOrder,
      coiRecusals: [],
    });
  },
});

export const getMinutesExport = query({
  args: { meetingId: v.id("meetings") },
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) return "";
    const minutes = await ctx.db
      .query("minutes")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .order("desc")
      .first();
    const items = minutes
      ? await ctx.db
          .query("minutesItems")
          .withIndex("by_minutes", (q) => q.eq("minutesId", minutes._id))
          .collect()
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
    return lines.join("\n");
  },
});
