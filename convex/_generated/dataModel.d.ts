/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
  AnyDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */

export type DataModel = {
  conversations: {
    document: {
      participantOne: Id<"users">;
      participantTwo: Id<"users">;
      updatedAt: number;
      _id: Id<"conversations">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "participantOne"
      | "participantTwo"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_participantOne: ["participantOne", "_creationTime"];
      by_participantTwo: ["participantTwo", "_creationTime"];
      by_participants: ["participantOne", "participantTwo", "_creationTime"];
      by_updatedAt: ["updatedAt", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  listings: {
    document: {
      category: "buy" | "sell" | "service" | "collab";
      createdAt: number;
      creatorId: Id<"users">;
      description: string;
      mediaStorageIds: Array<string>;
      price?: number;
      status: "active" | "sold";
      telegramMessageId?: number;
      title: string;
      _id: Id<"listings">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "category"
      | "createdAt"
      | "creatorId"
      | "description"
      | "mediaStorageIds"
      | "price"
      | "status"
      | "telegramMessageId"
      | "title";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_category: ["category", "_creationTime"];
      by_createdAt: ["createdAt", "_creationTime"];
      by_creator: ["creatorId", "_creationTime"];
      by_status: ["status", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  messages: {
    document: {
      content: string;
      conversationId: Id<"conversations">;
      createdAt: number;
      isRead: boolean;
      mediaStorageId?: string;
      senderId: Id<"users">;
      _id: Id<"messages">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "content"
      | "conversationId"
      | "createdAt"
      | "isRead"
      | "mediaStorageId"
      | "senderId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_conversation: ["conversationId", "_creationTime"];
      by_conversation_createdAt: [
        "conversationId",
        "createdAt",
        "_creationTime",
      ];
      by_read: ["conversationId", "isRead", "_creationTime"];
      by_sender: ["senderId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  telegramUpdates: {
    document: {
      processingAt: number;
      state: "processing" | "sent" | "failed";
      updateId: number;
      _id: Id<"telegramUpdates">;
      _creationTime: number;
    };
    fieldPaths: "_creationTime" | "_id" | "processingAt" | "state" | "updateId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_state_processingAt: ["state", "processingAt", "_creationTime"];
      by_updateId: ["updateId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  users: {
    document: {
      avatarUrl?: string;
      bio?: string;
      campusRole: "student" | "faculty" | "staff";
      createdAt: number;
      displayName: string;
      major?: string;
      phoneNumber?: string;
      phoneVerifiedAt?: number;
      skills: Array<string>;
      telegramId: string;
      updatedAt: number;
      _id: Id<"users">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "avatarUrl"
      | "bio"
      | "campusRole"
      | "createdAt"
      | "displayName"
      | "major"
      | "phoneNumber"
      | "phoneVerifiedAt"
      | "skills"
      | "telegramId"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_createdAt: ["createdAt", "_creationTime"];
      by_major: ["major", "_creationTime"];
      by_phoneNumber: ["phoneNumber", "_creationTime"];
      by_telegramId: ["telegramId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
};

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/using/document-ids).
 *
 * Documents can be loaded using `db.get(tableName, id)` in query and mutation functions.
 *
 * IDs are just strings at runtime, but this type can be used to distinguish them from other
 * strings when type checking.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;
