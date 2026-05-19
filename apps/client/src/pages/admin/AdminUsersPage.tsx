import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Mail, Search, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
  blockAdminUser,
  deleteAdminUser,
  getAdminUsers,
  messageAdminUser,
  type AdminUser,
} from "../../lib/admin-api";
import { useAuthStore } from "../../lib/auth-store";
import { getAdminOrders, orderStatusLabels, type AdminOrder } from "../../lib/orders-api";
import { useToastStore } from "../../lib/toast-store";
import { formatDate } from "./admin-utils";

type UserModalTab = "main" | "orders" | "management";

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UserModalTab>("main");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageText, setMessageText] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => getAdminUsers(search),
  });
  const ordersQuery = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: getAdminOrders,
  });

  const blockMutation = useMutation({
    mutationFn: ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => blockAdminUser(userId, isBlocked),
    onSuccess: async () => {
      showToast("Статус аккаунта обновлён");
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError(error) {
      showToast(error instanceof Error ? error.message : "Не удалось обновить статус аккаунта", "error");
    },
  });
  const messageMutation = useMutation({
    mutationFn: ({ userId, title, message }: { userId: string; title: string; message: string }) =>
      messageAdminUser(userId, { title, message }),
    onSuccess: () => {
      showToast("Сообщение отправлено");
      setMessageTitle("");
      setMessageText("");
    },
    onError(error) {
      showToast(error instanceof Error ? error.message : "Не удалось отправить сообщение", "error");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      showToast("Пользователь удалён");
      setSelectedUserId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError(error) {
      showToast(error instanceof Error ? error.message : "Не удалось удалить пользователя", "error");
    },
  });

  const users = usersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const selectedUserOrders = useMemo(
    () => (selectedUser ? orders.filter((order) => order.userId === selectedUser.id) : []),
    [orders, selectedUser],
  );

  function openUser(user: AdminUser) {
    setSelectedUserId(user.id);
    setActiveTab("main");
    setMessageTitle("");
    setMessageText("");
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    messageMutation.mutate({
      userId: selectedUser.id,
      title: messageTitle.trim(),
      message: messageText.trim(),
    });
  }

  function deleteUser(user: AdminUser) {
    if (user.id === currentUser?.id) {
      showToast("Нельзя удалить собственный аккаунт администратора", "error");
      return;
    }

    if (selectedUserOrders.length > 0) {
      showToast("Пользователя с заказами нельзя удалить", "error");
      return;
    }

    if (window.confirm(`Удалить аккаунт ${getUserName(user)}?`)) {
      deleteMutation.mutate(user.id);
    }
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Пользователи</h1>
      </header>

      <section className="admin_panel admin_users_toolbar">
        <label className="admin_search_field">
          <Search size={18} />
          <input
            className="admin_input"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Введите имя, фамилию или email пользователя"
            type="search"
            value={search}
          />
        </label>
      </section>

      {usersQuery.isError ? <p className="admin_error">Не удалось загрузить пользователей.</p> : null}

      <section className="admin_card admin_table_wrap">
        <table className="admin_table admin_users_table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Аватар</th>
              <th>ФИО</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Дата регистрации</th>
              <th>Подробнее</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{shortId(user.id)}</td>
                <td>
                  <UserAvatar user={user} />
                </td>
                <td>{getUserName(user)}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`admin_badge ${user.isBlocked ? "admin_badge_inactive" : "admin_badge_active"}`}>
                    {user.isBlocked ? "Заблокирован" : "Активен"}
                  </span>
                </td>
                <td>{formatDateTime(user.createdAt)}</td>
                <td>
                  <button className="admin_button" onClick={() => openUser(user)} type="button">
                    Подробнее
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usersQuery.isLoading ? <p className="admin_empty">Загружаем пользователей...</p> : null}
        {!usersQuery.isLoading && !users.length ? <p className="admin_empty">Пользователи не найдены.</p> : null}
      </section>

      {selectedUser ? (
        <UserModal
          activeTab={activeTab}
          blockPending={blockMutation.isPending}
          currentUserId={currentUser?.id}
          deletePending={deleteMutation.isPending}
          messagePending={messageMutation.isPending}
          messageText={messageText}
          messageTitle={messageTitle}
          onBlockToggle={() => blockMutation.mutate({ userId: selectedUser.id, isBlocked: !selectedUser.isBlocked })}
          onClose={() => setSelectedUserId(null)}
          onDelete={() => deleteUser(selectedUser)}
          onMessageTextChange={setMessageText}
          onMessageTitleChange={setMessageTitle}
          onSubmitMessage={submitMessage}
          onTabChange={setActiveTab}
          orders={selectedUserOrders}
          ordersLoading={ordersQuery.isLoading}
          user={selectedUser}
        />
      ) : null}
    </>
  );
}

function UserModal({
  user,
  orders,
  ordersLoading,
  activeTab,
  currentUserId,
  messageTitle,
  messageText,
  blockPending,
  messagePending,
  deletePending,
  onClose,
  onTabChange,
  onBlockToggle,
  onDelete,
  onSubmitMessage,
  onMessageTitleChange,
  onMessageTextChange,
}: {
  user: AdminUser;
  orders: AdminOrder[];
  ordersLoading: boolean;
  activeTab: UserModalTab;
  currentUserId?: string;
  messageTitle: string;
  messageText: string;
  blockPending: boolean;
  messagePending: boolean;
  deletePending: boolean;
  onClose: () => void;
  onTabChange: (tab: UserModalTab) => void;
  onBlockToggle: () => void;
  onDelete: () => void;
  onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void;
  onMessageTitleChange: (value: string) => void;
  onMessageTextChange: (value: string) => void;
}) {
  const canDelete = user.id !== currentUserId && orders.length === 0;

  return (
    <div className="admin_user_modal_backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="admin_user_modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="admin_user_modal_header">
          <h2>
            Информация о <span>пользователе</span>
          </h2>
          <button aria-label="Закрыть" className="admin_icon_button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        <div className="admin_user_modal_identity">
          <UserAvatar large user={user} />
          <strong>{getUserName(user)}</strong>
          <span>{user.email}</span>
        </div>

        <div className="admin_user_tabs" role="tablist" aria-label="Разделы пользователя">
          <TabButton active={activeTab === "main"} onClick={() => onTabChange("main")}>
            Основное
          </TabButton>
          <TabButton active={activeTab === "orders"} onClick={() => onTabChange("orders")}>
            Заказы
          </TabButton>
          <TabButton active={activeTab === "management"} onClick={() => onTabChange("management")}>
            Управление
          </TabButton>
        </div>

        {activeTab === "main" ? <UserMainTab user={user} /> : null}
        {activeTab === "orders" ? <UserOrdersTab loading={ordersLoading} orders={orders} /> : null}
        {activeTab === "management" ? (
          <UserManagementTab
            blockPending={blockPending}
            canDelete={canDelete}
            deletePending={deletePending}
            messagePending={messagePending}
            messageText={messageText}
            messageTitle={messageTitle}
            onBlockToggle={onBlockToggle}
            onDelete={onDelete}
            onMessageTextChange={onMessageTextChange}
            onMessageTitleChange={onMessageTitleChange}
            onSubmitMessage={onSubmitMessage}
            user={user}
          />
        ) : null}
      </section>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button aria-selected={active} className={active ? "is-active" : ""} onClick={onClick} role="tab" type="button">
      {children}
    </button>
  );
}

function UserMainTab({ user }: { user: AdminUser }) {
  return (
    <dl className="admin_user_detail_grid">
      <Detail label="Идентификатор" value={user.id} />
      <Detail label="Электронная почта" value={user.email} />
      <Detail label="Имя" value={user.firstName} />
      <Detail label="Фамилия" value={user.lastName} />
      <Detail label="Номер телефона" value={user.phone} />
      <Detail label="Роль" value={user.role} />
      <Detail label="Статус" value={user.isBlocked ? "Заблокирован" : "Активен"} />
      <Detail label="Дата регистрации" value={formatDateTime(user.createdAt)} />
    </dl>
  );
}

function UserOrdersTab({ orders, loading }: { orders: AdminOrder[]; loading: boolean }) {
  if (loading) {
    return <p className="admin_empty">Загружаем заказы...</p>;
  }

  if (!orders.length) {
    return <p className="admin_empty">У пользователя пока нет заказов.</p>;
  }

  return (
    <div className="admin_user_orders_grid">
      {orders.map((order) => (
        <article className="admin_user_order_card" key={order.id}>
          <strong>Идентификатор заказа: {order.orderNumber ?? shortId(order.id)}</strong>
          <span>Дата: {formatDateTime(order.createdAt)}</span>
          <span>Статус: {orderStatusLabels[order.status]}</span>
          <span>Сумма: {Number(order.totalPrice).toFixed(2)} BYN</span>
        </article>
      ))}
    </div>
  );
}

function UserManagementTab({
  user,
  canDelete,
  messageTitle,
  messageText,
  blockPending,
  messagePending,
  deletePending,
  onBlockToggle,
  onDelete,
  onSubmitMessage,
  onMessageTitleChange,
  onMessageTextChange,
}: {
  user: AdminUser;
  canDelete: boolean;
  messageTitle: string;
  messageText: string;
  blockPending: boolean;
  messagePending: boolean;
  deletePending: boolean;
  onBlockToggle: () => void;
  onDelete: () => void;
  onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void;
  onMessageTitleChange: (value: string) => void;
  onMessageTextChange: (value: string) => void;
}) {
  return (
    <div className="admin_user_management">
      <button className="admin_user_action admin_user_action_warn" disabled={blockPending} onClick={onBlockToggle} type="button">
        {user.isBlocked ? <ShieldCheck size={16} /> : <Ban size={16} />}
        {user.isBlocked ? "Разблокировать аккаунт" : "Заблокировать аккаунт"}
      </button>
      <button
        className="admin_user_action admin_user_action_danger"
        disabled={!canDelete || deletePending}
        onClick={onDelete}
        title={!canDelete ? "Нельзя удалить свой аккаунт или пользователя с заказами" : "Удалить аккаунт"}
        type="button"
      >
        <Trash2 size={16} />
        Удалить аккаунт
      </button>

      <form className="admin_user_message_form" onSubmit={onSubmitMessage}>
        <label className="admin_field">
          <span>Тема сообщения</span>
          <input
            className="admin_input"
            maxLength={120}
            minLength={2}
            onChange={(event) => onMessageTitleChange(event.target.value)}
            required
            value={messageTitle}
          />
        </label>
        <label className="admin_field">
          <span>Сообщение</span>
          <textarea
            className="admin_textarea"
            maxLength={1000}
            minLength={2}
            onChange={(event) => onMessageTextChange(event.target.value)}
            required
            value={messageText}
          />
        </label>
        <button className="admin_user_action admin_user_action_info" disabled={messagePending} type="submit">
          <Mail size={16} />
          Написать сообщение
        </button>
      </form>
    </div>
  );
}

function UserAvatar({ user, large = false }: { user: AdminUser; large?: boolean }) {
  return (
    <span className={`admin_user_avatar ${large ? "admin_user_avatar_large" : ""}`} aria-hidden="true">
      <UserRound size={large ? 34 : 22} />
      <b>{getInitials(user)}</b>
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "Не указано"}</dd>
    </div>
  );
}

function getUserName(user: AdminUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

function getInitials(user: AdminUser) {
  return `${user.firstName[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

function shortId(id: string) {
  return id.length > 8 ? id.slice(-8) : id;
}

function formatDateTime(value: string) {
  return `${formatDate(value)} ${new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
