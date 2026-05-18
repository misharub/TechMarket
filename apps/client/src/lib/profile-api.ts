import { apiGet, apiPatch, apiPost } from "./api";
import type { AuthUser } from "./auth-api";

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
  status: string;
  totalPrice: string | number;
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
