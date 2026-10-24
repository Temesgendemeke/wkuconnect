import { v } from "convex/values";
import {
  mutation,
  query,
  type DatabaseReader,
  type QueryCtx,
} from "./_generated/server";
import { parseAndVerifyInitData } from "./auth";
import { toPublicUser, type PublicUser } from "./users";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Sandboxed in-app chat.
 *
 * Every function authenticates the caller from `initData` (HMAC-SHA256
 * verification) and resolves their Convex user id. This prevents IDOR — a
 * client can never read a conversation or message it does not belong to, and
 * query args can never name another user's conversation.
 *
 * Identity sandbox: the only user identity ever returned is `PublicUser`
 * (displayName, campusRole, bio, major, skills, avatarUrl). Telegram
 * usernames, phone numbers, and handles never cross the wire. Messages are
 * keyed by the sender's Convex user id only.
 */

async function getAuthedUser(
  db: DatabaseReader,
  initData: string,
): Promise<Doc<"users">> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const { user } = parseAndVerifyInitData(initData, botToken);
  if (!user) {
    throw new Error("initData does not contain a Telegram user");
  }
  const row = await db
    .query("users")
    .withIndex("by_telegramId", (q) => q.eq("telegramId", String(user.id)))
    .unique();
  if (!row) {
    throw new Error("User not found. Call users.upsertUser first.");
  }
  return row;
}

function orderParticipants(a: Id<"users">, b: Id<"users">): [Id<"users">, Id<"users">] {
  return a < b ? [a, b] : [b, a];
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const getOrCreateConversation = mutation({
  args: {
    initData: v.string(),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const me = await getAuthedUser(ctx.db, args.initData);
    if (me._id === args.otherUserId) {
      throw new Error("You cannot start a conversation with yourself.");
    }

    const other = await ctx.db.get(args.otherUserId);
    if (!other) {
      throw new Error("The other user does not exist.");
    }

    const [participantOne, participantTwo] = orderParticipants(
      me._id,
      args.otherUserId,
    );

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) =>
        q.eq("participantOne", participantOne).eq("participantTwo", participantTwo),
      )
      .unique();

    if (existing) {
      return {
        conversationId: existing._id,
        conversation: existing,
        otherUser: toPublicUser(other),
      };
    }

    const now = Date.now();
    const createdId = await ctx.db.insert("conversations", {
      participantOne,
      participantTwo,
      updatedAt: now,
    });

    // Guard against concurrent creates of the same pair: keep the earliest
    // conversation, drop our duplicate if one appeared meanwhile.
    const after = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) =>
        q.eq("participantOne", participantOne).eq("participantTwo", participantTwo),
      )
      .order("asc")
      .first();
    if (after && after._id !== createdId) {
      await ctx.db.delete(createdId);
    }

    const conversation = await ctx.db.get(after?._id ?? createdId);
    return {
      conversationId: conversation!._id,
      conversation: conversation!,
      otherUser: toPublicUser(other),
    };
  },
});

export const sendMessage = mutation({
  args: {
    initData: v.string(),
    conversationId: v.id("conversations"),
    content: v.string(),
    mediaStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await getAuthedUser(ctx.db, args.initData);
    const content = args.content.trim();
    if (!content && !args.mediaStorageId) {
      throw new Error("Message content is empty.");
    }
    if (content.length > 4000) {
      throw new Error("Message is too long (max 4000 characters).");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found.");
    }
    if (
      conversation.participantOne !== me._id &&
      conversation.participantTwo !== me._id
    ) {
      throw new Error("You are not a participant of this conversation.");
    }

    const id = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: me._id,
      content,
      mediaStorageId: args.mediaStorageId,
      isRead: false,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });
    return id;
  },
});

export const markConversationRead = mutation({
  args: {
    initData: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const me = await getAuthedUser(ctx.db, args.initData);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found.");
    }
    const otherId =
      conversation.participantOne === me._id
        ? conversation.participantTwo
        : conversation.participantOne;

    const unread = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("senderId"), otherId),
          q.eq(q.field("isRead"), false),
        ),
      )
      .take(100);

    await Promise.all(
      unread.map((m) => ctx.db.patch(m._id, { isRead: true })),
    );
  },
});

// ---------------------------------------------------------------------------
// Queries (real-time — subscribed with useQuery)
// ---------------------------------------------------------------------------

export type ConversationSummary = {
  conversationId: Id<"conversations">;
  otherUser: PublicUser;
  lastMessage?: {
    content: string;
    createdAt: number;
    senderId: Id<"users">;
    isRead: boolean;
  };
  hasUnread: boolean;
  updatedAt: number;
};

async function hydrateConversation(
  ctx: QueryCtx,
  conversation: Doc<"conversations">,
  meId: Id<"users">,
  otherId: Id<"users">,
): Promise<ConversationSummary> {
  const other = await ctx.db.get(otherId);
  const last = await ctx.db
    .query("messages")
    .withIndex("by_conversation_createdAt", (q) =>
      q.eq("conversationId", conversation._id),
    )
    .order("desc")
    .first();

  let hasUnread = false;
  if (last && last.senderId === otherId && !last.isRead) {
    hasUnread = true;
  }

  return {
    conversationId: conversation._id,
    otherUser: other ? toPublicUser(other) : ({} as PublicUser),
    lastMessage: last
      ? {
          content: last.content,
          createdAt: last.createdAt,
          senderId: last.senderId,
          isRead: last.isRead,
        }
      : undefined,
    hasUnread,
    updatedAt: conversation.updatedAt,
  };
}

export const listMyConversations = query({
  args: { initData: v.string() },
  handler: async (ctx, args): Promise<ConversationSummary[]> => {
    const me = await getAuthedUser(ctx.db, args.initData);

    const [asOne, asTwo] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_participantOne", (q) => q.eq("participantOne", me._id))
        .collect(),
      ctx.db
        .query("conversations")
        .withIndex("by_participantTwo", (q) => q.eq("participantTwo", me._id))
        .collect(),
    ]);

    const summaries = await Promise.all(
      [...asOne, ...asTwo].map((conversation) => {
        const otherId =
          conversation.participantOne === me._id
            ? conversation.participantTwo
            : conversation.participantOne;
        return hydrateConversation(ctx, conversation, me._id, otherId);
      }),
    );

    return summaries
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 100);
  },
});

export const getConversation = query({
  args: {
    initData: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const me = await getAuthedUser(ctx.db, args.initData);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found.");
    }
    if (
      conversation.participantOne !== me._id &&
      conversation.participantTwo !== me._id
    ) {
      throw new Error("You are not a participant of this conversation.");
    }
    const otherId =
      conversation.participantOne === me._id
        ? conversation.participantTwo
        : conversation.participantOne;
    const other = await ctx.db.get(otherId);
    return {
      conversationId: conversation._id,
      otherUser: other ? toPublicUser(other) : ({} as PublicUser),
      conversation,
    };
  },
});

export const listMessages = query({
  args: {
    initData: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const me = await getAuthedUser(ctx.db, args.initData);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found.");
    }
    if (
      conversation.participantOne !== me._id &&
      conversation.participantTwo !== me._id
    ) {
      throw new Error("You are not a participant of this conversation.");
    }

    const msgRows = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .take(500);

    // Resolve senders once; only public identity is projected.
    const senderIds = [...new Set(msgRows.map((m) => m.senderId))];
    const users = (await Promise.all(senderIds.map((id) => ctx.db.get(id)))).filter(
      (u): u is Doc<"users"> => u !== null,
    );
    const userById = new Map(users.map((u) => [u._id, u]));

    return msgRows.map((message) => ({
      messageId: message._id,
      sender: userById.has(message.senderId)
        ? toPublicUser(userById.get(message.senderId)!)
        : ({} as PublicUser),
      content: message.content,
      mediaStorageId: message.mediaStorageId,
      isRead: message.isRead,
      createdAt: message.createdAt,
    }));
  },
});
