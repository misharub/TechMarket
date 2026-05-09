# TechMarket Frontend Development Notes

Документ описывает план разработки клиентской части TechMarket. Он нужен как памятка для диплома и как рабочий ориентир при постепенной реализации frontend.

## 1. Назначение frontend

Frontend отвечает за пользовательский интерфейс интернет-магазина:

- главная страница;
- каталог товаров;
- поиск и фильтрация;
- карточка товара;
- корзина;
- оформление заказа;
- личный кабинет;
- история заказов;
- уведомления;
- избранное;
- сравнение товаров;
- административная панель.

Серверная часть уже реализована отдельно в `apps/server`. Клиентская часть будет жить в `apps/client` и общаться с сервером через REST API.

```text
apps/server -> NestJS REST API, Prisma, PostgreSQL, бизнес-логика
apps/client -> React UI, страницы, формы, запросы к API
```

## 2. Выбранный стек frontend

Итоговый стек:

```text
React + Vite + TypeScript
React Router
TanStack Query
React Hook Form + Zod
Tailwind CSS
Radix UI
lucide-react
Zustand
fetch wrapper
Vitest + React Testing Library
```

## 3. Зачем нужна каждая технология

### React

React используется для построения интерфейса из компонентов.

Примеры компонентов:

```text
Header
ProductCard
ProductGrid
CartItem
OrderStatusBadge
CompareTable
AdminSidebar
```

Главная идея: интерфейс разбивается на маленькие части, которые проще читать, поддерживать и переиспользовать.

### Vite

Vite используется как инструмент запуска и сборки frontend.

Он нужен для:

- быстрого запуска dev-сервера;
- обновления страницы при изменении кода;
- сборки production-версии;
- удобной работы с React + TypeScript.

Dev-сервер клиента:

```text
http://localhost:5173
```

### TypeScript

TypeScript добавляет типизацию.

Это особенно важно для интернет-магазина, потому что frontend работает со множеством структур:

```text
User
Product
Category
Brand
CartItem
Order
Notification
PromoCode
CompareResult
```

Типы помогают заранее увидеть ошибки, например:

- поле называется `orderNumber`, а не `number`;
- цена приходит числом;
- `aiSummaryMeta.isFallback` является boolean;
- товар может иметь `oldPrice`, а может не иметь.

### React Router

React Router отвечает за страницы приложения.

Планируемые маршруты:

```text
/
/catalog
/catalog/:categorySlug
/product/:productSlug
/search
/cart
/checkout
/login
/register
/auth/oauth-success
/profile
/profile/orders
/profile/orders/:id
/admin
/admin/products
/admin/categories
/admin/orders
/admin/users
```

React Router позволит переходить между страницами без полной перезагрузки сайта.

### TanStack Query

TanStack Query отвечает за работу с серверными данными.

Она будет использоваться для:

- загрузки каталога;
- загрузки карточки товара;
- загрузки корзины;
- загрузки заказов;
- загрузки уведомлений;
- обновления данных после действий пользователя.

Пример логики:

```text
1. Пользователь нажимает "В корзину".
2. Frontend вызывает POST /api/cart.
3. После успеха TanStack Query обновляет GET /api/cart.
4. В шапке меняется количество товаров.
```

### React Hook Form + Zod

React Hook Form отвечает за состояние форм.

Zod отвечает за валидацию.

Они будут использоваться для:

- авторизации;
- регистрации;
- checkout;
- профиля;
- создания товара в админке;
- создания категории;
- создания промокода;
- настройки способов доставки и оплаты.

Пример проверки:

```text
email должен быть email
пароль не короче 8 символов
цена должна быть больше 0
количество товара не может быть меньше 0
```

### Tailwind CSS

Tailwind CSS используется для стилизации интерфейса.

Он нужен для:

- быстрой адаптивной верстки;
- единой сетки;
- цветов TechMarket;
- карточек товаров;
- форм;
- таблиц;
- админки.

Основная визуальная идея:

```text
светлая тема
минимализм
бирюзово-синяя палитра TechMarket
аккуратные карточки товаров
понятная навигация
```

### Radix UI

Radix UI используется для сложных интерактивных компонентов.

Например:

```text
Dialog
DropdownMenu
Select
Tabs
Tooltip
Checkbox
Switch
Popover
```

Radix дает правильное поведение и доступность, а внешний вид мы оформляем Tailwind CSS.

### lucide-react

lucide-react используется для иконок.

Примеры:

```text
Search
ShoppingCart
User
Heart
Scale
Bell
Menu
LogOut
Package
Settings
```

Важно: в рабочем frontend не используем emoji-иконки. Используем единый минималистичный набор lucide.

### Zustand

Zustand используется для локального состояния frontend.

В нем удобно хранить:

```text
accessToken
гостевую корзину
список сравнения
состояние мобильного меню
локальные UI-настройки
```

Серверные данные в Zustand не складываем. Для серверных данных используем TanStack Query.

### fetch wrapper

Для запросов к backend будет создан единый API-клиент.

Он будет отвечать за:

- базовый URL;
- JSON-запросы;
- обработку ошибок;
- отправку access token;
- `credentials: "include"` для refresh cookie.

Базовый URL:

```text
http://localhost:5000/api
```

### Vitest + React Testing Library

Vitest нужен для тестов frontend.

React Testing Library помогает тестировать интерфейс как пользователь:

```text
видит кнопку
нажимает кнопку
вводит email
получает ошибку валидации
```

Для диплома достаточно покрыть несколько ключевых вещей:

- formatter-функции;
- auth form validation;
- ProductCard;
- CartItem;
- CompareTable.

## 4. Связь frontend с backend

Frontend и backend запускаются отдельно:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000/api
```

Пример запроса:

```ts
fetch("http://localhost:5000/api/products")
```

Защищенный запрос:

```ts
fetch("http://localhost:5000/api/cart", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  credentials: "include",
});
```

`credentials: "include"` нужен, чтобы браузер отправлял HTTP-only cookie с refresh token.

## 5. Авторизация на frontend

Схема авторизации:

```text
1. Пользователь вводит email и пароль.
2. Frontend отправляет POST /api/auth/login.
3. Backend возвращает accessToken и user.
4. Backend ставит refreshToken в HTTP-only cookie.
5. Frontend сохраняет accessToken в Zustand.
6. Для защищенных запросов frontend отправляет Authorization: Bearer <accessToken>.
7. Если accessToken истек, frontend вызывает POST /api/auth/refresh.
8. Если refresh успешен, frontend получает новый accessToken.
9. Если refresh неуспешен, пользователь выходит из аккаунта.
```

Google OAuth:

```text
1. Пользователь нажимает "Войти через Google".
2. Frontend открывает /api/auth/google.
3. Backend перенаправляет пользователя в Google.
4. После успеха Google возвращает пользователя на backend callback.
5. Backend ставит refresh cookie.
6. Backend перенаправляет пользователя на /auth/oauth-success.
7. Frontend на этой странице вызывает /auth/refresh или /auth/me.
```

## 6. Предлагаемая структура папок

```text
apps/client/src/
├── app/
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/
│   ├── home/
│   ├── catalog/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   ├── profile/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── product/
│   ├── cart/
│   ├── compare/
│   └── admin/
│
├── features/
│   ├── auth/
│   ├── catalog/
│   ├── cart/
│   ├── orders/
│   ├── wishlist/
│   ├── compare/
│   └── notifications/
│
├── lib/
│   ├── api.ts
│   ├── query-client.ts
│   └── format.ts
│
├── store/
│   ├── auth-store.ts
│   ├── cart-store.ts
│   └── compare-store.ts
│
├── types/
│   └── api.ts
│
└── main.tsx
```

## 7. Этапы frontend-разработки

### Этап 1. Создание клиента

Статус: выполнено.

Команда:

```powershell
cd C:\TechMarket\apps
npm.cmd create vite@latest client -- --template react-ts
cd C:\TechMarket\apps\client
npm.cmd install
npm.cmd run dev
```

Результат:

```text
http://localhost:5173
```

На экране отображается стандартная стартовая страница Vite.

### Этап 2. Tailwind CSS и очистка стартового проекта

Статус: выполнено.

Цель:

- подключить Tailwind CSS;
- убрать стандартную страницу Vite;
- удалить лишние стили;
- подготовить базовую тему TechMarket.

Измененные файлы:

```text
apps/client/src/index.css
apps/client/src/App.tsx
apps/client/vite.config.ts
```

Что сделано:

- установлен `tailwindcss`;
- установлен `@tailwindcss/vite`;
- Tailwind подключен в `vite.config.ts`;
- `src/index.css` очищен от стандартных стилей Vite;
- добавлена базовая светлая тема;
- `src/App.tsx` заменен на простой стартовый экран TechMarket;
- проверено, что `http://localhost:5173` отображает страницу корректно.

### Этап 3. Базовые зависимости

Статус: выполнено.

Установить:

```text
react-router-dom
@tanstack/react-query
react-hook-form
zod
@hookform/resolvers
zustand
lucide-react
```

Radix UI будем добавлять постепенно, когда понадобится конкретный компонент.

Установленные зависимости:

```powershell
npm.cmd install react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers zustand lucide-react
```

Создана базовая структура:

```text
src/app
src/pages
src/components
src/features
src/lib
src/store
src/types
```

Создан `src/lib/query-client.ts`.

Он отвечает за настройки TanStack Query:

- кэш серверных данных;
- `staleTime`;
- количество повторов запроса;
- отключение автоматического refetch при возврате на вкладку.

Создан `src/app/providers.tsx`.

Он подключает глобальные провайдеры приложения. Сейчас подключен `QueryClientProvider`.

Создан `src/app/router.tsx`.

Он задает первый маршрут:

```text
/
```

Обновлен `src/main.tsx`.

Теперь приложение запускается через:

```text
AppProviders -> RouterProvider -> router
```

Проверка:

```powershell
npm.cmd run build
```

Сборка прошла успешно.

### Этап 4. Базовый layout

Статус: выполнено.

Сделать:

- `Header`;
- `Footer`;
- `MainLayout`;
- логотип TechMarket;
- строку поиска;
- иконки профиля, корзины, избранного, сравнения, уведомлений.

Созданные файлы:

```text
apps/client/src/components/layout/Header.tsx
apps/client/src/components/layout/Footer.tsx
apps/client/src/components/layout/MainLayout.tsx
apps/client/src/pages/home/HomePage.tsx
```

Что сделано:

- создана публичная шапка магазина;
- добавлен логотип TechMarket;
- добавлена строка поиска;
- добавлена горизонтальная навигация категорий;
- добавлены иконки из `lucide-react`;
- создан footer с дополнительной навигацией;
- создан `MainLayout` с общей структурой `Header -> Outlet -> Footer`;
- роут `/` теперь показывает `HomePage` внутри `MainLayout`;
- стандартный временный экран заменен на стартовую главную страницу магазина.

Проверка:

```powershell
cd C:\TechMarket\apps\client
npm.cmd run build
```

Сборка прошла успешно.

### Этап 5. Главная страница

Статус: частично выполнено.

Сделать по стартовому макету:

- hero-блок;
- категории;
- новинки;
- блок AI-сравнения;
- карточки товаров.

На этом этапе используются временные mock-данные. Реальные товары и категории будут подключены позже через API-клиент и TanStack Query.

### Этап 6. API-клиент

Создать единый API wrapper:

```text
src/lib/api.ts
```

Он будет обращаться к:

```text
http://localhost:5000/api
```

### Этап 7. Каталог

Подключить реальные endpoints:

```text
GET /products
GET /categories/tree
GET /brands
```

Реализовать:

- фильтры;
- сортировку;
- пагинацию;
- карточки товаров.

### Этап 8. Корзина

Подключить:

```text
GET /cart
POST /cart
PATCH /cart/:id
DELETE /cart/:id
```

Для гостя позже можно сделать localStorage-корзину.

### Этап 9. Auth

Подключить:

```text
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
GET /auth/me
GET /auth/google
```

### Этап 10. Checkout

Подключить:

```text
GET /checkout-options/delivery-methods
GET /checkout-options/payment-methods
POST /promo-codes/validate
POST /orders
```

### Этап 11. Личный кабинет

Подключить:

```text
GET /users/me
PATCH /users/me
GET /addresses
GET /orders
GET /orders/:id
GET /notifications
```

### Этап 12. Сравнение товаров

Подключить:

```text
POST /products/compare
```

Показать:

- таблицу характеристик;
- подсветку лучших значений;
- `aiSummary`;
- `aiSummaryMeta.provider`.

### Этап 13. Админ-панель

Подключить административные endpoints:

```text
GET /admin/stats
GET /admin/users
GET /admin/orders
POST /products
PATCH /products/:id
DELETE /products/:id
POST /categories
POST /brands
POST /promo-codes
```

## 8. Правила разработки frontend

1. Код пишем постепенно.
2. Сначала делаем понятную структуру, потом усложняем.
3. Сложные страницы разбиваем на компоненты.
4. Серверные данные получаем через TanStack Query.
5. Локальное состояние храним в Zustand.
6. Формы делаем через React Hook Form + Zod.
7. Иконки берем из lucide-react.
8. Emoji-иконки в рабочем UI не используем.
9. Компоненты должны быть адаптивными.
10. Админка должна визуально отличаться от пользовательской части.

## 9. Ближайшее действие

Следующий технический шаг:

```text
Подключить Tailwind CSS и очистить стартовую Vite-страницу.
```

После этого можно будет перенести стартовый макет TechMarket из:

```text
docs/figma-make/TechMarketApp.tsx
```

в реальный frontend, но уже аккуратно, с разбиением на компоненты.
