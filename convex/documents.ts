import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireBoardIdentity, requireBoardRole } from "./lib/auth";

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

const documentReturn = v.object({
  _id: v.id("documents"),
  _creationTime: v.number(),
  title: v.string(),
  category: v.string(),
  storageId: v.id("_storage"),
  contentType: v.string(),
  uploadedBy: v.string(),
  createdAt: v.number(),
  retentionClass: v.string(),
  legalHold: v.boolean(),
  taxYear: v.optional(v.number()),
  reportingTag: v.optional(v.string()),
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
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    if (!args.title.trim()) {
      throw new Error("Title is required");
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
    return id;
  },
});

async function attachUrls(
  ctx: { storage: { getUrl: (id: import("./_generated/dataModel").Id<"_storage">) => Promise<string | null> } },
  docs: Array<{
    _id: import("./_generated/dataModel").Id<"documents">;
    _creationTime: number;
    title: string;
    category: string;
    storageId: import("./_generated/dataModel").Id<"_storage">;
    contentType: string;
    uploadedBy: string;
    createdAt: number;
    retentionClass: string;
    legalHold: boolean;
    taxYear?: number;
    reportingTag?: string;
  }>,
) {
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
  },
  returns: v.array(documentReturn),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    let docs;
    if (args.category) {
      docs = await ctx.db
        .query("documents")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(200);
    } else {
      docs = await ctx.db
        .query("documents")
        .withIndex("by_created")
        .order("desc")
        .take(200);
    }
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

export const getDocumentUrl = query({
  args: { documentId: v.id("documents") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc) return null;
    return await ctx.storage.getUrl(doc.storageId);
  },
});

export const archiveDocument = mutation({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity } = await requireBoardRole(ctx, ["admin"]);
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    if (doc.legalHold) {
      throw new Error("Cannot archive: document is under legal hold");
    }
    await ctx.db.delete(args.documentId);
    try {
      await ctx.storage.delete(doc.storageId);
    } catch {
      // Blob may already be gone; metadata delete already applied.
    }
    await logAudit(ctx, {
      kind: "document.archive",
      summary: `Archived document: ${doc.title}`,
      actorSubject: identity.subject,
      actorEmail: identity.email,
    });
    return null;
  },
});
