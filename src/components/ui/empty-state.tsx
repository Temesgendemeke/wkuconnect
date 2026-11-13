import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-card p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-[22px] bg-brand/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
