import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireBoardIdentity } from "./lib/auth";

const POLICY_TYPES = [
  "conflict_of_interest",
  "whistleblower",
  "document_retention",
  "gift_acceptance",
] as const;

export const getDashboard = query({
  args: { year: v.number() },
  returns: v.object({
    coi: v.object({
      submitted: v.number(),
      eligible: v.number(),
      complete: v.boolean(),
    }),
    policies: v.object({
      adopted: v.array(v.string()),
      missing: v.array(v.string()),
    }),
    form990: v.object({
      taxYear: v.number(),
      boardReviewedBeforeFiled: v.boolean(),
    }),
    minutesGaps: v.array(
      v.object({
        meetingId: v.id("meetings"),
        title: v.string(),
        scheduledAt: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const members = await ctx.db.query("boardMembers").take(200);
    const eligible = members.length > 0 ? members.length : 1;
    const disclosures = await ctx.db.query("coiDisclosures").take(500);
    const submitted = disclosures.filter((d) => d.year === args.year).length;

    const policies = await ctx.db.query("policies").take(100);
    const adoptedTypes = new Set(policies.map((p) => p.policyType));
    const adopted = POLICY_TYPES.filter((t) => adoptedTypes.has(t));
    const missing = POLICY_TYPES.filter((t) => !adoptedTypes.has(t));

    const review = await ctx.db
      .query("form990Reviews")
      .withIndex("by_tax_year", (q) => q.eq("taxYear", args.year))
      .unique();

    const held = await ctx.db
      .query("meetings")
      .withIndex("by_status", (q) => q.eq("status", "held"))
      .take(50);
    const minutesGaps = [];
    for (const m of held) {
      const minutes = await ctx.db
        .query("minutes")
        .withIndex("by_meeting", (q) => q.eq("meetingId", m._id))
        .first();
      if (!minutes || minutes.status !== "approved") {
        minutesGaps.push({
          meetingId: m._id,
          title: m.title,
          scheduledAt: m.scheduledAt,
        });
      }
    }

    return {
      coi: {
        submitted,
        eligible,
        complete: submitted >= eligible,
      },
      policies: { adopted, missing },
      form990: {
        taxYear: args.year,
        boardReviewedBeforeFiled: review?.boardReviewedBeforeFiled ?? false,
      },
      minutesGaps,
    };
  },
});

export const listAuditEvents = query({
  args: {},
  returns: v.array(
    v.object({
      kind: v.string(),
      summary: v.string(),
      createdAt: v.number(),
      actorEmail: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    await requireBoardIdentity(ctx);
    const events = await ctx.db
      .query("auditEvents")
      .withIndex("by_created")
      .order("desc")
      .take(50);
    return events.map((e) => ({
      kind: e.kind,
      summary: e.summary,
      createdAt: e.createdAt,
      actorEmail: e.actorEmail,
    }));
  },
});
