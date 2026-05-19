import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ChevronLeft, ChevronRight, Heart, Scale, ShoppingCart, Star, Store, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAddToCart } from "../../lib/cart-hooks";
import { getProductBySlug, resolveUploadUrl } from "../../lib/products-api";
import { getSpecificationTemplateByCategory } from "../../lib/specification-templates-api";
import "./ProductPage.css";

const currencyFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

export function ProductPage() {
  const { slug = "" } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
  const product = productQuery.data;
  const { addProduct, isPending } = useAddToCart();
  const templateQuery = useQuery({
    queryKey: ["product", "specification_template", product?.categoryId],
    queryFn: () => getSpecificationTemplateByCategory(product!.categoryId),
    enabled: Boolean(product?.categoryId),
  });
  const groupedSpecs = useMemo(() => {
    if (!product) {
      return [];
    }

    return (templateQuery.data?.groups ?? [])
      .map((group) => ({
        id: group.id,
        name: group.name,
        sortOrder: group.sortOrder,
        items: group.specifications
          .map((spec) => {
            const rawValue = product.specs[spec.key];

            if (rawValue === undefined || rawValue === null || rawValue === "") {
              return null;
            }

            return {
              label: spec.name,
              value:
                typeof rawValue === "boolean"
                  ? rawValue
                    ? "Да"
                    : "Нет"
                  : `${rawValue}${spec.unit ? ` ${spec.unit}` : ""}`,
              sortOrder: spec.sortOrder,
            };
          })
          .filter((spec): spec is { label: string; value: string; sortOrder: number } => spec !== null)
          .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label)),
      }))
      .filter((group) => group.items.length > 0)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
  }, [product, templateQuery.data]);

  if (productQuery.isLoading) {
    return (
      <main className="product_page">
        <p>Загрузка товара...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product_page">
        <p>Товар не найден.</p>
      </main>
    );
  }

  const images = product.images.map(resolveUploadUrl).filter((image): image is string => Boolean(image));
  const activeImage = images[activeImageIndex] ?? images[0] ?? null;
  const showGalleryArrows = images.length > 1;
  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
  };
  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % images.length);
  };

  return (
    <main className="product_page">
      <div className="product_page_inner">
        <nav className="product_page_breadcrumbs" aria-label="Навигация">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          <span>/</span>
          <Link to={`/catalog/${product.category.slug}`}>{product.category.name}</Link>
        </nav>

        <section className="product_page_hero">
          <div className="product_page_gallery">
            <div className="product_page_media">
              {showGalleryArrows ? (
                <button
                  className="product_page_gallery_arrow product_page_gallery_arrow__prev"
                  type="button"
                  aria-label="Предыдущее фото"
                  onClick={showPreviousImage}
                >
                  <ChevronLeft />
                </button>
              ) : null}
              {activeImage ? <img src={activeImage} alt={product.title} /> : <span>{product.brand.name.slice(0, 2).toUpperCase()}</span>}
              {showGalleryArrows ? (
                <button
                  className="product_page_gallery_arrow product_page_gallery_arrow__next"
                  type="button"
                  aria-label="Следующее фото"
                  onClick={showNextImage}
                >
                  <ChevronRight />
                </button>
              ) : null}
            </div>
            {images.length > 1 ? (
              <div className="product_page_thumbnails" aria-label="Изображения товара">
                {images.map((image, index) => (
                  <button
                    className={index === activeImageIndex ? "product_page_thumbnail product_page_thumbnail__active" : "product_page_thumbnail"}
                    key={image}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product_page_summary">
            <div className="product_page_kicker">
              <span>{product.brand.name}</span>
              <span>{product.stock > 0 ? "В наличии" : "Под заказ"}</span>
            </div>
            <h1>{product.title}</h1>
            {product.shortDescription ? <p className="product_page_short">{product.shortDescription}</p> : null}

            <div className="product_page_rating">
              <Star />
              <strong>{product.rating.count ? product.rating.average.toFixed(1) : "Нет оценок"}</strong>
              {product.rating.count ? <span>{product.rating.count} отзывов</span> : null}
            </div>

            <div className="product_page_buybox">
              <div>
                {product.oldPrice ? <span>{currencyFormatter.format(Number(product.oldPrice))}</span> : null}
                <strong>{currencyFormatter.format(Number(product.price))}</strong>
              </div>
              <button type="button" disabled={product.stock <= 0 || isPending} onClick={() => void addProduct(product)}>
                <ShoppingCart />
                {isPending ? "Добавляем..." : "В корзину"}
              </button>
            </div>

            <div className="product_page_perks">
              <article>
                <Truck />
                <div>
                  <strong>Доставка по Минску</strong>
                  <span>Курьером или до пункта выдачи</span>
                </div>
              </article>
              <article>
                <Store />
                <div>
                  <strong>Самовывоз</strong>
                  <span>Можно забрать из магазина</span>
                </div>
              </article>
              <article>
                <BadgeCheck />
                <div>
                  <strong>Официальная гарантия</strong>
                  <span>Проверка перед выдачей</span>
                </div>
              </article>
            </div>

            <div className="product_page_meta">
              <span>Код товара: {product.sku}</span>
              <button type="button">
                <Heart />
                В избранное
              </button>
              <button type="button">
                <Scale />
                Сравнить
              </button>
            </div>
          </div>
        </section>

        <section className="product_page_description">
          <h2>Описание</h2>
          <p>{product.description}</p>
        </section>

        <section className="product_page_specs">
          <h2>Характеристики</h2>
          <div className="product_page_specs_groups">
            {groupedSpecs.map((group) => (
              <div className="product_page_specs_group" key={group.id}>
                <h3>{group.name}</h3>
                <dl>
                  {group.items.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            {product.additionalSpecs.length ? (
              <div className="product_page_specs_group">
                <h3>Дополнительно</h3>
                <dl>
                  {product.additionalSpecs.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
