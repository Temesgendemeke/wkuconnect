import Link from "next/link";
import { Plus } from "lucide-react";
import { AuthProvider } from "@/components/auth/provider";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <AuthProvider>
      <div className="flex h-dvh max-h-dvh flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <h1 className="text-base font-medium">Chats</h1>
          <Button variant="outline" size="sm" render={<Link href="/chat/new" />}>
            <Plus data-icon="inline-start" />
            New
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </div>
    </AuthProvider>
  );
}