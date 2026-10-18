import type { UserIdentity } from "convex/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

/**
 * The caller's email, lowercased, only if Clerk marked it verified. The
 * allowlist is keyed by email, so a token without email_verified counts as
 * unverified and never matches.
 */
export function verifiedEmail(identity: UserIdentity): string | undefined {
  return typeof identity.email === "string" && identity.emailVerified === true
    ? identity.email.toLowerCase()
    : undefined;
}

import type { BoardRole } from "./vocab";

export type { BoardRole };

async function isAllowlisted(ctx: Ctx, email: string | undefined) {
  if (!email) return false;
  const normalized = email.toLowerCase();
  const member = await ctx.db
    .query("boardMembers")
    .withIndex("by_email", (q) => q.eq("email", normalized))
    .unique();
  return member !== null;
}

export async function getBoardMember(ctx: Ctx, email: string | undefined) {
  if (!email) return null;
  return await ctx.db
    .query("boardMembers")
    .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
    .unique();
}

/** Authenticated Clerk user who is on the board allowlist (fail-closed). */
export async function requireBoardIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const email = verifiedEmail(identity);

  const allowlist = await ctx.db.query("boardMembers").take(1);
  if (allowlist.length === 0) {
    throw new Error(
      "Board allowlist empty. An admin must claim access via bootstrap first.",
    );
  }

  const ok = await isAllowlisted(ctx, email);
  if (!ok) {
    throw new Error("Unauthorized: board access required");
  }

  return { ...identity, email };
}

/**
 * Clerk identity only — for bootstrapAdmin when the allowlist is still empty.
 * Does not grant board data access.
 */
export async function requireClerkIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const email = verifiedEmail(identity);
  return { ...identity, email };
}

export async function requireBoardRole(ctx: Ctx, allowed: BoardRole[]) {
  const identity = await requireBoardIdentity(ctx);
  const member = await getBoardMember(ctx, identity.email);
  if (!member) {
    throw new Error("Unauthorized: board access required");
  }
  const role = (member.role ?? "member") as BoardRole;
  if (!allowed.includes(role) && role !== "admin") {
    throw new Error("Unauthorized: insufficient board role");
  }
  return { identity, role };
}

/**
 * Officers (President, Secretary, Treasurer) are full admins: they run
 * meetings, motions, documents, policies and the allowlist. Directors vote,
 * read documents and file their own COI. Legacy secretary/chair roles count
 * as officers.
 */
export async function requireOfficer(ctx: Ctx) {
  return requireBoardRole(ctx, ["admin", "secretary", "chair"]);
}

export function isOfficerRole(role: string | undefined): boolean {
  return role === "admin" || role === "secretary" || role === "chair";
}
