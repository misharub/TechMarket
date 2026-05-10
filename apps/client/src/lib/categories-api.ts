import { apiGet } from "./api";

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
  children: CategoryNode[];
};

export function getCategoryTree() {
  return apiGet<CategoryNode[]>("/categories/tree");
}
