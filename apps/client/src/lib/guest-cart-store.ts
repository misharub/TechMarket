import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products-api";

export type GuestCartItem = {
  productId: string;
  quantity: number;
  isSelected: boolean;
  product: Product;
};

type GuestCartState = {
  items: GuestCartItem[];
  addProduct: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleItem: (productId: string, isSelected: boolean) => void;
  toggleAll: (isSelected: boolean) => void;
  removeItem: (productId: string) => void;
  removeSelected: () => void;
  clear: () => void;
};

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set) => ({
      items: [],
      addProduct(product, quantity = 1) {
        set((state) => {
          const current = state.items.find((item) => item.productId === product.id);
          const nextQuantity = Math.min(product.stock, (current?.quantity ?? 0) + quantity);

          if (current) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id ? { ...item, quantity: nextQuantity, isSelected: true, product } : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                quantity: Math.min(product.stock, quantity),
                isSelected: true,
                product,
              },
            ],
          };
        });
      },
      updateQuantity(productId, quantity) {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.min(item.product.stock, quantity) } : item,
          ),
        }));
      },
      toggleItem(productId, isSelected) {
        set((state) => ({
          items: state.items.map((item) => (item.productId === productId ? { ...item, isSelected } : item)),
        }));
      },
      toggleAll(isSelected) {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, isSelected })),
        }));
      },
      removeItem(productId) {
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) }));
      },
      removeSelected() {
        set((state) => ({ items: state.items.filter((item) => !item.isSelected) }));
      },
      clear() {
        set({ items: [] });
      },
    }),
    {
      name: "techmarket-guest-cart",
    },
  ),
);

export function summarizeGuestCart(items: GuestCartItem[]) {
  const selectedItems = items.filter((item) => item.isSelected);

  return {
    items,
    totalPrice: Number(
      selectedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0).toFixed(2),
    ),
    itemsCount: items.length,
    selectedItemsCount: selectedItems.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    selectedQuantity: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

