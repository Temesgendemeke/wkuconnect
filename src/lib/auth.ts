"use client";

import { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { retrieveRawInitData } from "@telegram-apps/sdk-react";
import { api } from "../../convex/_generated/api";
import type { PublicUser } from "../../convex/users";

function readInitDataSafely(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    return retrieveRawInitData();
  } catch {
    // Ran outside a Telegram client (e.g. plain browser dev tab).
    return undefined;
  }
}

function useSafeRawInitData(): string | undefined {
  const [raw] = useState<string | undefined>(readInitDataSafely);
  return raw;
}

/** Raw Telegram initData, or undefined when not running inside Telegram. */
export function useInitData(): string | undefined {
  return useSafeRawInitData();
}

type AuthState =
  | { status: "no-init-data" }
  | { status: "authenticating" }
  | { status: "authenticated"; user: PublicUser }
  | { status: "error"; message: string };

type AuthResult =
  | { status: "authenticated"; user: PublicUser }
  | { status: "error"; message: string };

/**
 * Verifies the Telegram session on the backend by sending initData to
 * `users.upsertUser`, which re-derives the HMAC-SHA256 signature with the bot
 * token. Survivors of that check are upserted (or patched) and returned as a
 * sanitized PublicUser that never contains Telegram identifiers.
 */
export function useAuth(): AuthState {
  const convex = useConvex();
  const rawInitData = useSafeRawInitData();

  const [result, setResult] = useState<AuthResult | null>(null);

  useEffect(() => {
    if (!rawInitData) {
      return;
    }
    let cancelled = false;
    convex
      .mutation(api.users.upsertUser, { initData: rawInitData })
      .then((user) => {
        if (!cancelled) setResult({ status: "authenticated", user });
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Telegram verification failed";
          setResult({ status: "error", message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [convex, rawInitData]);

  if (result) return result;
  if (!rawInitData) return { status: "no-init-data" };
  return { status: "authenticating" };
}