"use client";

import { useEffect, useState } from "react";
import { useConvex, type ConvexReactClient } from "convex/react";
import { retrieveRawInitData } from "@telegram-apps/sdk-react";
import { api } from "../../convex/_generated/api";
import type { PublicUser } from "../../convex/users";

export type AuthState =
  | { status: "loading" }
  | { status: "no-init-data" }
  | { status: "authenticating"; initData: string }
  | { status: "authenticated"; initData: string; user: PublicUser }
  | { status: "error"; message: string };

const MAX_INIT_DATA_ATTEMPTS = 10;
const AUTH_REQUEST_TIMEOUT_MS = 15_000;
const isDevelopment = process.env.NODE_ENV === "development";
const authenticationRequests = new WeakMap<
  ConvexReactClient,
  Map<string, Promise<PublicUser>>
>();

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
};

function logAuthDiagnostic(event: string, details?: Record<string, unknown>) {
  if (isDevelopment) {
    console.info("[WKUConnect auth]", event, details ?? {});
  }
}

function getUrlInitData(): string | undefined {
  const url = new URL(window.location.href);
  const hashParameters = new URLSearchParams(
    url.hash.replace(/^#/, "").replace(/^[^?]*\?/, ""),
  );
  for (const initData of [
    url.searchParams.get("tgWebAppData"),
    hashParameters.get("tgWebAppData"),
  ]) {
    if (initData && initData.trim().length > 0) {
      return initData;
    }
  }
  return undefined;
}

function getBridgeInitData(): string | undefined {
  const initData = (window as TelegramWindow).Telegram?.WebApp?.initData;
  return initData && initData.trim().length > 0 ? initData : undefined;
}

export function retrieveTelegramInitData(): string | undefined {
  try {
    const initData = retrieveRawInitData();
    if (initData && initData.trim().length > 0) {
      return initData;
    }
  } catch {
    // Fall back to the launch URL when the SDK cannot retrieve launch params.
  }

  try {
    const initData = getBridgeInitData();
    if (initData) {
      return initData;
    }
  } catch {
    // Continue to the launch URL fallback.
  }

  try {
    return getUrlInitData();
  } catch {
    return undefined;
  }
}

function authenticateWithConvex(
  convex: ConvexReactClient,
  initData: string,
): Promise<PublicUser> {
  let requests = authenticationRequests.get(convex);
  if (!requests) {
    requests = new Map();
    authenticationRequests.set(convex, requests);
  }

  const existingRequest = requests.get(initData);
  if (existingRequest) {
    logAuthDiagnostic("Reusing in-flight users.upsertUser request");
    return existingRequest;
  }

  const request = convex.mutation(api.users.upsertUser, { initData });
  logAuthDiagnostic("users.upsertUser request started");
  requests.set(initData, request);
  const clearRequest = () => {
    if (requests?.get(initData) === request) {
      requests.delete(initData);
    }
  };
  void request.then(
    () => {
      logAuthDiagnostic("users.upsertUser request succeeded");
      clearRequest();
    },
    (error: unknown) => {
      logAuthDiagnostic("users.upsertUser request failed", {
        errorType: error instanceof Error ? error.name : typeof error,
      });
      clearRequest();
    },
  );
  return request;
}

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

    logAuthDiagnostic("Authentication effect started");

    const authenticate = async () => {
      if (cancelled) {
        return;
      }

      try {
        attempts += 1;
        logAuthDiagnostic("Retrieving Telegram initData", {
          attempt: attempts,
        });
        const initData = retrieveTelegramInitData();
        logAuthDiagnostic("Telegram initData retrieval completed", {
          attempt: attempts,
          hasInitData: Boolean(initData),
        });

        if (!initData) {
          if (attempts < MAX_INIT_DATA_ATTEMPTS) {
            retryTimer = setTimeout(
              authenticate,
              Math.min(attempts * 250, 1_000),
            );
          } else if (!cancelled) {
            logAuthDiagnostic("Authentication failed: no initData retrieved");
            setAuth({ status: "no-init-data" });
          }
          return;
        }

        if (!cancelled) {
          logAuthDiagnostic("Authentication started");
          setAuth({ status: "authenticating", initData });
        }

        const timeout = new Promise<never>((_, reject) => {
          authTimeoutTimer = setTimeout(
            () => {
              logAuthDiagnostic("Authentication timed out");
              reject(new Error("Telegram authentication timed out. Please try again."));
            },
            AUTH_REQUEST_TIMEOUT_MS,
          );
        });

        let user: PublicUser;
        try {
          user = await Promise.race([
            authenticateWithConvex(convex, initData),
            timeout,
          ]);
        } finally {
          if (authTimeoutTimer !== undefined) {
            clearTimeout(authTimeoutTimer);
            authTimeoutTimer = undefined;
          }
        }

        if (!cancelled) {
          logAuthDiagnostic("Authentication succeeded");
          setAuth({ status: "authenticated", initData, user });
        } else {
          logAuthDiagnostic("Authentication success ignored after cancellation");
        }
      } catch (error) {
        logAuthDiagnostic("Authentication attempt failed", {
          errorType: error instanceof Error ? error.name : typeof error,
        });
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
      logAuthDiagnostic("Authentication effect cleanup", { cancelled });
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