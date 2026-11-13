// TODO: replace with Convex marketplace queries.

export type MarketItem = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  seller: string;
  year: string;
  department: string;
  image?: string;
};

export type MarketResult = {
  data: MarketItem[];
  loading: boolean;
  error: string | null;
};

const marketData: MarketItem[] = [
  {
    id: "market-1",
    title: "Biology lab manual",
    price: 18500,
    category: "Books",
    description: "Used but in great condition. Includes cheat sheet and practice questions.",
    seller: "Meron D.",
    year: "Y2",
    department: "Biology",
    image: "/images/item-1.jpg",
  },
  {
    id: "market-2",
    title: "USB-C monitor adapter",
    price: 24000,
    category: "Electronics",
    description: "Compact adapter for MacBook and Windows laptops. Works well for classroom setups.",
    seller: "Daniel A.",
    year: "Y3",
    department: "CS",
    image: "/images/item-2.jpg",
  },
  {
    id: "market-3",
    title: "Winter hoodie",
    price: 16500,
    category: "Clothes",
    description: "Lightweight hoodie with a neutral design. Worn twice, still in excellent shape.",
    seller: "Netsanet K.",
    year: "Y1",
    department: "Psychology",
  },
  {
    id: "market-4",
    title: "Study desk lamp",
    price: 9800,
    category: "Home",
    description: "Soft warm light with adjustable arm. Great for late-night exam prep.",
    seller: "Yohannes G.",
    year: "Y4",
    department: "Architecture",
  },
];

export function useMarket(): MarketResult {
  return {
    data: marketData,
    loading: false,
    error: null,
  };
}

export function getMarketItem(id: string): MarketItem | undefined {
  return marketData.find((item) => item.id === id);
}
