"use client";

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

const gradientMap = [
  "from-[#d7ff5f] via-[#a8d83c] to-[#6e9f2c]",
  "from-[#c5ec58] via-[#8bbd39] to-[#58802e]",
  "from-[#dafa78] via-[#a6c84d] to-[#718c39]",
  "from-[#bbdf68] via-[#8fae49] to-[#58743a]",
];

export default function Home() {
  const { data: feed } = useFeed();
  const auth = useSharedAuthState();
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
    <main className="layout-shell isolate relative min-h-screen w-full overflow-hidden bg-[#111310] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(174,222,62,0.12),transparent_68%)]" />
      <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5 px-4 pb-10 pt-3 sm:gap-3 sm:px-6 sm:pt-5">
        <header className="relative z-10 flex items-center justify-between pb-2">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="WKU Connect home">
            <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-[#c6f15b] shadow-[0_0_16px_rgba(198,241,91,0.2)] transition-transform group-hover:scale-110" />
            <span className="font-display text-sm font-bold tracking-tight text-white">
              WKU Connect
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-full border border-white/[0.06] bg-[#191c18] text-[#c4c8bd] transition-colors hover:border-[#c6f15b]/35 hover:text-[#d9ff86]"
            >
              <Bell aria-hidden="true" className="size-4" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#ff805f] ring-2 ring-[#191c18]" />
            </button>
            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-[#c6f15b]/30 bg-[#c6f15b] text-[#18210f] transition-colors hover:border-[#d9ff86]"
            >
              {initials ? (
                <span className="text-xs font-bold">{initials[0]}</span>
              ) : (
                <UserRound aria-hidden="true" className="size-4" />
              )}
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[25px] bg-[#c6f15b] px-4 py-4 text-[#17200e] shadow-[0_16px_40px_rgba(123,161,43,0.13)] sm:px-5 sm:py-5">
          <div aria-hidden="true" className="absolute -bottom-12 -right-8 size-32 rounded-full bg-[#8dbb30]/25" />
          <div aria-hidden="true" className="absolute -bottom-7 right-2 size-20 rounded-full border border-[#263914]/10" />
          <div className="relative flex min-h-32 items-end justify-between gap-2">
            <div className="max-w-[19rem] pb-0.5 pr-2">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#34491c]">
                Good morning
              </p>
              <h1 className="font-display text-[25px] font-bold leading-[1.08] tracking-tight sm:text-3xl">
                Hey {firstName ?? "there"}, who will you meet today?
              </h1>
              <p className="mt-2 max-w-[15rem] text-[11px] leading-[1.4] text-[#34451f] sm:text-xs">
                Your campus circle is ready when you are.
              </p>
            </div>
            <span aria-hidden="true" className="relative z-10 mb-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-[#111510] text-[#d7ff72] shadow-lg sm:size-12">
              <ChevronRight className="size-5" strokeWidth={2.2} />
            </span>
          </div>
        </section>

        <section aria-label="Authentication status" className="my-0.5">
          <AuthStatus />
        </section>

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
              className={`group flex gap-3 rounded-[21px] border border-white/[0.06] bg-[#191c18] p-3.5 shadow-[0_10px_26px_rgba(0,0,0,0.14)] transition-all duration-200 hover:border-[#c6f15b]/30 hover:bg-[#1e221a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f15b] ${className}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#c6f15b]/20 bg-[#252c1c] text-[#c6f15b] transition-transform duration-200 group-hover:scale-105">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 items-end justify-between gap-1">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight text-white">{label}</span>
                  <span className="mt-1 block text-[10px] font-medium text-[#c6f15b]">{description}</span>
                </span>
                {href === "/connections" ? null : (
                  <ChevronRight aria-hidden="true" className="mb-1 size-4 shrink-0 text-[#9ba194] transition-transform group-hover:translate-x-0.5 group-hover:text-[#c6f15b]" />
                )}
              </span>
            </Link>
          ))}
        </section>

        <section className="rounded-[23px] border border-white/[0.06] bg-[#191c18] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                Campus updates
              </h2>
            </div>
            <Link href="/notifications" className="group inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-[#c6f15b] transition-colors hover:text-[#dcff8b]">
              View all
            </Link>
          </div>

          <div className="mb-2 flex min-h-10 items-center rounded-[13px] border border-white/[0.04] bg-[#0f110e] px-3 text-xs text-[#8f9589]">
            <span>What&apos;s on your mind{firstName ? `, ${firstName}` : ""}?</span>
          </div>

          <div className="space-y-2.5">
            {feed.map((post, index) => (
              <article key={post.id} className="card-in rounded-[18px] px-0 py-2 transition-colors hover:bg-white/[0.015]" style={{ ["--i" as string]: index }}>
                <div className="flex items-start gap-2.5">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br ${gradientMap[index % gradientMap.length]} text-[10px] font-bold text-[#1e2415]`}>
                    {post.author.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-xs font-semibold text-white">{post.author}</p>
                      <p className="text-[9px] leading-4 text-[#858b80]">{post.time}</p>
                    </div>
                    <p className="mt-1.5 text-xs leading-[1.45] text-[#e0e3db]">{post.content}</p>

                    {post.image && (
                      <div className="mt-3 overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#22271d] p-2">
                        <div className={`h-32 rounded-[10px] bg-gradient-to-br ${gradientMap[index % gradientMap.length]} opacity-70`} />
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-[10px] text-[#92988d]">
                      <span className={`inline-flex items-center gap-1 ${post.liked ? "text-[#c6f15b]" : ""}`}>
                        <Heart aria-hidden="true" className={`size-3.5 ${post.liked ? "fill-current" : ""}`} />
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