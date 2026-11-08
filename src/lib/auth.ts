"use client";

import { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { retrieveRawInitData } from "@telegram-apps/sdk-react";
import { api } from "../../convex/_generated/api";
import type { PublicUser } from "../../convex/users";

type AuthState =
  | { status: "loading" }
  | { status: "no-init-data" }
  | { status: "authenticating"; initData: string }
  | { status: "authenticated"; initData: string; user: PublicUser }
  | { status: "error"; message: string };

const MAX_INIT_DATA_ATTEMPTS = 4;
const AUTH_REQUEST_TIMEOUT_MS = 15_000;

/**
 * Verifies the Telegram session on the backend by sending initData to
 * `users.upsertUser`, which re-derives the HMAC-SHA256 signature with the bot
 * token. Survivors of that check are upserted (or patched) and returned as a
 * sanitized PublicUser that never contains Telegram identifiers.
 */
export function useAuth(): AuthState {
  const convex = useConvex();
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let authTimeoutTimer: ReturnType<typeof setTimeout> | undefined;

    const authenticate = async () => {
      try {
        attempts += 1;
        let initData: string | undefined;
        try {
          initData = retrieveRawInitData();
        } catch {
          initData = undefined;
        }

        if (!initData) {
          if (attempts < MAX_INIT_DATA_ATTEMPTS) {
            retryTimer = setTimeout(authenticate, attempts * 250);
          } else if (!cancelled) {
            setAuth({ status: "no-init-data" });
          }
          return;
        }

        if (!cancelled) {
          setAuth({ status: "authenticating", initData });
        }

        const timeout = new Promise<never>((_, reject) => {
          authTimeoutTimer = setTimeout(
            () => reject(new Error("Telegram authentication timed out. Please try again.")),
            AUTH_REQUEST_TIMEOUT_MS,
          );
        });

        let user: PublicUser;
        try {
          user = await Promise.race([
            convex.mutation(api.users.upsertUser, { initData }),
            timeout,
          ]);
        } finally {
          if (authTimeoutTimer !== undefined) {
            clearTimeout(authTimeoutTimer);
            authTimeoutTimer = undefined;
          }
        }

        if (!cancelled) {
          setAuth({ status: "authenticated", initData, user });
        }
      } catch (error) {
        if (!cancelled) {
          setAuth({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Telegram verification failed",
          });
        }
      }
    };

    void authenticate();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) {
        clearTimeout(retryTimer);
      }
      if (authTimeoutTimer !== undefined) {
        clearTimeout(authTimeoutTimer);
      }
    };
  }, [convex]);

  return auth;
}