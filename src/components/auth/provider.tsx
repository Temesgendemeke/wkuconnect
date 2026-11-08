"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { PublicUser } from "../../../convex/users";

type AuthedContextValue = {
  initData: string;
  user: PublicUser;
};

const AuthedContext = createContext<AuthedContextValue | null>(null);

/**
 * Gates protected pages behind Telegram initData authentication. The backend
 * re-verifies initData for every protected query and mutation.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return <p className="m-4 text-sm text-zinc-500">Loading Telegram…</p>;
  }

  if (auth.status === "authenticating") {
    return <p className="m-4 text-sm text-zinc-500">Verifying Telegram session…</p>;
  }

  if (auth.status === "error") {
    return <p className="m-4 text-sm text-red-600">Auth failed: {auth.message}</p>;
  }

  if (auth.status === "no-init-data") {
    return (
      <p className="m-4 text-sm text-zinc-500">
        No initData — open this app through the Telegram bot.
      </p>
    );
  }

  return (
    <AuthedContext.Provider
      value={{ initData: auth.initData, user: auth.user }}
    >
      {children}
    </AuthedContext.Provider>
  );
}

export function useAuthedSession(): AuthedContextValue {
  const ctx = useContext(AuthedContext);
  if (!ctx) {
    throw new Error("useAuthedSession must be used within <AuthProvider>");
  }
  return ctx;
}