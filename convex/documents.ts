import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireBoardIdentity } from "./lib/auth";

const categoryValidator = v.union(
  v.literal("governance"),
  v.literal("legal"),
  v.literal("meeting"),
  v.literal("other"),
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
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const identity = await requireBoardIdentity(ctx);
    if (!args.title.trim()) {
      throw new Error("Title is required");
    }
    return await ctx.db.insert("documents", {
      title: args.title.trim(),
      category: args.category,
      storageId: args.storageId,
      contentType: args.contentType,
      uploadedBy: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const listDocuments = query({
  args: {},
  returns: v.array(documentReturn),
  handler: async (ctx) => {
    await requireBoardIdentity(ctx);
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_created")
      .order("desc")
      .take(100);
    return docs;
  },
});

export const getDocumentUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireBoardIdentity(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});
