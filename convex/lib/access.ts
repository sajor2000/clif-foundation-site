export type AccessRequestStatus = "pending" | "approved" | "denied";

/**
 * Who may claim admin while the allowlist is empty: only BOOTSTRAP_ADMIN_EMAIL.
 * Fails closed — if the variable is missing, nobody can claim admin.
 */
export function canBootstrapAdmin(
  email: string | undefined,
  requiredEmail: string | undefined,
): boolean {
  if (!email) return false;
  const required = requiredEmail?.trim().toLowerCase();
  if (!required) return false;
  return email.trim().toLowerCase() === required;
}

/** What `requestAccess` should do given the caller's current request and membership. */
export function requestAccessOutcome(
  existing: AccessRequestStatus | null,
  isMember: boolean,
): "already_member" | "create" | "keep" | "reopen" {
  if (isMember) return "already_member";
  if (existing === null) return "create";
  if (existing === "pending") return "keep";
  return "reopen";
}

/**
 * True if setting `email`'s role to `nextRole` (null = removing them) would
 * leave the allowlist with no admin, locking everyone out of approvals.
 */
export function leavesNoAdmin(
  members: ReadonlyArray<{ email: string; role?: string }>,
  email: string,
  nextRole: string | null,
): boolean {
  const target = email.trim().toLowerCase();
  const adminsAfter = members.filter((m) =>
    m.email.toLowerCase() === target ? nextRole === "admin" : (m.role ?? "member") === "admin",
  );
  return adminsAfter.length === 0;
}
