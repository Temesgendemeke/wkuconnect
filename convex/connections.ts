import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getAuthenticatedUser,
  toPublicUser,
  type PublicUser,
} from "./users";
import type { DatabaseReader } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

const MAX_RESULTS = 100;
const DEFAULT_DIRECTORY_LIMIT = 50;

async function getAuthenticatedStudent(
  db: DatabaseReader,
  initData: string,
): Promise<Doc<"users">> {
  const user = await getAuthenticatedUser(db, initData);
  if (user.campusRole !== "student") {
    throw new Error("Only students can use connections.");
  }
  return user;
}

function boundedLimit(limit: number | undefined): number {
  return Math.max(1, Math.min(Math.floor(limit ?? DEFAULT_DIRECTORY_LIMIT), MAX_RESULTS));
}

async function getStudent(
  db: DatabaseReader,
  userId: Doc<"users">["_id"],
): Promise<Doc<"users"> | null> {
  const user = await db.get(userId);
  return user?.campusRole === "student" ? user : null;
}

export const listStudents = query({
  args: {
    initData: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PublicUser[]> => {
    const me = await getAuthenticatedStudent(ctx.db, args.initData);
    const limit = boundedLimit(args.limit);
    const students = await ctx.db
      .query("users")
      .withIndex("by_createdAt")
      .order("desc")
      .filter((q) => q.eq(q.field("campusRole"), "student"))
      .take(limit + 1);

    return students
      .filter((student) => student._id !== me._id)
      .slice(0, limit)
      .map(toPublicUser);
  },
});

export const sendConnectionRequest = mutation({
  args: {
    initData: v.string(),
    recipientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requester = await getAuthenticatedStudent(ctx.db, args.initData);
    if (requester._id === args.recipientId) {
      throw new Error("You cannot send a connection request to yourself.");
    }

    const recipient = await getStudent(ctx.db, args.recipientId);
    if (!recipient) {
      throw new Error("The recipient does not exist or is not a student.");
    }

    const [outgoing, incoming] = await Promise.all([
      ctx.db
        .query("connections")
        .withIndex("by_requester_recipient", (q) =>
          q.eq("requesterId", requester._id).eq("recipientId", recipient._id),
        )
        .first(),
      ctx.db
        .query("connections")
        .withIndex("by_requester_recipient", (q) =>
          q.eq("requesterId", recipient._id).eq("recipientId", requester._id),
        )
        .first(),
    ]);

    if (outgoing?.status === "accepted" || incoming?.status === "accepted") {
      return {
        status: "already_connected" as const,
        connectionId: (outgoing?.status === "accepted" ? outgoing : incoming)!._id,
      };
    }
    if (incoming?.status === "pending") {
      return {
        status: "incoming_request_exists" as const,
        requestId: incoming._id,
      };
    }
    if (outgoing?.status === "pending") {
      return {
        status: "request_already_sent" as const,
        requestId: outgoing._id,
      };
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("connections", {
      requesterId: requester._id,
      recipientId: recipient._id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { status: "request_sent" as const, requestId };
  },
});

export const listIncomingRequests = query({
  args: { initData: v.string() },
  handler: async (ctx, args) => {
    const me = await getAuthenticatedStudent(ctx.db, args.initData);
    const requests = await ctx.db
      .query("connections")
      .withIndex("by_recipient_status", (q) =>
        q.eq("recipientId", me._id).eq("status", "pending"),
      )
      .order("desc")
      .take(MAX_RESULTS);

    const results = await Promise.all(
      requests.map(async (request) => {
        const requester = await getStudent(ctx.db, request.requesterId);
        return requester
          ? {
              requestId: request._id,
              createdAt: request.createdAt,
              user: toPublicUser(requester),
            }
          : null;
      }),
    );
    return results.filter((result) => result !== null);
  },
});

export const listOutgoingRequests = query({
  args: { initData: v.string() },
  handler: async (ctx, args) => {
    const me = await getAuthenticatedStudent(ctx.db, args.initData);
    const requests = await ctx.db
      .query("connections")
      .withIndex("by_requester_status", (q) =>
        q.eq("requesterId", me._id).eq("status", "pending"),
      )
      .order("desc")
      .take(MAX_RESULTS);

    const results = await Promise.all(
      requests.map(async (request) => {
        const recipient = await getStudent(ctx.db, request.recipientId);
        return recipient
          ? {
              requestId: request._id,
              createdAt: request.createdAt,
              user: toPublicUser(recipient),
            }
          : null;
      }),
    );
    return results.filter((result) => result !== null);
  },
});

export const acceptConnectionRequest = mutation({
  args: {
    initData: v.string(),
    requestId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const recipient = await getAuthenticatedStudent(ctx.db, args.initData);
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Connection request not found.");
    }
    if (request.recipientId !== recipient._id) {
      throw new Error("Only the recipient can accept this request.");
    }
    if (request.status !== "pending") {
      throw new Error("This connection request is no longer pending.");
    }
    if (!(await getStudent(ctx.db, request.requesterId))) {
      throw new Error("The requester does not exist or is not a student.");
    }

    const updatedAt = Date.now();
    await ctx.db.patch(request._id, { status: "accepted", updatedAt });
    return { requestId: request._id, status: "accepted" as const, updatedAt };
  },
});

export const rejectConnectionRequest = mutation({
  args: {
    initData: v.string(),
    requestId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const recipient = await getAuthenticatedStudent(ctx.db, args.initData);
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Connection request not found.");
    }
    if (request.recipientId !== recipient._id) {
      throw new Error("Only the recipient can reject this request.");
    }
    if (request.status !== "pending") {
      throw new Error("This connection request is no longer pending.");
    }

    await ctx.db.delete(request._id);
    return { requestId: request._id, status: "rejected" as const };
  },
});

export const listConnectedStudents = query({
  args: { initData: v.string() },
  handler: async (ctx, args) => {
    const me = await getAuthenticatedStudent(ctx.db, args.initData);
    const [asRequester, asRecipient] = await Promise.all([
      ctx.db
        .query("connections")
        .withIndex("by_requester_status", (q) =>
          q.eq("requesterId", me._id).eq("status", "accepted"),
        )
        .take(MAX_RESULTS),
      ctx.db
        .query("connections")
        .withIndex("by_recipient_status", (q) =>
          q.eq("recipientId", me._id).eq("status", "accepted"),
        )
        .take(MAX_RESULTS),
    ]);

    const uniqueConnections = new Map(
      [...asRequester, ...asRecipient].map((connection) => [
        connection._id,
        {
          connection,
          otherUserId:
            connection.requesterId === me._id
              ? connection.recipientId
              : connection.requesterId,
        },
      ]),
    );

    const results = await Promise.all(
      [...uniqueConnections.values()].map(async ({ connection, otherUserId }) => {
        const otherUser = await getStudent(ctx.db, otherUserId);
        return otherUser
          ? {
              connectionId: connection._id,
              updatedAt: connection.updatedAt,
              user: toPublicUser(otherUser),
            }
          : null;
      }),
    );
    return results.filter((result) => result !== null);
  },
});
