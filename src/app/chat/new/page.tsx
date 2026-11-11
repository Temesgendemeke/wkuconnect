import { AuthGate } from "@/components/auth/provider";
import { NewConversation } from "@/components/chat/new-conversation";

export default function NewConversationPage() {
  return (
    <AuthGate>
      <NewConversation />
    </AuthGate>
  );
}