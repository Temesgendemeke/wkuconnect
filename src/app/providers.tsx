"use client";

import { ReactNode } from "react";
import { ConvexProvider } from "convex/react";
import { AuthProvider } from "@/components/auth/provider";
import { convex } from "@/lib/convex";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}