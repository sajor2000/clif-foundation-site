import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canBootstrapAdmin, leavesNoAdmin, requestAccessOutcome } from "./lib/access";
import { logAudit } from "./lib/audit";
import { isDirector } from "./lib/directors";
import {
  getBoardMember,
  requireBoardIdentity,
  requireBoardRole,
  requireClerkIdentity,
} from "./lib/auth";

export const listMembers = query({
  args: {},
  returns: v.array(
    v.object({
      email: v.string(),
      role: v.optional(v.string()),
      displayName: v.optional(v.string()),
      isDirector: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    await requireBoardIdentity(ctx);
    const rows = await ctx.db.query("boardMembers").take(200);
    return rows.map((m) => ({
      email: m.email,
      role: m.role,
      displayName: m.displayName,
      isDirector: m.isDirector !== false,
    }));
  },
});

export const myRole = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    try {
      const identity = await requireBoardIdentity(ctx);
      if (!identity.email) return null;
      const member = await ctx.db
        .query("boardMembers")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .unique();
      return member?.role ?? (member ? "member" : null);
    } catch {
      // Allowlist empty or not a member — UI shows bootstrap / denied.
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      const any = await ctx.db.query("boardMembers").take(1);
      if (any.length > 0) return null;
      // Only the designated email is offered Claim admin; everyone else requests access.
      const email =
        typeof identity.email === "string" && identity.emailVerified === true
          ? identity.email
          : undefined;
      return canBootstrapAdmin(email, process.env.BOOTSTRAP_ADMIN_EMAIL)
        ? "bootstrap_eligible"
        : null;
    }
  },
});

/** Whether the signed-in member counts as a director (directors are the only voters). */
export const amIDirector = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await requireBoardIdentity(ctx);
    return isDirector(await getBoardMember(ctx, identity.email));
  },
});

export const upsertMember = mutation({
  args: {
    email: v.string(),
    role: v.optional(
      v.union(
        v.literal("member"),
        v.literal("secretary"),
        v.literal("chair"),
        v.literal("admin"),
      ),
    ),
    displayName: v.optional(v.string()),
    isDirector: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["admin"]);
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("boardMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing && args.role && args.role !== (existing.role ?? "member")) {
      const members = await ctx.db.query("boardMembers").take(200);
      if (leavesNoAdmin(members, email, args.role)) {
        throw new Error("The board needs at least one admin. Make someone else admin first.");
      }
    }
    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role ?? existing.role,
        displayName: args.displayName ?? existing.displayName,
        isDirector: args.isDirector ?? existing.isDirector ?? true,
      });
    } else {
      await ctx.db.insert("boardMembers", {
        email,
        role: args.role ?? "member",
        displayName: args.displayName,
        isDirector: args.isDirector ?? true,
      });
    }
    await logAudit(ctx, {
      kind: "board.member_upsert",
      summary: `Allowlist upsert: ${email}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});

/** Take someone off the allowlist; they lose portal access immediately. */
export const removeMember = mutation({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["admin"]);
    const email = args.email.trim().toLowerCase();
    const member = await ctx.db
      .query("boardMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!member) throw new Error("That email is not on the allowlist");
    const members = await ctx.db.query("boardMembers").take(200);
    if (leavesNoAdmin(members, email, null)) {
      throw new Error("The board needs at least one admin. Make someone else admin first.");
    }
    await ctx.db.delete(member._id);
    await logAudit(ctx, {
      kind: "board.member_remove",
      summary: `Removed from allowlist: ${email}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});

/**
 * Bootstrap: claim admin while the allowlist is empty. Limited to
 * BOOTSTRAP_ADMIN_EMAIL; nobody if that Convex env var is unset.
 */
export const bootstrapAdmin = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await requireClerkIdentity(ctx);
    if (!identity.email) {
      throw new Error("Email required to bootstrap admin");
    }
    if (!canBootstrapAdmin(identity.email, process.env.BOOTSTRAP_ADMIN_EMAIL)) {
      throw new Error("Only the foundation's designated admin email can claim admin");
    }

    // Serialize via singleton orgSettings row: only one bootstrap may create it.
    const settings = await ctx.db.query("orgSettings").take(1);
    const members = await ctx.db.query("boardMembers").take(1);
    if (members.length > 0 || settings.length > 0) {
      throw new Error("Allowlist already initialized");
    }

    await ctx.db.insert("orgSettings", {
      quorumFraction: 0.5,
      updatedAt: Date.now(),
      updatedBy: identity.subject,
    });

    // Re-check after occupying the settings singleton (OCC retries if conflict).
    const again = await ctx.db.query("boardMembers").take(1);
    if (again.length > 0) {
      throw new Error("Allowlist already initialized");
    }

    await ctx.db.insert("boardMembers", {
      email: identity.email,
      role: "admin",
      displayName: identity.name ?? undefined,
      // Claiming admin is usually a director; toggle off in Members if not.
      isDirector: true,
    });
    await logAudit(ctx, {
      kind: "board.bootstrap",
      summary: `Bootstrap admin: ${identity.email}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});

const boardRoleArg = v.union(
  v.literal("member"),
  v.literal("secretary"),
  v.literal("chair"),
  v.literal("admin"),
);

const requestStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("denied"),
);

/** Signed-in, not-yet-allowlisted user asks an admin for access. */
export const requestAccess = mutation({
  args: {},
  returns: v.union(v.literal("already_member"), requestStatus),
  handler: async (ctx) => {
    const identity = await requireClerkIdentity(ctx);
    const email = identity.email;
    if (!email) {
      throw new Error("A verified email is required to request access");
    }
    const member = await ctx.db
      .query("boardMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    const existing = await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const outcome = requestAccessOutcome(existing?.status ?? null, member !== null);
    if (outcome === "already_member") return "already_member";
    if (outcome === "keep") return "pending";

    const name = identity.name ?? undefined;
    if (outcome === "create") {
      await ctx.db.insert("accessRequests", {
        email,
        name,
        subject: identity.subject,
        status: "pending",
        createdAt: Date.now(),
      });
    } else if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        subject: identity.subject,
        status: "pending",
        createdAt: Date.now(),
        decidedAt: undefined,
        decidedBy: undefined,
      });
    }
    await logAudit(ctx, {
      kind: "board.access_requested",
      summary: `Access requested: ${email}`,
      actorSubject: identity.subject,
      actorEmail: email,
    });
    return "pending";
  },
});

/** The caller's own access request status, or null if they have not asked. */
export const myAccessRequest = query({
  args: {},
  returns: v.union(requestStatus, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || typeof identity.email !== "string" || identity.emailVerified !== true) {
      return null;
    }
    const email = identity.email.toLowerCase();
    const existing = await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    return existing?.status ?? null;
  },
});

export const listAccessRequests = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("accessRequests"),
      email: v.string(),
      name: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireBoardRole(ctx, ["admin"]);
    const rows = await ctx.db
      .query("accessRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(100);
    return rows.map((r) => ({
      id: r._id,
      email: r.email,
      name: r.name,
      createdAt: r.createdAt,
    }));
  },
});

export const decideAccessRequest = mutation({
  args: {
    id: v.id("accessRequests"),
    approve: v.boolean(),
    role: v.optional(boardRoleArg),
    isDirector: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["admin"]);
    const request = await ctx.db.get(args.id);
    if (!request || request.status !== "pending") {
      throw new Error("This request was already handled");
    }

    if (args.approve) {
      const existing = await ctx.db
        .query("boardMembers")
        .withIndex("by_email", (q) => q.eq("email", request.email))
        .unique();
      if (!existing) {
        await ctx.db.insert("boardMembers", {
          email: request.email,
          role: args.role ?? "member",
          displayName: request.name,
          isDirector: args.isDirector ?? true,
        });
      }
    }

    await ctx.db.patch(request._id, {
      status: args.approve ? "approved" : "denied",
      decidedAt: Date.now(),
      decidedBy: identity.email,
    });
    await logAudit(ctx, {
      kind: args.approve ? "board.access_approved" : "board.access_denied",
      summary: `${args.approve ? "Approved" : "Denied"} access: ${request.email}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
      metadata: args.approve ? { role: args.role ?? "member" } : undefined,
    });
    return null;
  },
});
