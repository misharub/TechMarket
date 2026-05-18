import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Product } from "./products-api";

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  isSelected: boolean;
  product: Product;
};

export type CartResponse = {
  items: CartItem[];
  totalPrice: number;
  itemsCount: number;
  selectedItemsCount: number;
  totalQuantity: number;
  selectedQuantity: number;
};

export type GuestCartMergeItem = {
  productId: string;
  quantity: number;
  isSelected: boolean;
};

export function getCart() {
  return apiGet<CartResponse>("/cart");
}

export function addCartItem(productId: string, quantity = 1) {
  return apiPost<CartItem, { productId: string; quantity: number }>("/cart", { productId, quantity });
}

export function mergeGuestCart(items: GuestCartMergeItem[]) {
  return apiPost<CartResponse, { items: GuestCartMergeItem[] }>("/cart/merge", { items });
}

export function updateCartItem(id: string, payload: { quantity: number; isSelected?: boolean }) {
  return apiPatch<CartItem, { quantity: number; isSelected?: boolean }>(`/cart/${id}`, payload);
}

export function updateCartSelection(payload: { isSelected: boolean; itemIds?: string[] }) {
  return apiPatch<{ updated: number }, { isSelected: boolean; itemIds?: string[] }>("/cart/selection", payload);
}

export function removeCartItem(id: string) {
  return apiDelete<CartItem>(`/cart/${id}`);
}

export function removeSelectedCartItems() {
  return apiDelete<{ deleted: number }>("/cart/selected");
}

