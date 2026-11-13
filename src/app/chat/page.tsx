import Link from "next/link";
import { Plus } from "lucide-react";
import { AuthGate } from "@/components/auth/provider";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <AuthGate>
      <div className="flex h-dvh max-h-dvh flex-col bg-background text-foreground">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <h1 className="text-xl text-foreground">Chats</h1>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/chat/new" />}
          >
            <Plus data-icon="inline-start" />
            New
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto pb-24">
          <ConversationList />
        </div>
      </div>
    </AuthGate>
  );
}