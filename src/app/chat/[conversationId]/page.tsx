import { AuthGate } from "@/components/auth/provider";
import { Thread } from "@/components/chat/thread";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return (
    <AuthGate>
      <Thread conversationId={conversationId} />
    </AuthGate>
  );
}