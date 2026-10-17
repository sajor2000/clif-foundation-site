import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { getBoardMember, requireBoardIdentity, requireBoardRole } from "./lib/auth";
import { isDirector, loadDirectorEmails } from "./lib/directors";
import { tallyBallots } from "./lib/tally";
import { ballotChoice, motionStatus, motionType } from "./lib/vocab";
import schema from "./schema";

// Raw motion rows are returned, so the validator must match the table exactly.
const motionReturn = v.object({
  _id: v.id("motions"),
  _creationTime: v.number(),
  ...schema.tables.motions.validator.fields,
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
      motionStatus,
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

    const directorEmails = await loadDirectorEmails(ctx);
    const results = [];
    for (const motion of motions) {
      results.push({
        motion,
        tally: await computeTally(ctx, motion, directorEmails),
      });
    }
    return results;
  },
});

/** Live tally for open/draft motions; the frozen result for closed ones. */
async function computeTally(
  ctx: QueryCtx,
  motion: Pick<Doc<"motions">, "_id" | "motionType" | "status" | "finalTally">,
  directorEmails?: Set<string>,
) {
  if (motion.status === "closed" && motion.finalTally) return motion.finalTally;
  const ballots = await ctx.db
    .query("ballots")
    .withIndex("by_motion", (q) => q.eq("motionId", motion._id))
    .take(500);
  return tallyBallots(
    ballots,
    directorEmails ?? (await loadDirectorEmails(ctx)),
    motion.motionType,
    motion.status,
  );
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
    const tally = await computeTally(ctx, motion);
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
    motionType,
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
    status: motionStatus,
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
      finalTally?: Doc<"motions">["finalTally"];
    } = { status: args.status };
    if (args.status === "open") patch.openedAt = Date.now();
    if (args.status === "closed" && from !== "closed") {
      patch.closedAt = Date.now();
      // Freeze the result: this is the board record for the vote.
      patch.finalTally = await computeTally(ctx, { ...motion, status: "closed", finalTally: undefined });
    }
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
    choice: ballotChoice,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    // Only directors vote; officers or admins who are not directors cannot.
    if (!isDirector(await getBoardMember(ctx, identity.email))) {
      throw new Error("Only directors can vote on motions");
    }
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
        voterEmail: identity.email, // backfill legacy ballots so they count
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
