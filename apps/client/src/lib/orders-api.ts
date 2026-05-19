import { apiGet, apiPatch } from "./api";
import type { Product } from "./products-api";

export type OrderStatus = "NEW" | "PROCESSING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export const orderStatusLabels: Record<OrderStatus, string> = {
  NEW: "Новый",
  PROCESSING: "В обработке",
  CONFIRMED: "Подтверждён",
  SHIPPED: "Передан в доставку",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
};

export const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "NEW", label: orderStatusLabels.NEW },
  { value: "PROCESSING", label: orderStatusLabels.PROCESSING },
  { value: "CONFIRMED", label: orderStatusLabels.CONFIRMED },
  { value: "SHIPPED", label: orderStatusLabels.SHIPPED },
  { value: "COMPLETED", label: orderStatusLabels.COMPLETED },
  { value: "CANCELLED", label: orderStatusLabels.CANCELLED },
];

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: string | number;
  product: Product;
};

export type OrderStatusHistoryItem = {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  adminComment: string | null;
  createdAt: string;
};

export type AdminOrderUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
};

export type AdminOrder = {
  id: string;
  orderNumber: string | null;
  userId: string;
  user: AdminOrderUser;
  status: OrderStatus;
  totalPrice: string | number;
  discountAmount: string | number;
  promoCodeCode: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  deliveryAddress: string;
  deliveryMethod: string;
  deliveryMethodName: string | null;
  deliveryPrice: string | number;
  pickupPointId: string | null;
  pickupPointName: string | null;
  pickupPointAddress: string | null;
  recipientName: string | null;
  pickupCity: string | null;
  pickupNumber: string | null;
  paymentMethod: string;
  paymentMethodName: string | null;
  comment: string | null;
  adminComment: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
  adminComment?: string;
};

export function getAdminOrders() {
  return apiGet<AdminOrder[]>("/admin/orders");
}

export function updateAdminOrderStatus(orderId: string, payload: UpdateOrderStatusPayload) {
  return apiPatch<AdminOrder, UpdateOrderStatusPayload>(`/admin/orders/${orderId}/status`, payload);
}
