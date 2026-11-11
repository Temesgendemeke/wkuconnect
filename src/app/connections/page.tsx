import { AuthGate } from "@/components/auth/provider";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { ConnectionsPage } from "@/components/connections/connections-page";

export default function ConnectionsRoute() {
  return (
    <>
      <AuthGate>
        <ConnectionsPage />
      </AuthGate>
      <BottomNavigation />
    </>
  );
}
