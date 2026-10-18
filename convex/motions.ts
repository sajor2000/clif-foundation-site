import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { getBoardMember, requireBoardIdentity, requireOfficer } from "./lib/auth";
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
    const identity = await requireOfficer(ctx);
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

/**
 * Close a motion: freeze its result (the board record), and if it approves a
 * minutes version, approve those minutes when it passes or return them to
 * draft when it fails.
 */
async function closeMotion(
  ctx: MutationCtx,
  motion: Doc<"motions">,
  identity: { subject: string; email?: string },
) {
  const finalTally = await computeTally(ctx, { ...motion, status: "closed", finalTally: undefined });
  const closedAt = Date.now();
  await ctx.db.patch(motion._id, { status: "closed", closedAt, finalTally });
  await logAudit(ctx, {
    kind: "motion.status",
    summary: `Motion "${motion.title}" closed · ${finalTally.passed ? "passed" : "not passed"}`,
    actorSubject: identity.subject,
    actorEmail: identity.email,
  });
  if (motion.minutesId) {
    const minutes = await ctx.db.get(motion.minutesId);
    if (minutes && minutes.status !== "approved") {
      await ctx.db.patch(minutes._id, finalTally.passed
        ? { status: "approved", certifiedBy: identity.email ?? identity.subject, certifiedAt: closedAt, updatedAt: closedAt }
        : { status: "draft", updatedAt: closedAt });
      await logAudit(ctx, {
        kind: finalTally.passed ? "minutes.approved_by_vote" : "minutes.returned_to_draft",
        summary: `Minutes v${minutes.version} ${finalTally.passed ? "approved by board vote" : "not approved; back to draft"}`,
        actorSubject: identity.subject,
        actorEmail: identity.email,
      });
    }
  }
}

/**
 * Record a vote taken outside the portal (for example, in a meeting): the
 * officer enters each director's vote and the motion closes with that result.
 */
export const recordVote = mutation({
  args: {
    motionId: v.id("motions"),
    votes: v.array(v.object({ email: v.string(), choice: ballotChoice })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("Motion not found");
    if (motion.status !== "open") throw new Error("Open the motion before recording its vote");
    const directors = await loadDirectorEmails(ctx);
    const existing = await ctx.db
      .query("ballots")
      .withIndex("by_motion", (q) => q.eq("motionId", motion._id))
      .take(500);
    const seen = new Set<string>();
    for (const vote of args.votes) {
      const email = vote.email.trim().toLowerCase();
      if (!directors.has(email)) throw new Error(`Not a current director: ${email}`);
      if (seen.has(email)) throw new Error(`Recorded twice: ${email}`);
      seen.add(email);
      // Replace any ballot this director already cast for this motion.
      for (const b of existing) {
        if (b.voterEmail?.toLowerCase() === email) await ctx.db.delete(b._id);
      }
      await ctx.db.insert("ballots", {
        motionId: motion._id,
        voterSubject: `recorded:${email}`,
        voterEmail: email,
        choice: vote.choice,
        castAt: Date.now(),
      });
    }
    await ctx.db.patch(motion._id, { recordedBy: identity.email ?? identity.subject });
    await logAudit(ctx, {
      kind: "motion.recorded_vote",
      summary: `Recorded ${args.votes.length} votes on "${motion.title}"`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    await closeMotion(ctx, { ...motion, recordedBy: identity.email }, identity);
    return null;
  },
});

export const setMotionStatus = mutation({
  args: {
    motionId: v.id("motions"),
    status: motionStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireOfficer(ctx);
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

    if (to === "closed" && from === "open") {
      await closeMotion(ctx, motion, identity);
      return null;
    }
    await ctx.db.patch(args.motionId, {
      status: to,
      ...(to === "open" && from !== "open" ? { openedAt: Date.now() } : {}),
    });
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
