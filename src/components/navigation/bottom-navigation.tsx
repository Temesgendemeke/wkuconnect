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
      className="fixed inset-x-3 bottom-5 z-50"
    >
      <div className="relative mx-auto flex max-w-md items-center justify-between gap-1 rounded-full border border-border bg-card/95 px-2 py-2 shadow-glow backdrop-blur-xl">
        {destinations.map(({ href, label, icon: Icon }, index) => {
          const active = index === activeIndex;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="relative z-10 flex-1"
            >
              <span
                className={`relative flex items-center justify-center gap-2 rounded-full px-3 py-3 text-xs font-medium transition-all ${
                  active
                    ? "bg-brand text-white shadow-[0_10px_24px_rgba(11,122,87,0.38)]"
                    : "text-muted-foreground hover:text-foreground"
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
