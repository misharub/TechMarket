import { apiDelete, apiGet, apiPost, apiPut } from "./api";

export type SpecificationOption = {
  id: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Specification = {
  id: string;
  key: string;
  name: string;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "SELECT";
  unit: string | null;
  isRequired: boolean;
  sortOrder: number;
  options: SpecificationOption[];
  createdAt: string;
  updatedAt: string;
};

export type SpecificationGroup = {
  id: string;
  name: string;
  sortOrder: number;
  specifications: Specification[];
  createdAt: string;
  updatedAt: string;
};

export type SpecificationTemplateCategory = {
  id: string;
  name: string;
  slug: string;
};

export type SpecificationTemplate = {
  id: string;
  name: string;
  categoryId: string;
  category: SpecificationTemplateCategory;
  groups: SpecificationGroup[];
  createdAt: string;
  updatedAt: string;
};

export type SpecificationTemplateListItem = Omit<SpecificationTemplate, "groups"> & {
  _count: { groups: number };
};

export type SpecificationTemplatePayload = {
  name: string;
  categoryId: string;
  groups: Array<{
    id?: string;
    name: string;
    sortOrder: number;
    specifications: Array<{
      id?: string;
      name: string;
      type: Specification["type"];
      unit?: string | null;
      isRequired: boolean;
      sortOrder: number;
      options: Array<{
        id?: string;
        value: string;
        sortOrder: number;
      }>;
    }>;
  }>;
};

export function getSpecificationTemplates() {
  return apiGet<SpecificationTemplateListItem[]>("/admin/specification-templates");
}

export function getSpecificationTemplate(id: string) {
  return apiGet<SpecificationTemplate>(`/admin/specification-templates/${id}`);
}

export function getSpecificationTemplateByCategory(categoryId: string) {
  return apiGet<SpecificationTemplate | null>(`/specification-templates/by-category/${categoryId}`);
}

export function createSpecificationTemplate(payload: SpecificationTemplatePayload) {
  return apiPost<SpecificationTemplate, SpecificationTemplatePayload>("/admin/specification-templates", payload);
}

export function updateSpecificationTemplate(id: string, payload: SpecificationTemplatePayload) {
  return apiPut<SpecificationTemplate, SpecificationTemplatePayload>(`/admin/specification-templates/${id}`, payload);
}

export function deleteSpecificationTemplate(id: string) {
  return apiDelete<SpecificationTemplate>(`/admin/specification-templates/${id}`);
}
