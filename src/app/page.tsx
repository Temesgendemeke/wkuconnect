"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Heart,
  MessageSquare,
  MessageSquareText,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";
import { AuthStatus } from "@/components/auth-status";
import { useSharedAuthState } from "@/components/auth/provider";
import { useFeed } from "@/lib/data/feed";

export default function Home() {
  const { data: feed } = useFeed();
  const auth = useSharedAuthState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName =
    auth.status === "authenticated" ? auth.user.displayName.trim() : "";
  const firstName = fullName ? fullName.split(/\s+/)[0] : undefined;
  const initials = fullName
    ? fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : undefined;

  return (
    <main className="layout-shell isolate relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-[#FFFFFF]">
      {/* Background ambient glow - warm terracotta copper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(212,122,76,0.14),transparent_68%)]"
      />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5 px-4 pb-10 pt-3 sm:gap-3 sm:px-6 sm:pt-5">
        <header className="relative z-10 flex items-center justify-between pb-2">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="WKU Connect home">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-[3px] bg-[#D47A4C] shadow-[0_0_16px_rgba(212,122,76,0.35)] transition-transform group-hover:scale-110"
            />
            <span className="font-display text-sm font-bold tracking-tight text-[#FFFFFF]">
              WKU Connect
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111113] text-[#8A8480] transition-colors hover:border-[#D47A4C]/50 hover:text-[#E8DDD6]"
            >
              <Bell aria-hidden="true" className="size-4" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#C88EA7] ring-2 ring-[#111113]" />
            </button>
            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-[#D47A4C]/45 bg-[#2A1C16] text-[#D47A4C] transition-all hover:scale-105 hover:border-[#E69A72]"
            >
              {mounted && auth.status === "authenticated" && auth.user.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={auth.user.avatarUrl}
                  alt={auth.user.displayName || "Profile"}
                  className="size-full object-cover"
                />
              ) : mounted && initials ? (
                <span className="text-xs font-bold text-[#E8DDD6]">{initials[0]}</span>
              ) : (
                <UserRound aria-hidden="true" className="size-4 text-[#D47A4C]" />
              )}
            </Link>
          </div>
        </header>

        {/* TOP BANNER: Frosted-glass dark card with soft warm orange glow */}
        <section
          style={{
            background: "#161416",
            backgroundImage:
              "radial-gradient(circle at 10% 100%, rgba(255,138,61,0.6) 0%, rgba(224,114,58,0.18) 50%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "22px",
            backdropFilter: "blur(20px)",
          }}
          className="relative overflow-hidden px-4 py-4 text-white sm:px-5 sm:py-5"
        >
          {/* Subtle 5% white overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white/[0.05]"
          />

          <div className="relative z-10 flex min-h-32 items-end justify-between gap-2">
            <div className="max-w-[19rem] pb-0.5 pr-2">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#E69A72]">
                Good morning
              </p>
              <h1 className="font-display text-[22px] font-medium leading-[1.12] tracking-tight text-white sm:text-[23px]">
                Hey {firstName ?? "there"}, who will you meet today?
              </h1>
              <p className="mt-2 max-w-[15rem] text-[11px] leading-[1.4] text-white/78 sm:text-xs">
                Your campus circle is ready when you are.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="relative z-10 mb-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0B] text-[#D47A4C] border border-[rgba(255,255,255,0.1)] sm:size-12 transition-transform hover:scale-105"
            >
              <ChevronRight className="size-5" strokeWidth={2.4} />
            </span>
          </div>
        </section>

        <section aria-label="Authentication status" className="my-0.5">
          <AuthStatus />
        </section>

        {/* Quick links: cards in #111113, copper icon chips in #2A1C16 */}
        <section aria-label="Quick links" className="grid grid-cols-2 grid-rows-[repeat(2,minmax(4.5rem,1fr))] gap-2">
          {[
            {
              href: "/connections",
              label: "Find your people",
              description: "Explore",
              icon: Users,
              className: "row-span-2 min-h-[9.5rem] flex-col items-start justify-between",
            },
            {
              href: "/chat",
              label: "Your Chats",
              description: "Catch up",
              icon: MessageSquareText,
              className: "min-h-[4.6rem] flex-row items-center",
            },
            {
              href: "/market",
              label: "Market",
              description: "Browse",
              icon: ShoppingBag,
              className: "min-h-[4.6rem] flex-row items-center",
            },
          ].map(({ href, label, description, icon: Icon, className }) => (
            <Link
              key={href}
              href={href}
              className={`group flex gap-3 rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-3.5 transition-all duration-200 hover:border-[#D47A4C]/45 hover:bg-[#151517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D47A4C] ${className}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D47A4C]/45 bg-[#2A1C16] text-[#D47A4C] transition-transform duration-200 group-hover:scale-105">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 items-end justify-between gap-1">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight text-white">{label}</span>
                  <span className="mt-1 block text-[10px] font-medium text-[#D47A4C]">{description}</span>
                </span>
                {href === "/connections" ? null : (
                  <ChevronRight aria-hidden="true" className="mb-1 size-4 shrink-0 text-[#8A8480] transition-transform group-hover:translate-x-0.5 group-hover:text-[#D47A4C]" />
                )}
              </span>
            </Link>
          ))}
        </section>

        {/* Campus updates feed card */}
        <section className="rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-3.5 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                Campus updates
              </h2>
            </div>
            <Link
              href="/notifications"
              className="group inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-[#C88EA7] transition-colors hover:text-[#E8DDD6]"
            >
              View all
            </Link>
          </div>

          <div className="mb-2 flex min-h-10 items-center rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#151517] px-3 text-xs text-[#8A8480]">
            <span>What&apos;s on your mind{firstName ? `, ${firstName}` : ""}?</span>
          </div>

          <div className="space-y-2.5">
            {feed.map((post, index) => (
              <article
                key={post.id}
                className="card-in rounded-[16px] px-0 py-2 transition-colors hover:bg-white/[0.02]"
                style={{ ["--i" as string]: index }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#D47A4C] to-[#C88EA7] text-[10px] font-bold text-[#0A0A0B]">
                    {post.author
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-xs font-semibold text-white">{post.author}</p>
                      <p className="text-[9px] leading-4 text-[#8A8480]">{post.time}</p>
                    </div>
                    <p className="mt-1.5 text-xs leading-[1.45] text-[#E8DDD6]">{post.content}</p>

                    {post.image && (
                      <div className="mt-3 overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[#151517] p-2">
                        <div className="h-32 rounded-[10px] bg-gradient-to-br from-[#D47A4C] to-[#7A4A5C] opacity-80" />
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-[10px] text-[#8A8480]">
                      <span className={`inline-flex items-center gap-1 ${post.liked ? "text-[#C88EA7]" : ""}`}>
                        <Heart aria-hidden="true" className={`size-3.5 ${post.liked ? "fill-current text-[#C88EA7]" : ""}`} />
                        {post.likes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare aria-hidden="true" className="size-3.5" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
