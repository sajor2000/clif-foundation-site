import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    category: v.string(),
    storageId: v.id("_storage"),
    contentType: v.string(),
    uploadedBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_category", ["category", "createdAt"]),

  boardMembers: defineTable({
    email: v.string(),
    role: v.optional(v.string()),
  }).index("by_email", ["email"]),
});
