import Link from "next/link";
import { ArrowUpRight, Tag } from "lucide-react";

export function ProductCard({
  title,
  price,
  category,
  id,
  seller,
  year,
  index = 0,
}: {
  title: string;
  price: number;
  category: string;
  id: string;
  seller?: string;
  year?: string;
  index?: number;
}) {
  const formatted = new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(price);

  const bannerGradients = [
    "from-[#2A1C16] via-[#1E1716] to-[#111113]",
    "from-[#321F1B] via-[#211818] to-[#121113]",
    "from-[#281A1C] via-[#1E1619] to-[#111113]",
    "from-[#2D1D18] via-[#1F1716] to-[#111113]",
  ];

  const gradientClass = bannerGradients[index % bannerGradients.length];

  return (
    <Link
      href={`/market/${id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[#111113] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-[#D47A4C]/45 hover:bg-[#151517]"
    >
      {/* Top Banner Image / Graphic */}
      <div
        className={`relative mb-3 flex h-32 w-full items-end justify-between overflow-hidden rounded-[14px] bg-gradient-to-br ${gradientClass} p-2.5 border border-[rgba(255,255,255,0.05)]`}
      >
        {/* Warm copper glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-[#D47A4C]/15 blur-xl transition-transform group-hover:scale-125"
        />

        <div className="relative z-10 flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0A0A0B]/80 px-2.5 py-1 backdrop-blur-md">
          <Tag className="size-3 text-[#D47A4C]" />
          <span className="text-[10px] font-semibold text-[#E8DDD6]">{category}</span>
        </div>

        <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-[#0A0A0B]/85 text-white backdrop-blur-md transition-all duration-200 group-hover:bg-[#D47A4C] group-hover:text-[#0A0A0B]">
          <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
        </span>
      </div>

      {/* Item info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-1 font-display text-sm font-bold text-white transition-colors group-hover:text-[#E69A72]">
            {title}
          </h3>
          {seller && (
            <p className="mt-1 text-[11px] text-[#8A8480]">
              {seller} {year ? `• ${year}` : ""}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] pt-2.5">
          <span className="font-display text-sm font-bold tracking-tight text-[#D47A4C]">
            {formatted}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8480]">
            Verified
          </span>
        </div>
      </div>
    </Link>
  );
}
