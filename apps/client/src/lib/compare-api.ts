import { apiPost } from "./api";

export type CompareProductSummary = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  images: string[];
  brand: {
    id: string;
    name: string;
    slug: string;
  };
};

export type CompareRow = {
  key: string;
  label: string;
  unit: string | null;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "SELECT";
  values: Record<string, unknown>;
  bestProductIds: string[];
};

export type CompareResponse = {
  category: {
    id: string;
    name: string;
  };
  products: CompareProductSummary[];
  rows: CompareRow[];
  aiSummary: string;
  aiSummaryMeta: {
    provider: string;
    isFallback: boolean;
    fallbackReason?: string;
  };
};

export function compareProducts(productIds: string[]) {
  return apiPost<CompareResponse, { productIds: string[] }>("/products/compare", { productIds });
}
