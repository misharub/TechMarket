import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import "./OrderSuccessPage.css";

export function OrderSuccessPage() {
  const location = useLocation();
  const state = (location.state as { id?: string; orderNumber?: string | null } | undefined) ?? {};

  return (
    <main className="checkout_state">
      <div>
        <div className="checkout_success_icon">
          <Check />
        </div>

        <h2 className="checkout_success_title">Заказ принят! 🎉</h2>

        <p className="checkout_success_message">
          Ожидайте звонка от наших менеджеров для уточнения деталей заказа.
        </p>

        {state.orderNumber && (
          <p className="checkout_success_order">
            Номер заказа: <strong>{state.orderNumber}</strong>
          </p>
        )}

        <div className="checkout_success_actions">
          <Link to="/">На главную</Link>
          <Link to="/account/orders">Мои заказы</Link>
        </div>
      </div>
    </main>
  );
}