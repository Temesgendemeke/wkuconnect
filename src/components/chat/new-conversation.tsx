"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, AtSign } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthedSession } from "@/components/auth/provider";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

export function NewConversation() {
  const { initData, user: me } = useAuthedSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const users = useQuery(api.users.listUsers, { initData });
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);
  const [starting, setStarting] = useState<string | null>(null);

  const filtered =
    users?.filter((u) => {
      if (u._id === me._id) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        u.displayName.toLowerCase().includes(q) ||
        (u.major ?? "").toLowerCase().includes(q) ||
        (u.skills ?? []).some((s) => s.toLowerCase().includes(q))
      );
    }) ?? [];

  async function startChat(otherId: string) {
    if (starting) return;
    setStarting(otherId);
    try {
      const { conversationId } = await getOrCreateConversation({
        initData,
        otherUserId: otherId as Id<"users">,
      });
      router.push(`/chat/${conversationId}`);
    } catch {
      setStarting(null);
    }
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/chat" />}>
          <ArrowLeft />
          <span className="sr-only">Back to chats</span>
        </Button>
        <h1 className="text-base font-medium">New conversation</h1>
      </header>

      <div className="shrink-0 px-4 py-3">
        <InputGroup>
          <AtSign data-slot="input-group-text" />
          <InputGroupInput
            placeholder="Search by name, major, or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {users === undefined ? (
          <div className="flex flex-col gap-1 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Empty className="min-h-64">
            <EmptyMedia variant="icon">
              <AtSign />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nobody found</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <EmptyDescription>Try a different name or major.</EmptyDescription>
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((user) => (
              <li key={user._id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 disabled:opacity-50"
                  onClick={() => startChat(user._id)}
                  disabled={starting !== null}
                >
                  <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {user.displayName}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                      {user.major || "WKU student"}
                      {user.skills?.length ? ` · ${user.skills.slice(0, 3).join(", ")}` : ""}
                    </span>
                  </span>
                  {starting === user._id ? (
                    <span className="text-xs text-muted-foreground">Starting…</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}