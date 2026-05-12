import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { AboutPage } from "../pages/about/AboutPage";
import { CareersPage } from "../pages/careers/CareersPage";
import { CartPage } from "../pages/cart/CartPage";
import { CatalogPage } from "../pages/catalog/CatalogPage";
import { ComparePage } from "../pages/compare/ComparePage";
import { ContactsPage } from "../pages/contacts/ContactsPage";
import { OrderHelpPage } from "../pages/help/OrderHelpPage";
import { PaymentHelpPage } from "../pages/help/PaymentHelpPage";
import { WarrantyHelpPage } from "../pages/help/WarrantyHelpPage";
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { StoresPage } from "../pages/stores/StoresPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "catalog",
        element: <CatalogPage />,
      },
      {
        path: "catalog/:categorySlug",
        element: <CatalogPage />,
      },
      {
        path: "contacts",
        element: <ContactsPage />,
      },
      {
        path: "stores",
        element: <StoresPage />,
      },
      {
        path: "compare",
        element: <ComparePage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "careers",
        element: <CareersPage />,
      },
      {
        path: "help/order",
        element: <OrderHelpPage />,
      },
      {
        path: "help/payment",
        element: <PaymentHelpPage />,
      },
      {
        path: "help/warranty",
        element: <WarrantyHelpPage />,
      },
    ],
  },
]);
