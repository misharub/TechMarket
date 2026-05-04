# TechMarket Server Notes

## Назначение документа

Эта памятка объясняет первый этап разработки серверной части TechMarket простым языком. Ее можно использовать как основу для диплома и как рабочую документацию для дальнейшей разработки.

## Что уже сделано

На первом этапе был подготовлен фундамент серверного приложения на NestJS:

- сервер запускается как REST API;
- все маршруты имеют общий префикс `/api`;
- подключена конфигурация через `.env`;
- подключен PostgreSQL через Prisma ORM;
- подключена автоматическая валидация входных данных;
- подключена Swagger-документация;
- добавлен health endpoint для проверки работоспособности сервера.

## Общая архитектура

Проект разделен на несколько частей:

| Часть | Путь | Назначение |
|---|---|---|
| Server | `apps/server` | Backend на NestJS |
| Prisma | `prisma` | Схема базы данных и будущие миграции |
| Env | `.env` | Настройки окружения |
| Client | `apps/client` | Будущий frontend на React + Vite |

Главная идея архитектуры: frontend и backend развиваются отдельно. Клиент отправляет HTTP-запросы на сервер, сервер работает с базой данных и возвращает JSON.

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
- `AppController`;
- `AppService`.

`AppModule` можно понимать как центральное место, где собирается сервер.

В будущем сюда будут добавляться:

- `AuthModule`;
- `UsersModule`;
- `CategoriesModule`;
- `ProductsModule`;
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

ORM - это слой между кодом и базой данных. Вместо ручного SQL мы будем писать TypeScript-код через Prisma Client.

Пример будущего запроса:

```ts
this.prisma.product.findMany()
```

Это безопаснее и удобнее, чем вручную собирать SQL-строки.

## Prisma schema

Файл:

```text
prisma/schema.prisma
```

Сейчас в нем настроены:

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

Модели базы данных будут добавляться позже.

## PrismaService

Файлы:

```text
apps/server/src/prisma/prisma.module.ts
apps/server/src/prisma/prisma.service.ts
```

`PrismaService` делает Prisma доступной внутри NestJS.

В будущих сервисах можно будет писать:

```ts
constructor(private prisma: PrismaService) {}
```

После этого сервис сможет работать с базой.

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
```

Из папки `C:\TechMarket\apps\server`:

```powershell
npm.cmd run build
npm.cmd run start:dev
```

## Что писать в дипломе

Можно использовать такую формулировку:

> Серверная часть системы реализована на NestJS с использованием модульной архитектуры. На начальном этапе был настроен базовый инфраструктурный слой: глобальный префикс REST API, CORS, валидация входных данных, загрузка переменных окружения, подключение Prisma ORM к PostgreSQL и автоматическая документация Swagger/OpenAPI. Такой подход обеспечивает расширяемость серверной части и упрощает дальнейшую реализацию модулей авторизации, каталога, корзины, заказов и административной панели.

## Что будет следующим шагом

Рекомендуемый следующий учебный шаг - модуль категорий.

Почему категории:

- проще, чем авторизация;
- хорошо показывает схему NestJS: Controller -> Service -> Prisma;
- нужна для товаров и шаблонов характеристик;
- удобно тестировать через Swagger.

Будущий модуль:

```text
CategoriesModule
CategoriesController
CategoriesService
CreateCategoryDto
UpdateCategoryDto
```

Пример endpoints:

```text
GET /api/categories
GET /api/categories/:id
POST /api/categories
PATCH /api/categories/:id
DELETE /api/categories/:id
```

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
