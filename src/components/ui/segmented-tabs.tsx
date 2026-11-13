import type { ReactNode } from "react";

export function SegmentedTabs({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (next: string) => void;
  children: ReactNode[];
}) {
  return (
    <div className="relative flex rounded-full border border-border bg-muted/60 p-1">
      {children.map((child) => {
        const isActive = String((child as { props?: { value?: string } })?.props?.value ?? "") === value;
        return (
          <button
            key={String((child as { props?: { value?: string } })?.props?.value ?? "")}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(String((child as { props?: { value?: string } })?.props?.value ?? ""))}
            className={`relative z-10 flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {child}
          </button>
        );
      })}
    </div>
  );
}

export function TabButton({ children, active }: { children: ReactNode; active: boolean }) {
  return (
    <span className={active ? "text-foreground" : "text-muted-foreground"}>{children}</span>
  );
}
