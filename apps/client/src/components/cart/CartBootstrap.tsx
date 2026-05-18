import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { mergeGuestCart } from "../../lib/cart-api";
import { useAuthStore } from "../../lib/auth-store";
import { useGuestCartStore } from "../../lib/guest-cart-store";

export function CartBootstrap() {
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const items = useGuestCartStore((state) => state.items);
  const clear = useGuestCartStore((state) => state.clear);
  const queryClient = useQueryClient();
  const mergedForUserId = useRef<string | null>(null);
  const mergeMutation = useMutation({
    mutationFn: mergeGuestCart,
  });

  useEffect(() => {
    if (!isBootstrapped || !user || !items.length || mergedForUserId.current === user.id || mergeMutation.isPending) {
      return;
    }

    mergedForUserId.current = user.id;
    void mergeMutation
      .mutateAsync(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          isSelected: item.isSelected,
        })),
      )
      .then(async () => {
        clear();
        await queryClient.invalidateQueries({ queryKey: ["cart"] });
      })
      .catch(() => {
        mergedForUserId.current = null;
      });
  }, [clear, isBootstrapped, items, mergeMutation, queryClient, user]);

  useEffect(() => {
    if (!user) {
      mergedForUserId.current = null;
    }
  }, [user]);

  return null;
}
