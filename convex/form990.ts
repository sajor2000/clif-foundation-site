import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";

export const getReview = query({
  args: { taxYear: v.number() },
  returns: v.union(
    v.object({
      taxYear: v.number(),
      boardReviewedBeforeFiled: v.boolean(),
      reviewedAt: v.optional(v.number()),
      documentId: v.optional(v.id("documents")),
      notes: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const row = await ctx.db
      .query("form990Reviews")
      .withIndex("by_tax_year", (q) => q.eq("taxYear", args.taxYear))
      .unique();
    if (!row) return null;
    return {
      taxYear: row.taxYear,
      boardReviewedBeforeFiled: row.boardReviewedBeforeFiled,
      reviewedAt: row.reviewedAt,
      documentId: row.documentId,
      notes: row.notes,
    };
  },
});

export const upsertReview = mutation({
  args: {
    taxYear: v.number(),
    boardReviewedBeforeFiled: v.boolean(),
    documentId: v.optional(v.id("documents")),
    reviewMeetingId: v.optional(v.id("meetings")),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, [
      "secretary",
      "chair",
      "admin",
    ]);
    if (args.boardReviewedBeforeFiled && !args.reviewMeetingId && !args.notes) {
      throw new Error(
        "Link a review meeting or add notes when marking 990 as board-reviewed",
      );
    }
    const existing = await ctx.db
      .query("form990Reviews")
      .withIndex("by_tax_year", (q) => q.eq("taxYear", args.taxYear))
      .unique();
    const payload = {
      taxYear: args.taxYear,
      boardReviewedBeforeFiled: args.boardReviewedBeforeFiled,
      documentId: args.documentId,
      reviewMeetingId: args.reviewMeetingId,
      notes: args.notes,
      reviewedAt: args.boardReviewedBeforeFiled ? Date.now() : undefined,
      reviewedBy: args.boardReviewedBeforeFiled ? identity.subject : undefined,
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("form990Reviews", payload);
    }
    await logAudit(ctx, {
      kind: "form990.review",
      summary: `Form 990 ${args.taxYear} review updated`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});
