"use client";

import { useEffect } from "react";
import { CircleAlert, LoaderCircle, ShieldCheck } from "lucide-react";
import { useSharedAuthState } from "@/components/auth/provider";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthStatus() {
  const auth = useSharedAuthState();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.info("[WKUConnect auth]", "AuthStatus received authentication status", {
        status: auth.status,
      });
    }
  }, [auth.status]);

  if (auth.status === "loading") {
    return (
      <section
        aria-label="Telegram profile loading"
        aria-live="polite"
        className="w-full rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-4"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-2xl bg-[#1E1E21]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-28 bg-[#1E1E21]" />
            <Skeleton className="h-4 w-44 max-w-full bg-[#1E1E21]" />
            <p className="text-xs text-[#8A8480]">Loading your Telegram profile…</p>
          </div>
        </div>
      </section>
    );
  }

  if (auth.status === "authenticating") {
    return (
      <section
        aria-live="polite"
        className="flex items-center gap-3 rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-4 text-sm text-[#E8DDD6]"
      >
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-[#D47A4C]" />
        <span>Securely verifying your Telegram session…</span>
      </section>
    );
  }

  if (auth.status === "no-init-data") {
    return (
      <section
        aria-live="polite"
        className="flex items-start gap-3 rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-4"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D47A4C]/45 bg-[#2A1C16] text-[#D47A4C]">
          <CircleAlert aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white">Telegram session not found</h2>
          <p className="mt-1 text-xs leading-5 text-[#8A8480]">
            Open WKU Connect from its Telegram bot to securely load your profile.
          </p>
        </div>
      </section>
    );
  }

  if (auth.status === "error") {
    return (
      <section
        role="alert"
        className="rounded-[18px] border border-[#E05A47]/40 bg-[#161213] p-4"
      >
        <div className="flex items-start gap-3">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#E05A47]" />
          <div>
            <h2 className="font-medium text-[#FFFFFF]">We couldn’t load your profile</h2>
            <p className="mt-1 text-sm leading-6 text-[#E8DDD6]">{auth.message}</p>
          </div>
        </div>
      </section>
    );
  }

  const major = auth.user.major?.trim();
  const skills = auth.user.skills.filter((skill) => skill.trim().length > 0);

  return (
    <section
      aria-label="Your profile"
      className="relative w-full overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-4 sm:p-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-[#D47A4C]/[0.08] blur-3xl"
      />
      <div className="relative flex items-center gap-4">
        <UserAvatar
          name={auth.user.displayName}
          avatarUrl={auth.user.avatarUrl}
          size="lg"
          className="size-12 border border-[#D47A4C]/35 ring-2 ring-[#D47A4C]/10"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D47A4C]">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Telegram verified
          </div>
          <h2 className="truncate font-display text-xl font-semibold tracking-tight text-white">
            {auth.user.displayName.trim() || "Your WKU profile"}
          </h2>
        </div>
      </div>
      {(major || skills.length > 0) && (
        <div className="relative mt-4 border-t border-[rgba(255,255,255,0.07)] pt-3">
          {major && (
            <p className="text-sm text-[#E8DDD6]">
              <span className="text-[#8A8480]">Major</span>
              <span aria-hidden="true" className="mx-2 text-[#8A8480]">·</span>
              {major}
            </p>
          )}
          {skills.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${major ? "mt-3" : ""}`}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[#D47A4C]/30 bg-[#2A1C16] px-3 py-1 text-xs font-medium text-[#E69A72]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
