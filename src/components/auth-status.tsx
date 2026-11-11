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
        className="w-full rounded-3xl border border-[#493a29] bg-gradient-to-br from-[#211d17] to-[#171614] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-2xl bg-[#373025]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-28 bg-[#373025]" />
            <Skeleton className="h-4 w-44 max-w-full bg-[#373025]" />
            <p className="text-xs text-[#b3a995]">Loading your Telegram profile…</p>
          </div>
        </div>
      </section>
    );
  }

  if (auth.status === "authenticating") {
    return (
      <section
        aria-live="polite"
        className="flex items-center gap-3 rounded-3xl border border-[#493a29] bg-[#1c1a17] p-5 text-sm text-[#d7c7a6]"
      >
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-[#c39a52]" />
        <span>Securely verifying your Telegram session…</span>
      </section>
    );
  }

  if (auth.status === "no-init-data") {
    return (
      <section
        aria-live="polite"
        className="rounded-3xl border border-[#493a29] bg-gradient-to-br from-[#211d17] to-[#171614] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]"
      >
        <div className="mb-3 flex size-10 items-center justify-center rounded-2xl border border-[#80643a]/50 bg-[#34291b] text-[#d4b16a]">
          <CircleAlert aria-hidden="true" className="size-5" />
        </div>
        <h2 className="font-serif text-xl text-[#f0e5d1]">Telegram session not found</h2>
        <p className="mt-2 text-sm leading-6 text-[#b3a995]">
          Open WKU Connect from its Telegram bot to securely load your profile.
        </p>
      </section>
    );
  }

  if (auth.status === "error") {
    return (
      <section
        role="alert"
        className="rounded-3xl border border-[#68413b] bg-[#241a18] p-5"
      >
        <div className="flex items-start gap-3">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#e29a82]" />
          <div>
            <h2 className="font-medium text-[#f0d7cc]">We couldn’t load your profile</h2>
            <p className="mt-1 text-sm leading-6 text-[#c5a99e]">{auth.message}</p>
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
      className="relative w-full overflow-hidden rounded-3xl border border-[#58452b] bg-gradient-to-br from-[#282218] via-[#201d18] to-[#181715] p-5 shadow-[0_20px_56px_rgba(0,0,0,0.3)] sm:p-6"
    >
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-14 size-40 rounded-full bg-[#c39a52]/[0.07] blur-3xl"
      />
      <div className="relative flex items-center gap-4">
        <UserAvatar
          name={auth.user.displayName}
          avatarUrl={auth.user.avatarUrl}
          size="lg"
          className="size-14 border border-[#b9914d]/50 ring-2 ring-[#b9914d]/10"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9a867]">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Telegram verified
          </div>
          <h2 className="truncate font-serif text-2xl tracking-tight text-[#f1e7d5]">
            {auth.user.displayName.trim() || "Your WKU profile"}
          </h2>
        </div>
      </div>
      {(major || skills.length > 0) && (
        <div className="relative mt-5 border-t border-[#51432f]/80 pt-4">
          {major && (
            <p className="text-sm text-[#d8cbb5]">
              <span className="text-[#9f927e]">Major</span>
              <span aria-hidden="true" className="mx-2 text-[#765f3c]">·</span>
              {major}
            </p>
          )}
          {skills.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${major ? "mt-3" : ""}`}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[#655033]/70 bg-[#302719]/80 px-3 py-1 text-xs text-[#d6c095]"
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