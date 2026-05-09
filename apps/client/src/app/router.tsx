import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { HomePage } from "../pages/home/HomePage";

export const router = createBrowserRouter([
  {
    // MainLayout оборачивает публичные страницы общей шапкой и футером.
    path: "/",
    element: <MainLayout />,
    children: [
      {
        // Главная страница пока работает на mock-данных; API подключим отдельным этапом.
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
