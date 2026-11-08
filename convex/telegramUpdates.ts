import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const PROCESSING_LEASE_MS = 2 * 60 * 1000;

export const claimTelegramUpdate = internalMutation({
  args: { updateId: v.number() },
  handler: async (
    ctx,
    { updateId },
  ): Promise<
    | { status: "claimed"; processingAt: number }
    | { status: "processing" | "sent" }
  > => {
    const now = Date.now();
    const existing = await ctx.db
      .query("telegramUpdates")
      .withIndex("by_updateId", (q) => q.eq("updateId", updateId))
      .unique();

    if (existing?.state === "sent") {
      return { status: "sent" };
    }
    if (
      existing?.state === "processing" &&
      now - existing.processingAt < PROCESSING_LEASE_MS
    ) {
      return { status: "processing" };
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        state: "processing",
        processingAt: now,
      });
    } else {
      await ctx.db.insert("telegramUpdates", {
        updateId,
        state: "processing",
        processingAt: now,
      });
    }
    return { status: "claimed", processingAt: now };
  },
});

export const finishTelegramUpdate = internalMutation({
  args: {
    updateId: v.number(),
    processingAt: v.number(),
    sent: v.boolean(),
  },
  handler: async (ctx, { updateId, processingAt, sent }): Promise<void> => {
    const existing = await ctx.db
      .query("telegramUpdates")
      .withIndex("by_updateId", (q) => q.eq("updateId", updateId))
      .unique();
    if (
      !existing ||
      existing.state !== "processing" ||
      existing.processingAt !== processingAt
    ) {
      return;
    }

    await ctx.db.patch(existing._id, {
      state: sent ? "sent" : "failed",
      processingAt,
    });
  },
});
