import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../lib/auth-store";
import "./Admin.css";
import { AdminToastViewport } from "./AdminToastViewport";

const links = [
  { to: "/admin", label: "Обзор" },
  { to: "/admin/categories", label: "Категории" },
  { to: "/admin/products", label: "Товары" },
  { to: "/admin/specification-templates", label: "Шаблоны характеристик" },
  { to: "/admin/brands", label: "Бренды" },
];

export function AdminLayout() {
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <div className="admin_shell">
      <aside className="admin_sidebar">
        <a className="admin_brand" href="/">
          TechMarket
        </a>

        <nav className="admin_nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/admin"} className="admin_nav_link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <a className="admin_nav_link" href="/">
          На сайт
        </a>
        <button className="admin_button_muted" type="button" onClick={() => void signOut()}>
          Выйти
        </button>
      </aside>

      <main className="admin_main">
        <Outlet />
      </main>

      <AdminToastViewport />
    </div>
  );
}
