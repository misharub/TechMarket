import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  removeCartItem,
  removeSelectedCartItems,
  updateCartItem,
  updateCartSelection,
  type CartItem,
} from "../../lib/cart-api";
import { useAuthStore } from "../../lib/auth-store";
import { summarizeGuestCart, useGuestCartStore, type GuestCartItem } from "../../lib/guest-cart-store";
import { formatPrice } from "../../components/product/ProductCard";
import { resolveUploadUrl } from "../../lib/products-api";
import "./CartPage.css";

type ViewCartItem = CartItem | GuestCartItem;

export function CartPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const guestItems = useGuestCartStore((state) => state.items);
  const guestSummary = summarizeGuestCart(guestItems);
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: Boolean(user),
  });
  const summary = user ? cartQuery.data : guestSummary;
  const items = summary?.items ?? [];
  const allSelected = Boolean(items.length && items.every((item) => item.isSelected));
  const queryClient = useQueryClient();
  const selectionMutation = useMutation({
    mutationFn: updateCartSelection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
  const removeSelectedMutation = useMutation({
    mutationFn: removeSelectedCartItems,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  function handleToggleAll(isSelected: boolean) {
    if (!user) {
      useGuestCartStore.getState().toggleAll(isSelected);
      return;
    }

    void selectionMutation.mutateAsync({ isSelected });
  }

  function handleRemoveSelected() {
    if (!user) {
      useGuestCartStore.getState().removeSelected();
      return;
    }

    void removeSelectedMutation.mutateAsync();
  }

  if (user && cartQuery.isLoading) {
    return <CartState>Загружаем корзину...</CartState>;
  }

  if (!items.length) {
    return (
      <CartState>
        <ShoppingBasket />
        <strong>Корзина пока пуста</strong>
        <span>Добавьте товары из каталога — они появятся здесь.</span>
        <button type="button" onClick={() => navigate("/catalog")}>
          Перейти в каталог
        </button>
      </CartState>
    );
  }

  return (
    <main className="cart_page">
      <div className="cart_page_inner">
        <section className="cart_panel">
          <header className="cart_header">
            <div>
              <h1>Корзина</h1>
              <span>{summary?.totalQuantity ?? 0} шт.</span>
            </div>
            <div className="cart_bulk_actions">
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => handleToggleAll(event.target.checked)}
                />
                <span>Выбрать всё</span>
              </label>
              <button type="button" onClick={handleRemoveSelected} disabled={!summary?.selectedItemsCount}>
                Удалить выбранные
              </button>
            </div>
          </header>

          <div className="cart_items">
            {items.map((item) => (
              <CartRow item={item} isAuthenticated={Boolean(user)} key={"id" in item ? String(item.id) : item.productId} />
            ))}
          </div>
        </section>

        <aside className="cart_summary">
          <span>Итого</span>
          <strong>{summary?.selectedItemsCount ?? 0} товаров</strong>
          <b>{formatPrice(summary?.totalPrice ?? 0)}</b>
          <button
            type="button"
            disabled={!summary?.selectedItemsCount}
            onClick={() => {
              if (!user) {
                navigate("/login", { state: { from: "/checkout" } });
                return;
              }

              navigate("/checkout");
            }}
          >
            Перейти к оформлению
          </button>
          {!user ? <small>Для оформления понадобится войти в аккаунт.</small> : null}
        </aside>
      </div>
    </main>
  );
}

function CartRow({ item, isAuthenticated }: { item: ViewCartItem; isAuthenticated: boolean }) {
  const queryClient = useQueryClient();
  const updateGuestQuantity = useGuestCartStore((state) => state.updateQuantity);
  const toggleGuestItem = useGuestCartStore((state) => state.toggleItem);
  const removeGuestItem = useGuestCartStore((state) => state.removeItem);
  const updateMutation = useMutation({
    mutationFn: ({ id, quantity, isSelected }: { id: string; quantity: number; isSelected?: boolean }) =>
      updateCartItem(id, { quantity, isSelected }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
  const image = resolveUploadUrl(item.product.images[0]);
  const id = "id" in item ? item.id : item.productId;

  function changeQuantity(nextQuantity: number) {
    if (nextQuantity < 1) {
      return;
    }

    if (!isAuthenticated) {
      updateGuestQuantity(item.productId, nextQuantity);
      return;
    }

    void updateMutation.mutateAsync({ id, quantity: nextQuantity });
  }

  function changeSelection(isSelected: boolean) {
    if (!isAuthenticated) {
      toggleGuestItem(item.productId, isSelected);
      return;
    }

    void updateMutation.mutateAsync({ id, quantity: item.quantity, isSelected });
  }

  function remove() {
    if (!isAuthenticated) {
      removeGuestItem(item.productId);
      return;
    }

    void removeMutation.mutateAsync(id);
  }

  return (
    <article className="cart_row">
      <input
        type="checkbox"
        checked={item.isSelected}
        onChange={(event) => changeSelection(event.target.checked)}
        aria-label={`Выбрать ${item.product.title}`}
      />
      <div className="cart_row_media">
        {image ? <img src={image} alt={item.product.title} /> : <span>{item.product.brand.name.slice(0, 2)}</span>}
      </div>
      <div className="cart_row_body">
        <strong>{item.product.title}</strong>
        <span>{item.product.stock > 0 ? "В наличии" : "Нет в наличии"}</span>
        <div className="cart_row_controls">
          <button type="button" onClick={() => changeQuantity(item.quantity - 1)} disabled={item.quantity <= 1}>
            <Minus />
          </button>
          <b>{item.quantity}</b>
          <button
            type="button"
            onClick={() => changeQuantity(item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
          >
            <Plus />
          </button>
          <small>{formatPrice(item.product.price)} / шт.</small>
        </div>
      </div>
      <div className="cart_row_side">
        <strong>{formatPrice(Number(item.product.price) * item.quantity)}</strong>
        <button type="button" onClick={remove} aria-label={`Удалить ${item.product.title}`}>
          <Trash2 />
        </button>
      </div>
    </article>
  );
}

function CartState({ children }: { children: ReactNode }) {
  return (
    <main className="cart_state">
      <div>{children}</div>
    </main>
  );
}
