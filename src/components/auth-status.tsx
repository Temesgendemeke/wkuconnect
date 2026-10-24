"use client";

import { useAuth } from "@/lib/auth";

export function AuthStatus() {
  const auth = useAuth();

  if (auth.status === "authenticating") {
    return <p className="text-sm text-zinc-500">Verifying Telegram session…</p>;
  }

  if (auth.status === "no-init-data") {
    return (
      <p className="text-sm text-zinc-500">
        No initData — open this app through the Telegram bot to authenticate.
      </p>
    );
  }

  if (auth.status === "error") {
    return <p className="text-sm text-red-600">Auth failed: {auth.message}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-medium">Signed in as {auth.user.displayName}</p>
      <p className="text-xs text-zinc-500">
        {auth.user.major ?? "No major set"} ·{" "}
        {auth.user.skills.join(", ") || "No skills"}
      </p>
    </div>
  );
}