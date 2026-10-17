/**
 * The portal's fixed vocabularies, defined once. Convex validators, TypeScript
 * types, and the client's select options and labels all come from here, so
 * adding a role or category is a one-file change.
 */
import { v, type VLiteral, type VUnion } from "convex/values";

/** A Convex union validator of the given string literals. */
function literals<T extends string>(
  values: readonly T[],
): VUnion<T, VLiteral<T, "required">[], "required"> {
  const [first, second, ...rest] = values.map((value) => v.literal(value));
  return v.union(first, second, ...rest);
}

const valuesOf = <T extends string>(items: readonly { value: T }[]) => items.map((i) => i.value);

export const BOARD_ROLES = ["member", "secretary", "chair", "admin"] as const;
export type BoardRole = (typeof BOARD_ROLES)[number];
export const boardRole = literals(BOARD_ROLES);

export const DOCUMENT_CATEGORIES = [
  { value: "tax", label: "Tax and Form 990" },
  { value: "policy", label: "Governance policy" },
  { value: "governance", label: "Governance" },
  { value: "financial", label: "Financial" },
  { value: "legal", label: "Legal and corporate" },
  { value: "meeting", label: "Meeting materials" },
  { value: "other", label: "Other" },
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];
export const documentCategory = literals(valuesOf(DOCUMENT_CATEGORIES));

export const RETENTION_CLASSES = [
  { value: "permanent", label: "Permanent (minutes, articles)" },
  { value: "7y", label: "7 years" },
  { value: "3y", label: "3 years" },
  { value: "1y", label: "1 year" },
] as const;
export type RetentionClass = (typeof RETENTION_CLASSES)[number]["value"];
export const retentionClass = literals(valuesOf(RETENTION_CLASSES));

export const POLICY_TYPES = [
  { value: "conflict_of_interest", label: "Conflict of interest" },
  { value: "whistleblower", label: "Whistleblower" },
  { value: "document_retention", label: "Document retention" },
  { value: "gift_acceptance", label: "Gift acceptance" },
] as const;
export type PolicyType = (typeof POLICY_TYPES)[number]["value"];
export const policyType = literals(valuesOf(POLICY_TYPES));

export const ACCESS_REQUEST_STATUSES = ["pending", "approved", "denied"] as const;
export type AccessRequestStatus = (typeof ACCESS_REQUEST_STATUSES)[number];
export const accessRequestStatus = literals(ACCESS_REQUEST_STATUSES);

export const MEETING_STATUSES = ["scheduled", "held", "cancelled"] as const;
export const meetingStatus = literals(MEETING_STATUSES);

export const MINUTES_STATUSES = ["draft", "published_for_review", "approved"] as const;
export type MinutesStatus = (typeof MINUTES_STATUSES)[number];
export const minutesStatus = literals(MINUTES_STATUSES);

export const MOTION_STATUSES = ["draft", "open", "closed"] as const;
export type MotionStatus = (typeof MOTION_STATUSES)[number];
export const motionStatus = literals(MOTION_STATUSES);

export const MOTION_TYPES = ["standard", "consent"] as const;
export type MotionType = (typeof MOTION_TYPES)[number];
export const motionType = literals(MOTION_TYPES);

export const BALLOT_CHOICES = ["yes", "no", "abstain", "recuse"] as const;
export type BallotChoice = (typeof BALLOT_CHOICES)[number];
export const ballotChoice = literals(BALLOT_CHOICES);
