import type { ReactNode } from "react";

export function BottomSheet({ open, title, children }: { open: boolean; title: string; children: ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-[32px] border border-border bg-card p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.12)]">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}
