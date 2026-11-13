import Link from "next/link";

export function ProductCard({
  title,
  price,
  category,
  id,
}: {
  title: string;
  price: number;
  category: string;
  id: string;
}) {
  const formatted = new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/market/${id}`} className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition-transform hover:-translate-y-1">
      <div className="h-28 bg-gradient-to-br from-[#0B7A57] via-[#13986C] to-[#F29A24]" />
      <div className="space-y-2 p-3">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm font-medium text-primary">{formatted}</p>
        <span className="inline-flex rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">{category}</span>
      </div>
    </Link>
  );
}
