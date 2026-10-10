import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

async function isAllowlisted(ctx: Ctx, email: string | undefined) {
  if (!email) return false;
  const normalized = email.toLowerCase();
  const member = await ctx.db
    .query("boardMembers")
    .withIndex("by_email", (q) => q.eq("email", normalized))
    .unique();
  return member !== null;
}

/**
 * Require Clerk identity via Convex auth. Optionally enforce board allowlist
 * when any boardMembers rows exist; empty allowlist = any authenticated user.
 */
export async function requireBoardIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const email =
    typeof identity.email === "string" ? identity.email.toLowerCase() : undefined;

  const allowlist = await ctx.db.query("boardMembers").take(1);
  if (allowlist.length > 0) {
    const ok = await isAllowlisted(ctx, email);
    if (!ok) {
      throw new Error("Unauthorized: board access required");
    }
  }

  return identity;
}
