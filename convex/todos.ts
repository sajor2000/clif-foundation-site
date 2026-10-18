import { v } from "convex/values";
import { query } from "./_generated/server";
import { isOfficerRole, requireBoardIdentity, getBoardMember } from "./lib/auth";
import { form990TaxYear } from "./lib/compliance";
import { isDirector } from "./lib/directors";
import { POLICY_TYPES } from "./lib/vocab";

const todo = v.object({
  kind: v.union(
    v.literal("coi"),
    v.literal("vote"),
    v.literal("requests"),
    v.literal("minutes"),
    v.literal("policies"),
    v.literal("form990"),
  ),
  title: v.string(),
  detail: v.optional(v.string()),
  href: v.string(),
});

/** What the signed-in member should do next, most personal first. */
export const myTodos = query({
  args: {},
  returns: v.array(todo),
  handler: async (ctx) => {
    const identity = await requireBoardIdentity(ctx);
    const email = identity.email!;
    const member = await getBoardMember(ctx, email);
    const officer = isOfficerRole(member?.role);
    const director = isDirector(member);
    const now = new Date();
    const year = now.getUTCFullYear();
    const items: (typeof todo.type)[] = [];

    if (director) {
      const filed = await ctx.db
        .query("coiDisclosures")
        .withIndex("by_year_member", (q) => q.eq("year", year).eq("memberEmail", email))
        .first();
      if (!filed) {
        items.push({
          kind: "coi",
          title: `File your ${year} conflict of interest disclosure`,
          detail: "Annual, required of every director. Takes about two minutes.",
          href: "/portal/coi",
        });
      }

      const open = await ctx.db
        .query("motions")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .order("desc")
        .take(50);
      for (const motion of open) {
        const ballots = await ctx.db
          .query("ballots")
          .withIndex("by_motion", (q) => q.eq("motionId", motion._id))
          .take(500);
        if (ballots.some((b) => b.voterEmail?.toLowerCase() === email)) continue;
        items.push({
          kind: "vote",
          title: `Vote: ${motion.title}`,
          detail: motion.minutesId
            ? "Read the minutes, then vote to approve them."
            : motion.motionType === "consent"
              ? "Written consent: every director must vote yes."
              : undefined,
          href: `/portal/votes/${motion._id}`,
        });
      }
    }

    if (officer) {
      const pending = await ctx.db
        .query("accessRequests")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .take(100);
      if (pending.length) {
        items.push({
          kind: "requests",
          title: `Review ${pending.length} access ${pending.length === 1 ? "request" : "requests"}`,
          href: "/portal/members",
        });
      }

      const held = await ctx.db
        .query("meetings")
        .withIndex("by_status", (q) => q.eq("status", "held"))
        .take(50);
      for (const meeting of held) {
        const minutes = await ctx.db
          .query("minutes")
          .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
          .order("desc")
          .first();
        if (minutes?.status === "approved" || minutes?.status === "published_for_review") continue;
        items.push({
          kind: "minutes",
          title: `Send the minutes of ${meeting.title} for approval`,
          detail: minutes ? "Draft ready; put it to a board vote." : "Attach the minutes file first.",
          href: `/portal/meetings/${meeting._id}`,
        });
      }

      const policies = await ctx.db.query("policies").take(100);
      const have = new Set(policies.map((p) => p.policyType));
      const missing = POLICY_TYPES.filter((p) => !have.has(p.value)).map((p) => p.label);
      if (missing.length) {
        items.push({
          kind: "policies",
          title: "Register the board's governance policies",
          detail: `Still missing: ${missing.join(", ")}.`,
          href: "/portal/policies",
        });
      }

      const taxYear = form990TaxYear(now);
      const review = await ctx.db
        .query("form990Reviews")
        .withIndex("by_tax_year", (q) => q.eq("taxYear", taxYear))
        .unique();
      if (!review?.boardReviewedBeforeFiled) {
        items.push({
          kind: "form990",
          title: `Record the board's review of the ${taxYear} Form 990`,
          detail: "Before the return is filed.",
          href: "/portal/compliance",
        });
      }
    }

    return items;
  },
});
