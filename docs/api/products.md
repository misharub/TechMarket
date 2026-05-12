# API товаров

## GET /products

Возвращает постраничный список товаров с брендом, категорией и рейтингом.

## Query-параметры

- `search` — поиск по названию, описанию, SKU и бренду.
- `categoryId` — точная фильтрация по id категории.
- `categorySlug` — фильтрация по slug категории; включает выбранную категорию и все дочерние категории.
- `brandId` — фильтр по id бренда.
- `priceFrom` — минимальная цена.
- `priceTo` — максимальная цена.
- `inStock=true` — только товары со `stock > 0`.
- `includeInactive=true` — включая скрытые товары.
- `page` — страница, по умолчанию `1`.
- `limit` — размер страницы, по умолчанию `12`, максимум `48`.
- `sort` — `newest`, `priceAsc`, `priceDesc`, `titleAsc`.

## Ответ

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 12,
  "pages": 0
}
```

Каждый товар содержит основные поля товара, `category`, `brand` и `rating`.

## Примеры

- `/api/products?limit=12&sort=newest`
- `/api/products?categorySlug=laptops-computers&inStock=true`
- `/api/products?search=lenovo&priceFrom=1000&priceTo=4000`
