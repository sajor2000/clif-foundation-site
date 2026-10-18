import type { MinutesStatus } from "./vocab";

/**
 * Why a minutes status change is not allowed, or null if it is.
 * Flow: draft → published_for_review → approved (review can go back to draft).
 * Approval needs a review step and a meeting marked held; approved is read-only.
 */
export function minutesTransitionError(
  from: MinutesStatus | null,
  to: MinutesStatus,
  meetingHeld: boolean,
): string | null {
  if (from === "approved") {
    return "Approved minutes are read-only. Start a new version to revise them.";
  }
  if (to !== "approved") return null;
  if (from !== "published_for_review") {
    return "Publish the minutes for review before approving them.";
  }
  if (!meetingHeld) {
    return "Mark the meeting as held before approving its minutes.";
  }
  return null;
}
