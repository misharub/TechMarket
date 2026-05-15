import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

export type CategorySpecType = "STRING" | "NUMBER" | "BOOLEAN" | "SELECT";

export type CategorySpecTemplate = {
  id: string;
  categoryId: string;
  key: string;
  label: string;
  type: CategorySpecType;
  unit: string | null;
  options: string[];
  isRequired: boolean;
  isLocked: boolean;
  isComparable: boolean;
  sortOrder: number;
  helpText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategorySpecPayload = {
  key: string;
  label: string;
  type: CategorySpecType;
  unit?: string;
  options?: string[];
  isRequired?: boolean;
  isComparable?: boolean;
  sortOrder?: number;
  helpText?: string;
};

export function getCategorySpecs(categoryId: string) {
  return apiGet<CategorySpecTemplate[]>(`/categories/${categoryId}/specs`);
}

export function createCategorySpec(categoryId: string, payload: CategorySpecPayload) {
  return apiPost<CategorySpecTemplate, CategorySpecPayload>(`/categories/${categoryId}/specs`, payload);
}

export function updateCategorySpec(categoryId: string, specId: string, payload: Partial<CategorySpecPayload>) {
  return apiPatch<CategorySpecTemplate, Partial<CategorySpecPayload>>(
    `/categories/${categoryId}/specs/${specId}`,
    payload,
  );
}

export function deleteCategorySpec(categoryId: string, specId: string) {
  return apiDelete<CategorySpecTemplate>(`/categories/${categoryId}/specs/${specId}`);
}
