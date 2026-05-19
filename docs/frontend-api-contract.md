# Frontend API Contract: TechMarket Server

Этот файл описывает, какие серверные endpoints нужны будущему React + Vite клиенту. Его удобно держать рядом с backend, чтобы frontend не гадал, какие поля отправлять и какие данные ждать.

Базовый URL для разработки:

```text
http://localhost:5000/api
```

Авторизация:

```text
Authorization: Bearer <accessToken>
```

Refresh token хранится в HTTP-only cookie. Frontend не читает его напрямую, а вызывает `POST /auth/refresh`.

## Auth

### POST `/auth/login`

Вход по email и паролю.

```json
{
  "email": "user@techmarket.local",
  "password": "User12345"
}
```

Ответ содержит `accessToken` и пользователя.

### POST `/auth/register`

Регистрация обычного пользователя.

```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "Password123"
}
```

### GET `/auth/me`

Возвращает текущего пользователя по access token.

### POST `/auth/refresh`

Выдает новый access token по refresh cookie.

### POST `/auth/logout`

Отзывает refresh-сессию и очищает cookie.

### GET `/auth/google`

Начинает Google OAuth flow. Frontend может открывать этот URL как обычную ссылку.

## Catalog

### GET `/categories/tree`

Дерево категорий для меню каталога.

### GET `/brands`

Список брендов для фильтров.

### GET `/products`

Каталог с фильтрами и пагинацией.

Query параметры:

```text
search
categoryId
brandId
priceFrom
priceTo
inStock
page
limit
sort
```

Формат ответа:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 12,
  "pages": 0
}
```

### GET `/products/by-slug/:slug`

Страница товара.

### POST `/products/compare`

Сравнение 2-3 товаров одной категории.

```json
{
  "productIds": ["product-id-1", "product-id-2"]
}
```

Ответ содержит `products`, `rows` и `aiSummary`.

## Cart

Все endpoints требуют авторизацию.

### GET `/cart`

Текущая корзина пользователя.

### POST `/cart`

```json
{
  "productId": "product-id",
  "quantity": 1
}
```

### PATCH `/cart/:id`

```json
{
  "quantity": 2
}
```

### DELETE `/cart/:id`

Удалить позицию.

### DELETE `/cart`

Очистить корзину.

## Checkout

### GET `/delivery-methods`

Способы доставки.

### GET `/payment-methods`

Способы оплаты.

### POST `/promo-codes/validate`

Проверка промокода по серверной корзине пользователя.

```json
{
  "code": "WELCOME10"
}
```

### POST `/orders`

Оформление заказа.

```json
{
  "customerName": "Иван Иванов",
  "customerPhone": "+375291112233",
  "customerEmail": "ivan@example.com",
  "city": "Минск",
  "deliveryAddress": "ул. Ленина, 10-15",
  "deliveryMethod": "courier",
  "recipientName": "Ivan Ivanov",
  "pickupCity": "Minsk",
  "pickupNumber": "67",
  "paymentMethod": "cash_on_delivery",
  "promoCode": "WELCOME10",
  "comment": "Позвонить за час до доставки"
}
```

В ответе заказ содержит:

```text
id
orderNumber
status
totalPrice
discountAmount
deliveryPrice
recipientName
pickupCity
pickupNumber
items
statusHistory
```

## Profile

### GET `/users/me`

Профиль пользователя.

### PATCH `/users/me`

Редактирование профиля.

### GET `/addresses`

Адреса доставки.

### POST `/addresses`

Создать адрес.

### GET `/orders`

История заказов текущего пользователя.

### GET `/orders/:id`

Детали заказа текущего пользователя.

### GET `/notifications`

Данные для значка уведомлений.

```json
{
  "items": [],
  "unreadCount": 0
}
```

### PATCH `/notifications/:id/read`

Отметить одно уведомление прочитанным.

### PATCH `/notifications/read-all`

Отметить все уведомления прочитанными.

## Wishlist And Reviews

### GET `/wishlist`

Избранное пользователя.

### POST `/wishlist`

```json
{
  "productId": "product-id"
}
```

### DELETE `/wishlist/:productId`

Удалить товар из избранного.

### GET `/products/:productId/reviews`

Отзывы товара.

### POST `/products/:productId/reviews`

Создать отзыв авторизованного пользователя.

## Admin

Admin endpoints требуют `ADMIN` role.

Основные разделы:

```text
GET /admin/stats
GET/POST/PATCH/DELETE /categories
GET/POST/PATCH/DELETE /categories/:categoryId/specs
GET/POST/PATCH/DELETE /brands
GET/POST/PATCH/DELETE /products
GET /admin/orders
GET /admin/orders/:id
PATCH /admin/orders/:id/status
GET /admin/users
PATCH /admin/users/:id
PATCH /admin/users/:id/block
GET/POST/PATCH/DELETE /admin/promo-codes
GET/POST/PATCH/DELETE /admin/delivery-methods
GET/POST/PATCH/DELETE /admin/payment-methods
GET /admin/export/products
GET /admin/export/orders
POST /admin/import/products
```

Для изменения статуса заказа:

```json
{
  "status": "PROCESSING",
  "adminComment": "Покупатель подтвердил заказ по телефону"
}
```

Если администратор ставит `CANCELLED`, сервер возвращает остатки товаров на склад.
