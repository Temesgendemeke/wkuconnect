"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessagesSquare } from "lucide-react";

const destinations = [
  { href: "/", label: "Home", icon: House },
  { href: "/chat", label: "Chats", icon: MessagesSquare },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#4b3b27]/80 bg-[#11100e]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_36px_rgba(0,0,0,0.28)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-6">
        {destinations.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith("/chat");

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-24 flex-col items-center gap-1 px-5 pb-2 pt-3 text-xs font-medium transition-colors ${
                active
                  ? "text-[#d4b16a]"
                  : "text-[#a69c8d] hover:text-[#e8dfd0]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-5 top-0 h-0.5 rounded-full ${
                  active ? "bg-[#c39a52] shadow-[0_0_12px_#c39a5270]" : ""
                }`}
              />
              <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
