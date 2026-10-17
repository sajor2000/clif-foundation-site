import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { uploadRejection } from "./lib/uploads";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";
import schema from "./schema";

const categoryValidator = v.union(
  v.literal("governance"),
  v.literal("legal"),
  v.literal("meeting"),
  v.literal("policy"),
  v.literal("tax"),
  v.literal("financial"),
  v.literal("other"),
);

const retentionValidator = v.union(
  v.literal("permanent"),
  v.literal("7y"),
  v.literal("3y"),
  v.literal("1y"),
);

// Raw rows plus a download URL, so the validator must match the table exactly.
const documentReturn = v.object({
  _id: v.id("documents"),
  _creationTime: v.number(),
  ...schema.tables.documents.validator.fields,
  downloadUrl: v.union(v.string(), v.null()),
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireBoardIdentity(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    storageId: v.id("_storage"),
    title: v.string(),
    category: categoryValidator,
    contentType: v.string(),
    retentionClass: v.optional(retentionValidator),
    taxYear: v.optional(v.number()),
    reportingTag: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ ok: v.literal(true), id: v.id("documents") }),
    v.object({ ok: v.literal(false), error: v.string() }),
  ),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    if (!args.title.trim()) {
      throw new Error("Title is required");
    }
    const file = await ctx.db.system.get(args.storageId);
    if (!file) {
      throw new Error("Upload not found; try again");
    }
    const rejection = uploadRejection(file.size, file.contentType ?? args.contentType);
    if (rejection) {
      // Return instead of throwing: a thrown error would roll back this delete.
      await ctx.storage.delete(args.storageId);
      return { ok: false as const, error: rejection };
    }
    const id = await ctx.db.insert("documents", {
      title: args.title.trim(),
      category: args.category,
      storageId: args.storageId,
      contentType: args.contentType,
      uploadedBy: identity.subject,
      createdAt: Date.now(),
      retentionClass: args.retentionClass ?? "permanent",
      legalHold: false,
      taxYear: args.taxYear,
      reportingTag: args.reportingTag,
    });
    await logAudit(ctx, {
      kind: "document.upload",
      summary: `Uploaded document: ${args.title.trim()}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
      metadata: { documentId: id, category: args.category },
    });
    return { ok: true as const, id };
  },
});

async function attachUrls(ctx: QueryCtx, docs: Doc<"documents">[]) {
  return Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      downloadUrl: await ctx.storage.getUrl(doc.storageId),
    })),
  );
}

export const listDocuments = query({
  args: {
    category: v.optional(categoryValidator),
    search: v.optional(v.string()),
    /** Show only archived documents instead of the active library. */
    archived: v.optional(v.boolean()),
  },
  returns: v.array(documentReturn),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const wantArchived = args.archived === true;
    const base = args.category
      ? ctx.db
          .query("documents")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
      : ctx.db.query("documents").withIndex("by_created");
    // Filter archive state before the limit so the cap never hides matching rows.
    const docs = await base
      .order("desc")
      .filter((q) =>
        wantArchived
          ? q.neq(q.field("archivedAt"), undefined)
          : q.eq(q.field("archivedAt"), undefined),
      )
      .take(200);
    const needle = args.search?.trim().toLowerCase();
    const filtered = needle
      ? docs.filter(
          (d) =>
            d.title.toLowerCase().includes(needle) ||
            d.reportingTag?.toLowerCase().includes(needle),
        )
      : docs;
    return attachUrls(ctx, filtered);
  },
});

export const setLegalHold = mutation({
  args: { documentId: v.id("documents"), legalHold: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["admin", "secretary"]);
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    await ctx.db.patch(args.documentId, { legalHold: args.legalHold });
    await logAudit(ctx, {
      kind: "document.legal_hold",
      summary: `${args.legalHold ? "Set" : "Cleared"} legal hold on ${doc.title}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});

/** Hide a document from the library and reporting pack. Nothing is deleted. */
export const archiveDocument = mutation({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["admin", "secretary"]);
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    if (doc.legalHold) {
      throw new Error("Cannot archive: document is under legal hold");
    }
    if (doc.archivedAt !== undefined) return null;
    await ctx.db.patch(args.documentId, {
      archivedAt: Date.now(),
      archivedBy: identity.email ?? identity.subject,
    });
    await logAudit(ctx, {
      kind: "document.archive",
      summary: `Archived document: ${doc.title}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});

export const restoreDocument = mutation({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["admin", "secretary"]);
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    if (doc.archivedAt === undefined) return null;
    await ctx.db.patch(args.documentId, { archivedAt: undefined, archivedBy: undefined });
    await logAudit(ctx, {
      kind: "document.restore",
      summary: `Restored document: ${doc.title}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});
