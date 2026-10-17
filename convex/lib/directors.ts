import type { QueryCtx } from "../_generated/server";

/** Explicit director eligibility — never infer from access role. */
export function isDirector(
  member: { isDirector?: boolean } | null | undefined,
): boolean {
  if (!member) return false;
  // Default true for rows created before the field existed.
  return member.isDirector !== false;
}

/** Lowercased emails of everyone who currently counts as a director. */
export async function loadDirectorEmails(ctx: QueryCtx): Promise<Set<string>> {
  const members = await ctx.db.query("boardMembers").take(200);
  return new Set(members.filter(isDirector).map((m) => m.email.toLowerCase()));
}
