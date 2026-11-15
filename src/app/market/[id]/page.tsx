import Link from "next/link";
import { ArrowLeft, MessageCircleMore, ShieldCheck, Tag } from "lucide-react";
import { getMarketItem } from "@/lib/data/market";

export default async function MarketItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getMarketItem(id);

  if (!item) {
    return (
      <main className="layout-shell isolate relative min-h-screen w-full bg-[#0A0A0B] px-4 py-10 text-white">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm text-[#8A8480]">Item not found or already sold.</p>
          <Link
            href="/market"
            className="mt-4 inline-block rounded-full bg-[#D47A4C] px-4 py-2 text-xs font-bold text-[#0A0A0B]"
          >
            Back to Market
          </Link>
        </div>
      </main>
    );
  }

  const formatted = new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(item.price);

  return (
    <main className="layout-shell isolate relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Background ambient glow - warm terracotta copper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(212,122,76,0.14),transparent_68%)]"
      />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-3.5 px-4 pb-28 pt-3 sm:px-6 sm:pt-5">
        <header className="flex items-center justify-between pb-1">
          <Link
            href="/market"
            aria-label="Back to market"
            className="group inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111113] px-3.5 py-1.5 text-xs font-semibold text-[#8A8480] transition-all hover:border-[#D47A4C]/50 hover:text-[#E8DDD6]"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Market</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D47A4C]/45 bg-[#2A1C16] px-3 py-1 text-[11px] font-semibold text-[#D47A4C]">
            <Tag className="size-3" />
            {item.category}
          </span>
        </header>

        {/* Product Card Showcase */}
        <div className="overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113]">
          <div className="relative flex h-52 w-full items-end justify-between bg-gradient-to-br from-[#2A1C16] via-[#1E1716] to-[#111113] p-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-[#D47A4C]/20 blur-2xl"
            />
            <span className="relative z-10 rounded-full bg-[#0A0A0B]/85 px-3 py-1 text-xs font-bold text-[#D47A4C] backdrop-blur-md">
              Available Now
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {item.title}
                </h1>
                <p className="mt-1 text-xs font-semibold text-[#8A8480]">
                  {item.department} • {item.year}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold tracking-tight text-[#D47A4C]">
                  {formatted}
                </span>
                <p className="text-[10px] text-[#8A8480]">Cash on pickup</p>
              </div>
            </div>

            <div className="mt-4 border-t border-[rgba(255,255,255,0.07)] pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A8480]">
                Description
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#E8DDD6]">
                {item.description}
              </p>
            </div>
          </div>
        </div>

        {/* Seller Info Card */}
        <section className="flex items-center justify-between rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D47A4C] to-[#C88EA7] font-display text-base font-bold text-[#0A0A0B]">
              {item.seller.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-display text-sm font-bold text-white">{item.seller}</p>
                <ShieldCheck className="size-3.5 text-[#D47A4C]" />
              </div>
              <p className="text-[11px] text-[#8A8480]">
                {item.department} • WKU Campus
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[#D47A4C]/45 bg-[#2A1C16] px-3 py-1 text-[11px] font-bold text-[#D47A4C]">
            Verified Seller
          </span>
        </section>

        {/* Contact seller floating CTA */}
        <Link
          href={`/chat`}
          className="fixed inset-x-4 bottom-[5.5rem] z-40 mx-auto flex max-w-lg items-center justify-center gap-2 rounded-full bg-[#D47A4C] py-3.5 text-sm font-bold text-[#0A0A0B] shadow-[0_12px_32px_rgba(212,122,76,0.35)] transition-all hover:bg-[#E69A72] active:scale-[0.99]"
        >
          <MessageCircleMore className="size-4" />
          <span>Message {item.seller}</span>
        </Link>
      </div>
    </main>
  );
}
