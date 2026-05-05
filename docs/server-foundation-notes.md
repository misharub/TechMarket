# TechMarket Server Notes

## Назначение документа

Эта памятка объясняет этапы разработки серверной части TechMarket простым языком. Ее можно использовать как основу для диплома и как рабочую документацию для дальнейшей разработки.

Документ ведется накопительно: старые разделы не удаляются и не сокращаются, а новые итерации добавляются ниже. Так проще восстановить ход разработки и объяснить, почему архитектура стала именно такой.

## Что уже сделано

На первых этапах был подготовлен фундамент серверного приложения на NestJS:

- сервер запускается как REST API;
- все маршруты имеют общий префикс `/api`;
- подключена конфигурация через `.env`;
- подключен PostgreSQL через Prisma ORM;
- подключена автоматическая валидация входных данных;
- подключена Swagger-документация;
- добавлен health endpoint для проверки работоспособности сервера;
- добавлены категории каталога;
- добавлены шаблоны характеристик категорий;
- добавлены бренды и товары.

## Общая архитектура

Проект разделен на несколько частей:

| Часть | Путь | Назначение |
|---|---|---|
| Server | `apps/server` | Backend на NestJS |
| Prisma | `prisma` | Схема базы данных и миграции |
| Env | `.env` | Настройки окружения |
| Client | `apps/client` | Будущий frontend на React + Vite |

Главная идея архитектуры: frontend и backend развиваются отдельно. Клиент отправляет HTTP-запросы на сервер, сервер работает с базой данных и возвращает JSON.

Общая схема:

```text
Frontend React + Vite
        |
        | HTTP request
        v
NestJS Controller
        |
        v
NestJS Service
        |
        v
PrismaService
        |
        v
PostgreSQL
```

## Итерация 6: Корзина и заказы

На шестом этапе добавляются корзина и оформление заказов. Это основной пользовательский сценарий интернет-магазина: выбрать товар, добавить его в корзину, оформить заказ и затем видеть историю заказов.

Корзина на сервере работает только для авторизованных пользователей. Гостевая корзина будет реализована позже на frontend через `localStorage`, а после входа пользователя ее можно будет синхронизировать с сервером.

Основные сущности:

| Сущность | Назначение |
|---|---|
| `CartItem` | Позиция товара в корзине пользователя |
| `Order` | Заказ пользователя с контактными данными и статусом |
| `OrderItem` | Товарная позиция внутри заказа |
| `OrderStatus` | Перечисление возможных статусов заказа |

Статусы заказа:

```text
NEW
PROCESSING
CONFIRMED
SHIPPED
COMPLETED
CANCELLED
```

Endpoints корзины:

```text
GET    /api/cart
POST   /api/cart
PATCH  /api/cart/:id
DELETE /api/cart/:id
DELETE /api/cart
```

Все endpoints корзины требуют авторизацию:

```text
Authorization: Bearer <accessToken>
```

Пример добавления товара в корзину:

```json
{
  "productId": "product-id",
  "quantity": 2
}
```

Логика корзины:

- нельзя добавить неактивный товар;
- нельзя добавить товар, которого нет в наличии;
- нельзя добавить количество больше остатка на складе;
- если товар уже есть в корзине, количество увеличивается;
- итоговая цена корзины считается по актуальной цене товара из базы.

Endpoints заказов пользователя:

```text
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
```

Пример оформления заказа:

```json
{
  "customerName": "Иван Иванов",
  "customerPhone": "+375291112233",
  "customerEmail": "ivan@example.com",
  "city": "Минск",
  "deliveryAddress": "ул. Ленина, 10-15",
  "deliveryMethod": "courier",
  "paymentMethod": "cash_on_delivery",
  "comment": "Позвонить за час до доставки"
}
```

Административные endpoints заказов:

```text
GET   /api/admin/orders
GET   /api/admin/orders/:id
PATCH /api/admin/orders/:id/status
```

Пример изменения статуса:

```json
{
  "status": "PROCESSING"
}
```

Логика оформления заказа:

- заказ нельзя оформить с пустой корзиной;
- заблокированный пользователь не может оформить заказ;
- перед созданием заказа сервер повторно проверяет наличие товаров;
- заказ создается в транзакции Prisma;
- в этой же транзакции создаются позиции заказа;
- остатки товаров уменьшаются;
- корзина пользователя очищается;
- в `OrderItem.price` сохраняется цена товара на момент оформления заказа.

Почему используется транзакция:

```text
создать заказ
создать позиции заказа
уменьшить остатки
очистить корзину
```

Эти действия должны выполниться вместе. Если одно из них не удалось, остальные тоже не должны быть сохранены. Так база данных не окажется в противоречивом состоянии.

В дипломе можно написать:

> Для реализации процесса покупки были добавлены модули корзины и заказов. Корзина хранится на сервере для авторизованных пользователей и содержит позиции товаров с количеством. При оформлении заказа сервер проверяет наличие товаров, создает заказ и позиции заказа, уменьшает остатки на складе и очищает корзину. Все операции оформления выполняются в транзакции Prisma, что обеспечивает целостность данных. Пользователь может просматривать только собственные заказы, а администратор имеет доступ ко всем заказам и может изменять их статусы.

## Итерация 5: Пользователи, авторизация и OAuth

На пятом этапе добавляется модуль пользователей и авторизации. После этого сервер начинает различать гостя, обычного пользователя и администратора.

Главная идея:

- пользователь регистрируется по email и паролю;
- пароль не хранится в открытом виде, в базе лежит только `passwordHash`;
- после входа сервер выдает короткоживущий `accessToken`;
- `accessToken` отправляется клиентом в заголовке `Authorization`;
- `refreshToken` хранится в HTTP-only cookie и нужен для получения нового access token;
- администратор может управлять пользователями и назначать роль `ADMIN`;
- обычный пользователь не может сам стать администратором.

Схема токенов:

```text
POST /api/auth/login
        |
        v
accessToken -> JSON response
refreshToken -> HTTP-only cookie
```

Почему так удобно:

- access token легко тестировать через Postman и Swagger;
- refresh token не доступен JavaScript-коду в браузере;
- при истечении access token пользователь может получить новый без повторного ввода пароля;
- подход хорошо подходит для будущего frontend на React.

Endpoints авторизации:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/vk
GET  /api/auth/vk/callback
```

Пример регистрации:

```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "Password123"
}
```

Пример входа:

```json
{
  "email": "admin@techmarket.local",
  "password": "Admin12345"
}
```

Пример успешного ответа:

```json
{
  "accessToken": "jwt...",
  "user": {
    "id": "user-id",
    "email": "admin@techmarket.local",
    "name": "TechMarket Admin",
    "role": "ADMIN"
  }
}
```

Защищенный запрос:

```text
Authorization: Bearer <accessToken>
```

Пользовательские endpoints:

```text
GET   /api/users/me
PATCH /api/users/me
```

Административные endpoints пользователей:

```text
GET   /api/admin/users
PATCH /api/admin/users/:id
PATCH /api/admin/users/:id/block
```

Как появляются администраторы:

- первый администратор создается через seed;
- новые администраторы назначаются только существующим администратором;
- регистрация обычного пользователя всегда создает роль `USER`;
- роль можно изменить через `PATCH /api/admin/users/:id`.

Тестовые пользователи:

```text
admin@techmarket.local / Admin12345
user@techmarket.local / User12345
```

OAuth через Google и VK:

- пользователь нажимает “Войти через Google” или “Войти через VK”;
- backend перенаправляет его на страницу провайдера;
- после подтверждения провайдер возвращает пользователя на callback endpoint;
- backend получает email и provider id;
- если пользователь уже есть по email, OAuth-аккаунт привязывается к нему;
- если пользователя нет, создается новый пользователь с ролью `USER`;
- если provider не вернул email, пользователь не создается.

Переменные окружения для OAuth:

```env
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

VK_CLIENT_ID=
VK_CLIENT_SECRET=
VK_CALLBACK_URL=http://localhost:5000/api/auth/vk/callback
```

Если ключи Google/VK не заполнены, OAuth endpoints возвращают понятную ошибку конфигурации. Email/password авторизация при этом работает.

После добавления авторизации административные действия каталога закрываются:

```text
POST/PATCH/DELETE categories -> только ADMIN
POST/PATCH/DELETE category specs -> только ADMIN
POST/PATCH/DELETE brands -> только ADMIN
POST/PATCH/DELETE products -> только ADMIN
```

Публичные `GET` endpoints каталога остаются доступными без входа.

В дипломе можно написать:

> В системе реализована ролевая модель доступа с ролями USER и ADMIN. Пароли пользователей хранятся только в виде bcrypt-хэша. Для авторизации используется JWT access token, а refresh token хранится в HTTP-only cookie, что повышает безопасность пользовательской сессии. Административные операции каталога защищены guard-ами NestJS и доступны только пользователям с ролью ADMIN. Дополнительно заложена архитектура OAuth-входа через Google и VK, позволяющая создавать или связывать внешние аккаунты с пользователем по email.

Controller принимает HTTP-запросы. Service содержит бизнес-логику. PrismaService выполняет запросы к базе данных PostgreSQL.

## Как проходит запрос

Пример запроса проверки сервера:

```text
Браузер -> GET http://localhost:5000/api/health
NestJS -> AppController
AppController -> AppService
AppService -> JSON response
```

Ответ:

```json
{
  "status": "ok",
  "service": "TechMarket API"
}
```

Этот пример удобен для объяснения общей схемы NestJS: запрос приходит в controller, controller вызывает service, service возвращает данные.

## Файл main.ts

Файл `apps/server/src/main.ts` отвечает за запуск NestJS-приложения.

Что в нем настроено:

- создание приложения через `NestFactory.create(AppModule)`;
- порт сервера из `.env`;
- глобальный префикс `/api`;
- CORS для будущего frontend;
- глобальная валидация DTO;
- Swagger-документация.

В дипломе можно написать:

> Точка входа серверного приложения выполняет инициализацию NestJS, задает общий префикс API, включает CORS для взаимодействия с клиентской частью, подключает глобальную валидацию входных данных и формирует OpenAPI-документацию.

## Глобальный префикс /api

В коде используется:

```ts
app.setGlobalPrefix("api");
```

Это значит, что все endpoints начинаются с `/api`.

Пример:

```text
health -> /api/health
products -> /api/products
auth/login -> /api/auth/login
```

Так проще отделить backend API от frontend-страниц.

## CORS

CORS нужен, чтобы frontend мог обращаться к backend.

Разрешены адреса:

```text
http://localhost:5173
http://localhost:3000
```

`5173` - стандартный порт Vite. `3000` оставлен для совместимости с предыдущим прототипом.

Параметр `credentials: true` понадобится для авторизации через HTTP-only cookies.

## ValidationPipe

Глобальная валидация включена через `ValidationPipe`.

Настройки:

| Настройка | Что делает |
|---|---|
| `whitelist: true` | удаляет лишние поля из запроса |
| `forbidNonWhitelisted: true` | запрещает поля, которых нет в DTO |
| `transform: true` | преобразует значения к нужным типам |

Зачем это нужно:

- защита от лишних данных;
- меньше ошибок в сервисах;
- единая проверка форм регистрации, товаров, заказов;
- проще объяснить безопасность на защите.

## Swagger

Swagger доступен по адресу:

```text
http://localhost:5000/api/docs
```

Он нужен для просмотра и тестирования API. В дальнейшем там будут отображаться endpoints для пользователей, авторизации, товаров, категорий, корзины и заказов.

В дипломе можно написать:

> Для документирования REST API используется Swagger/OpenAPI. Это позволяет автоматически формировать интерактивную документацию серверных маршрутов и упрощает тестирование endpoints.

## AppModule

Файл `apps/server/src/app.module.ts` - корневой модуль приложения.

Сейчас он подключает:

- `ConfigModule`;
- `PrismaModule`;
- `CategoriesModule`;
- `CategorySpecsModule`;
- `BrandsModule`;
- `ProductsModule`;
- `AppController`;
- `AppService`.

`AppModule` можно понимать как центральное место, где собирается сервер.

В будущем сюда будут добавляться:

- `AuthModule`;
- `UsersModule`;
- `OrdersModule`;
- `CartModule`;
- `AdminModule`.

## ConfigModule

`ConfigModule` читает настройки из `.env`.

В проекте используется:

```text
C:\TechMarket\.env
```

Основные переменные:

| Переменная | Назначение |
|---|---|
| `PORT` | порт сервера |
| `DATABASE_URL` | строка подключения к PostgreSQL |
| `JWT_ACCESS_SECRET` | секрет для access token |
| `JWT_REFRESH_SECRET` | секрет для refresh token |

Важно: пароль базы данных не должен попадать в публичный репозиторий.

## Prisma

Prisma используется как ORM.

ORM - это слой между кодом и базой данных. Вместо ручного SQL мы пишем TypeScript-код через Prisma Client.

Пример запроса:

```ts
this.prisma.product.findMany()
```

Это безопаснее и удобнее, чем вручную собирать SQL-строки.

## Prisma schema

Файл:

```text
prisma/schema.prisma
```

В нем описываются модели базы данных. Prisma на основе этого файла создает миграции и генерирует TypeScript-клиент.

Базовая настройка:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

`generator client` говорит Prisma, что нужно сгенерировать TypeScript-клиент.

`datasource db` говорит, что используется PostgreSQL.

## PrismaService

Файлы:

```text
apps/server/src/prisma/prisma.module.ts
apps/server/src/prisma/prisma.service.ts
```

`PrismaService` делает Prisma доступной внутри NestJS.

В сервисах можно писать:

```ts
constructor(private prisma: PrismaService) {}
```

После этого service сможет работать с базой.

## Особенность Prisma 7

В проекте используется Prisma 7. Для нее нужен adapter PostgreSQL.

Поэтому установлен пакет:

```text
@prisma/adapter-pg
```

В `PrismaService` создается adapter:

```ts
const adapter = new PrismaPg({
  connectionString: configService.getOrThrow<string>("DATABASE_URL"),
});

super({ adapter });
```

Простыми словами: Prisma получает строку подключения из `.env` и через adapter подключается к PostgreSQL.

## Health endpoint

Health endpoint нужен для проверки, что сервер работает.

Адрес:

```text
GET /api/health
```

Ответ:

```json
{
  "status": "ok",
  "service": "TechMarket API"
}
```

Если этот endpoint отвечает, значит сервер стартовал.

## Как запускать сервер

Перейти в папку сервера:

```powershell
cd C:\TechMarket\apps\server
```

Запустить dev-режим:

```powershell
npm.cmd run start:dev
```

Проверить:

```text
http://localhost:5000/api/health
http://localhost:5000/api/docs
```

## Полезные команды

Из корня проекта `C:\TechMarket`:

```powershell
npx.cmd prisma generate
npx.cmd prisma validate
npx.cmd prisma migrate dev --name migration_name
npm.cmd run prisma:seed
```

Из папки `C:\TechMarket\apps\server`:

```powershell
npm.cmd run build
npm.cmd run start:dev
```

## Что писать в дипломе

Можно использовать такую формулировку:

> Серверная часть системы реализована на NestJS с использованием модульной архитектуры. На начальном этапе был настроен базовый инфраструктурный слой: глобальный префикс REST API, CORS, валидация входных данных, загрузка переменных окружения, подключение Prisma ORM к PostgreSQL и автоматическая документация Swagger/OpenAPI. Такой подход обеспечивает расширяемость серверной части и упрощает дальнейшую реализацию модулей авторизации, каталога, корзины, заказов и административной панели.

## Итерация 2: CategoriesModule

На втором этапе добавлен первый полноценный доменный модуль сервера - категории каталога.

Зачем нужны категории:

- они формируют структуру каталога магазина;
- к категории позже будут привязаны товары;
- для категорий позже будут создаваться шаблоны характеристик;
- дерево категорий понадобится для меню frontend.

Архитектура модуля:

```text
HTTP request
   |
   v
CategoriesController
   |
   v
CategoriesService
   |
   v
PrismaService
   |
   v
PostgreSQL
```

Файлы модуля:

```text
apps/server/src/categories/
├── categories.module.ts
├── categories.controller.ts
├── categories.service.ts
└── dto/
    ├── create-category.dto.ts
    ├── update-category.dto.ts
    └── find-categories.dto.ts
```

Главная идея:

- controller принимает HTTP-запрос;
- DTO проверяет входные данные;
- service содержит бизнес-логику;
- PrismaService выполняет запрос к PostgreSQL.

Endpoints:

```text
GET    /api/categories
GET    /api/categories/tree
GET    /api/categories/:id
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

Удаление категорий сделано мягким. Это значит, что строка не удаляется из базы физически. Вместо этого поле `isActive` становится `false`.

Почему это удобно:

- не ломаются будущие связи с товарами;
- категорию можно восстановить;
- история данных остается в базе.

В дипломе можно написать:

> Модуль категорий реализован с использованием стандартной архитектуры NestJS: контроллер отвечает за обработку HTTP-запросов, сервис содержит бизнес-логику, а доступ к данным выполняется через Prisma ORM. Категории поддерживают иерархическую структуру за счет связи parentId, что позволяет строить дерево каталога. Удаление реализовано как мягкое скрытие через поле isActive, чтобы не нарушать целостность связанных данных.

## Итерация 3: Шаблоны характеристик категорий

На третьем этапе добавлен модуль шаблонов характеристик категорий.

Идея модуля:

- администратор выбирает категорию;
- затем создает для нее список характеристик;
- при добавлении товара форма сможет использовать эти характеристики;
- сравнение товаров будет строиться по характеристикам с `isComparable = true`.

Пример для категории “Ноутбуки”:

| key | label | type | unit |
|---|---|---|---|
| `screenSize` | Диагональ экрана | `NUMBER` | дюйм |
| `processor` | Процессор | `STRING` |  |
| `ram` | Оперативная память | `NUMBER` | GB |
| `ssd` | Объем SSD | `NUMBER` | GB |

Поле `key` вводится на английском. Оно нужно для кода, API и хранения характеристик товара. Поле `label` отображается пользователю на русском языке.

Endpoints:

```text
GET    /api/categories/:categoryId/specs
POST   /api/categories/:categoryId/specs
PATCH  /api/categories/:categoryId/specs/:specId
DELETE /api/categories/:categoryId/specs/:specId
```

Пример создания характеристики:

```json
{
  "key": "ram",
  "label": "Оперативная память",
  "type": "NUMBER",
  "unit": "GB",
  "isRequired": true,
  "isComparable": true,
  "sortOrder": 10,
  "helpText": "Введите число без единицы измерения. Например: 16."
}
```

Типы характеристик:

| Тип | Когда использовать |
|---|---|
| `STRING` | Текст: процессор, цвет, операционная система |
| `NUMBER` | Число: объем памяти, диагональ, мощность |
| `BOOLEAN` | Да/нет: есть Wi-Fi, есть Bluetooth |
| `SELECT` | Выбор из списка, будет расширен позже |

В дипломе можно написать:

> Для повышения гибкости каталога реализован модуль шаблонов характеристик категорий. Он позволяет администратору самостоятельно задавать набор характеристик для каждой категории товаров. Такой подход упрощает добавление разных типов техники, так как ноутбуки, холодильники и телевизоры могут иметь разные наборы параметров. Отдельное поле `isComparable` позволяет заранее определить, какие характеристики будут участвовать в сравнении товаров.

## Итерация 4: Бренды и товары

На четвертом этапе добавлены бренды и товары. Это основа полноценного каталога интернет-магазина.

Зачем нужен отдельный `Brand`:

- бренд можно выбрать из справочника при создании товара;
- проще фильтровать товары по брендам;
- меньше риска опечаток, например `Samsung`, `Samsng`, `samsung`;
- в админ-панели можно будет управлять логотипами и описаниями брендов.

Зачем нужен `Product`:

- товар является основной сущностью интернет-магазина;
- карточка товара хранит цену, остаток, изображения и описание;
- товар связан с категорией и брендом;
- характеристики товара хранятся в гибком JSON-поле `specs`.

Связи в базе:

```text
Category 1 -> many Product
Brand    1 -> many Product
Product  many -> 1 Category
Product  many -> 1 Brand
```

Файлы модулей:

```text
apps/server/src/brands/
├── brands.module.ts
├── brands.controller.ts
├── brands.service.ts
└── dto/

apps/server/src/products/
├── products.module.ts
├── products.controller.ts
├── products.service.ts
└── dto/
```

Endpoints брендов:

```text
GET    /api/brands
GET    /api/brands/:id
POST   /api/brands
PATCH  /api/brands/:id
DELETE /api/brands/:id
```

Удаление бренда сделано мягким через `isActive = false`.

Endpoints товаров:

```text
GET    /api/products
GET    /api/products/:id
GET    /api/products/by-slug/:slug
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

Список товаров поддерживает:

- поиск;
- фильтр по категории;
- фильтр по бренду;
- фильтр по цене;
- фильтр по наличию;
- пагинацию;
- сортировку.

Пример запроса:

```text
GET /api/products?search=lenovo&brandId=...&categoryId=...&priceFrom=1000&priceTo=3000&inStock=true&page=1&limit=12&sort=priceAsc
```

Формат ответа списка:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 12,
  "pages": 0
}
```

Пример создания товара:

```json
{
  "title": "Lenovo IdeaPad 5 16",
  "slug": "lenovo-ideapad-5-16",
  "sku": "NB-LEN-0001",
  "description": "Ноутбук для учебы, работы и мультимедиа.",
  "price": 2599.99,
  "oldPrice": 2899.99,
  "categoryId": "category-id",
  "brandId": "brand-id",
  "stock": 12,
  "images": ["/uploads/products/lenovo-ideapad-5.jpg"],
  "specs": {
    "screenSize": 16,
    "processor": "Intel Core i5",
    "ram": 16,
    "ssd": 512
  }
}
```

Проверка `specs`:

- нельзя передать ключ, которого нет в шаблоне категории;
- обязательные характеристики должны быть заполнены;
- `STRING` должен быть строкой;
- `NUMBER` должен быть числом;
- `BOOLEAN` должен быть логическим значением;
- `SELECT` пока принимается как строка.

В дипломе можно написать:

> На этапе реализации каталога были добавлены сущности бренда и товара. Бренд вынесен в отдельную таблицу, что позволяет централизованно управлять производителями и использовать их в фильтрации каталога. Товар связан с категорией и брендом, содержит цену, остаток, изображения и гибкий набор характеристик в формате JSON. Перед сохранением товара сервер проверяет характеристики по шаблону выбранной категории, что снижает вероятность ошибок при заполнении каталога и подготавливает систему к реализации сравнения товаров.

## Мини-глоссарий

| Термин | Простое объяснение |
|---|---|
| NestJS | backend-фреймворк для Node.js |
| Module | часть приложения, объединяющая controller и service |
| Controller | принимает HTTP-запросы |
| Service | содержит бизнес-логику |
| DTO | описание данных, которые приходят в запросе |
| ValidationPipe | автоматическая проверка DTO |
| Prisma | ORM для работы с базой данных |
| PostgreSQL | база данных |
| Swagger | интерактивная документация API |
| CORS | разрешение frontend обращаться к backend |
| `.env` | файл с настройками окружения |
| Soft delete | мягкое удаление: запись остается в базе, но скрывается |
| JSON specs | гибкое поле характеристик товара |

## Краткая схема

```text
Frontend React + Vite
        |
        | HTTP request
        v
NestJS Controller
        |
        v
NestJS Service
        |
        v
PrismaService
        |
        v
PostgreSQL
```
