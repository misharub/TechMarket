import { apiBaseUrl, apiGet, apiPatch, apiPost } from "./api";

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
  shortDescription: string | null;
  description: string;
  price: string | number;
  oldPrice: string | number | null;
  stock: number;
  images: string[];
  specs: Record<string, unknown>;
  additionalSpecs: ProductAdditionalSpec[];
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
  collectionSlug?: string;
  brandId?: string;
  specFilters?: string;
  priceFrom?: number;
  priceTo?: number;
  inStock?: boolean;
  includeInactive?: boolean;
  isActive?: boolean;
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

export type ProductPayload = {
  title: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  images?: string[];
  specs: Record<string, unknown>;
  additionalSpecs?: ProductAdditionalSpec[];
  categoryId: string;
  brandId: string;
  isActive?: boolean;
};

export type ProductAdditionalSpec = {
  label: string;
  value: string;
};

export type BulkProductAction = "activate" | "deactivate" | "delete";

export function getProduct(id: string) {
  return apiGet<Product>(`/products/${id}`);
}

export function getProductBySlug(slug: string) {
  return apiGet<Product>(`/products/by-slug/${slug}`);
}

export function createProduct(payload: ProductPayload) {
  return apiPost<Product, ProductPayload>("/products", payload);
}

export function updateProduct(id: string, payload: Partial<ProductPayload>) {
  return apiPatch<Product, Partial<ProductPayload>>(`/products/${id}`, payload);
}

export function bulkUpdateProducts(ids: string[], action: BulkProductAction) {
  return apiPatch<{ count: number }, { ids: string[]; action: BulkProductAction }>("/products/bulk", {
    ids,
    action,
  });
}
