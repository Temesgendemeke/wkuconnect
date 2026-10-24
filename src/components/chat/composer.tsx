"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Send } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthedSession } from "@/components/auth/provider";
import {
  InputGroup,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useMessageScroller } from "@/components/ui/message-scroller";

export function Composer({ conversationId }: { conversationId: Id<"conversations"> }) {
  const { initData } = useAuthedSession();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const scroller = useMessageScroller();

  const canSend = text.trim().length > 0;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    const content = text.trim();
    setText("");
    setError(null);
    try {
      await sendMessage({ initData, conversationId, content });
      scroller.scrollToEnd();
    } catch (err) {
      setText(content);
      setError(
        err instanceof Error ? err.message : "Failed to send. Try again.",
      );
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 px-4 pb-4 pt-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <InputGroup>
        <InputGroupTextarea
          rows={1}
          maxLength={4000}
          value={text}
          placeholder="Message…"
          aria-label="Message"
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <InputGroupButton
          type="submit"
          data-align="end"
          variant="secondary"
          size="icon-sm"
          disabled={!canSend}
          aria-label="Send"
        >
          <Send />
        </InputGroupButton>
      </InputGroup>
    </form>
  );
}