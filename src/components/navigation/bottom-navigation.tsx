"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessageSquareText, ShoppingBag, UsersRound } from "lucide-react";

const destinations = [
  { href: "/", label: "Home", icon: House },
  { href: "/connections", label: "People", icon: UsersRound },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/chat", label: "Chats", icon: MessageSquareText },
] as const;

export function BottomNavigation() {
  const pathname = usePathname() ?? "/";

  const activeIndex = destinations.findIndex(({ href }) => {
    if (href === "/") return pathname === "/";
    if (href === "/connections") return pathname.startsWith("/connections") || pathname.startsWith("/groups");
    if (href === "/market") return pathname.startsWith("/market");
    if (href === "/chat") return pathname.startsWith("/chat");
    return false;
  });

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-3 z-50 px-3 pb-[env(safe-area-inset-bottom)] sm:bottom-5"
    >
      <div className="relative mx-auto flex w-full max-w-[360px] items-center justify-between gap-1 rounded-full border border-white/70 bg-[#f1f2eb] p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:max-w-md sm:p-2">
        {destinations.map(({ href, label, icon: Icon }, index) => {
          const active = index === activeIndex;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className="relative z-10 flex flex-1 justify-center"
            >
              <span
                className={`relative flex size-11 items-center justify-center gap-2 rounded-full px-3 text-xs font-medium transition-all duration-200 sm:size-auto sm:min-h-11 sm:flex-1 sm:px-4 ${
                  active
                    ? "bg-[#111310] text-[#c6f15b] shadow-[0_4px_12px_rgba(0,0,0,0.22)]"
                    : "text-[#555b50] hover:bg-black/[0.05] hover:text-[#1d2119]"
                }`}
              >
                <Icon aria-hidden="true" className="size-4" strokeWidth={2.2} />
                <span className="hidden sm:inline">{label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
