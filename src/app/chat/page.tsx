"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { AuthGate, useAuthedSession } from "@/components/auth/provider";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/time";
import type { ConversationSummary } from "../../../convex/messages";

export function ConversationList() {
  const { initData } = useAuthedSession();
  const conversations = useQuery(api.messages.listMyConversations, { initData });
  const [searchQuery, setSearchQuery] = useState("");

  if (conversations === undefined) {
    return (
      <div className="flex flex-col gap-2.5 p-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-[20px] border border-white/[0.04] bg-[#191c18] p-3.5"
          >
            <Skeleton className="size-11 rounded-2xl bg-[#252a22]" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-32 bg-[#252a22]" />
              <Skeleton className="h-2.5 w-48 bg-[#252a22]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filtered = conversations.filter((c: ConversationSummary) =>
    c.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="flex items-center gap-2 rounded-[18px] border border-white/[0.08] bg-[#191c18] px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] focus-within:border-[#c6f15b]/50">
        <Search className="size-4 shrink-0 text-[#8e9587]" />
        <input
          type="text"
          placeholder="Search students or chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-[#787f71] focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-[11px] font-bold text-[#8e9587] hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Conversation Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-white/[0.06] bg-[#191c18] p-8 text-center shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#252c1c] text-[#c6f15b]">
            <MessageSquare className="size-6" />
          </div>
          <h2 className="font-display text-sm font-bold text-white">
            {searchQuery ? "No matching chats" : "No conversations yet"}
          </h2>
          <p className="mt-1 text-xs text-[#8e9587]">
            {searchQuery
              ? "Try searching for a different name."
              : "Find classmates or sellers and start your first conversation."}
          </p>
          <Link
            href="/chat/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#c6f15b] px-4 py-2 text-xs font-bold text-[#111310] transition-transform hover:scale-105"
          >
            <MessageSquarePlus className="size-3.5" />
            <span>New Chat</span>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((conversation: ConversationSummary) => {
            const preview = conversation.lastMessage?.content ?? "Say hi 👋";
            return (
              <li key={conversation.conversationId}>
                <Link
                  href={`/chat/${conversation.conversationId}`}
                  className="group flex items-center gap-3.5 rounded-[20px] border border-white/[0.05] bg-[#191c18] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c6f15b]/40 hover:bg-[#1f231d]"
                >
                  <div className="relative">
                    <UserAvatar
                      name={conversation.otherUser.displayName}
                      avatarUrl={conversation.otherUser.avatarUrl}
                      className="size-12 rounded-2xl border border-white/[0.08]"
                    />
                    {conversation.hasUnread && (
                      <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-[#c6f15b] ring-2 ring-[#191c18]" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-display text-sm font-bold text-white group-hover:text-[#d9ff86]">
                        {conversation.otherUser.displayName}
                      </span>
                      {conversation.lastMessage && (
                        <span className="shrink-0 text-[10px] text-[#8e9587]">
                          {formatRelativeTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          conversation.hasUnread
                            ? "font-semibold text-white"
                            : "text-[#92988c]"
                        }`}
                      >
                        {preview}
                      </p>
                      {conversation.hasUnread && (
                        <span className="shrink-0 rounded-full bg-[#c6f15b] px-2 py-0.5 text-[9px] font-bold text-[#111310]">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-[#60675a] transition-transform group-hover:translate-x-0.5 group-hover:text-[#c6f15b]" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGate>
      <main className="layout-shell isolate relative min-h-screen w-full overflow-hidden bg-[#111310] text-white">
        {/* Background glow matching home page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(174,222,62,0.12),transparent_68%)]"
        />

        <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pb-28 pt-3 sm:gap-4 sm:px-6 sm:pt-5">
          {/* Header */}
          <header className="relative z-10 flex items-center justify-between pb-1">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#191c18] px-3.5 py-1.5 text-xs font-semibold text-[#c4c8bd] transition-all hover:border-[#c6f15b]/40 hover:text-[#d9ff86]"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Home</span>
            </Link>

            <Link
              href="/chat/new"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#c6f15b]/30 bg-[#c6f15b]/10 px-3.5 py-1.5 text-xs font-bold text-[#c6f15b] transition-all hover:bg-[#c6f15b] hover:text-[#111310]"
            >
              <Plus className="size-3.5" strokeWidth={2.6} />
              <span>New Chat</span>
            </Link>
          </header>

          {/* Chat Hero Banner */}
          <section className="relative overflow-hidden rounded-[25px] bg-[#c6f15b] p-4 text-[#17200e] shadow-[0_16px_40px_rgba(123,161,43,0.14)] sm:p-5">
            <div
              aria-hidden="true"
              className="absolute -bottom-10 -right-6 size-36 rounded-full bg-[#8dbb30]/25"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-6 right-8 size-20 rounded-full border border-[#263914]/15"
            />

            <div className="relative flex items-end justify-between gap-3">
              <div className="max-w-[19rem]">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#34491c]">
                  Direct Messages
                </p>
                <h1 className="font-display text-[22px] font-bold leading-[1.1] tracking-tight sm:text-2xl">
                  Connect with classmates & study partners.
                </h1>
                <p className="mt-1.5 text-[11px] leading-snug text-[#34451f]">
                  Instant peer-to-peer campus messaging.
                </p>
              </div>
              <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full bg-[#111510] text-[#c6f15b] shadow-lg">
                <MessageSquare className="size-5" />
              </span>
            </div>
          </section>

          {/* Conversation List */}
          <ConversationList />
        </div>
      </main>
    </AuthGate>
  );
}
