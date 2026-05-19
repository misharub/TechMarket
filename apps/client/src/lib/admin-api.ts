import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "./api";
import type { AuthUser } from "./auth-api";

export type CatalogStats = {
  categoriesCount: number;
  productsCount: number;
  brandsCount: number;
};

export type UploadedImage = {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export function getCatalogStats() {
  return apiGet<CatalogStats>("/admin/stats/catalog");
}

export type AdminUser = AuthUser;

export type AdminUserMessagePayload = {
  title: string;
  message: string;
};

export function getAdminUsers(search?: string) {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  return apiGet<AdminUser[]>(`/admin/users${query ? `?${query}` : ""}`);
}

export function blockAdminUser(userId: string, isBlocked: boolean) {
  return apiPatch<AdminUser, { isBlocked: boolean }>(`/admin/users/${userId}/block`, { isBlocked });
}

export function messageAdminUser(userId: string, payload: AdminUserMessagePayload) {
  return apiPost<{ id: string }, AdminUserMessagePayload>(`/admin/users/${userId}/message`, payload);
}

export function deleteAdminUser(userId: string) {
  return apiDelete<{ success: true }>(`/admin/users/${userId}`);
}

export function uploadImage(file: File, type: "products" | "categories" | "brands" | "general") {
  const body = new FormData();
  body.append("file", file);

  return apiUpload<UploadedImage>(`/uploads/image?type=${type}`, body);
}
