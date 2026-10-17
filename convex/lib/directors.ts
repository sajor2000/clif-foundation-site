/** Explicit director eligibility — never infer from access role. */
export function isDirector(
  member: { isDirector?: boolean } | null | undefined,
): boolean {
  if (!member) return false;
  // Default true for rows created before the field existed.
  return member.isDirector !== false;
}
