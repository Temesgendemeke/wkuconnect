"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { MessageSquarePlus } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useAuthedSession } from "@/components/auth/provider";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/time";

export function ConversationList() {
  const { initData } = useAuthedSession();
  const conversations = useQuery(api.messages.listMyConversations, { initData });

  if (conversations === undefined) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Empty className="min-h-64">
        <EmptyHeader>
          <EmptyTitle>No conversations yet</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <p className="text-sm text-muted-foreground">
            Find a classmate, twin, or favorite seller and start chatting.
          </p>
        </EmptyContent>
        <Button render={<Link href="/chat/new" />}>
          <MessageSquarePlus data-icon="inline-start" />
          Start a conversation
        </Button>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col">
      {conversations.map((conversation) => {
        const preview = conversation.lastMessage?.content ?? "Say hi 👋";
        return (
          <li key={conversation.conversationId}>
            <Link
              href={`/chat/${conversation.conversationId}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
            >
              <UserAvatar
                name={conversation.otherUser.displayName}
                avatarUrl={conversation.otherUser.avatarUrl}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {conversation.otherUser.displayName}
                  </span>
                  {conversation.lastMessage && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm ${
                      conversation.hasUnread
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conversation.hasUnread ? "• " : ""}
                    {preview}
                  </span>
                  {conversation.hasUnread && <Badge>New</Badge>}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}