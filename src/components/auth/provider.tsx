"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth, useInitData } from "@/lib/auth";
import type { PublicUser } from "../../../convex/users";

type AuthedContextValue = {
  initData: string;
  user: PublicUser;
};

const AuthedContext = createContext<AuthedContextValue | null>(null);

/**
 * Gates a chat/marketplace page behind a verified Telegram session. The
 * verified claim (initData) is provided to every downstream Convex query and
 * mutation; the backend re-verifies it server-side every time. Zero identity
 * beyond PublicUser is stored or rendered here.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const initData = useInitData();
  const auth = useAuth();

  if (!initData) {
    return (
      <p className="m-4 text-sm text-zinc-500">
        Open this app through the Telegram bot to authenticate.
      </p>
    );
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
    <AuthedContext.Provider value={{ initData, user: auth.user }}>
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