"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuth, type AuthState } from "@/lib/auth";
import type { PublicUser } from "../../../convex/users";

type AuthenticatedSession = {
  initData: string;
  user: PublicUser;
};

const AuthContext = createContext<AuthState | null>(null);
const AuthedSessionContext = createContext<AuthenticatedSession | null>(null);

const isDevelopment = process.env.NODE_ENV === "development";

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    if (isDevelopment) {
      console.info("[WKUConnect auth]", "AuthProvider mounted");
    }
    return () => {
      if (isDevelopment) {
        console.info("[WKUConnect auth]", "AuthProvider unmounted");
      }
    };
  }, []);

  useEffect(() => {
    if (isDevelopment) {
      console.info("[WKUConnect auth]", "Authentication status changed", {
        status: auth.status,
      });
    }
  }, [auth.status]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuthState(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("Auth state must be used within <AuthProvider>");
  }
  return ctx;
}

export function useAuthedSession(): AuthenticatedSession {
  const session = useContext(AuthedSessionContext);
  if (!session) {
    throw new Error("useAuthedSession must be used within <AuthGate>");
  }
  return session;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuthState();

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
    <AuthedSessionContext.Provider
      value={{ initData: auth.initData, user: auth.user }}
    >
      {children}
    </AuthedSessionContext.Provider>
  );
}

export function useSharedAuthState(): AuthState {
  return useAuthState();
}