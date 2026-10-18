import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireBoardIdentity } from "./lib/auth";
import { coiCompletion } from "./lib/compliance";
import { loadDirectorEmails } from "./lib/directors";
import { POLICY_TYPES } from "./lib/vocab";

export const getDashboard = query({
  args: {
    /** Calendar year for COI disclosures. */
    year: v.number(),
    /** Form 990 tax year under review; defaults to the year before `year`. */
    taxYear: v.optional(v.number()),
  },
  returns: v.object({
    coi: v.object({
      submitted: v.number(),
      eligible: v.number(),
      missing: v.array(v.string()),
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
    const disclosures = await ctx.db
      .query("coiDisclosures")
      .withIndex("by_year_member", (q) => q.eq("year", args.year))
      .take(500);
    const coi = coiCompletion(
      await loadDirectorEmails(ctx),
      disclosures.map((d) => d.memberEmail),
    );
    const taxYear = args.taxYear ?? args.year - 1;

    const policies = await ctx.db.query("policies").take(100);
    const adoptedTypes = new Set(policies.map((p) => p.policyType));
    const types = POLICY_TYPES.map((p) => p.value);
    const adopted = types.filter((t) => adoptedTypes.has(t));
    const missing = types.filter((t) => !adoptedTypes.has(t));

    const review = await ctx.db
      .query("form990Reviews")
      .withIndex("by_tax_year", (q) => q.eq("taxYear", taxYear))
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
        .order("desc") // latest version: a revised, unapproved v2 is a gap
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
      coi,
      policies: { adopted, missing },
      form990: {
        taxYear,
        boardReviewedBeforeFiled: review?.boardReviewedBeforeFiled ?? false,
      },
      minutesGaps,
    };
  },
});

export const listAuditEvents = query({
  args: {
    since: v.optional(v.number()),
    until: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      id: v.id("auditEvents"),
      kind: v.string(),
      summary: v.string(),
      createdAt: v.number(),
      actorEmail: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const events = await ctx.db
      .query("auditEvents")
      .withIndex("by_created", (q) => {
        const from = args.since !== undefined ? q.gte("createdAt", args.since) : q;
        return args.until !== undefined ? from.lte("createdAt", args.until) : from;
      })
      .order("desc")
      .take(100);
    return events.map((e) => ({
        id: e._id,
        kind: e.kind,
        summary: e.summary,
        createdAt: e.createdAt,
        actorEmail: e.actorEmail,
      }));
  },
});
