import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "./api";
import type { AuthUser } from "./auth-api";

export type CatalogStats = {
  categoriesCount: number;
  productsCount: number;
  brandsCount: number;
};

export type AdminOrderStatus = "NEW" | "PROCESSING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export type AdminStatsProductSummary = {
  id: string;
  title: string;
  sku: string;
  images: string[];
};

export type AdminStatsLowStockProduct = AdminStatsProductSummary & {
  stock: number;
  slug: string;
  price: string | number;
  oldPrice: string | number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
  };
};

export type AdminStatsTopProduct = {
  product: AdminStatsProductSummary;
  totalQuantity: number;
  totalRevenue: number;
};

export type AdminStatsOrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  product: AdminStatsProductSummary;
};

export type AdminStatsOrder = {
  id: string;
  orderNumber: string | null;
  status: AdminOrderStatus;
  totalPrice: string | number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  user: Pick<AuthUser, "id" | "email" | "firstName" | "lastName">;
  items: AdminStatsOrderItem[];
};

export type AdminDashboardStats = {
  products: {
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
    lowStockItems: AdminStatsLowStockProduct[];
  };
  orders: {
    total: number;
    new: number;
    byStatus: Record<AdminOrderStatus, number>;
    latest: AdminStatsOrder[];
  };
  users: {
    total: number;
    blocked: number;
  };
  catalog: {
    brands: number;
    categories: number;
  };
  sales: {
    totalRevenue: number;
    topProducts: AdminStatsTopProduct[];
  };
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

export function getAdminDashboardStats() {
  return apiGet<AdminDashboardStats>("/admin/stats");
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
