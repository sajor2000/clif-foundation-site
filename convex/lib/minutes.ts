import type { MinutesStatus } from "./vocab";

/**
 * Why a minutes status change is not allowed, or null if it is.
 * Flow: draft → published_for_review (meeting must be held) → approved, and
 * approval only ever comes from the board passing the approval motion.
 * Review can go back to draft; approved minutes are read-only.
 */
export function minutesTransitionError(
  from: MinutesStatus | null,
  to: MinutesStatus,
  meetingHeld: boolean,
): string | null {
  if (from === "approved") {
    return "Approved minutes are read-only. Start a new version to revise them.";
  }
  if (to === "approved") {
    return "Minutes are approved by a board vote. Send them to the board for approval.";
  }
  if (to === "published_for_review" && !meetingHeld) {
    return "Mark the meeting as held before sending its minutes for approval.";
  }
  return null;
}
