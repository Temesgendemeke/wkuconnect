export function NotificationRow({
  title,
  subtitle,
  time,
  unread,
}: {
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-border bg-card p-3 shadow-sm">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-white">
        {title.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <span className="text-[11px] text-muted-foreground">{time}</span>
        </div>
      </div>
      {unread ? <span className="size-2.5 rounded-full bg-[#FF5A4D]" aria-label="Unread" /> : null}
    </div>
  );
}
