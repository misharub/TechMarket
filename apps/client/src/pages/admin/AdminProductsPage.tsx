import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBrands } from "../../lib/brands-api";
import { getCategories } from "../../lib/categories-api";
import {
  bulkUpdateProducts,
  getProducts,
  resolveUploadUrl,
  type BulkProductAction,
  type Product,
} from "../../lib/products-api";
import { formatDate, getChildCategories, getRootCategories } from "./admin-utils";

const productLimit = 20;

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("all");
  const [inStock, setInStock] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => getCategories(true),
  });
  const brandsQuery = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => getBrands({ includeInactive: true }),
  });
  const categories = categoriesQuery.data ?? [];
  const parentCategories = useMemo(() => getRootCategories(categories), [categories]);
  const childCategories = useMemo(
    () => (parentCategoryId ? getChildCategories(categories, parentCategoryId) : []),
    [categories, parentCategoryId],
  );
  const selectedParentCategory = parentCategories.find((category) => category.id === parentCategoryId);
  const productsQuery = useQuery({
    queryKey: ["admin", "products", search, categoryId, brandId, status, inStock, page],
    queryFn: () =>
      getProducts({
        search: search || undefined,
        categoryId: categoryId || undefined,
        categorySlug: !categoryId ? selectedParentCategory?.slug : undefined,
        brandId: brandId || undefined,
        includeInactive: true,
        isActive: status === "all" ? undefined : status === "active",
        inStock: inStock === "all" ? undefined : inStock === "yes",
        page,
        limit: productLimit,
      }),
  });
  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: BulkProductAction }) => bulkUpdateProducts(ids, action),
    onSuccess: async () => {
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
    },
  });

  const products = useMemo(() => productsQuery.data?.items ?? [], [productsQuery.data?.items]);

  function toggleProduct(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function runBulkAction(action: BulkProductAction) {
    if (selectedIds.length) {
      bulkMutation.mutate({ ids: selectedIds, action });
    }
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Товары</h1>
        <Link className="admin_button" to="/admin/products/new">
          Добавить
        </Link>
      </header>

      <section className="admin_panel admin_toolbar">
        <input
          className="admin_input"
          placeholder="Название, SKU"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          className="admin_select"
          value={parentCategoryId}
          onChange={(event) => {
            setParentCategoryId(event.target.value);
            setCategoryId("");
            setPage(1);
          }}
        >
          <option value="">Все родители</option>
          {parentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="admin_select"
          value={categoryId}
          disabled={!parentCategoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Все подкатегории</option>
          {childCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="admin_select"
          value={brandId}
          onChange={(event) => {
            setBrandId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Все бренды</option>
          {(brandsQuery.data ?? []).map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select className="admin_select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="inactive">Скрытые</option>
        </select>
        <select className="admin_select" value={inStock} onChange={(event) => setInStock(event.target.value)}>
          <option value="all">Любой остаток</option>
          <option value="yes">В наличии</option>
          <option value="no">Нет в наличии</option>
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

      <section className="admin_card admin_table_wrap">
        <table className="admin_table admin_products_table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onChange={(event) => setSelectedIds(event.target.checked ? products.map((product) => product.id) : [])}
                />
              </th>
              <th>Изображение</th>
              <th>Название</th>
              <th>SKU</th>
              <th>Категория</th>
              <th>Бренд</th>
              <th>Цена</th>
              <th>Остаток</th>
              <th>Статус</th>
              <th>Обновлено</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selected={selectedIds.includes(product.id)}
                onToggle={() => toggleProduct(product.id)}
              />
            ))}
          </tbody>
        </table>
        {!products.length && !productsQuery.isLoading ? <p className="admin_empty">Товары не найдены.</p> : null}
      </section>

      <div className="admin_pagination admin_pagination_compact">
        <button className="admin_page_button" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>{"<"}</button>
        {buildPageItems(productsQuery.data?.page ?? page, productsQuery.data?.pages ?? 1).map((item, index) =>
          item === "ellipsis" ? (
            <span className="admin_page_ellipsis" key={`ellipsis-${index}`}>...</span>
          ) : (
            <button className={`admin_page_button ${item === (productsQuery.data?.page ?? page) ? "active" : ""}`} key={item} type="button" onClick={() => setPage(item)}>{item}</button>
          ),
        )}
        <button className="admin_page_button" type="button" disabled={page >= (productsQuery.data?.pages ?? 1)} onClick={() => setPage((current) => current + 1)}>{">"}</button>
      </div>
    </>
  );
}

function buildPageItems(currentPage: number, pages: number): Array<number | "ellipsis"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", pages];
  if (currentPage >= pages - 3) return [1, "ellipsis", pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pages];
}

function ProductRow({ product, selected, onToggle }: { product: Product; selected: boolean; onToggle: () => void }) {
  const image = resolveUploadUrl(product.images[0]);

  return (
    <tr>
      <td>
        <input type="checkbox" checked={selected} onChange={onToggle} />
      </td>
      <td>{image ? <img src={image} alt="" /> : "—"}</td>
      <td>{product.title}</td>
      <td>{product.sku}</td>
      <td>{product.category.name}</td>
      <td>{product.brand.name}</td>
      <td>{product.price}</td>
      <td>{product.stock}</td>
      <td>
        <span className={`admin_badge ${product.isActive ? "admin_badge_active" : "admin_badge_inactive"}`}>
          {product.isActive ? "Активен" : "Скрыт"}
        </span>
      </td>
      <td>{formatDate(product.updatedAt)}</td>
      <td>
        <Link
          aria-label="????????????? ?????"
          className="admin_icon_button"
          title="????????????? ?????"
          to={`/admin/products/${product.id}/edit`}
        >
          <Pencil size={16} />
        </Link>
      </td>
    </tr>
  );
}
