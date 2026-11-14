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
        className="w-full rounded-3xl border border-white/[0.07] bg-[#191c18] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-2xl bg-[#292d26]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-28 bg-[#292d26]" />
            <Skeleton className="h-4 w-44 max-w-full bg-[#292d26]" />
            <p className="text-xs text-[#92978c]">Loading your Telegram profile…</p>
          </div>
        </div>
      </section>
    );
  }

  if (auth.status === "authenticating") {
    return (
      <section
        aria-live="polite"
        className="flex items-center gap-3 rounded-3xl border border-white/[0.07] bg-[#191c18] p-4 text-sm text-[#c5c9bf]"
      >
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-[#c6f15b]" />
        <span>Securely verifying your Telegram session…</span>
      </section>
    );
  }

  if (auth.status === "no-init-data") {
    return (
      <section
        aria-live="polite"
        className="flex items-start gap-3 rounded-3xl border border-white/[0.07] bg-[#191c18] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#c6f15b]/25 bg-[#252c1c] text-[#c6f15b]">
          <CircleAlert aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white">Telegram session not found</h2>
          <p className="mt-1 text-xs leading-5 text-[#a3a99c]">
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
        className="rounded-3xl border border-[#70443d]/60 bg-[#211a18] p-4"
      >
        <div className="flex items-start gap-3">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#ef927d]" />
          <div>
            <h2 className="font-medium text-[#f3d9d2]">We couldn’t load your profile</h2>
            <p className="mt-1 text-sm leading-6 text-[#c9aaa2]">{auth.message}</p>
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
      className="relative w-full overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#1e221b] via-[#191c18] to-[#151713] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] sm:p-5"
    >
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-14 size-40 rounded-full bg-[#c6f15b]/[0.06] blur-3xl"
      />
      <div className="relative flex items-center gap-4">
        <UserAvatar
          name={auth.user.displayName}
          avatarUrl={auth.user.avatarUrl}
          size="lg"
          className="size-12 border border-[#c6f15b]/30 ring-2 ring-[#c6f15b]/10"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c6f15b]">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Telegram verified
          </div>
          <h2 className="truncate font-display text-xl font-semibold tracking-tight text-white">
            {auth.user.displayName.trim() || "Your WKU profile"}
          </h2>
        </div>
      </div>
      {(major || skills.length > 0) && (
        <div className="relative mt-4 border-t border-white/[0.08] pt-3">
          {major && (
            <p className="text-sm text-[#c5c9bf]">
              <span className="text-[#92978c]">Major</span>
              <span aria-hidden="true" className="mx-2 text-[#646b5e]">·</span>
              {major}
            </p>
          )}
          {skills.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${major ? "mt-3" : ""}`}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[#c6f15b]/15 bg-[#252c1c] px-3 py-1 text-xs text-[#d0e7a3]"
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