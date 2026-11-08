"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PhoneRegistration } from "@/components/auth/phone-registration";
import { useAuth, useInitData } from "@/lib/auth";

export function AuthStatus() {
  const auth = useAuth();
  const initData = useInitData();
  const phoneVerified = useQuery(
    api.users.getPhoneVerificationStatus,
    initData && auth.status === "authenticated" ? { initData } : "skip",
  );

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

  if (phoneVerified === undefined) {
    return <p className="text-sm text-zinc-500">Checking phone verification…</p>;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-medium">Signed in as {auth.user.displayName}</p>
      <p className="text-xs text-zinc-500">
        {auth.user.major ?? "No major set"} ·{" "}
        {auth.user.skills.join(", ") || "No skills"}
      </p>
      {phoneVerified ? (
        <p className="mt-3 text-sm text-green-700">Phone number verified</p>
      ) : initData ? (
        <PhoneRegistration initData={initData} />
      ) : null}
    </div>
  );
}