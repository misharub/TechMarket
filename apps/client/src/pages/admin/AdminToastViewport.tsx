import { useToastStore } from "../../lib/toast-store";

export function AdminToastViewport() {
  const items = useToastStore((state) => state.items);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (!items.length) {
    return null;
  }

  return (
    <aside aria-live="polite" className="admin_toast_viewport">
      {items.map((item) => (
        <button
          className={`admin_toast admin_toast_${item.tone}`}
          key={item.id}
          onClick={() => dismissToast(item.id)}
          type="button"
        >
          {item.message}
        </button>
      ))}
    </aside>
  );
}
