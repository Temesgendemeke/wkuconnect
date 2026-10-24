"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthedSession } from "@/components/auth/provider";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Composer } from "@/components/chat/composer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { formatRelativeTime } from "@/lib/time";

export function Thread({ conversationId }: { conversationId: string }) {
  const { initData, user: me } = useAuthedSession();
  const conversationIdRef = conversationId as Id<"conversations">;
  const args = useMemo(
    () => ({ initData, conversationId: conversationIdRef }),
    [initData, conversationIdRef],
  );

  const thread = useQuery(api.messages.getConversation, args);
  const messages = useQuery(api.messages.listMessages, args);
  const markConversationRead = useMutation(api.messages.markConversationRead);

  useEffect(() => {
    const hasUnreadFromOther = messages?.some(
      (m) => m.sender._id !== me._id && !m.isRead,
    );
    if (!hasUnreadFromOther) return;
    markConversationRead({ initData, conversationId: conversationIdRef }).catch(
      () => {},
    );
  }, [messages, me._id, initData, conversationIdRef, markConversationRead]);

  const loading = thread === undefined || messages === undefined;

  return (
    <MessageScrollerProvider
      autoScroll
      defaultScrollPosition="end"
      scrollEdgeThreshold={200}
    >
      <div className="flex h-dvh max-h-dvh min-h-0 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2">
          <Button variant="ghost" size="icon-sm" render={<Link href="/chat" />}>
            <ArrowLeft data-icon="inline-start" className="size-4" />
            <span className="sr-only">Back to chats</span>
          </Button>
          {thread?.otherUser ? (
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <UserAvatar
                name={thread.otherUser.displayName}
                avatarUrl={thread.otherUser.avatarUrl}
              />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium">
                  {thread.otherUser.displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {thread.otherUser.major || "WKU student"}
                </span>
              </div>
            </div>
          ) : (
            <Skeleton className="ml-2 h-8 w-8 rounded-full" />
          )}
        </header>

        {loading ? (
          <div className="flex flex-1 flex-col justify-end gap-4 p-4">
            <Skeleton className="h-9 w-2/3 rounded-xl" />
            <Skeleton className="h-9 w-1/2 self-end rounded-xl" />
            <Skeleton className="h-9 w-3/4 rounded-xl" />
          </div>
        ) : thread === null ? (
          <Empty className="min-h-[50dvh]">
            <EmptyMedia variant="icon">
              <MessagesSquare />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Conversation not found</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <EmptyDescription>
                This chat doesn&apos;t exist or you&apos;re not a participant.
              </EmptyDescription>
            </EmptyContent>
            <Button render={<Link href="/chat" />}>Back to chats</Button>
          </Empty>
        ) : (
          <>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport aria-label="Messages">
                <MessageScrollerContent>
                  {messages.map((message, i) => {
                    const mine = message.sender._id === me._id;
                    const isLast = i === messages.length - 1;
                    return (
                      <MessageScrollerItem
                        key={message.messageId}
                        messageId={message.messageId}
                        scrollAnchor={isLast}
                      >
                        <Message align={mine ? "end" : "start"}>
                          {!mine && (
                            <MessageAvatar>
                              <UserAvatar
                                name={message.sender.displayName}
                                avatarUrl={message.sender.avatarUrl}
                              />
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            {!mine && (
                              <MessageHeader>
                                {message.sender.displayName}
                              </MessageHeader>
                            )}
                            <Bubble
                              variant={mine ? "default" : "muted"}
                              align={mine ? "end" : "start"}
                            >
                              <BubbleContent>
                                {message.content}
                              </BubbleContent>
                            </Bubble>
                            <MessageHeader>
                              {formatRelativeTime(message.createdAt)}
                            </MessageHeader>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    );
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
            <Composer conversationId={conversationIdRef} />
          </>
        )}
      </div>
    </MessageScrollerProvider>
  );
}