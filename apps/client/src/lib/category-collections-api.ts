import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { CategoryCollection } from "./categories-api";

export type CategoryCollectionPayload = {
  name: string;
  slug: string;
  conditions: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
};

export function getCategoryCollections(categoryId: string, includeInactive = false) {
  return apiGet<CategoryCollection[]>(
    `/categories/${categoryId}/collections${includeInactive ? "?includeInactive=true" : ""}`,
  );
}

export function createCategoryCollection(categoryId: string, payload: CategoryCollectionPayload) {
  return apiPost<CategoryCollection, CategoryCollectionPayload>(`/categories/${categoryId}/collections`, payload);
}

export function updateCategoryCollection(
  categoryId: string,
  collectionId: string,
  payload: Partial<CategoryCollectionPayload>,
) {
  return apiPatch<CategoryCollection, Partial<CategoryCollectionPayload>>(
    `/categories/${categoryId}/collections/${collectionId}`,
    payload,
  );
}

export function deleteCategoryCollection(categoryId: string, collectionId: string) {
  return apiDelete<CategoryCollection>(`/categories/${categoryId}/collections/${collectionId}`);
}
