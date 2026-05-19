import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getAdminOrders,
  orderStatusLabels,
  orderStatusOptions,
  updateAdminOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from "../../lib/orders-api";
import { useToastStore } from "../../lib/toast-store";
import { formatDate } from "./admin-utils";

type OrderTab = "active" | "completed" | "cancelled";

const activeStatuses: OrderStatus[] = ["NEW", "PROCESSING", "CONFIRMED", "SHIPPED"];

const orderTabs: Array<{ id: OrderTab; label: string }> = [
  { id: "active", label: "В процессе" },
  { id: "completed", label: "Выполненные" },
  { id: "cancelled", label: "Отменённые" },
];

const deliveryMethodLabels: Record<string, string> = {
  courier: "Доставка курьером",
  pickup: "Самовывоз из магазина",
  pickup_point: "Отделение Европочты",
};

const paymentMethodLabels: Record<string, string> = {
  cash_on_delivery: "Наличными или картой при получении",
  card_mock: "Банковской картой",
  online_mock: "Онлайн-оплата",
};

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const [activeTab, setActiveTab] = useState<OrderTab>("active");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: getAdminOrders,
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateAdminOrderStatus(orderId, { status }),
    onSuccess: async () => {
      showToast("Статус заказа обновлён");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
    },
    onError(error) {
      showToast(error instanceof Error ? error.message : "Не удалось обновить статус заказа", "error");
    },
  });

  const orders = ordersQuery.data ?? [];
  const deliveryOptions = useMemo(() => {
    const codes = Array.from(new Set(orders.map((order) => order.deliveryMethod))).sort((first, second) =>
      getDeliveryMethodLabel(first).localeCompare(getDeliveryMethodLabel(second), "ru"),
    );

    return codes.map((code) => ({ code, label: getDeliveryMethodLabel(code) }));
  }, [orders]);
  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesDelivery = deliveryFilter === "all" || order.deliveryMethod === deliveryFilter;

        if (!matchesDelivery) {
          return false;
        }

        if (activeTab === "completed") {
          return order.status === "COMPLETED";
        }

        if (activeTab === "cancelled") {
          return order.status === "CANCELLED";
        }

        return activeStatuses.includes(order.status) && (statusFilter === "all" || order.status === statusFilter);
      }),
    [activeTab, deliveryFilter, orders, statusFilter],
  );

  function changeTab(tab: OrderTab) {
    setActiveTab(tab);
    setExpandedOrderId(null);

    if (tab !== "active") {
      setStatusFilter("all");
      setDeliveryFilter("all");
    }
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Заказы</h1>
      </header>

      <section className="admin_panel admin_orders_controls">
        {activeTab === "active" ? (
          <div className="admin_orders_filters">
            <select
              className="admin_select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)}
            >
              <option value="all">Все статусы</option>
              {activeStatuses.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabels[status]}
                </option>
              ))}
            </select>

            <select
              className="admin_select"
              value={deliveryFilter}
              onChange={(event) => setDeliveryFilter(event.target.value)}
            >
              <option value="all">Все виды доставки</option>
              {deliveryOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="admin_order_tabs" role="tablist" aria-label="Разделы заказов">
          {orderTabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? "is-active" : ""}
              key={tab.id}
              onClick={() => changeTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {ordersQuery.isError ? <p className="admin_error">Не удалось загрузить заказы.</p> : null}

      <section className="admin_card admin_table_wrap">
        <table className="admin_table admin_orders_table">
          <thead>
            <tr>
              <th>Заказ</th>
              <th>Дата</th>
              <th>Покупатель</th>
              <th>Телефон</th>
              <th>Сумма</th>
              <th>Доставка</th>
              <th>Статус</th>
              <th>Детали</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <OrderRows
                expanded={expandedOrderId === order.id}
                key={order.id}
                onStatusChange={(status) => updateStatusMutation.mutate({ orderId: order.id, status })}
                onToggle={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                order={order}
                updating={updateStatusMutation.isPending}
              />
            ))}
          </tbody>
        </table>

        {ordersQuery.isLoading ? <p className="admin_empty">Загружаем заказы...</p> : null}
        {!ordersQuery.isLoading && !visibleOrders.length ? <p className="admin_empty">Заказы не найдены.</p> : null}
      </section>
    </>
  );
}

function OrderRows({
  order,
  expanded,
  updating,
  onToggle,
  onStatusChange,
}: {
  order: AdminOrder;
  expanded: boolean;
  updating: boolean;
  onToggle: () => void;
  onStatusChange: (status: OrderStatus) => void;
}) {
  return (
    <>
      <tr>
        <td>
          <strong>{order.orderNumber ?? order.id}</strong>
        </td>
        <td>{formatDateTime(order.createdAt)}</td>
        <td>{order.customerName}</td>
        <td>{order.customerPhone}</td>
        <td>{formatPrice(order.totalPrice)}</td>
        <td>{getDeliveryMethodLabel(order.deliveryMethod)}</td>
        <td>
          <select
            className="admin_select admin_order_status_select"
            disabled={updating || order.status === "CANCELLED"}
            value={order.status}
            onChange={(event) => onStatusChange(event.target.value as OrderStatus)}
          >
            {orderStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </td>
        <td>
          <button
            aria-label={expanded ? "Скрыть детали заказа" : "Показать детали заказа"}
            className="admin_icon_button"
            onClick={onToggle}
            title={expanded ? "Скрыть детали" : "Показать детали"}
            type="button"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="admin_order_details_row">
          <td colSpan={8}>
            <OrderDetails order={order} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function OrderDetails({ order }: { order: AdminOrder }) {
  const deliveryDetails = getDeliveryDetails(order);

  return (
    <div className="admin_order_details">
      <section>
        <h2>Покупатель</h2>
        <dl>
          <Detail label="Имя" value={order.customerName} />
          <Detail label="Телефон" value={order.customerPhone} />
          <Detail label="Email" value={order.customerEmail} />
          <Detail label="Аккаунт" value={order.user.email} />
        </dl>
      </section>

      <section>
        <h2>Доставка</h2>
        <dl>
          {deliveryDetails.map((item) => (
            <Detail key={item.label} label={item.label} value={item.value} />
          ))}
        </dl>
      </section>

      <section>
        <h2>Оплата и комментарии</h2>
        <dl>
          <Detail label="Оплата" value={getPaymentMethodLabel(order.paymentMethod)} />
          <Detail label="Промокод" value={order.promoCodeCode} />
          <Detail label="Скидка" value={formatPrice(order.discountAmount)} />
          <Detail label="Комментарий покупателя" value={order.comment} />
          <Detail label="Комментарий админа" value={order.adminComment} />
        </dl>
      </section>

      <section>
        <h2>Товары</h2>
        <div className="admin_order_items">
          {order.items.map((item) => (
            <div key={item.id}>
              <strong>{item.product.title}</strong>
              <span>{item.product.sku}</span>
              <span>
                {item.quantity} x {formatPrice(item.price)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>История статусов</h2>
        <div className="admin_order_history">
          {order.statusHistory.map((item) => (
            <div key={item.id}>
              <span>{formatDateTime(item.createdAt)}</span>
              <strong>
                {item.fromStatus ? `${orderStatusLabels[item.fromStatus]} -> ` : ""}
                {orderStatusLabels[item.toStatus]}
              </strong>
              {item.adminComment ? <em>{item.adminComment}</em> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function getDeliveryDetails(order: AdminOrder) {
  const baseDetails: Array<{ label: string; value: string | number | null | undefined }> = [
    { label: "Способ", value: getDeliveryMethodLabel(order.deliveryMethod) },
    { label: "Стоимость", value: formatPrice(order.deliveryPrice) },
  ];

  if (order.deliveryMethod === "pickup_point") {
    return [
      ...baseDetails,
      { label: "Получатель", value: order.recipientName },
      { label: "Город", value: order.pickupCity ?? order.city },
      { label: "Номер отделения", value: order.pickupNumber },
      { label: "Адрес отделения", value: getEuropostAddress(order) },
    ];
  }

  if (order.deliveryMethod === "pickup") {
    return [
      ...baseDetails,
      { label: "Пункт выдачи", value: order.pickupPointName },
      { label: "Город", value: order.city },
      { label: "Адрес пункта", value: order.pickupPointAddress ?? order.deliveryAddress },
    ];
  }

  return [
    ...baseDetails,
    { label: "Город", value: order.city },
    { label: "Адрес", value: order.deliveryAddress },
  ];
}

function getDeliveryMethodLabel(code: string) {
  return deliveryMethodLabels[code] ?? code;
}

function getPaymentMethodLabel(code: string) {
  return paymentMethodLabels[code] ?? code;
}

function getEuropostAddress(order: AdminOrder) {
  if (order.pickupNumber) {
    return `Отделение Европочты ${order.pickupNumber}`;
  }

  return order.deliveryAddress.replace(/^Europost pickup point #(.+)$/i, "Отделение Европочты $1");
}

function formatPrice(value: string | number) {
  return `${Number(value).toFixed(2)} BYN`;
}

function formatDateTime(value: string) {
  return `${formatDate(value)} ${new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
