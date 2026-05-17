import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  bulkUpdateCategories,
  deleteCategory,
  getCategories,
  updateCategory,
  type BulkCatalogAction,
  type CategoryNode,
} from "../../lib/categories-api";
import { formatDate, getCategoryDepth } from "./admin-utils";

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => getCategories(true),
  });
  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: BulkCatalogAction }) =>
      bulkUpdateCategories(ids, action),
    onSuccess: async () => {
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
    },
  });
  const toggleMutation = useMutation({
    mutationFn: (category: CategoryNode) => updateCategory(category.id, { isActive: !category.isActive }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
    },
  });

  const categories = categoriesQuery.data ?? [];
  const visibleGroups = useMemo(() => {
    const parents = categories.filter((category) => getCategoryDepth(category, categories) < 2);

    return parents
      .map((parent) => ({
        parent,
        level: getCategoryDepth(parent, categories) + 1,
        children: categories.filter(
          (category) => category.parentId === parent.id && matchesFilters(category, search, status),
        ),
        collections: (parent.collections ?? []).filter((collection) =>
          matchesCollectionFilters(collection.name, search, status, collection.isActive),
        ),
      }))
      .filter(
        (group) =>
          group.children.length > 0 ||
          group.collections.length > 0 ||
          matchesFilters(group.parent, search, status),
      );
  }, [categories, search, status]);
  const firstLevelGroups = visibleGroups.filter((group) => group.level === 1);
  const secondLevelGroups = visibleGroups.filter((group) => group.level === 2);
  const selectableCategories = visibleGroups.flatMap((group) => group.children);

  function toggleCategory(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function runBulkAction(action: BulkCatalogAction) {
    if (selectedIds.length) {
      bulkMutation.mutate({ ids: selectedIds, action });
    }
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Категории</h1>
        <Link className="admin_button" to="/admin/categories/new">
          Добавить категорию
        </Link>
      </header>

      <section className="admin_panel admin_toolbar">
        <input
          className="admin_input"
          placeholder="Поиск по названию"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="admin_select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="inactive">Скрытые</option>
        </select>
        <button className="admin_button_muted" type="button" onClick={() => runBulkAction("activate")}>
          Активировать
        </button>
        <button className="admin_button_muted" type="button" onClick={() => runBulkAction("deactivate")}>
          Скрыть
        </button>
        <button className="admin_button_danger" type="button" onClick={() => runBulkAction("delete")}>
          Удалить
        </button>
      </section>

      <section className="admin_panel admin_toolbar">
        <label className="admin_checkbox">
          <input
            type="checkbox"
            checked={selectableCategories.length > 0 && selectedIds.length === selectableCategories.length}
            onChange={(event) =>
              setSelectedIds(event.target.checked ? selectableCategories.map((category) => category.id) : [])
            }
          />
          Выбрать видимые разделы
        </label>
      </section>

      {firstLevelGroups.length ? <h2 className="admin_section_title">Категории 1-го уровня</h2> : null}
      {firstLevelGroups.map((group) => (
        <CategoryGroup
          key={group.parent.id}
          parent={group.parent}
          level={group.level}
          categories={group.children}
          collections={group.collections}
          selectedIds={selectedIds}
          onToggle={toggleCategory}
          onToggleStatus={(category) => toggleMutation.mutate(category)}
          onDelete={(categoryId) => deleteMutation.mutate(categoryId)}
        />
      ))}

      {secondLevelGroups.length ? <h2 className="admin_section_title">Категории 2-го уровня</h2> : null}
      {secondLevelGroups.map((group) => (
        <CategoryGroup
          key={group.parent.id}
          parent={group.parent}
          level={group.level}
          categories={group.children}
          collections={group.collections}
          selectedIds={selectedIds}
          onToggle={toggleCategory}
          onToggleStatus={(category) => toggleMutation.mutate(category)}
          onDelete={(categoryId) => deleteMutation.mutate(categoryId)}
        />
      ))}

      {!visibleGroups.length && !categoriesQuery.isLoading ? (
        <section className="admin_card">
          <p className="admin_empty">Категории не найдены.</p>
        </section>
      ) : null}
    </>
  );
}

function matchesFilters(category: CategoryNode, search: string, status: string) {
  const matchesSearch = category.name.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = status === "all" || (status === "active" ? category.isActive : !category.isActive);

  return matchesSearch && matchesStatus;
}

function matchesCollectionFilters(name: string, search: string, status: string, isActive: boolean) {
  const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = status === "all" || (status === "active" ? isActive : !isActive);

  return matchesSearch && matchesStatus;
}

function CategoryGroup({
  parent,
  level,
  categories,
  collections,
  selectedIds,
  onToggle,
  onToggleStatus,
  onDelete,
}: {
  parent: CategoryNode;
  level: number;
  categories: CategoryNode[];
  collections: CategoryNode["collections"];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleStatus: (category: CategoryNode) => void;
  onDelete: (categoryId: string) => void;
}) {
  return (
    <section className="admin_card admin_table_wrap">
      <div className="admin_panel_title">
        <span>
          {parent.name} <em className="admin_panel_meta">категория {level}-го уровня</em>
        </span>
        <div className="admin_inline_actions">
          <Link className="admin_button" to={`/admin/categories/new?parentId=${parent.id}`}>
            <Plus size={16} />
            Добавить раздел
          </Link>
          {level === 2 ? (
            <Link className="admin_button" to={`/admin/categories/${parent.id}/collections`}>
              <Plus size={16} />
              Добавить подборку
            </Link>
          ) : null}
          <Link className="admin_button_muted" to={`/admin/categories/${parent.id}/edit`}>
            Редактировать категорию
          </Link>
        </div>
      </div>
      <table className="admin_table admin_categories_table">
        <thead>
          <tr>
            <th />
            <th>Название</th>
            <th>Тип</th>
            <th>Порядок</th>
            <th>Статус</th>
            <th>Обновлено</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(category.id)}
                  onChange={() => onToggle(category.id)}
                />
              </td>
              <td>{category.name}</td>
              <td><span className="admin_badge">Категория</span></td>
              <td>{category.sortOrder}</td>
              <td>
                <span className={`admin_badge ${category.isActive ? "admin_badge_active" : "admin_badge_inactive"}`}>
                  {category.isActive ? "Активна" : "Скрыта"}
                </span>
              </td>
              <td>{formatDate(category.updatedAt)}</td>
              <td>
                <div className="admin_icon_actions">
                  <Link
                    aria-label="Редактировать раздел"
                    className="admin_icon_button"
                    title="Редактировать раздел"
                    to={`/admin/categories/${category.id}/edit`}
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    aria-label={category.isActive ? "Скрыть раздел" : "Активировать раздел"}
                    className="admin_icon_button"
                    title={category.isActive ? "Скрыть раздел" : "Активировать раздел"}
                    type="button"
                    onClick={() => onToggleStatus(category)}
                  >
                    {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    aria-label="Удалить раздел"
                    className="admin_icon_button admin_icon_button_danger"
                    title="Удалить раздел"
                    type="button"
                    onClick={() => onDelete(category.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {level === 2 ? collections.map((collection) => (
            <tr key={collection.id}>
              <td />
              <td>{collection.name}</td>
              <td><span className="admin_badge admin_badge_collection">Подборка</span></td>
              <td>{collection.sortOrder}</td>
              <td>
                <span className={`admin_badge ${collection.isActive ? "admin_badge_active" : "admin_badge_inactive"}`}>
                  {collection.isActive ? "Активна" : "Скрыта"}
                </span>
              </td>
              <td>{formatDate(collection.updatedAt)}</td>
              <td>
                <Link className="admin_button_muted" to={`/admin/categories/${parent.id}/collections`}>
                  Управлять подборками
                </Link>
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </section>
  );
}
