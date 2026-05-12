import { apiGet, apiBaseUrl } from "./api";

export type ProductSort = "newest" | "priceAsc" | "priceDesc" | "titleAsc";

export type ProductRating = {
  average: number;
  count: number;
};

export type ProductBrand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  price: string | number;
  oldPrice: string | number | null;
  stock: number;
  images: string[];
  specs: Record<string, unknown>;
  isActive: boolean;
  categoryId: string;
  category: ProductCategory;
  brandId: string;
  brand: ProductBrand;
  rating: ProductRating;
  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type FindProductsParams = {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  brandId?: string;
  priceFrom?: number;
  priceTo?: number;
  inStock?: boolean;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  sort?: ProductSort;
};

export function getProducts(params: FindProductsParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return apiGet<ProductListResponse>(`/products${queryString ? `?${queryString}` : ""}`);
}

export function resolveUploadUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/uploads")) {
    return `${apiBaseUrl.replace(/\/api$/, "")}${path}`;
  }

  return path;
}
