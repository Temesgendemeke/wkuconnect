import type { ReactNode } from "react";

export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-transparent bg-brand text-white"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
