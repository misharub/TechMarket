import type { CategoryNode } from "../../lib/categories-api";

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU");
}

export function flattenCategoryTree(categories: CategoryNode[]): CategoryNode[] {
  return categories.flatMap((category) => [category, ...flattenCategoryTree(category.children ?? [])]);
}

export function buildCategoryLabel(category: CategoryNode, categories: CategoryNode[]) {
  const parent = categories.find((item) => item.id === category.parentId);

  return parent ? `${parent.name} / ${category.name}` : category.name;
}

export function getParentCategories(categories: CategoryNode[]) {
  return categories.filter((category) => categories.some((item) => item.parentId === category.id));
}

export function getChildCategories(categories: CategoryNode[], parentId: string) {
  return categories.filter((category) => category.parentId === parentId);
}

export function groupCategoriesByParent(categories: CategoryNode[]) {
  const parentGroups = getParentCategories(categories).map((parent) => ({
    parent,
    children: getChildCategories(categories, parent.id),
  }));
  const standaloneRoots = categories.filter(
    (category) => !category.parentId && !categories.some((item) => item.parentId === category.id),
  );

  return {
    parentGroups,
    standaloneRoots,
  };
}
