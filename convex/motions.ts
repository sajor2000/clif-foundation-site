import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";
import { isDirector } from "./lib/directors";

const motionReturn = v.object({
  _id: v.id("motions"),
  title: v.string(),
  description: v.optional(v.string()),
  motionType: v.string(),
  status: v.string(),
  meetingId: v.optional(v.id("meetings")),
  openedAt: v.optional(v.number()),
  closedAt: v.optional(v.number()),
});

const tallyReturn = v.object({
  yes: v.number(),
  no: v.number(),
  abstain: v.number(),
  recuse: v.number(),
  eligible: v.number(),
  voted: v.number(),
  passed: v.boolean(),
});

export const listMotions = query({
  args: {
    status: v.optional(
      v.union(v.literal("draft"), v.literal("open"), v.literal("closed")),
    ),
  },
  returns: v.array(
    v.object({
      motion: motionReturn,
      tally: tallyReturn,
    }),
  ),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const motions = args.status
      ? await ctx.db
          .query("motions")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .take(100)
      : await ctx.db
          .query("motions")
          .withIndex("by_created")
          .order("desc")
          .take(100);

    const results = [];
    for (const motion of motions) {
      results.push({
        motion,
        tally: await computeTally(ctx, motion._id, motion.motionType, motion.status),
      });
    }
    return results;
  },
});

async function computeTally(
  ctx: QueryCtx,
  motionId: Id<"motions">,
  motionType: string,
  status: string,
) {
  const ballots = await ctx.db
    .query("ballots")
    .withIndex("by_motion", (q) => q.eq("motionId", motionId))
    .take(500);
  const members = await ctx.db.query("boardMembers").take(200);
  const directors = members.filter(isDirector);
  const directorCount = directors.length > 0 ? directors.length : 1;
  const yes = ballots.filter((b) => b.choice === "yes").length;
  const no = ballots.filter((b) => b.choice === "no").length;
  const abstain = ballots.filter((b) => b.choice === "abstain").length;
  const recuse = ballots.filter((b) => b.choice === "recuse").length;
  const voted = ballots.length;
  // Recused directors are excluded from the unanimous consent denominator.
  const eligible =
    motionType === "consent"
      ? Math.max(1, directorCount - recuse)
      : directorCount;

  let passed = false;
  if (status === "closed") {
    if (motionType === "consent") {
      passed = yes === eligible && no === 0 && abstain === 0;
    } else {
      passed = yes > no;
    }
  }

  return { yes, no, abstain, recuse, eligible, voted, passed };
}

export const getMotion = query({
  args: { motionId: v.id("motions") },
  returns: v.union(
    v.object({
      motion: motionReturn,
      tally: tallyReturn,
      myBallot: v.union(
        v.object({ choice: v.string(), castAt: v.number() }),
        v.null(),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    const motion = await ctx.db.get(args.motionId);
    if (!motion) return null;
    const tally = await computeTally(
      ctx,
      args.motionId,
      motion.motionType,
      motion.status,
    );
    const myBallot = await ctx.db
      .query("ballots")
      .withIndex("by_motion_voter", (q) =>
        q.eq("motionId", args.motionId).eq("voterSubject", identity.subject),
      )
      .unique();
    return {
      motion,
      tally,
      myBallot: myBallot
        ? { choice: myBallot.choice, castAt: myBallot.castAt }
        : null,
    };
  },
});

export const createMotion = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    motionType: v.union(v.literal("standard"), v.literal("consent")),
    meetingId: v.optional(v.id("meetings")),
  },
  returns: v.id("motions"),
  handler: async (ctx, args) => {
    const identity = await requireBoardRole(ctx, [
      "chair",
      "secretary",
      "admin",
    ]);
    const id = await ctx.db.insert("motions", {
      title: args.title.trim(),
      description: args.description,
      motionType: args.motionType,
      status: "draft",
      meetingId: args.meetingId,
      createdBy: identity.identity.subject,
      createdAt: Date.now(),
    });
    await logAudit(ctx, {
      kind: "motion.create",
      summary: `Draft motion: ${args.title}`,
      actorSubject: identity.identity.subject,
      actorEmail: identity.identity.email,
    });
    return id;
  },
});

export const setMotionStatus = mutation({
  args: {
    motionId: v.id("motions"),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("closed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["chair", "admin"]);
    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("Motion not found");

    const from = motion.status;
    const to = args.status;
    const allowed =
      (from === "draft" && to === "open") ||
      (from === "open" && to === "closed") ||
      (from === "draft" && to === "draft");
    if (from !== to && !allowed) {
      throw new Error(`Invalid motion transition: ${from} → ${to}`);
    }

    const patch: {
      status: typeof args.status;
      openedAt?: number;
      closedAt?: number;
    } = { status: args.status };
    if (args.status === "open") patch.openedAt = Date.now();
    if (args.status === "closed") patch.closedAt = Date.now();
    await ctx.db.patch(args.motionId, patch);
    await logAudit(ctx, {
      kind: "motion.status",
      summary: `Motion "${motion.title}" → ${args.status}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});

export const castBallot = mutation({
  args: {
    motionId: v.id("motions"),
    choice: v.union(
      v.literal("yes"),
      v.literal("no"),
      v.literal("abstain"),
      v.literal("recuse"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("Motion not found");
    if (motion.status !== "open") {
      throw new Error("Voting is closed for this motion");
    }
    const existing = await ctx.db
      .query("ballots")
      .withIndex("by_motion_voter", (q) =>
        q.eq("motionId", args.motionId).eq("voterSubject", identity.subject),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        choice: args.choice,
        castAt: Date.now(),
      });
    } else {
      await ctx.db.insert("ballots", {
        motionId: args.motionId,
        voterSubject: identity.subject,
        voterEmail: identity.email,
        choice: args.choice,
        castAt: Date.now(),
      });
    }
    await logAudit(ctx, {
      kind: "motion.ballot",
      summary: `Vote on "${motion.title}": ${args.choice}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});
