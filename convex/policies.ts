import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
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
    const rows = await ctx.db.query("policies").order("desc").take(50);
    return rows.map((p) => ({
      _id: p._id,
      policyType: p.policyType,
      version: p.version,
      title: p.title,
      adoptedAt: p.adoptedAt,
      documentId: p.documentId,
      reportingInstructions: p.reportingInstructions,
    }));
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
    const { identity } = await requireBoardRole(ctx, ["secretary", "admin"]);
    const id = await ctx.db.insert("policies", {
      policyType: args.policyType,
      title: args.title.trim(),
      version: args.version,
      documentId: args.documentId,
      reportingInstructions: args.reportingInstructions,
      adoptedAt: args.adoptedAt ?? Date.now(),
    });
    await logAudit(ctx, {
      kind: "policy.register",
      summary: `Registered policy: ${args.title.trim()} (v${args.version})`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return id;
  },
});
