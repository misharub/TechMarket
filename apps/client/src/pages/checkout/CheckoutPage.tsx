
function extractBelarusPhoneDigits(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.startsWith("375") ? digits.slice(3, 12) : digits.slice(0, 9);
}

function formatBelarusPhone(digits: string) {
  const normalized = digits.slice(0, 9);
  const parts = [
    normalized.slice(0, 2),
    normalized.slice(2, 5),
    normalized.slice(5, 7),
    normalized.slice(7, 9),
  ];

  if (!normalized) return "";
  if (normalized.length <= 2) return `(${parts[0]}`;
  if (normalized.length <= 5) return `(${parts[0]}) ${parts[1]}`;
  if (normalized.length <= 7) return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
  return `(${parts[0]}) ${parts[1]}-${parts[2]}-${parts[3]}`;
}


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { formatPrice } from "../../components/product/ProductCard";
import { useAuthStore } from "../../lib/auth-store";
import { getCart } from "../../lib/cart-api";
import {
  createOrder,
  getDeliveryMethods,
  getPaymentMethods,
  getPickupPoints,
  validatePromoCode,
  type DeliveryMethod,
} from "../../lib/checkout-api";
import { useGuestCartStore } from "../../lib/guest-cart-store";
import { getAddresses } from "../../lib/profile-api";
import "./CheckoutPage.css";

type AddressMode = "saved" | "new";

type CheckoutFormState = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
};

const deliveryScenarioOrder = ["STORE_PICKUP", "COURIER", "PICKUP_POINT"] as const;

const deliveryScenarioLabels = {
  STORE_PICKUP: "Из магазина",
  COURIER: "Доставка на дом",
  PICKUP_POINT: "Отделение Европочты",
} as const;

const paymentMethodLabels: Record<string, string> = {
  cash_on_delivery: "Наличными или картой",
  card_mock: "Банковской картой",
  online_mock: "Онлайн-оплата",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const guestItems = useGuestCartStore((state) => state.items);
  const cartQuery = useQuery({ queryKey: ["cart"], queryFn: getCart, enabled: Boolean(user) });
  const deliveryMethodsQuery = useQuery<DeliveryMethod[]>({ queryKey: ["delivery-methods"], queryFn: getDeliveryMethods });
  const paymentMethodsQuery = useQuery({ queryKey: ["payment-methods"], queryFn: getPaymentMethods });
  const addressesQuery = useQuery({ queryKey: ["addresses"], queryFn: getAddresses, enabled: Boolean(user) });
  const [deliveryMethodCode, setDeliveryMethodCode] = useState("");
  const activeDeliveryMethod = deliveryMethodsQuery.data?.find((method) => method.code === deliveryMethodCode);
  const pickupPointsQuery = useQuery({
    queryKey: ["pickup-points", activeDeliveryMethod?.scenario],
    queryFn: () => getPickupPoints(activeDeliveryMethod?.scenario),
    enabled: Boolean(activeDeliveryMethod && activeDeliveryMethod.scenario !== "COURIER"),
  });
  const [paymentMethodCode, setPaymentMethodCode] = useState("");
  const [addressMode, setAddressMode] = useState<AddressMode>("saved");
  const [addressId, setAddressId] = useState("");
  const [pickupPointId, setPickupPointId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [comment, setComment] = useState("");
  // Новые состояния для Европочты
  const [recipientName, setRecipientName] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupNumber, setPickupNumber] = useState("");
  const [form, setForm] = useState<CheckoutFormState>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    city: "",
    street: "",
    house: "",
    apartment: "",
  });
  const promoMutation = useMutation({
    mutationFn: validatePromoCode,
    onSuccess(result) {
      setDiscountAmount(result.discountAmount);
      setPromoMessage(`Промокод применён: −${formatPrice(result.discountAmount)}`);
    },
    onError(error) {
      setDiscountAmount(0);
      setPromoMessage(error instanceof Error ? error.message : "Не удалось применить промокод");
    },
  });
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
      navigate("/checkout/success", { state: { id: result.id, orderNumber: result.orderNumber } });
    },
  });


  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        customerName: [user.firstName, user.lastName].filter(Boolean).join(" "),
        customerPhone: extractBelarusPhoneDigits(user.phone),
        customerEmail: user.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    const firstMethod = deliveryMethodsQuery.data
      ?.slice()
      .sort(
        (first, second) =>
          deliveryScenarioOrder.indexOf(first.scenario) - deliveryScenarioOrder.indexOf(second.scenario),
      )[0];

    if (firstMethod && !deliveryMethodCode) {
      setDeliveryMethodCode(firstMethod.code);
    }
  }, [deliveryMethodCode, deliveryMethodsQuery.data]);

  useEffect(() => {
    const firstMethod = paymentMethodsQuery.data?.[0];
    if (firstMethod && !paymentMethodCode) {
      setPaymentMethodCode(firstMethod.code);
    }
  }, [paymentMethodCode, paymentMethodsQuery.data]);

  useEffect(() => {
    setPickupPointId("");
  }, [activeDeliveryMethod?.scenario]);

  useEffect(() => {
    const defaultAddress = addressesQuery.data?.find((address) => address.isDefault) ?? addressesQuery.data?.[0];
    if (defaultAddress && !addressId) {
      setAddressId(defaultAddress.id);
    }
  }, [addressId, addressesQuery.data]);

  useEffect(() => {
    const firstPickupPoint = pickupPointsQuery.data?.[0];
    if (firstPickupPoint && !pickupPointId) {
      setPickupPointId(firstPickupPoint.id);
    }
  }, [pickupPointId, pickupPointsQuery.data]);

  const deliveryMethods = [...(deliveryMethodsQuery.data ?? [])].sort(
    (first, second) => deliveryScenarioOrder.indexOf(first.scenario) - deliveryScenarioOrder.indexOf(second.scenario),
  );
  const selectedItems = cartQuery.data?.items.filter((item) => item.isSelected) ?? [];
  const subtotal = cartQuery.data?.totalPrice ?? 0;
  const deliveryPrice = Number(activeDeliveryMethod?.price ?? 0);
  const total = Number((subtotal - discountAmount + deliveryPrice).toFixed(2));
  const isSyncingGuestCart = Boolean(user && guestItems.length);

  if (!isBootstrapped) {
    return <CheckoutState>Проверяем авторизацию...</CheckoutState>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  }

  if (cartQuery.isLoading || isSyncingGuestCart) {
    return <CheckoutState>Подготавливаем корзину к оформлению...</CheckoutState>;
  }

  if (!selectedItems.length) {
    return (
      <CheckoutState>
        <strong>Нет выбранных товаров</strong>
        <button type="button" onClick={() => navigate("/cart")}>
          Вернуться в корзину
        </button>
      </CheckoutState>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeDeliveryMethod) {
      return;
    }

    const orderPayload: any = {
      customerName: form.customerName,
      customerPhone: form.customerPhone ? `+375${form.customerPhone}` : "",
      customerEmail: form.customerEmail,
      deliveryMethod: activeDeliveryMethod.code,
      paymentMethod: paymentMethodCode,
      ...(promoCode.trim() ? { promoCode: promoCode.trim() } : {}),
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    };

    if (activeDeliveryMethod.scenario === "COURIER") {
      if (addressMode === "saved" && addressId) {
        orderPayload.addressId = addressId;
      } else {
        orderPayload.city = form.city;
        const fullAddress = `${form.street}, ${form.house}${form.apartment ? `, кв. ${form.apartment}` : ""}`;
        orderPayload.deliveryAddress = fullAddress;
      }
    } else if (activeDeliveryMethod.scenario === "PICKUP_POINT") {
      orderPayload.recipientName = recipientName;
      orderPayload.pickupCity = pickupCity;
      orderPayload.pickupNumber = pickupNumber;
    } else {
      // STORE_PICKUP
      orderPayload.pickupPointId = pickupPointId;
    }

    await createOrderMutation.mutateAsync(orderPayload);
  }

  return (
    <main className="checkout_page">
      <div className="checkout_page_inner">
        <form className="checkout_form" onSubmit={handleSubmit}>
          <CheckoutSection index="1" title="Данные покупателя">
            <div className="checkout_grid checkout_grid__three">
              <Field label="Имя и фамилия">
                <input
                  required
                  value={form.customerName}
                  onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                />
              </Field>
              <Field label="Телефон">
                <div className="checkout_phone_field">
                  <span>+375</span>
                  <input
                    required
                    value={formatBelarusPhone(extractBelarusPhoneDigits(form.customerPhone))}
                    onChange={(event) => {
                      const digits = extractBelarusPhoneDigits(event.target.value);
                      setForm((current) => ({ ...current, customerPhone: digits }));
                    }}
                    placeholder="(29) 123-45-67"
                    inputMode="numeric"
                  />
                </div>
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={form.customerEmail}
                  onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))}
                />
              </Field>
            </div>
            <Field label="Комментарий">
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
            </Field>
          </CheckoutSection>

          <CheckoutSection index="2" title="Выберите способ получения">
            <ChoiceRow
              items={deliveryMethods.map((method) => ({
                code: method.code,
                label: deliveryScenarioLabels[method.scenario],
              }))}
              activeCode={deliveryMethodCode}
              onSelect={setDeliveryMethodCode}
            />

            {activeDeliveryMethod?.scenario === "STORE_PICKUP" ? (
              <PickupStores
                points={pickupPointsQuery.data ?? []}
                pickupPointId={pickupPointId}
                onSelect={setPickupPointId}
              />
            ) : null}

            {activeDeliveryMethod?.scenario === "COURIER" ? (
              <HomeDelivery
                addressMode={addressMode}
                addresses={addressesQuery.data ?? []}
                addressId={addressId}
                form={form}
                onAddressModeChange={setAddressMode}
                onAddressChange={setAddressId}
                onFormChange={setForm}
              />
            ) : null}

            {activeDeliveryMethod?.scenario === "PICKUP_POINT" ? (
              <EuropostDelivery
                recipientName={recipientName}
                pickupCity={pickupCity}
                pickupNumber={pickupNumber}
                onRecipientNameChange={setRecipientName}
                onPickupCityChange={setPickupCity}
                onPickupNumberChange={setPickupNumber}
              />
            ) : null}
          </CheckoutSection>

          <CheckoutSection index="3" title="Способ оплаты">
            <ChoiceRow
              items={(paymentMethodsQuery.data ?? []).map((method) => ({
                code: method.code,
                label: paymentMethodLabels[method.code] ?? method.name,
              }))}
              activeCode={paymentMethodCode}
              onSelect={setPaymentMethodCode}
            />
          </CheckoutSection>

          <CheckoutSection index="4" title="Промокод">
            <div className="checkout_promo">
              <input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="WELCOME10" />
              <button type="button" onClick={() => void promoMutation.mutateAsync(promoCode)} disabled={!promoCode.trim()}>
                Применить
              </button>
            </div>
            {promoMessage ? <p className="checkout_note">{promoMessage}</p> : null}
          </CheckoutSection>

          {createOrderMutation.error ? (
            <p className="checkout_error">
              {createOrderMutation.error instanceof Error ? createOrderMutation.error.message : "Не удалось оформить заказ"}
            </p>
          ) : null}

          <button className="checkout_submit" type="submit" disabled={createOrderMutation.isPending}>
            {createOrderMutation.isPending ? "Оформляем..." : "Подтвердить заказ"}
          </button>
        </form>

        <aside className="checkout_summary">
          <span>Оформляем</span>
          <strong>{selectedItems.length} товаров</strong>
          <dl>
            <div>
              <dt>Товары</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Доставка</dt>
              <dd>{formatPrice(deliveryPrice)}</dd>
            </div>
            <div>
              <dt>Скидка</dt>
              <dd>−{formatPrice(discountAmount)}</dd>
            </div>
          </dl>
          <b>{formatPrice(total)}</b>
        </aside>
      </div>
    </main>
  );
}

function ChoiceRow({
  items,
  activeCode,
  onSelect,
}: {
  items: Array<{ code: string; label: string }>;
  activeCode: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="checkout_choices">
      {items.map((item) => (
        <button
          className={item.code === activeCode ? "is-active" : ""}
          type="button"
          key={item.code}
          onClick={() => onSelect(item.code)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PickupStores({
  points,
  pickupPointId,
  onSelect,
}: {
  points: Array<{ id: string; name: string; address: string }>;
  pickupPointId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="checkout_delivery-panel checkout_delivery-panel--stores">
      <div>
        <h3>Выберите магазин</h3>
        <p>Заберите заказ самостоятельно в удобной точке.</p>
      </div>

      <div className="checkout_store_list">
        {points.map((point, index) => (
          <label key={point.id}>
            <input
              type="radio"
              name="pickupPoint"
              checked={pickupPointId === point.id}
              onChange={() => onSelect(point.id)}
            />
            <span>
              <strong>Магазин {index + 1}</strong>
              <span>Адрес: Адрес магазина {index + 1}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}


function HomeDelivery({
  addressMode,
  addresses,
  addressId,
  form,
  onAddressModeChange,
  onAddressChange,
  onFormChange,
}: {
  addressMode: AddressMode;
  addresses: Array<{ id: string; label: string | null; city: string; street: string; house: string }>;
  addressId: string;
  form: CheckoutFormState;
  onAddressModeChange: (mode: AddressMode) => void;
  onAddressChange: (id: string) => void;
  onFormChange: Dispatch<SetStateAction<CheckoutFormState>>;
}) {
  return (
    <div className="checkout_delivery-card">
      {/* Картинка удалена */}
      <div className="checkout_delivery-content">
        <div>
          <h3>Доставка до двери</h3>
          <p>Укажите, куда привезти заказ. Остальное мы уже знаем из данных покупателя.</p>
          <p>По срокам и стоимости доставки с вами свяжется наш менеджер.</p>
        </div>

        <div className="checkout_toggle">
          <button
            type="button"
            className={addressMode === "saved" ? "is-active" : ""}
            onClick={() => onAddressModeChange("saved")}
            disabled={!addresses.length}
          >
            Сохранённый адрес
          </button>
          <button
            type="button"
            className={addressMode === "new" ? "is-active" : ""}
            onClick={() => onAddressModeChange("new")}
          >
            Новый адрес
          </button>
        </div>

        {addressMode === "saved" && addresses.length ? (
          <div className="checkout_choice_list">
            {addresses.map((address) => (
              <label key={address.id}>
                <input
                  type="radio"
                  name="address"
                  checked={addressId === address.id}
                  onChange={() => onAddressChange(address.id)}
                />
                <span>
                  <strong>{address.label || "Адрес"}</strong>
                  {address.city}, {address.street}, {address.house}
                </span>
              </label>
            ))}
          </div>
        ) : null}

        {addressMode === "new" || !addresses.length ? (
          <div className="checkout_grid">
            <Field label="Город">
              <input
                required={addressMode === "new" || !addresses.length}
                value={form.city}
                onChange={(event) => onFormChange((current) => ({ ...current, city: event.target.value }))}
              />
            </Field>
            <Field label="Улица">
              <input
                required={addressMode === "new" || !addresses.length}
                value={form.street}
                onChange={(event) => onFormChange((current) => ({ ...current, street: event.target.value }))}
              />
            </Field>
            <Field label="Дом">
              <input
                required={addressMode === "new" || !addresses.length}
                value={form.house}
                onChange={(event) => onFormChange((current) => ({ ...current, house: event.target.value }))}
              />
            </Field>
            <Field label="Квартира (опционально)">
              <input
                value={form.apartment}
                onChange={(event) => onFormChange((current) => ({ ...current, apartment: event.target.value }))}
              />
            </Field>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EuropostDelivery({
  recipientName,
  pickupCity,
  pickupNumber,
  onRecipientNameChange,
  onPickupCityChange,
  onPickupNumberChange,
}: {
  recipientName: string;
  pickupCity: string;
  pickupNumber: string;
  onRecipientNameChange: (value: string) => void;
  onPickupCityChange: (value: string) => void;
  onPickupNumberChange: (value: string) => void;
}) {
  return (
    <div className="checkout_delivery-card">
      {/* Картинка удалена */}
      <div className="checkout_delivery-content">
        <div>
          <h3>Получение в отделении Европочты</h3>
          <p>Укажите данные получателя и номер отделения.</p>
        </div>

        <div className="checkout_grid">
          <Field label="ФИО получателя">
            <input
              required
              value={recipientName}
              onChange={(e) => onRecipientNameChange(e.target.value)}
            />
          </Field>
          <Field label="Город">
            <input
              required
              value={pickupCity}
              onChange={(e) => onPickupCityChange(e.target.value)}
            />
          </Field>
          <Field label="Номер отделения">
            <input
              required
              value={pickupNumber}
              placeholder="Например, 67"
              onChange={(e) => onPickupNumberChange(e.target.value)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function CheckoutSection({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="checkout_section">
      <header>
        <span>{index}</span>
        <h2>{title}</h2>
      </header>
      <div>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="checkout_field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function CheckoutState({ children }: { children: ReactNode }) {
  return (
    <main className="checkout_state">
      <div>{children}</div>
    </main>
  );
}
