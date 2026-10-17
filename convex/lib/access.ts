export type AccessRequestStatus = "pending" | "approved" | "denied";

/**
 * Who may claim admin while the allowlist is empty. When BOOTSTRAP_ADMIN_EMAIL
 * is set (production), only that address may; otherwise any signed-in email.
 */
export function canBootstrapAdmin(
  email: string | undefined,
  requiredEmail: string | undefined,
): boolean {
  if (!email) return false;
  const required = requiredEmail?.trim().toLowerCase();
  if (!required) return true;
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
