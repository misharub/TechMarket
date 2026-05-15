import { apiGet, apiPatch, apiPost } from "./api";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FindBrandsParams = {
  search?: string;
  includeInactive?: boolean;
};

export function getBrands(params: FindBrandsParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return apiGet<Brand[]>(`/brands${queryString ? `?${queryString}` : ""}`);
}

export type BrandPayload = {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
};

export type BulkBrandAction = "activate" | "deactivate" | "delete";

export function getBrand(id: string) {
  return apiGet<Brand>(`/brands/${id}`);
}

export function createBrand(payload: BrandPayload) {
  return apiPost<Brand, BrandPayload>("/brands", payload);
}

export function updateBrand(id: string, payload: Partial<BrandPayload>) {
  return apiPatch<Brand, Partial<BrandPayload>>(`/brands/${id}`, payload);
}

export function bulkUpdateBrands(ids: string[], action: BulkBrandAction) {
  return apiPatch<{ count: number }, { ids: string[]; action: BulkBrandAction }>("/brands/bulk", {
    ids,
    action,
  });
}
