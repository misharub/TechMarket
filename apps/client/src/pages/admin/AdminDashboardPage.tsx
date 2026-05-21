import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, CircleDollarSign, ClipboardList, PackageCheck, ShoppingBag, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminDashboardStats, type AdminOrderStatus } from "../../lib/admin-api";

const currencyFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const orderStatusLabels: Record<AdminOrderStatus, string> = {
  NEW: "Новые",
  PROCESSING: "В обработке",
  CONFIRMED: "Подтверждены",
  SHIPPED: "Отправлены",
  COMPLETED: "Завершены",
  CANCELLED: "Отменены",
};

const orderStatusOrder: AdminOrderStatus[] = ["NEW", "PROCESSING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];

function formatMoney(value: number | string | null | undefined) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function DashboardSkeleton() {
  return (
    <div className="admin_dashboard_skeleton" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["admin", "catalog_stats"],
    queryFn: getAdminDashboardStats,
  });
  const stats = statsQuery.data;

  return (
    <>
      <header className="admin_header admin_dashboard_header">
        <div>
          <p className="admin_eyebrow">Сводка магазина</p>
          <h1 className="admin_title">Админ-панель</h1>
        </div>
        <Link className="admin_button_muted" to="/admin/products">
          Управление товарами
        </Link>
      </header>

      {statsQuery.isLoading ? <DashboardSkeleton /> : null}
      {statsQuery.isError ? <p className="admin_error">Не удалось загрузить расширенную статистику.</p> : null}

      {stats ? (
        <>
          <section className="admin_stats admin_stats_dashboard">
            <Link className="admin_card admin_stat admin_stat_primary" to="/admin/products">
              <span>
                <ShoppingBag />
                Товары
              </span>
              <strong className="admin_stat_value">{stats.products.total}</strong>
              <small>{stats.products.active} активных, {stats.products.inactive} скрытых</small>
            </Link>

            <Link className="admin_card admin_stat" to="/admin/orders">
              <span>
                <ClipboardList />
                Заказы
              </span>
              <strong className="admin_stat_value">{stats.orders.total}</strong>
              <small>{stats.orders.new} новых требуют внимания</small>
            </Link>

            <div className="admin_card admin_stat">
              <span>
                <CircleDollarSign />
                Выручка
              </span>
              <strong className="admin_stat_value">{formatMoney(stats.sales.totalRevenue)}</strong>
              <small>без отмененных заказов</small>
            </div>

            <Link className="admin_card admin_stat" to="/admin/users">
              <span>
                <UsersRound />
                Пользователи
              </span>
              <strong className="admin_stat_value">{stats.users.total}</strong>
              <small>{stats.users.blocked} заблокированных</small>
            </Link>

            <Link className="admin_card admin_stat" to="/admin/categories">
              <span>
                <Boxes />
                Категории
              </span>
              <strong className="admin_stat_value">{stats.catalog.categories}</strong>
              <small>{stats.catalog.brands} активных брендов</small>
            </Link>

            <Link className="admin_card admin_stat" to="/admin/products">
              <span>
                <AlertTriangle />
                Низкий остаток
              </span>
              <strong className="admin_stat_value">{stats.products.lowStock}</strong>
              <small>товаров с остатком до 5 шт.</small>
            </Link>
          </section>

          <section className="admin_dashboard_grid">
            <article className="admin_panel admin_dashboard_panel admin_dashboard_panel_wide">
              <div className="admin_panel_title">
                <span>Статусы заказов</span>
                <Link to="/admin/orders">Все заказы</Link>
              </div>
              <div className="admin_status_rows">
                {orderStatusOrder.map((status) => {
                  const count = stats.orders.byStatus[status] ?? 0;
                  const max = Math.max(stats.orders.total, 1);

                  return (
                    <div className="admin_status_row" key={status}>
                      <span>{orderStatusLabels[status]}</span>
                      <div>
                        <i style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="admin_panel admin_dashboard_panel">
              <div className="admin_panel_title">
                <span>Топ товаров</span>
                <PackageCheck />
              </div>
              <div className="admin_ranked_list">
                {stats.sales.topProducts.length ? (
                  stats.sales.topProducts.map((item, index) => (
                    <div className="admin_ranked_item" key={item.product.id}>
                      <b>{index + 1}</b>
                      <div>
                        <strong>{item.product.title}</strong>
                        <span>{item.totalQuantity} шт. · {formatMoney(item.totalRevenue)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="admin_muted">Продаж пока нет.</p>
                )}
              </div>
            </article>
          </section>

          <section className="admin_dashboard_grid">
            <article className="admin_panel admin_dashboard_panel admin_dashboard_panel_wide">
              <div className="admin_panel_title">
                <span>Последние заказы</span>
                <Link to="/admin/orders">Открыть раздел</Link>
              </div>
              <div className="admin_table_wrap">
                <table className="admin_table admin_dashboard_table">
                  <thead>
                    <tr>
                      <th>Заказ</th>
                      <th>Клиент</th>
                      <th>Статус</th>
                      <th>Сумма</th>
                      <th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.orders.latest.length ? (
                      stats.orders.latest.map((order) => (
                        <tr key={order.id}>
                          <td>{order.orderNumber ?? order.id.slice(0, 8)}</td>
                          <td>{order.customerName}</td>
                          <td>
                            <span className={`admin_badge admin_order_status admin_order_status_${order.status.toLowerCase()}`}>
                              {orderStatusLabels[order.status]}
                            </span>
                          </td>
                          <td>{formatMoney(order.totalPrice)}</td>
                          <td>{formatDate(order.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>Заказов пока нет.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="admin_panel admin_dashboard_panel">
              <div className="admin_panel_title">
                <span>Остатки до 5 шт.</span>
                <Link to="/admin/products">Товары</Link>
              </div>
              <div className="admin_stock_list">
                {stats.products.lowStockItems.length ? (
                  stats.products.lowStockItems.map((product) => (
                    <Link className="admin_stock_item" to={`/admin/products/${product.id}/edit`} key={product.id}>
                      <span>{product.title}</span>
                      <strong>{product.stock} шт.</strong>
                    </Link>
                  ))
                ) : (
                  <p className="admin_muted">Критичных остатков нет.</p>
                )}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </>
  );
}
