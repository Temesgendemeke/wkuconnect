"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNavigation = pathname !== "/onboarding";

  return (
    <>
      {children}
      {showNavigation ? <BottomNavigation /> : null}
    </>
  );
}
