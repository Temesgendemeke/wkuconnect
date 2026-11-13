"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { useMarket } from "@/lib/data/market";

const categories = ["All", "Books", "Electronics", "Clothes", "Home", "Services"];

export default function MarketPage() {
  const { data } = useMarket();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const searchMatch = item.title.toLowerCase().includes(query.trim().toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, data, query]);

  return (
    <main className="layout-shell mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-10 pt-5">
      <header className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Campus deals</p>
          <h1 className="text-3xl">Market</h1>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-sm">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <input
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search campus items"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${
              category === activeCategory ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item) => (
          <ProductCard key={item.id} id={item.id} title={item.title} price={item.price} category={item.category} />
        ))}
      </div>

      <button type="button" aria-label="Sell an item" className="fixed bottom-24 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-glow">
        <Plus aria-hidden="true" className="size-6" />
      </button>
    </main>
  );
}
