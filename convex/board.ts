import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";

export const listMembers = query({
  args: {},
  returns: v.array(
    v.object({
      email: v.string(),
      role: v.optional(v.string()),
      displayName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    await requireBoardIdentity(ctx);
    return await ctx.db.query("boardMembers").take(200);
  },
});

export const upsertMember = mutation({
  args: {
    email: v.string(),
    role: v.optional(
      v.union(
        v.literal("member"),
        v.literal("secretary"),
        v.literal("chair"),
        v.literal("admin"),
      ),
    ),
    displayName: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireBoardRole(ctx, ["admin"]);
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("boardMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role ?? existing.role,
        displayName: args.displayName ?? existing.displayName,
      });
    } else {
      await ctx.db.insert("boardMembers", {
        email,
        role: args.role ?? "member",
        displayName: args.displayName,
      });
    }
    return null;
  },
});

/** Bootstrap: first authenticated user can claim admin when allowlist is empty. */
export const bootstrapAdmin = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await requireBoardIdentity(ctx);
    if (!identity.email) {
      throw new Error("Email required to bootstrap admin");
    }
    const any = await ctx.db.query("boardMembers").take(1);
    if (any.length > 0) {
      throw new Error("Allowlist already initialized");
    }
    await ctx.db.insert("boardMembers", {
      email: identity.email,
      role: "admin",
      displayName: identity.name ?? undefined,
    });
    return null;
  },
});
