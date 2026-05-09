# TechMarket Frontend Code Guide

Этот файл объясняет основы React и Tailwind CSS на примере текущего frontend-кода TechMarket. Его цель — помочь самостоятельно читать, менять и улучшать дизайн.

## 1. Главная идея React

React-приложение состоит из компонентов.

Компонент — это функция, которая возвращает JSX-разметку.

Пример:

```tsx
function Header() {
  return (
    <header>
      TechMarket
    </header>
  );
}
```

В нашем проекте уже есть компоненты:

```text
Header
Footer
MainLayout
HomePage
```

Они лежат здесь:

```text
apps/client/src/components/layout/Header.tsx
apps/client/src/components/layout/Footer.tsx
apps/client/src/components/layout/MainLayout.tsx
apps/client/src/pages/home/HomePage.tsx
```

## 2. Как сейчас запускается frontend

Главная цепочка такая:

```text
main.tsx
  -> AppProviders
    -> RouterProvider
      -> router
        -> MainLayout
          -> Header
          -> HomePage
          -> Footer
```

Файл:

```text
apps/client/src/main.tsx
```

Отвечает за запуск React-приложения.

Файл:

```text
apps/client/src/app/router.tsx
```

Отвечает за маршруты.

Сейчас маршрут один:

```text
/
```

Он показывает `HomePage` внутри `MainLayout`.

## 3. Что такое JSX

JSX похож на HTML, но внутри React.

Пример:

```tsx
return (
  <div className="bg-white text-slate-950">
    <h1>TechMarket</h1>
  </div>
);
```

Отличие от обычного HTML:

```html
class="..."
```

в React пишется так:

```tsx
className="..."
```

## 4. Что такое Tailwind CSS

Tailwind CSS позволяет писать стили прямо в `className`.

Пример:

```tsx
<div className="min-h-screen bg-white text-slate-950">
```

Расшифровка:

```text
min-h-screen   минимальная высота равна высоте экрана
bg-white       белый фон
text-slate-950 почти черный цвет текста
```

То есть вместо отдельного CSS-файла мы описываем внешний вид прямо в компоненте.

## 5. Как менять цвета

Пример из Header:

```tsx
className="text-teal-800"
```

Это цвет текста.

Основные цвета, которые мы используем:

```text
teal   бирюзовый брендовый цвет TechMarket
blue   синий для поиска и акцентов
slate  серые и почти черные оттенки текста
white  белый фон
red    акции и скидки
emerald зеленый статус наличия
```

Примеры:

```tsx
text-teal-800
bg-teal-700
hover:bg-teal-800
text-slate-950
text-slate-600
bg-blue-700
bg-red-600
text-emerald-700
```

Если хочешь сделать кнопку темнее:

```tsx
bg-teal-700
```

можно заменить на:

```tsx
bg-teal-800
```

Если хочешь сделать фон светлее:

```tsx
bg-slate-100
```

можно заменить на:

```tsx
bg-slate-50
```

## 6. Как менять размеры текста

Пример:

```tsx
className="text-sm"
```

Частые размеры:

```text
text-xs      очень маленький
text-sm      маленький
text-base    обычный
text-lg      крупнее обычного
text-2xl     заголовок
text-3xl     большой заголовок
```

Можно использовать точный размер:

```tsx
text-[28px]
text-[34px]
text-[48px]
```

Пример из главной страницы:

```tsx
<p className="mt-1 text-4xl font-bold leading-tight text-slate-950 md:text-[48px]">
  плати позже
</p>
```

Расшифровка:

```text
mt-1           отступ сверху
text-4xl       крупный текст на обычных экранах
font-bold      жирный текст
leading-tight  плотная высота строки
text-slate-950 цвет текста
md:text-[48px] на экранах md и больше размер станет 48px
```

## 7. Как менять отступы

В Tailwind:

```text
m  margin, внешний отступ
p  padding, внутренний отступ
```

Примеры:

```tsx
mt-4   margin-top
mb-6   margin-bottom
px-4   padding-left и padding-right
py-3   padding-top и padding-bottom
gap-4  расстояние между элементами flex/grid
```

Пример:

```tsx
className="px-4 py-3"
```

Означает:

```text
горизонтальный внутренний отступ 16px
вертикальный внутренний отступ 12px
```

Если кнопка кажется слишком маленькой:

```tsx
px-4 py-3
```

можно заменить на:

```tsx
px-6 py-3
```

или:

```tsx
px-8 py-4
```

## 8. Как менять ширину контейнера

В проекте часто используется:

```tsx
max-w-[1264px]
```

Это максимальная ширина основного контента.

Пример из Header:

```tsx
<div className="mx-auto flex min-h-[88px] max-w-[1264px] items-center gap-4 px-4 py-4">
```

Расшифровка:

```text
mx-auto        центрирует блок по горизонтали
flex           включает flexbox
min-h-[88px]   минимальная высота 88px
max-w-[1264px] максимальная ширина 1264px
items-center   выравнивание по вертикали
gap-4          расстояние между элементами
px-4           горизонтальные внутренние отступы
py-4           вертикальные внутренние отступы
```

Если хочется шире:

```tsx
max-w-[1264px]
```

можно заменить на:

```tsx
max-w-[1320px]
```

Но лучше делать это одинаково во всех основных секциях.

## 9. Flexbox в Tailwind

Flex используется для выравнивания элементов в строку или колонку.

Пример:

```tsx
className="flex items-center gap-3"
```

Расшифровка:

```text
flex          элементы становятся в строку
items-center выравнивание по вертикали
gap-3        расстояние между элементами
```

Пример из логотипа:

```tsx
<a className="flex shrink-0 items-center gap-3">
```

Значит:

```text
логотип и текст стоят рядом
они выровнены по центру
между ними есть отступ
логотип не сжимается
```

## 10. Grid в Tailwind

Grid используется для сеток.

Пример:

```tsx
className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
```

Расшифровка:

```text
grid          включить CSS Grid
gap-5         расстояние между карточками
sm:grid-cols-2 на маленьких экранах 2 колонки
lg:grid-cols-4 на больших экранах 4 колонки
```

Так сделаны категории и товары на главной странице.

Если хочешь больше карточек в ряд:

```tsx
lg:grid-cols-4
```

можно заменить на:

```tsx
lg:grid-cols-5
```

Но тогда карточки станут уже.

## 11. Адаптивность

Tailwind использует префиксы:

```text
sm:
md:
lg:
xl:
```

Пример:

```tsx
className="hidden md:flex"
```

Значит:

```text
по умолчанию скрыто
на md-экранах и больше становится flex
```

Пример из Header:

```tsx
<form className="hidden h-12 ... md:flex">
```

Значит:

```text
на мобильных поиск в верхней строке скрыт
на планшетах и десктопах поиск показывается
```

Для мобильных ниже есть отдельный поиск:

```tsx
<div className="border-t border-slate-100 px-4 py-3 md:hidden">
```

`md:hidden` значит:

```text
на md и больше скрыть
```

## 12. Как устроен Header

Файл:

```text
apps/client/src/components/layout/Header.tsx
```

Основные части:

```text
mainCategories
TechMarketLogo
HeaderIconButton
Header
```

### mainCategories

```tsx
const mainCategories = [
  "Ноутбуки и компьютеры",
  "Комплектующие",
  ...
];
```

Это временный список категорий.

Чтобы изменить категории в шапке, меняй этот массив.

Позже он будет заменен на данные с backend:

```text
GET /api/categories/tree
```

### TechMarketLogo

```tsx
function TechMarketLogo() { ... }
```

Отвечает только за логотип.

Если хочешь поменять текст логотипа:

```tsx
TechMarket
```

Если хочешь поменять цвет:

```tsx
text-teal-800
```

можно заменить на:

```tsx
text-teal-900
```

### HeaderIconButton

```tsx
function HeaderIconButton({ label, children, badge }) { ... }
```

Это универсальная кнопка для иконок.

Пример использования:

```tsx
<HeaderIconButton label="Уведомления" badge={3}>
  <Bell className="h-5 w-5" />
</HeaderIconButton>
```

Если `badge={3}`, появится маленький кружок с цифрой.

Если `badge` убрать, кружка не будет.

### Header

```tsx
export function Header() { ... }
```

Это главный компонент шапки.

Он содержит:

```text
логотип
поиск
иконки действий
корзину
навигацию категорий
мобильный поиск
```

## 13. Как устроен Footer

Файл:

```text
apps/client/src/components/layout/Footer.tsx
```

В начале:

```tsx
const footerSections = [...]
```

Это массив колонок футера.

Чтобы добавить новую ссылку:

```tsx
links: ["Доставка", "Оплата", "Гарантия", "Возврат"]
```

можно заменить на:

```tsx
links: ["Доставка", "Оплата", "Гарантия", "Возврат", "Самовывоз"]
```

Footer рендерит ссылки через:

```tsx
footerSections.map(...)
```

## 14. Как устроен MainLayout

Файл:

```text
apps/client/src/components/layout/MainLayout.tsx
```

Код:

```tsx
<Header />
<main>
  <Outlet />
</main>
<Footer />
```

`Outlet` — место, куда React Router вставляет текущую страницу.

Например:

```text
/        -> HomePage
/catalog -> CatalogPage
/cart    -> CartPage
```

Все эти страницы будут иметь одну и ту же шапку и футер.

## 15. Как устроена HomePage

Файл:

```text
apps/client/src/pages/home/HomePage.tsx
```

Основные части:

```text
categoryCards
productCards
DeviceMockup
HomePage
```

### categoryCards

Временные данные популярных категорий:

```tsx
const categoryCards = [
  { title: "Ноутбуки", description: "Для учебы, работы и игр", icon: Laptop },
  ...
];
```

Чтобы поменять название:

```tsx
title: "Ноутбуки"
```

Чтобы поменять описание:

```tsx
description: "Для учебы, работы и игр"
```

Чтобы поменять иконку:

```tsx
icon: Laptop
```

На другую из lucide-react, например:

```tsx
icon: Smartphone
```

### productCards

Временные товары:

```tsx
const productCards = [
  { brand: "Lenovo", title: "Lenovo IdeaPad 5 16", price: "2 599 BYN" },
  ...
];
```

Чтобы изменить цену:

```tsx
price: "2 599 BYN"
```

Чтобы включить красный ярлык акции:

```tsx
promo: true
```

Чтобы убрать ярлык, удали:

```tsx
promo: true
```

### DeviceMockup

```tsx
function DeviceMockup() { ... }
```

Это временная CSS-картинка ноутбука.

Позже она будет заменена на реальные изображения:

```tsx
<img src={product.images[0]} />
```

## 16. Как работает `map`

В React часто нужно из массива сделать список элементов.

Пример:

```tsx
{productCards.map((product) => (
  <article key={product.title}>
    {product.title}
  </article>
))}
```

Это значит:

```text
для каждого товара из productCards создать карточку
```

`key` нужен React, чтобы отличать элементы друг от друга.

## 17. Как работает условный рендеринг

Пример:

```tsx
{product.promo ? (
  <span>Акция</span>
) : null}
```

Это значит:

```text
если product.promo true — показать Акция
если false или undefined — ничего не показывать
```

Так можно включать и выключать части интерфейса.

## 18. Где менять дизайн шапки

Файл:

```text
Header.tsx
```

### Высота шапки

Ищи:

```tsx
min-h-[88px]
lg:min-h-[106px]
```

Можно сделать ниже:

```tsx
min-h-[76px]
lg:min-h-[92px]
```

### Ширина контента

Ищи:

```tsx
max-w-[1264px]
```

Можно изменить на:

```tsx
max-w-[1320px]
```

### Цвет кнопки корзины

Ищи:

```tsx
bg-teal-700
hover:bg-teal-800
```

Можно заменить на синий:

```tsx
bg-blue-700
hover:bg-blue-800
```

## 19. Где менять дизайн карточек товаров

Файл:

```text
HomePage.tsx
```

### Высота карточки

Ищи:

```tsx
min-h-[330px]
```

Можно сделать выше:

```tsx
min-h-[360px]
```

### Количество колонок

Ищи:

```tsx
lg:grid-cols-4
```

Можно сделать 5 колонок:

```tsx
lg:grid-cols-5
```

Но карточки станут уже.

### Цвет кнопки

Ищи:

```tsx
bg-teal-700
hover:bg-teal-800
```

## 20. Где менять hero-блок

Файл:

```text
HomePage.tsx
```

Hero начинается с комментария:

```tsx
{/* Hero задает первый визуальный акцент главной страницы ... */}
```

### Высота hero

Ищи:

```tsx
md:h-[284px]
```

Можно сделать выше:

```tsx
md:h-[340px]
```

### Цвет фона

Ищи:

```tsx
bg-blue-100
```

Можно заменить:

```tsx
bg-slate-100
bg-teal-50
```

### Скругление

Ищи:

```tsx
rounded-[28px]
```

Можно сделать меньше:

```tsx
rounded-2xl
```

## 21. Как безопасно редактировать дизайн

Правило:

```text
Меняй по одному блоку и сразу проверяй в браузере.
```

Например:

1. Изменил цвет кнопки.
2. Сохранил файл.
3. Посмотрел браузер.
4. Если хорошо — идешь дальше.

Не меняй сразу 20 классов, иначе будет сложно понять, что именно сломало дизайн.

## 22. Как проверять после изменений

Запуск:

```powershell
cd C:\TechMarket\apps\client
npm.cmd run dev
```

Проверка сборки:

```powershell
npm.cmd run build
```

Если `build` проходит, значит TypeScript и Vite не нашли критических ошибок.

## 23. Частые ошибки

### Ошибка: JSX element implicitly has type...

Обычно проблема с типами или импортом.

### Ошибка: Cannot find module...

Значит не установлен пакет или неправильный путь импорта.

### Страница пустая

Проверить:

```text
router.tsx
MainLayout.tsx
Outlet
HomePage import
```

### Стили не работают

Проверить:

```text
index.css содержит @import "tailwindcss";
vite.config.ts содержит tailwindcss()
```

## 24. Ближайшие улучшения дизайна

После базового layout можно улучшать:

- реальные изображения товаров;
- sticky header;
- аккуратное мобильное меню;
- hover-состояния карточек;
- скелетоны загрузки;
- отдельный компонент `ProductCard`;
- отдельный компонент `CategoryCard`;
- страницу каталога;
- API-подключение товаров.

## 25. Главное правило

Если хочешь изменить внешний вид, сначала ищи:

```text
className="..."
```

Большинство дизайна сейчас управляется именно Tailwind-классами внутри `className`.

React отвечает за структуру и данные.

Tailwind отвечает за внешний вид.
