import { createBrowserRouter } from "react-router-dom";
import { RequireAdmin } from "../components/auth/RequireAdmin";
import { MainLayout } from "../components/layout/MainLayout";
import { AboutPage } from "../pages/about/AboutPage";
import { AdminBrandFormPage } from "../pages/admin/AdminBrandFormPage";
import { AdminBrandsPage } from "../pages/admin/AdminBrandsPage";
import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage";
import { AdminCategoryFormPage } from "../pages/admin/AdminCategoryFormPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminLayout } from "../pages/admin/AdminLayout";
import { AdminProductFormPage } from "../pages/admin/AdminProductFormPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { AdminSpecificationTemplateFormPage } from "../pages/admin/AdminSpecificationTemplateFormPage";
import { AdminSpecificationTemplatesPage } from "../pages/admin/AdminSpecificationTemplatesPage";
import { CareersPage } from "../pages/careers/CareersPage";
import { CartPage } from "../pages/cart/CartPage";
import { CatalogPage } from "../pages/catalog/CatalogPage";
import { ComparePage } from "../pages/compare/ComparePage";
import { ContactsPage } from "../pages/contacts/ContactsPage";
import { OrderHelpPage } from "../pages/help/OrderHelpPage";
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { ProductPage } from "../pages/product/ProductPage";
import { StoresPage } from "../pages/stores/StoresPage";

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "categories",
        element: <AdminCategoriesPage />,
      },
      {
        path: "categories/new",
        element: <AdminCategoryFormPage />,
      },
      {
        path: "categories/:id/edit",
        element: <AdminCategoryFormPage />,
      },
      {
        path: "products",
        element: <AdminProductsPage />,
      },
      {
        path: "products/new",
        element: <AdminProductFormPage />,
      },
      {
        path: "products/:id/edit",
        element: <AdminProductFormPage />,
      },
      {
        path: "specification-templates",
        element: <AdminSpecificationTemplatesPage />,
      },
      {
        path: "specification-templates/new",
        element: <AdminSpecificationTemplateFormPage />,
      },
      {
        path: "specification-templates/:id/edit",
        element: <AdminSpecificationTemplateFormPage />,
      },
      {
        path: "brands",
        element: <AdminBrandsPage />,
      },
      {
        path: "brands/new",
        element: <AdminBrandFormPage />,
      },
      {
        path: "brands/:id/edit",
        element: <AdminBrandFormPage />,
      },
    ],
  },
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
        path: "product/:slug",
        element: <ProductPage />,
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
        path: "help",
        element: <OrderHelpPage />,
      },
    ],
  },
]);
