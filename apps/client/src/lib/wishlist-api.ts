import { apiDelete, apiGet, apiPost } from "./api";
import type { Product } from "./products-api";

export type WishlistItem = {
  id: string;
  productId: string;
  userId: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
};

export type WishlistResponse = {
  items: WishlistItem[];
};

export function getWishlist() {
  return apiGet<WishlistResponse>("/wishlist");
}

export function addWishlistItem(productId: string) {
  return apiPost<WishlistItem, { productId: string }>("/wishlist", { productId });
}

export function removeWishlistItem(productId: string) {
  return apiDelete<{ deleted: number }>(`/wishlist/${productId}`);
}
