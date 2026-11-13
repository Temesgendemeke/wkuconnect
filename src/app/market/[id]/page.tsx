import Link from "next/link";
import { ArrowLeft, MessageCircleMore } from "lucide-react";
import { getMarketItem } from "@/lib/data/market";

export default async function MarketItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getMarketItem(id);

  if (!item) {
    return (
      <main className="layout-shell mx-auto flex w-full max-w-md px-4 pb-8 pt-5">
        <p className="text-lg text-muted-foreground">Item not found.</p>
      </main>
    );
  }

  const formatted = new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(item.price);

  return (
    <main className="layout-shell mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-24 pt-5">
      <header className="flex items-center justify-between">
        <Link href="/market" aria-label="Back to market" className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">{item.category}</span>
      </header>

      <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
        <div className="h-56 bg-gradient-to-br from-[#0B7A57] via-[#13986C] to-[#F29A24]" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl">{item.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{item.department} · {item.year}</p>
            </div>
            <p className="text-xl font-semibold text-primary">{formatted}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/80">{item.description}</p>
        </div>
      </div>

      <section className="rounded-[28px] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {item.seller.slice(0, 1)}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{item.seller}</p>
            <p className="text-sm text-muted-foreground">{item.department} · {item.year}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Friend</span>
        </div>
      </section>

      <button type="button" className="fixed inset-x-4 bottom-[5.5rem] z-50 flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-base font-medium text-white shadow-glow">
        <MessageCircleMore aria-hidden="true" className="size-4" />
        Contact seller
      </button>
    </main>
  );
}
