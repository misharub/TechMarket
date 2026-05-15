import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bulkUpdateBrands, getBrands, type Brand, type BulkBrandAction } from "../../lib/brands-api";
import { formatDate } from "./admin-utils";

export function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const brandsQuery = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => getBrands({ includeInactive: true }),
  });
  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: BulkBrandAction }) => bulkUpdateBrands(ids, action),
    onSuccess: async () => {
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
    },
  });

  const brands = brandsQuery.data ?? [];
  const visibleBrands = useMemo(
    () =>
      brands.filter((brand) => {
        const matchesSearch = `${brand.name} ${brand.slug}`.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "all" || (status === "active" ? brand.isActive : !brand.isActive);

        return matchesSearch && matchesStatus;
      }),
    [brands, search, status],
  );

  function toggleBrand(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function runBulkAction(action: BulkBrandAction) {
    if (selectedIds.length) {
      bulkMutation.mutate({ ids: selectedIds, action });
    }
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Бренды</h1>
        <Link className="admin_button" to="/admin/brands/new">
          Добавить
        </Link>
      </header>

      <section className="admin_panel admin_toolbar">
        <input
          className="admin_input"
          placeholder="Поиск"
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

      <section className="admin_card admin_table_wrap">
        <table className="admin_table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={visibleBrands.length > 0 && selectedIds.length === visibleBrands.length}
                  onChange={(event) =>
                    setSelectedIds(event.target.checked ? visibleBrands.map((brand) => brand.id) : [])
                  }
                />
              </th>
              <th>Название</th>
              <th>Slug</th>
              <th>Статус</th>
              <th>Обновлено</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {visibleBrands.map((brand) => (
              <BrandRow
                key={brand.id}
                brand={brand}
                selected={selectedIds.includes(brand.id)}
                onToggle={() => toggleBrand(brand.id)}
              />
            ))}
          </tbody>
        </table>
        {!visibleBrands.length && !brandsQuery.isLoading ? <p className="admin_empty">Бренды не найдены.</p> : null}
      </section>
    </>
  );
}

function BrandRow({ brand, selected, onToggle }: { brand: Brand; selected: boolean; onToggle: () => void }) {
  return (
    <tr>
      <td>
        <input type="checkbox" checked={selected} onChange={onToggle} />
      </td>
      <td>{brand.name}</td>
      <td>{brand.slug}</td>
      <td>
        <span className={`admin_badge ${brand.isActive ? "admin_badge_active" : "admin_badge_inactive"}`}>
          {brand.isActive ? "Активен" : "Скрыт"}
        </span>
      </td>
      <td>{formatDate(brand.updatedAt)}</td>
      <td>
        <Link className="admin_button_muted" to={`/admin/brands/${brand.id}/edit`}>
          Редактировать
        </Link>
      </td>
    </tr>
  );
}
