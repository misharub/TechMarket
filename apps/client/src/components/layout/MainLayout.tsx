import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function MainLayout() {
  return (
    // MainLayout сейчас оставлен максимально чистым, чтобы отдельно отработать точный внешний вид шапки.
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
