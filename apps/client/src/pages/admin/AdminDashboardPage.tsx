import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCatalogStats } from "../../lib/admin-api";

export function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["admin", "catalog_stats"],
    queryFn: getCatalogStats,
  });

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Админ-панель</h1>
      </header>

      {statsQuery.isError ? <p className="admin_error">Не удалось загрузить сводку.</p> : null}

      <section className="admin_stats">
        <Link className="admin_card admin_stat" to="/admin/categories">
          Категории
          <span className="admin_stat_value">{statsQuery.data?.categoriesCount ?? "—"}</span>
        </Link>
        <Link className="admin_card admin_stat" to="/admin/products">
          Товары
          <span className="admin_stat_value">{statsQuery.data?.productsCount ?? "—"}</span>
        </Link>
        <Link className="admin_card admin_stat" to="/admin/brands">
          Бренды
          <span className="admin_stat_value">{statsQuery.data?.brandsCount ?? "—"}</span>
        </Link>
      </section>
    </>
  );
}
