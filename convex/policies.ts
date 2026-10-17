import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";

const policyTypeValidator = v.union(
  v.literal("conflict_of_interest"),
  v.literal("whistleblower"),
  v.literal("document_retention"),
  v.literal("gift_acceptance"),
);

export const listPolicies = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("policies"),
      policyType: v.string(),
      version: v.number(),
      title: v.string(),
      adoptedAt: v.optional(v.number()),
      documentId: v.optional(v.id("documents")),
      reportingInstructions: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    await requireBoardIdentity(ctx);
    return await ctx.db.query("policies").order("desc").take(50);
  },
});

export const registerPolicy = mutation({
  args: {
    policyType: policyTypeValidator,
    title: v.string(),
    version: v.number(),
    documentId: v.optional(v.id("documents")),
    reportingInstructions: v.optional(v.string()),
    adoptedAt: v.optional(v.number()),
  },
  returns: v.id("policies"),
  handler: async (ctx, args) => {
    await requireBoardRole(ctx, ["secretary", "admin"]);
    return await ctx.db.insert("policies", {
      policyType: args.policyType,
      title: args.title.trim(),
      version: args.version,
      documentId: args.documentId,
      reportingInstructions: args.reportingInstructions,
      adoptedAt: args.adoptedAt ?? Date.now(),
    });
  },
});
