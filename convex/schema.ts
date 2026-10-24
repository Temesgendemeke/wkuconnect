import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * WKU Connect - Convex database schema.
 *
 * Identity / privacy model:
 * - The only table that stores Telegram data is `users` (telegramId), and it is
 *   indexed with the dedicated `telegramId` index. It is used solely to map a
 *   verified Telegram session to a Convex user and is NEVER returned to the
 *   frontend. All public-facing identity lives on displayName, campusRole,
 *   bio, major, skills, and avatarUrl.
 * - The listing conversation messages do not store any external Telegram
 *   handles, phone numbers, or usernames.
 */

export const CATEGORIES = [
  "buy",
  "sell",
  "service",
  "collab",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const LISTING_STATUSES = ["active", "sold"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const CAMPUS_ROLES = ["student", "faculty", "staff"] as const;
export type CampusRole = (typeof CAMPUS_ROLES)[number];

const campusRole = v.union(...CAMPUS_ROLES.map((r) => v.literal(r)));
const category = v.union(...CATEGORIES.map((c) => v.literal(c)));
const listingStatus = v.union(...LISTING_STATUSES.map((s) => v.literal(s)));

const users = defineTable({
  // Remove from clients via a custom query projection. Never leak externally.
  telegramId: v.string(),
  displayName: v.string(),
  campusRole,
  bio: v.optional(v.string()),
  major: v.optional(v.string()),
  skills: v.array(v.string()),
  avatarUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_telegramId", ["telegramId"])
  .index("by_createdAt", ["createdAt"])
  .index("by_major", ["major"]);

const listings = defineTable({
  creatorId: v.id("users"),
  title: v.string(),
  description: v.string(),
  price: v.optional(v.number()),
  category,
  mediaStorageIds: v.array(v.string()),
  telegramMessageId: v.optional(v.number()),
  status: listingStatus,
  createdAt: v.number(),
})
  .index("by_creator", ["creatorId"])
  .index("by_createdAt", ["createdAt"])
  .index("by_category", ["category"])
  .index("by_status", ["status"]);

const conversations = defineTable({
  participantOne: v.id("users"),
  participantTwo: v.id("users"),
  updatedAt: v.number(),
})
  .index("by_participantOne", ["participantOne"])
  .index("by_participantTwo", ["participantTwo"])
  .index("by_updatedAt", ["updatedAt"])
  // Composite participant index: the mutation stores (participantOne,
  // participantTwo) with strictly ordered ids so this index works in both
  // lookup directions.
  .index("by_participants", ["participantOne", "participantTwo"]);

const messages = defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  content: v.string(),
  mediaStorageId: v.optional(v.string()),
  isRead: v.boolean(),
  createdAt: v.number(),
})
  .index("by_conversation", ["conversationId"])
  .index("by_conversation_createdAt", ["conversationId", "createdAt"])
  .index("by_sender", ["senderId"])
  .index("by_read", ["conversationId", "isRead"]);

export default defineSchema({
  users,
  listings,
  conversations,
  messages,
});
