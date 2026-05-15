import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

export type CategoryNode = {
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
  collections: CategoryCollection[];
  children: CategoryNode[];
};

export type CategoryCollection = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  conditions: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getCategoryTree() {
  return apiGet<CategoryNode[]>("/categories/tree");
}

export type CategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  parentId?: string | null;
  isActive?: boolean;
};

export type BulkCatalogAction = "activate" | "deactivate" | "delete";

export function getCategories(includeInactive = false) {
  return apiGet<CategoryNode[]>(`/categories${includeInactive ? "?includeInactive=true" : ""}`);
}

export function getCategory(id: string) {
  return apiGet<CategoryNode>(`/categories/${id}`);
}

export function createCategory(payload: CategoryPayload) {
  return apiPost<CategoryNode, CategoryPayload>("/categories", payload);
}

export function updateCategory(id: string, payload: Partial<CategoryPayload>) {
  return apiPatch<CategoryNode, Partial<CategoryPayload>>(`/categories/${id}`, payload);
}

export function deleteCategory(id: string) {
  return apiDelete<CategoryNode>(`/categories/${id}`);
}

export function bulkUpdateCategories(ids: string[], action: BulkCatalogAction) {
  return apiPatch<{ count: number }, { ids: string[]; action: BulkCatalogAction }>("/categories/bulk", {
    ids,
    action,
  });
}
