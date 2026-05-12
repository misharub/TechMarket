import { Scale, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { resolveUploadUrl, type Product } from "../../lib/products-api";
import "./ProductCard.css";

const currencyFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

export function productHref(product: Product) {
  return `/product/${product.slug}`;
}

export function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

export function formatPrice(value: string | number | null | undefined) {
  return currencyFormatter.format(toNumber(value));
}

export function getDiscountPercent(product: Product) {
  const price = toNumber(product.price);
  const oldPrice = toNumber(product.oldPrice);

  if (!oldPrice || oldPrice <= price) {
    return null;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function ProductImage({ product }: { product: Product }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveUploadUrl(product.images[0]);
  const canShowImage = imageUrl && !hasImageError;
  const fallbackLabel = product.brand?.name ?? product.category?.name ?? "TechMarket";

  if (!canShowImage) {
    return (
      <div className="product-card_placeholder" aria-hidden="true">
        <span>{fallbackLabel.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      className="product-card_image"
      src={imageUrl}
      alt={product.title}
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  );
}

export function ProductCard({ product, view = "grid" }: { product: Product; view?: "grid" | "compact" }) {
  const discountPercent = getDiscountPercent(product);
  const hasRating = product.rating.count > 0;

  return (
    <article className={`product-card product-card--${view}`}>
      <a className="product-card_media" href={productHref(product)} aria-label={product.title}>
        {discountPercent ? <span className="product-card_badge">-{discountPercent}%</span> : null}
        <ProductImage product={product} />
      </a>

      <div className="product-card_body">
        <div className="product-card_meta">
          <span>{product.brand.name}</span>
          <span className={product.stock > 0 ? "product-card_stock" : "product-card_stock product-card_stock--empty"}>
            {product.stock > 0 ? "В наличии" : "Под заказ"}
          </span>
        </div>

        <a className="product-card_title" href={productHref(product)}>
          {product.title}
        </a>

        <div className="product-card_rating" aria-label={`Рейтинг ${product.rating.average}`}>
          <Star className="product-card_star" />
          <span>{hasRating ? product.rating.average.toFixed(1) : "Нет оценок"}</span>
          {hasRating ? <span className="product-card_reviews">{product.rating.count} отзыв.</span> : null}
        </div>

        <div className="product-card_price-row">
          <strong className="product-card_price">{formatPrice(product.price)}</strong>
          {product.oldPrice ? <span className="product-card_old-price">{formatPrice(product.oldPrice)}</span> : null}
        </div>

        <div className="product-card_actions">
          <button className="product-card_cart" type="button">
            <ShoppingCart className="product-card_action-icon" />
            <span>В корзину</span>
          </button>
          <button className="product-card_compare" type="button" aria-label={`Сравнить ${product.title}`}>
            <Scale className="product-card_action-icon" />
          </button>
        </div>
      </div>
    </article>
  );
}
