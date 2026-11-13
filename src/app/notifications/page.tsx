import { Search } from "lucide-react";
import { NotificationRow } from "@/components/ui/notification-row";
import { useNotifications } from "@/lib/data/notifications";

export default function NotificationsPage() {
  const { data } = useNotifications();

  return (
    <main className="layout-shell mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-8 pt-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Updates</p>
          <h1 className="text-3xl">Alerts</h1>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full border border-border bg-card">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', 'Requests', 'Messages'].map((item, index) => (
          <button
            key={item}
            type="button"
            className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${
              index === 0 ? "bg-brand text-white" : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {data.map((notification) => (
          <NotificationRow
            key={notification.id}
            title={notification.title}
            subtitle={notification.subtitle}
            time={notification.time}
            unread={notification.unread}
          />
        ))}
      </section>
    </main>
  );
}
