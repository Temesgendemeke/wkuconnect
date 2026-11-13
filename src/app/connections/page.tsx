import { AuthGate } from "@/components/auth/provider";
import { ConnectionsPage } from "@/components/connections/connections-page";

export default function ConnectionsRoute() {
  return (
    <AuthGate>
      <ConnectionsPage />
    </AuthGate>
  );
}
