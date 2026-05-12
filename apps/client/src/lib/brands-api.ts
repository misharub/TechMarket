import { apiGet } from "./api";

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
