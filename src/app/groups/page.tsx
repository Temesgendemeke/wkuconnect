import { CommunityCard } from "@/components/ui/community-card";
import { useGroups } from "@/lib/data/groups";

export default function GroupsPage() {
  const { data } = useGroups();

  return (
    <main className="layout-shell mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-8 pt-5">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Communities</p>
        <h1 className="text-3xl">Groups</h1>
      </header>

      <section className="space-y-3">
        {data.map((community) => (
          <CommunityCard key={community.id} name={community.name} members={community.members} joined={community.joined} />
        ))}
      </section>
    </main>
  );
}
