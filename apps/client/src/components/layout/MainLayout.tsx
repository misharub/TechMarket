import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import "./MainLayout.css";

export function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-shell_main">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
