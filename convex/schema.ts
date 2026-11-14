import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * WKU Connect - Convex database schema.
 *
 * Identity / privacy model:
 * - Telegram IDs and verified phone data are stored on `users` and are never
 *   returned to the frontend. Public-facing identity is projected separately.
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
const connectionStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
);

const users = defineTable({
  // Remove from clients via a custom query projection. Never leak externally.
  telegramId: v.string(),
  phoneNumber: v.optional(v.string()),
  phoneVerifiedAt: v.optional(v.number()),
  displayName: v.string(),
  campusRole,
  bio: v.optional(v.string()),
  major: v.optional(v.string()),
  academicYear: v.optional(v.string()),
  skills: v.array(v.string()),
  avatarUrl: v.optional(v.string()),
  showDepartment: v.optional(v.boolean()),
  showPhoneNumber: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_telegramId", ["telegramId"])
  .index("by_phoneNumber", ["phoneNumber"])
  .index("by_createdAt", ["createdAt"])
  .index("by_major", ["major"]);

const connections = defineTable({
  requesterId: v.id("users"),
  recipientId: v.id("users"),
  status: connectionStatus,
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_requester", ["requesterId"])
  .index("by_recipient", ["recipientId"])
  .index("by_requester_recipient", ["requesterId", "recipientId"])
  .index("by_recipient_status", ["recipientId", "status"])
  .index("by_requester_status", ["requesterId", "status"]);

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

const telegramUpdateState = v.union(
  v.literal("processing"),
  v.literal("sent"),
  v.literal("failed"),
);

const telegramUpdates = defineTable({
  updateId: v.number(),
  state: telegramUpdateState,
  processingAt: v.number(),
})
  .index("by_updateId", ["updateId"])
  
  .index("by_state_processingAt", ["state", "processingAt"]);


export default defineSchema({
  users,
  connections,
  listings,
  conversations,
  messages,
  telegramUpdates,
});
