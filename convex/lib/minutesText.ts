import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { loadDirectorEmails } from "./directors";
import { tallyBallots } from "./tally";

/**
 * The text record of a meeting: attendance and quorum, the given minutes
 * version with its agenda items and COI recusals, and each motion's vote.
 * Used by the meeting export and the reporting pack so both read the same.
 */
export async function buildMinutesText(
  ctx: QueryCtx,
  meeting: Doc<"meetings">,
  minutes: Doc<"minutes"> | null,
): Promise<string> {
    const items = minutes
      ? await ctx.db
          .query("minutesItems")
          .withIndex("by_minutes", (q) => q.eq("minutesId", minutes._id))
          .take(200)
      : [];
    const lines = [
      `# ${meeting.title}`,
      ``,
      `Scheduled: ${new Date(meeting.scheduledAt).toISOString()}`,
      `Status: ${meeting.status}`,
      `Quorum required: ${meeting.quorumRequired}`,
      `Present (${meeting.attendeeEmails.length}): ${meeting.attendeeEmails.join(", ") || "—"}`,
      `Quorum met: ${meeting.quorumMet ? "yes" : "no"}`,
      ``,
    ];
    if (minutes) {
      lines.push(`## Minutes (v${minutes.version}, ${minutes.status})`, ``);
      if (minutes.body) lines.push(minutes.body, ``);
      for (const item of items) {
        lines.push(`### ${item.title}`);
        if (item.discussion) lines.push(item.discussion);
        if (item.coiRecusals.length) {
          lines.push(`Recused: ${item.coiRecusals.join(", ")}`);
        }
        lines.push(``);
      }
    }

    const motions = await ctx.db
      .query("motions")
      .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
      .take(50);
    if (motions.length) {
      const directorEmails = await loadDirectorEmails(ctx);
      lines.push(`## Motions and votes`, ``);
      for (const motion of motions) {
        const ballots = await ctx.db
          .query("ballots")
          .withIndex("by_motion", (q) => q.eq("motionId", motion._id))
          .take(200);
        const t =
          motion.status === "closed" && motion.finalTally
            ? motion.finalTally
            : tallyBallots(ballots, directorEmails, motion.motionType, motion.status);
        lines.push(
          `### ${motion.title} (${motion.status}, ${motion.motionType})`,
          `Yes ${t.yes} · No ${t.no} · Abstain ${t.abstain} · Recuse ${t.recuse}` +
            (motion.status === "closed" ? ` · ${t.passed ? "Passed" : "Not passed"}` : ""),
          ``,
        );
      }
    }

    return lines.join("\n");
}
