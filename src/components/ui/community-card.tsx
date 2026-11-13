export function CommunityCard({
  name,
  members,
  joined,
}: {
  name: string;
  members: number;
  joined: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-white">
          {name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{members} members</p>
        </div>
        <button
          type="button"
          className={`rounded-full px-3 py-2 text-xs font-medium ${
            joined ? "bg-primary/10 text-primary" : "bg-brand text-white"
          }`}
        >
          {joined ? "Joined" : "Join"}
        </button>
      </div>
    </div>
  );
}
