import { apiGet, apiPost } from "./api";

export type DeliveryScenario = "COURIER" | "STORE_PICKUP" | "PICKUP_POINT";
export type PickupPointType = "STORE" | "PICKUP_POINT";

export type DeliveryMethod = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scenario: DeliveryScenario;
  price: string | number;
  minOrderTotal: string | number | null;
  isActive: boolean;
  sortOrder: number;
};

export type PaymentMethod = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type PickupPoint = {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  type: PickupPointType;
};

export type PromoValidation = {
  code: string | null;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
};

export type CheckoutPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryMethod: string;
  paymentMethod: string;
  addressId?: string;
  city?: string;
  deliveryAddress?: string;
  pickupPointId?: string;
  promoCode?: string;
  comment?: string;
};

export function getDeliveryMethods() {
  return apiGet<DeliveryMethod[]>("/delivery-methods");
}

export function getPaymentMethods() {
  return apiGet<PaymentMethod[]>("/payment-methods");
}

export function getPickupPoints(scenario?: DeliveryScenario) {
  return apiGet<PickupPoint[]>(`/pickup-points${scenario ? `?scenario=${scenario}` : ""}`);
}

export function validatePromoCode(code: string) {
  return apiPost<PromoValidation, { code: string }>("/promo-codes/validate", { code });
}

export function createOrder(payload: CheckoutPayload) {
  return apiPost<{ id: string; orderNumber: string | null }, CheckoutPayload>("/orders", payload);
}

