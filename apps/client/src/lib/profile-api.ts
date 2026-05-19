import { apiGet, apiPatch, apiPost } from "./api";
import type { AuthUser } from "./auth-api";
import type { OrderStatus } from "./orders-api";
import type { Product } from "./products-api";

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type Address = {
  id: string;
  label: string | null;
  city: string;
  street: string;
  house: string;
  apartment: string | null;
  zipCode: string | null;
  isDefault: boolean;
};

export type CreateAddressPayload = {
  label?: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  zipCode?: string;
  isDefault?: boolean;
};

export type Order = {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  totalPrice: string | number;
  deliveryMethod: string;
  deliveryMethodName: string | null;
  deliveryPrice: string | number;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: string | number;
    product: Product;
  }>;
  createdAt: string;
};

export function getProfile() {
  return apiGet<AuthUser>("/users/me");
}

export function updateProfile(payload: UpdateProfilePayload) {
  return apiPatch<AuthUser, UpdateProfilePayload>("/users/me", payload);
}

export function getAddresses() {
  return apiGet<Address[]>("/addresses");
}

export function createAddress(payload: CreateAddressPayload) {
  return apiPost<Address, CreateAddressPayload>("/addresses", payload);
}

export function getOrders() {
  return apiGet<Order[]>("/orders");
}
