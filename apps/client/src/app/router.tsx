import { createBrowserRouter } from "react-router-dom";
import App from "../App";

export const router = createBrowserRouter([
  {
    // Главный маршрут приложения.
    // Пока он показывает App, позже здесь появится MainLayout и вложенные страницы.
    path: "/",
    element: <App />,
  },
]);
