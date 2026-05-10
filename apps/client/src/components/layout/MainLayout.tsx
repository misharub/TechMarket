import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
