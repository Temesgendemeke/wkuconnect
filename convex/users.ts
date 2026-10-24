import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { parseAndVerifyInitData, TelegramAuthError } from "./auth";
import { CAMPUS_ROLES, type CampusRole } from "./schema";
import type { Doc } from "./_generated/dataModel";

const campusRoleValidator = v.union(
  ...CAMPUS_ROLES.map((role) => v.literal(role)),
);

// ---------------------------------------------------------------------------
// Public identity shape
//
// The frontend is ONLY ever allowed to see these fields. telegramId (and any
// Telegram username/handle) lives on the same row but is stripped via
// toPublicUser before it can cross the wire. Keep this function the single
// source of truth for what a client may read about a user.
// ---------------------------------------------------------------------------
export type PublicUser = {
  _id: string;
  _creationTime: number;
  displayName: string;
  campusRole: CampusRole;
  bio?: string;
  major?: string;
  skills: string[];
  avatarUrl?: string;
};

export type VerifiedSession = {
  userId: number; // Telegram user id
  firstName?: string;
  lastName?: string;
  username?: string;
  displayName: string;
  avatarUrl?: string;
};

export function toPublicUser(row: Doc<"users">): PublicUser {
  return {
    _id: row._id,
    _creationTime: row._creationTime,
    displayName: row.displayName,
    campusRole: row.campusRole,
    bio: row.bio,
    major: row.major,
    skills: row.skills,
    avatarUrl: row.avatarUrl,
  };
}

/**
 * Verify initData and return the trusted Telegram session. Shared by every
 * auth-gated mutation in the app.
 */
function verifyTelegramSession(
  initData: string,
  botToken: string,
): VerifiedSession {
  const { user } = parseAndVerifyInitData(initData, botToken);
  if (!user) {
    throw new TelegramAuthError("initData does not contain a Telegram user");
  }
  const firstName = user.first_name ?? "";
  const lastName = user.last_name ?? "";
  return {
    userId: user.id,
    firstName,
    lastName,
    username: user.username,
    displayName: [firstName, lastName].filter(Boolean).join(" ").trim(),
    avatarUrl: user.photo_url,
  };
}

export const upsertUser = mutation({
  args: {
    initData: v.string(),
    displayName: v.optional(v.string()),
    // Optional profile fields the user can set on first login / later edits.
    campusRole: v.optional(campusRoleValidator),
    bio: v.optional(v.string()),
    major: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PublicUser> => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
    const session = verifyTelegramSession(args.initData, botToken);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_telegramId", (q) => q.eq("telegramId", String(session.userId)))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName ?? session.displayName,
        campusRole: args.campusRole ?? existing.campusRole,
        bio: args.bio !== undefined ? args.bio : existing.bio,
        major: args.major !== undefined ? args.major : existing.major,
        skills: args.skills ?? existing.skills,
        avatarUrl: args.avatarUrl ?? session.avatarUrl ?? existing.avatarUrl,
        updatedAt: now,
      });
      const row = await ctx.db.get(existing._id);
      return toPublicUser(row!);
    }

    const id = await ctx.db.insert("users", {
      telegramId: String(session.userId),
      displayName: session.displayName,
      campusRole: args.campusRole ?? "student",
      bio: args.bio,
      major: args.major,
      skills: args.skills ?? [],
      avatarUrl: session.avatarUrl,
      createdAt: now,
      updatedAt: now,
    });

    const row = await ctx.db.get(id);
    return toPublicUser(row!);
  },
});

export const updateMe = mutation({
  args: {
    initData: v.string(),
    displayName: v.optional(v.string()),
    campusRole: v.optional(campusRoleValidator),
    bio: v.optional(v.string()),
    major: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PublicUser> => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
    const session = verifyTelegramSession(args.initData, botToken);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_telegramId", (q) => q.eq("telegramId", String(session.userId)))
      .unique();

    if (!existing) {
      throw new TelegramAuthError("User not found. Call upsertUser first.");
    }

    await ctx.db.patch(existing._id, {
      displayName: args.displayName ?? existing.displayName,
      campusRole: args.campusRole ?? existing.campusRole,
      bio: args.bio !== undefined ? args.bio : existing.bio,
      major: args.major !== undefined ? args.major : existing.major,
      skills: args.skills ?? existing.skills,
      avatarUrl: args.avatarUrl ?? existing.avatarUrl,
      updatedAt: Date.now(),
    });

    const row = await ctx.db.get(existing._id);
    return toPublicUser(row!);
  },
});

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

// "current user" = the Telegram session's own Convex user. Because queries
// cannot read the request's Telegram identity, we accept a Convex user id that
// was established at auth time and stored in the Mini App. Returns only public
// fields.
export const getMe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<PublicUser | null> => {
    const row = await ctx.db.get(args.userId);
    if (!row) return null;
    return toPublicUser(row);
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<PublicUser | null> => {
    const row = await ctx.db.get(args.userId);
    if (!row) return null;
    return toPublicUser(row);
  },
});

// Campus "Twin" matching: filter the directory by major and/or overlapping
// skill tags. Results only ever expose public identity.
export const matchUsers = query({
  args: {
    initData: v.string(),
    major: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PublicUser[]> => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
    parseAndVerifyInitData(args.initData, botToken);
    const limit = Math.min(args.limit ?? 20, 50);
    const wantedSkills = new Set((args.skills ?? []).map((s) => s.toLowerCase()));

    if (args.major) {
      const byMajor = await ctx.db
        .query("users")
        .withIndex("by_major", (q) => q.eq("major", args.major!))
        .order("desc")
        .take(limit);
      return filterAndRank(byMajor, args.skills, wantedSkills, limit);
    }

    // No major filter: scan by createdAt. Convex does not support arbitrary
    // array-contains on skills, so we fetch a window and rank by overlap.
    const recent = await ctx.db
      .query("users")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);

    return filterAndRank(recent, args.skills, wantedSkills, limit);
  },
});

function filterAndRank(
  rows: Doc<"users">[],
  skillFilter: string[] | undefined,
  wantedSkills: Set<string>,
  limit: number,
): PublicUser[] {
  let result = rows;

  if (skillFilter && skillFilter.length > 0) {
    result = rows
      .filter(
        (row) =>
          row.skills?.some((s) => wantedSkills.has(s.toLowerCase())),
      )
      .sort(
        (a, b) =>
          overlapCount(b.skills, wantedSkills) - overlapCount(a.skills, wantedSkills),
      );
  }

  return result.slice(0, limit).map(toPublicUser);
}

function overlapCount(skills: string[], wanted: Set<string>): number {
  return (skills ?? []).reduce(
    (acc, skill) => acc + (wanted.has(skill.toLowerCase()) ? 1 : 0),
    0,
  );
}

// All users in the directory (for browsing campus), public fields only.
export const listUsers = query({
  args: { initData: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<PublicUser[]> => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
    parseAndVerifyInitData(args.initData, botToken);
    const rows = await ctx.db
      .query("users")
      .withIndex("by_createdAt")
      .order("desc")
      .take(Math.min(args.limit ?? 50, 100));
    return rows.map(toPublicUser);
  },
});
