import type { MutationCtx } from "../_generated/server";

export async function logAudit(
  ctx: MutationCtx,
  args: {
    kind: string;
    summary: string;
    actorSubject: string;
    actorEmail?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await ctx.db.insert("auditEvents", {
    kind: args.kind,
    summary: args.summary,
    actorSubject: args.actorSubject,
    actorEmail: args.actorEmail,
    createdAt: Date.now(),
    metadata: args.metadata ? JSON.stringify(args.metadata) : undefined,
  });
}
