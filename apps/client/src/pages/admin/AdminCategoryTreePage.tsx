import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, type CategoryNode } from "../../lib/categories-api";
import { getCategoryDepth } from "./admin-utils";

export function AdminCategoryTreePage() {
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => getCategories(true),
  });
  const categories = categoriesQuery.data ?? [];
  const roots = categories.filter((category) => !category.parentId);
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(new Set());

  function toggleRoot(categoryId: string) {
    setExpandedRootIds((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Дерево категорий</h1>
      </header>

      <section className="admin_panel admin_category_tree">
        <div className="admin_category_tree_list">
          {roots.map((category) => (
            <CategoryTreeNode
              category={category}
              categories={categories}
              isRoot
              isExpanded={expandedRootIds.has(category.id)}
              key={category.id}
              onToggle={() => toggleRoot(category.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function CategoryTreeNode({
  category,
  categories,
  isRoot = false,
  isExpanded = true,
  onToggle,
}: {
  category: CategoryNode;
  categories: CategoryNode[];
  isRoot?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const children = categories.filter((item) => item.parentId === category.id);
  const hasNestedContent = children.length > 0 || Boolean(category.collections?.length);

  return (
    <div className="admin_category_tree_node">
      <div className="admin_category_tree_label">
        {isRoot && hasNestedContent ? (
          <button
            aria-label={isExpanded ? `Свернуть ${category.name}` : `Раскрыть ${category.name}`}
            className="admin_category_tree_toggle"
            onClick={onToggle}
            type="button"
          >
            {isExpanded ? "−" : "+"}
          </button>
        ) : null}
        <span>{category.name}</span>
        <em>{getCategoryDepth(category, categories) + 1}-й уровень</em>
      </div>
      {isExpanded && category.collections?.length ? (
        <div className="admin_category_tree_collections">
          {category.collections.map((collection) => (
            <span key={collection.id}>Подборка: {collection.name}</span>
          ))}
        </div>
      ) : null}
      {isExpanded && children.length ? (
        <div className="admin_category_tree_children">
          {children.map((child) => (
            <CategoryTreeNode category={child} categories={categories} key={child.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
