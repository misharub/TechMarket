import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem, getCart } from "./cart-api";
import { useAuthStore } from "./auth-store";
import { summarizeGuestCart, useGuestCartStore } from "./guest-cart-store";
import type { Product } from "./products-api";

export function useCartSummary() {
  const user = useAuthStore((state) => state.user);
  const guestItems = useGuestCartStore((state) => state.items);
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: Boolean(user),
  });

  return user ? cartQuery.data : summarizeGuestCart(guestItems);
}

export function useAddToCart() {
  const user = useAuthStore((state) => state.user);
  const addGuestProduct = useGuestCartStore((state) => state.addProduct);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (productId: string) => addCartItem(productId, 1),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    isPending: mutation.isPending,
    async addProduct(product: Product) {
      if (!user) {
        addGuestProduct(product, 1);
        return;
      }

      await mutation.mutateAsync(product.id);
    },
  };
}

