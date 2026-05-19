import { useQuery } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Heart, House, LogOut, Package, UserRound } from "lucide-react";
import { createAddress, getAddresses, getOrders, updateProfile } from "../../lib/profile-api";
import { useAuthStore } from "../../lib/auth-store";
import { orderStatusLabels, type OrderStatus } from "../../lib/orders-api";
import "./AccountPage.css";

type AccountSection = "profile" | "orders" | "addresses" | "favorites";

const navItems = [
  { id: "profile", label: "Личные данные", icon: UserRound },
  { id: "orders", label: "Мои заказы", icon: Package },
  { id: "addresses", label: "Адреса доставки", icon: House },
  { id: "favorites", label: "Избранное", icon: Heart },
] as const;

export function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const signOut = useAuthStore((state) => state.signOut);
  const params = useParams<{ section?: AccountSection }>();
  const section = params.section ?? "profile";
  const navigate = useNavigate();

  if (!isBootstrapped) {
    return (
      <section className="account_page">
        <div className="account_inner">
          <div className="account_content account_loading">Загружаем кабинет...</div>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `/account/${section}` }} />;
  }

  return (
    <section className="account_page">
      <div className="account_inner">
        <nav className="account_sidebar" aria-label="Разделы кабинета">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Link key={id} className={`account_nav_item${section === id ? " is-active" : ""}`} to={`/account/${id}`}>
              <Icon />
              <span>{label}</span>
            </Link>
          ))}

          <button
            className="account_nav_item account_logout"
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            <LogOut />
            <span>Выйти</span>
          </button>
        </nav>

        <div className="account_content">
          {section === "profile" ? <ProfileSection /> : null}
          {section === "orders" ? <OrdersSection /> : null}
          {section === "addresses" ? <AddressesSection /> : null}
          {section === "favorites" ? <FavoritesSection /> : null}
        </div>
      </div>
    </section>
  );
}

function ProfileSection() {
  const user = useAuthStore((state) => state.user)!;
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState(user.firstName);
  const [surname, setSurname] = useState(user.lastName ?? "");
  const [phoneDigits, setPhoneDigits] = useState(extractBelarusPhoneDigits(user.phone));
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const nextUser = await updateProfile({
        firstName: name.trim(),
        lastName: surname.trim(),
        phone: phoneDigits ? `+375${phoneDigits}` : "",
      });
      setUser(nextUser);
      setMessage("Данные сохранены.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить данные");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1>Личные данные</h1>
      <form className="account_form" onSubmit={handleSubmit}>
        <label>
          <span>Имя</span>
          <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
        </label>
        <label>
          <span>Фамилия</span>
          <input value={surname} onChange={(event) => setSurname(event.target.value)} />
        </label>
        <label>
          <span>Email</span>
          <input value={user.email} disabled />
        </label>
        <label>
          <span>Телефон</span>
          <div className="account_phone_field">
            <span>+375</span>
            <input
              value={formatBelarusPhone(phoneDigits)}
              onChange={(event) => setPhoneDigits(extractBelarusPhoneDigits(event.target.value))}
              placeholder="(29) 123-45-67"
              inputMode="numeric"
            />
          </div>
        </label>

        {message ? <p className="account_message">{message}</p> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
    </>
  );
}

function OrdersSection() {
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  return (
    <>
      <h1>Мои заказы</h1>
      <div className="account_panel">
        {ordersQuery.isLoading ? <p>Загружаем заказы...</p> : null}
        {!ordersQuery.isLoading && !ordersQuery.data?.length ? <p>Заказов пока нет.</p> : null}
        {ordersQuery.data?.map((order) => (
          <article key={order.id} className="account_order">
            <div className="account_order_head">
              <strong>{order.orderNumber ?? order.id}</strong>
              <span className={`account_order_status account_order_status_${order.status.toLowerCase()}`}>
                {orderStatusLabels[order.status as OrderStatus] ?? order.status}
              </span>
              <span>{formatOrderPrice(order.totalPrice)}</span>
            </div>

            <dl className="account_order_meta">
              <div>
                <dt>Доставка</dt>
                <dd>{getDeliveryMethodLabel(order.deliveryMethod)}</dd>
              </div>
              <div>
                <dt>Стоимость доставки</dt>
                <dd>{formatOrderPrice(order.deliveryPrice)}</dd>
              </div>
            </dl>

            <div className="account_order_items">
              {order.items.map((item) => (
                <div key={item.id}>
                  <span>{item.product.title}</span>
                  <strong>
                    {item.quantity} x {formatOrderPrice(item.price)}
                  </strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

const deliveryMethodLabels: Record<string, string> = {
  courier: "Доставка курьером",
  pickup: "Самовывоз из магазина",
  pickup_point: "Отделение Европочты",
};

function getDeliveryMethodLabel(code: string) {
  return deliveryMethodLabels[code] ?? code;
}

function formatOrderPrice(value: string | number) {
  return `${Number(value).toFixed(2)} BYN`;
}

function AddressesSection() {
  const addressesQuery = useQuery({ queryKey: ["addresses"], queryFn: getAddresses });
  const [form, setForm] = useState({
    label: "",
    city: "",
    street: "",
    house: "",
    apartment: "",
    zipCode: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await createAddress({
        label: form.label || undefined,
        city: form.city,
        street: form.street,
        house: form.house,
        apartment: form.apartment || undefined,
        zipCode: form.zipCode || undefined,
        isDefault: !addressesQuery.data?.length,
      });
      await addressesQuery.refetch();
      setForm({ label: "", city: "", street: "", house: "", apartment: "", zipCode: "" });
      setMessage("Адрес добавлен.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось добавить адрес");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1>Адреса доставки</h1>
      <form className="account_address_form" onSubmit={handleSubmit}>
        <label>
          <span>Название</span>
          <input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} placeholder="Дом" />
        </label>
        <label>
          <span>Город</span>
          <input required value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
        </label>
        <label>
          <span>Улица</span>
          <input required value={form.street} onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))} />
        </label>
        <label>
          <span>Дом</span>
          <input required value={form.house} onChange={(event) => setForm((current) => ({ ...current, house: event.target.value }))} />
        </label>
        <label>
          <span>Квартира</span>
          <input value={form.apartment} onChange={(event) => setForm((current) => ({ ...current, apartment: event.target.value }))} />
        </label>
        <label>
          <span>Индекс</span>
          <input value={form.zipCode} onChange={(event) => setForm((current) => ({ ...current, zipCode: event.target.value }))} />
        </label>
        {message ? <p className="account_message">{message}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Добавляем..." : "Добавить адрес"}
        </button>
      </form>

      <div className="account_panel">
        {addressesQuery.isLoading ? <p>Загружаем адреса...</p> : null}
        {!addressesQuery.isLoading && !addressesQuery.data?.length ? <p>Адресов пока нет.</p> : null}
        {addressesQuery.data?.map((address) => (
          <article key={address.id} className="account_address">
            <strong>{address.label || "Адрес"}</strong>
            <span>
              {address.city}, {address.street}, {address.house}
              {address.apartment ? `, кв. ${address.apartment}` : ""}
            </span>
            {address.isDefault ? <em>Основной</em> : null}
          </article>
        ))}
      </div>
    </>
  );
}

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

  if (!normalized) {
    return "";
  }

  if (normalized.length <= 2) {
    return `(${parts[0]}`;
  }

  if (normalized.length <= 5) {
    return `(${parts[0]}) ${parts[1]}`;
  }

  if (normalized.length <= 7) {
    return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
  }

  return `(${parts[0]}) ${parts[1]}-${parts[2]}-${parts[3]}`;
}

function FavoritesSection() {
  return (
    <>
      <h1>Избранное</h1>
      <div className="account_panel">
        <p>Избранные товары появятся здесь.</p>
      </div>
    </>
  );
}
