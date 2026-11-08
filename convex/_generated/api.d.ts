/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";
import type { GenericId as Id } from "convex/values";

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: {
  messages: {
    getConversation: FunctionReference<
      "query",
      "public",
      { conversationId: Id<"conversations">; initData: string },
      any
    >;
    getOrCreateConversation: FunctionReference<
      "mutation",
      "public",
      { initData: string; otherUserId: Id<"users"> },
      any
    >;
    listMessages: FunctionReference<
      "query",
      "public",
      { conversationId: Id<"conversations">; initData: string },
      any
    >;
    listMyConversations: FunctionReference<
      "query",
      "public",
      { initData: string },
      any
    >;
    markConversationRead: FunctionReference<
      "mutation",
      "public",
      { conversationId: Id<"conversations">; initData: string },
      any
    >;
    sendMessage: FunctionReference<
      "mutation",
      "public",
      {
        content: string;
        conversationId: Id<"conversations">;
        initData: string;
        mediaStorageId?: string;
      },
      any
    >;
  };
  users: {
    getMe: FunctionReference<"query", "public", { userId: Id<"users"> }, any>;
    getPhoneVerificationStatus: FunctionReference<
      "query",
      "public",
      { initData: string },
      any
    >;
    getUserById: FunctionReference<
      "query",
      "public",
      { userId: Id<"users"> },
      any
    >;
    listUsers: FunctionReference<
      "query",
      "public",
      { initData: string; limit?: number },
      any
    >;
    matchUsers: FunctionReference<
      "query",
      "public",
      {
        initData: string;
        limit?: number;
        major?: string;
        skills?: Array<string>;
      },
      any
    >;
    updateMe: FunctionReference<
      "mutation",
      "public",
      {
        avatarUrl?: string;
        bio?: string;
        initData: string;
        major?: string;
        skills?: Array<string>;
      },
      any
    >;
    upsertUser: FunctionReference<
      "mutation",
      "public",
      {
        avatarUrl?: string;
        bio?: string;
        initData: string;
        major?: string;
        skills?: Array<string>;
      },
      any
    >;
    verifyPhone: FunctionReference<
      "mutation",
      "public",
      { initData: string; rawContact: string },
      any
    >;
  };
};

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: {};

export declare const components: {};
