import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireBoardIdentity } from "./lib/auth";

const sectionDoc = v.object({
  _id: v.id("documents"),
  title: v.string(),
  category: v.string(),
  createdAt: v.number(),
  taxYear: v.optional(v.number()),
  retentionClass: v.string(),
  downloadUrl: v.union(v.string(), v.null()),
});

export const getReportingPack = query({
  args: { taxYear: v.optional(v.number()) },
  returns: v.object({
    generatedAt: v.number(),
    sections: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        description: v.string(),
        documents: v.array(sectionDoc),
      }),
    ),
    approvedMinutesExports: v.array(
      v.object({
        meetingId: v.id("meetings"),
        title: v.string(),
        exportText: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const allDocs = await ctx.db
      .query("documents")
      .withIndex("by_created")
      .order("desc")
      .take(300);

    const withUrl = async (d: (typeof allDocs)[number]) => {
      return {
        _id: d._id,
        title: d.title,
        category: d.category,
        createdAt: d.createdAt,
        taxYear: d.taxYear,
        retentionClass: d.retentionClass,
        downloadUrl: await ctx.storage.getUrl(d.storageId),
      };
    };

    const taxYear = args.taxYear ?? new Date().getFullYear();
    const taxDocs = allDocs.filter(
      (d) =>
        d.category === "tax" ||
        d.reportingTag === "form_990" ||
        d.taxYear === taxYear,
    );
    const policyDocs = allDocs.filter(
      (d) => d.category === "policy" || d.category === "governance",
    );
    const financialDocs = allDocs.filter((d) => d.category === "financial");
    const legalDocs = allDocs.filter((d) => d.category === "legal");
    const meetingDocs = allDocs.filter((d) => d.category === "meeting");

    const sections = [
      {
        id: "tax",
        label: "Tax and Form 990",
        description:
          "Returns, drafts, and determination materials for CPA and board review.",
        documents: await Promise.all(taxDocs.map(withUrl)),
      },
      {
        id: "policies",
        label: "Governance policies",
        description: "COI, whistleblower, retention, and gift acceptance policies.",
        documents: await Promise.all(policyDocs.map(withUrl)),
      },
      {
        id: "financial",
        label: "Financial",
        description: "Statements and schedules for audits and grant reporting.",
        documents: await Promise.all(financialDocs.map(withUrl)),
      },
      {
        id: "legal",
        label: "Legal and corporate",
        description: "Articles, bylaws, and corporate filings.",
        documents: await Promise.all(legalDocs.map(withUrl)),
      },
      {
        id: "meetings",
        label: "Meeting materials",
        description: "Agendas, decks, and supporting meeting files.",
        documents: await Promise.all(meetingDocs.map(withUrl)),
      },
    ];

    const approved = await ctx.db
      .query("minutes")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(20);

    const approvedMinutesExports = [];
    for (const min of approved) {
      const meeting = await ctx.db.get(min.meetingId);
      if (!meeting) continue;
      const items = await ctx.db
        .query("minutesItems")
        .withIndex("by_minutes", (q) => q.eq("minutesId", min._id))
        .collect();
      const lines = [
        `# ${meeting.title}`,
        `Approved minutes v${min.version}`,
        meeting.attendeeEmails.length
          ? `Present: ${meeting.attendeeEmails.join(", ")}`
          : "",
        min.body ?? "",
        ...items.map((i) => `## ${i.title}\n${i.discussion ?? ""}`),
      ].filter(Boolean);
      approvedMinutesExports.push({
        meetingId: meeting._id,
        title: meeting.title,
        exportText: lines.join("\n\n"),
      });
    }

    return {
      generatedAt: Date.now(),
      sections,
      approvedMinutesExports,
    };
  },
});
