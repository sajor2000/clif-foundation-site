import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  accessRequestStatus,
  ballotChoice,
  boardRole,
  documentCategory,
  meetingStatus,
  minutesStatus,
  motionStatus,
  motionType,
  policyType,
  retentionClass,
} from "./lib/vocab";

export default defineSchema({
  orgSettings: defineTable({
    quorumFraction: v.number(),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),

  documents: defineTable({
    title: v.string(),
    category: documentCategory,
    storageId: v.id("_storage"),
    contentType: v.string(),
    uploadedBy: v.string(),
    createdAt: v.number(),
    retentionClass: retentionClass,
    legalHold: v.boolean(),
    taxYear: v.optional(v.number()),
    policyType: v.optional(policyType),
    reportingTag: v.optional(v.string()),
    /** Archived documents are hidden from lists and the reporting pack, never deleted. */
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.string()),
  })
    .index("by_created", ["createdAt"])
    .index("by_category", ["category", "createdAt"])
    .index("by_tax_year", ["taxYear", "createdAt"]),

  boardMembers: defineTable({
    email: v.string(),
    role: v.optional(boardRole),
    displayName: v.optional(v.string()),
    /** Counts toward meeting quorum / director attendance (not inferred from role). */
    isDirector: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  /** Signed-in people asking to join the allowlist; an admin approves or denies. */
  accessRequests: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    subject: v.string(),
    status: accessRequestStatus,
    createdAt: v.number(),
    decidedAt: v.optional(v.number()),
    decidedBy: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status", "createdAt"]),

  meetings: defineTable({
    title: v.string(),
    scheduledAt: v.number(),
    heldAt: v.optional(v.number()),
    status: meetingStatus,
    committeeLabel: v.optional(v.string()),
    quorumRequired: v.number(),
    attendeeEmails: v.array(v.string()),
    quorumMet: v.optional(v.boolean()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_scheduled", ["scheduledAt"])
    .index("by_status", ["status", "scheduledAt"]),

  minutes: defineTable({
    meetingId: v.id("meetings"),
    body: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    status: minutesStatus,
    version: v.number(),
    certifiedBy: v.optional(v.string()),
    certifiedAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId", "version"])
    .index("by_status", ["status", "updatedAt"]),

  minutesItems: defineTable({
    minutesId: v.id("minutes"),
    sortOrder: v.number(),
    title: v.string(),
    discussion: v.optional(v.string()),
    motionId: v.optional(v.id("motions")),
    coiRecusals: v.array(v.string()),
  }).index("by_minutes", ["minutesId", "sortOrder"]),

  motions: defineTable({
    meetingId: v.optional(v.id("meetings")),
    title: v.string(),
    description: v.optional(v.string()),
    motionType: motionType,
    status: motionStatus,
    policyAdoption: v.optional(policyType),
    openedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    /** Result frozen when the motion closes; later allowlist changes never alter it. */
    finalTally: v.optional(
      v.object({
        yes: v.number(),
        no: v.number(),
        abstain: v.number(),
        recuse: v.number(),
        eligible: v.number(),
        voted: v.number(),
        passed: v.boolean(),
      }),
    ),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_meeting", ["meetingId", "createdAt"]),

  ballots: defineTable({
    motionId: v.id("motions"),
    voterSubject: v.string(),
    voterEmail: v.optional(v.string()),
    choice: ballotChoice,
    castAt: v.number(),
  })
    .index("by_motion", ["motionId"])
    .index("by_motion_voter", ["motionId", "voterSubject"]),

  coiDisclosures: defineTable({
    year: v.number(),
    memberEmail: v.string(),
    memberSubject: v.string(),
    hasConflict: v.boolean(),
    details: v.optional(v.string()),
    submittedAt: v.number(),
  }).index("by_year_member", ["year", "memberEmail"]),

  policies: defineTable({
    policyType: policyType,
    version: v.number(),
    title: v.string(),
    documentId: v.optional(v.id("documents")),
    adoptedAt: v.optional(v.number()),
    motionId: v.optional(v.id("motions")),
    reportingInstructions: v.optional(v.string()),
  }).index("by_type", ["policyType", "version"]),

  form990Reviews: defineTable({
    taxYear: v.number(),
    documentId: v.optional(v.id("documents")),
    boardReviewedBeforeFiled: v.boolean(),
    reviewMeetingId: v.optional(v.id("meetings")),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_tax_year", ["taxYear"]),

  auditEvents: defineTable({
    kind: v.string(),
    summary: v.string(),
    actorSubject: v.string(),
    actorEmail: v.optional(v.string()),
    createdAt: v.number(),
    metadata: v.optional(v.string()),
  }).index("by_created", ["createdAt"]),
});
