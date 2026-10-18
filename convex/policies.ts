import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";
import { policyType } from "./lib/vocab";

export const listPolicies = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("policies"),
      policyType,
      version: v.number(),
      title: v.string(),
      adoptedAt: v.optional(v.number()),
      motionId: v.optional(v.id("motions")),
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
      motionId: p.motionId,
      documentId: p.documentId,
      reportingInstructions: p.reportingInstructions,
    }));
  },
});

export const registerPolicy = mutation({
  args: {
    policyType: policyType,
    title: v.string(),
    version: v.number(),
    documentId: v.optional(v.id("documents")),
    reportingInstructions: v.optional(v.string()),
    adoptedAt: v.optional(v.number()),
    /** The passed motion that adopted this policy; its close date becomes adoptedAt. */
    motionId: v.optional(v.id("motions")),
  },
  returns: v.id("policies"),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["secretary", "admin"]);
    let adoptedAt = args.adoptedAt;
    if (args.motionId) {
      const motion = await ctx.db.get(args.motionId);
      if (!motion || motion.status !== "closed" || !motion.finalTally?.passed) {
        throw new Error("Link a closed motion that passed");
      }
      adoptedAt = motion.closedAt;
    }
    const id = await ctx.db.insert("policies", {
      policyType: args.policyType,
      title: args.title.trim(),
      version: args.version,
      documentId: args.documentId,
      reportingInstructions: args.reportingInstructions,
      adoptedAt: adoptedAt ?? Date.now(),
      motionId: args.motionId,
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
