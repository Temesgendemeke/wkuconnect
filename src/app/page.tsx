import Link from "next/link";
import { ArrowUpRight, MessagesSquare, Sparkles } from "lucide-react";
import { AuthStatus } from "@/components/auth-status";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";

export default function Home() {
  return (
    <>
      <main className="min-h-dvh flex-1 bg-[radial-gradient(ellipse_at_50%_-20%,#3a2d1b_0%,#171614_45%,#11100f_100%)] px-5 pb-32 pt-8 text-[#eee5d7] sm:px-8 sm:pt-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 sm:gap-10">
          <header className="flex items-center justify-between">
            <Link href="/" aria-label="WKU Connect home" className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-[#8c6b37]/60 bg-gradient-to-br from-[#4a3920] to-[#231d14] text-[#e1bd73] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Sparkles aria-hidden="true" className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold tracking-[0.2em] text-[#f0e6d6]">
                  WKU
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#b49a6d]">
                  Connect
                </span>
              </span>
            </Link>
            <span className="rounded-full border border-[#54442e] bg-[#211e19]/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#c5ae7f]">
              Bowling Green, KY
            </span>
          </header>

          <section aria-labelledby="welcome-heading" className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c5a15e]">
              Your campus, closer
            </p>
            <h1
              id="welcome-heading"
              className="max-w-xl font-serif text-4xl leading-[1.08] tracking-tight text-[#f3eadc] sm:text-5xl"
            >
              Good connections make a great campus.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-[#afa697] sm:text-base">
              A more personal way to find your people and stay connected at WKU.
            </p>
          </section>

          <AuthStatus />

          <section aria-labelledby="quick-nav-heading" className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a88b58]">
                Your space
              </p>
              <h2 id="quick-nav-heading" className="mt-1 font-serif text-2xl text-[#eee5d7]">
                Pick up where you left off
              </h2>
            </div>
            <Link
              href="/chat"
              className="group flex items-center gap-4 rounded-3xl border border-[#453a2a] bg-gradient-to-r from-[#211e19] to-[#191816] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.2)] transition-colors hover:border-[#80643a] hover:from-[#292318] sm:p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#735b34]/60 bg-[#342a1c] text-[#d3ad66]">
                <MessagesSquare aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-[#ede2cf]">Your chats</span>
                <span className="mt-1 block text-sm text-[#a99f90]">
                  Continue a conversation or reach out to a classmate.
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-5 shrink-0 text-[#9f875d] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </section>

          <p className="text-center text-[11px] tracking-wide text-[#766f64]">
            Built for the Hill. Made for each other.
          </p>
        </div>
      </main>
      <BottomNavigation />
    </>
  );
}