"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { useMarket } from "@/lib/data/market";

const categories = [
  "All",
  "Books",
  "Electronics",
  "Clothes",
  "Home",
  "Services",
];

export default function MarketPage() {
  const { data } = useMarket();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const categoryMatch =
        activeCategory === "All" || item.category === activeCategory;
      const searchMatch =
        item.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        item.description.toLowerCase().includes(query.trim().toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, data, query]);

  return (
    <main className="layout-shell isolate relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Background ambient glow - warm terracotta copper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(212,122,76,0.14),transparent_68%)]"
      />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pb-28 pt-3 sm:gap-4 sm:px-6 sm:pt-5">
        {/* Top Header Navigation */}
        <header className="relative z-10 flex items-center justify-between pb-1">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111113] px-3.5 py-1.5 text-xs font-semibold text-[#8A8480] transition-all hover:border-[#D47A4C]/50 hover:text-[#E8DDD6]"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D47A4C]/45 bg-[#2A1C16] px-3 py-1 text-[11px] font-semibold text-[#D47A4C]">
              <span className="size-1.5 rounded-full bg-[#D47A4C] animate-pulse" />
              WKU Student Market
            </span>
          </div>
        </header>

        {/* Top Banner: Dark frosted-glass with warm copper glow */}
        <section
          style={{
            background: "#161416",
            backgroundImage:
              "radial-gradient(circle at 10% 100%, rgba(255,138,61,0.6) 0%, rgba(224,114,58,0.18) 50%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "22px",
            backdropFilter: "blur(20px)",
          }}
          className="relative overflow-hidden p-4 text-white sm:p-5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white/[0.05]"
          />

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="max-w-[19rem]">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#E69A72]">
                Campus Marketplace
              </p>
              <h1 className="font-display text-[22px] font-medium leading-[1.12] tracking-tight text-white sm:text-2xl">
                Buy, sell & trade directly with WKU students.
              </h1>
              <p className="mt-1.5 text-[11px] leading-snug text-white/78">
                No middleman • Verified campus community.
              </p>
            </div>
            <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0A0A0B] text-[#D47A4C] border border-[rgba(255,255,255,0.1)] shadow-lg">
              <ShoppingBag className="size-5" />
            </span>
          </div>
        </section>

        {/* Search Bar: surface-2 with subtle border and copper focus ring */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-[16px] border border-[rgba(255,255,255,0.07)] bg-[#151517] px-3.5 py-2.5 focus-within:border-[#D47A4C] focus-within:ring-1 focus-within:ring-[#D47A4C]">
            <Search className="size-4 shrink-0 text-[#8A8480]" />
            <input
              type="text"
              aria-label="Search campus items"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, monitors, dorm essentials..."
              className="w-full bg-transparent text-xs text-white placeholder-[#8A8480] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[11px] font-bold text-[#8A8480] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#D47A4C] text-[#0A0A0B] ring-2 ring-[#D47A4C]"
                    : "border border-[rgba(255,255,255,0.07)] bg-[#111113] text-[#8A8480] hover:border-[#D47A4C]/45 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Result Counter */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-[#8A8480]">
            Showing <span className="text-white font-bold">{filtered.length}</span> items
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D47A4C]">
            <TrendingUp className="size-3" />
            <span>Latest listings</span>
          </span>
        </div>

        {/* Premier Product Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] py-14 text-center">
            <ShoppingBag className="mb-2 size-10 text-[#8A8480]" />
            <p className="font-display text-sm font-bold text-white">No items found</p>
            <p className="mt-1 text-xs text-[#8A8480]">Try searching with a different keyword</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filtered.map((item, idx) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                category={item.category}
                seller={item.seller}
                year={item.year}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button: Post an Item (copper fill with obsidian text) */}
      <Link
        href="/market"
        title="Sell an item on campus"
        className="fixed bottom-22 right-5 z-40 flex items-center gap-2 rounded-full bg-[#D47A4C] px-4 py-3.5 font-display text-xs font-bold text-[#0A0A0B] shadow-[0_12px_32px_rgba(212,122,76,0.35)] transition-all hover:scale-105 hover:bg-[#E69A72] active:scale-95 sm:bottom-24 sm:right-8"
      >
        <Plus className="size-4" strokeWidth={2.8} />
        <span>List Item</span>
      </Link>
    </main>
  );
}
