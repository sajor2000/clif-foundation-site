import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity } from "./lib/auth";

export const getMyDisclosure = query({
  args: { year: v.number() },
  returns: v.union(
    v.object({
      hasConflict: v.boolean(),
      details: v.optional(v.string()),
      submittedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    if (!identity.email) return null;
    const row = await ctx.db
      .query("coiDisclosures")
      .withIndex("by_year_member", (q) =>
        q.eq("year", args.year).eq("memberEmail", identity.email!),
      )
      .unique();
    if (!row) return null;
    return {
      hasConflict: row.hasConflict,
      details: row.details,
      submittedAt: row.submittedAt,
    };
  },
});

export const listDisclosuresForYear = query({
  args: { year: v.number() },
  returns: v.array(
    v.object({
      memberEmail: v.string(),
      hasConflict: v.boolean(),
      submittedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const all = await ctx.db.query("coiDisclosures").take(500);
    return all
      .filter((d) => d.year === args.year)
      .map((d) => ({
        memberEmail: d.memberEmail,
        hasConflict: d.hasConflict,
        submittedAt: d.submittedAt,
      }));
  },
});

export const submitDisclosure = mutation({
  args: {
    year: v.number(),
    hasConflict: v.boolean(),
    details: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    if (!identity.email) {
      throw new Error("Clerk account must include an email for COI disclosure");
    }
    const existing = await ctx.db
      .query("coiDisclosures")
      .withIndex("by_year_member", (q) =>
        q.eq("year", args.year).eq("memberEmail", identity.email!),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        hasConflict: args.hasConflict,
        details: args.details,
        submittedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("coiDisclosures", {
        year: args.year,
        memberEmail: identity.email,
        memberSubject: identity.subject,
        hasConflict: args.hasConflict,
        details: args.details,
        submittedAt: Date.now(),
      });
    }
    await logAudit(ctx, {
      kind: "coi.submit",
      summary: `COI disclosure ${args.year}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});
