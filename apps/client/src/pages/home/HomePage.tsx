import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  CreditCard,
  PackageCheck,
  Sparkles,
  TrendingDown,
  Truck,
} from "lucide-react";
import { useMemo } from "react";
import { ProductCard, formatPrice, productHref, toNumber } from "../../components/product/ProductCard";
import { getCategoryTree, type CategoryNode } from "../../lib/categories-api";
import { getProducts, type Product, type ProductListResponse } from "../../lib/products-api";
import "./HomePage.css";

function categoryHref(category: CategoryNode) {
  return `/catalog/${category.slug}`;
}

function takeItems(response: ProductListResponse | undefined, limit: number) {
  return response?.items.slice(0, limit) ?? [];
}

function ProductSkeletons() {
  return (
    <div className="home_products_grid" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="home_product_skeleton" key={index}>
          <div className="home_skeleton_media" />
          <div className="home_skeleton_line home_skeleton_line__wide" />
          <div className="home_skeleton_line" />
          <div className="home_skeleton_line home_skeleton_line__short" />
        </div>
      ))}
    </div>
  );
}

function CategorySkeletons() {
  return (
    <div className="home_categories_grid" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="home_category_skeleton" key={index} />
      ))}
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  isLoading,
  isError,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  isLoading: boolean;
  isError: boolean;
}) {
  const headingId = `home_product_section_${title.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <section className="home_section" aria-labelledby={headingId}>
      <div className="home_section_heading">
        <div>
          <h2 id={headingId}>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <a className="home_section_link" href="/catalog">
          Все товары
          <ArrowRight className="home_section_link_icon" />
        </a>
      </div>

      {isLoading ? <ProductSkeletons /> : null}

      {!isLoading && isError ? (
        <div className="home_state home_state__error" role="status">
          Не удалось загрузить товары. Проверьте, что backend запущен.
        </div>
      ) : null}

      {!isLoading && !isError && products.length === 0 ? (
        <div className="home_state" role="status">
          В этой подборке пока нет товаров.
        </div>
      ) : null}

      {!isLoading && !isError && products.length > 0 ? (
        <div className="home_products_grid">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function QuickCategories({
  categories,
  isLoading,
  isError,
}: {
  categories: CategoryNode[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <section className="home_categories" aria-labelledby="home_categories_heading">
      <div className="home_section_heading">
        <div>
          <h2 id="home_categories_heading">Популярные разделы</h2>
          <p>Быстрый переход к основным категориям каталога.</p>
        </div>
      </div>

      {isLoading ? <CategorySkeletons /> : null}

      {!isLoading && isError ? (
        <div className="home_state home_state__error" role="status">
          Категории временно недоступны.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div className="home_categories_grid">
          {categories.slice(0, 8).map((category) => (
            <a className="home_category_card" href={categoryHref(category)} key={category.id}>
              <span className="home_category_name">{category.name}</span>
              <span className="home_category_count">{category.children.length} подразделов</span>
              <ArrowRight className="home_category_icon" />
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SmartRail({ categories, product }: { categories: CategoryNode[]; product: Product | undefined }) {
  return (
    <div className="home_smart_rail" aria-label="Быстрые предложения">
      <a className="home_smart_card home_smart_card__deal" href={product ? productHref(product) : "/catalog"}>
        <span className="home_smart_icon">
          <TrendingDown />
        </span>
        <span>
          <strong>{product ? "Выгодно сейчас" : "Скидки недели"}</strong>
          <small>{product ? `${formatPrice(product.price)} на актуальный товар` : "Подборка появится после загрузки API"}</small>
        </span>
      </a>
      {categories.slice(0, 3).map((category) => (
        <a className="home_smart_card" href={categoryHref(category)} key={category.id}>
          <span>
            <strong>{category.name}</strong>
            <small>Открыть раздел</small>
          </span>
          <ArrowRight />
        </a>
      ))}
    </div>
  );
}

function HomeHero({ categories, featuredProduct }: { categories: CategoryNode[]; featuredProduct: Product | undefined }) {
  return (
    <section className="home_hero">
      <div className="home_hero_main">
        <span className="home_hero_kicker">
          <Sparkles className="home_hero_kicker_icon" />
          Умная витрина TechMarket
        </span>
        <h1>Техника для работы, учебы и дома без лишнего шума</h1>
        <p>
          Главная собирает категории, новинки и скидки прямо из API. Видны наличие, цена, рейтинг и быстрый переход в каталог.
        </p>
        <div className="home_hero_actions">
          <a className="home_hero_primary" href="/catalog">
            Перейти в каталог
            <ArrowRight className="home_hero_action_icon" />
          </a>
          {categories[0] ? (
            <a className="home_hero_secondary" href={categoryHref(categories[0])}>
              {categories[0].name}
            </a>
          ) : null}
        </div>
        <div className="home_hero_metrics" aria-label="Показатели витрины">
          <span>
            <strong>{categories.length || "API"}</strong>
            разделов
          </span>
          <span>
            <strong>{featuredProduct ? formatPrice(featuredProduct.price) : "BYN"}</strong>
            выгодное предложение
          </span>
        </div>
      </div>

      <aside className="home_hero_panel" aria-label="Акционное предложение">
        <div className="home_hero_panel_top">
          <BadgePercent className="home_hero_panel_icon" />
          <span>Price watch</span>
        </div>
        <strong>{featuredProduct ? featuredProduct.title : "Подборка товаров со старой ценой"}</strong>
        <p>
          {featuredProduct
            ? `${formatPrice(featuredProduct.price)} в наличии. Старая цена учитывается автоматически.`
            : "Запустите API, чтобы увидеть актуальные товары и скидки."}
        </p>
        <a href={featuredProduct ? productHref(featuredProduct) : "/catalog"}>Смотреть предложение</a>
      </aside>

      <SmartRail categories={categories} product={featuredProduct} />
    </section>
  );
}

function Benefits() {
  return (
    <section className="home_benefits" aria-label="Преимущества TechMarket">
      <div className="home_benefit">
        <Truck className="home_benefit_icon" />
        <span>Доставка по Минску</span>
      </div>
      <div className="home_benefit">
        <PackageCheck className="home_benefit_icon" />
        <span>Самовывоз из магазина</span>
      </div>
      <div className="home_benefit">
        <CreditCard className="home_benefit_icon" />
        <span>Оплата картой или при получении</span>
      </div>
      <div className="home_benefit">
        <CheckCircle2 className="home_benefit_icon" />
        <span>Официальная гарантия</span>
      </div>
    </section>
  );
}

export function HomePage() {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories", "tree", "home"],
    queryFn: getCategoryTree,
  });

  const newestQuery = useQuery({
    queryKey: ["products", "home", "newest"],
    queryFn: () => getProducts({ limit: 8, sort: "newest", inStock: true }),
  });

  const featuredQuery = useQuery({
    queryKey: ["products", "home", "featured"],
    queryFn: () => getProducts({ limit: 8, sort: "priceDesc", inStock: true }),
  });

  const discountSourceQuery = useQuery({
    queryKey: ["products", "home", "discounts"],
    queryFn: () => getProducts({ limit: 24, sort: "newest", inStock: true }),
  });

  const discountProducts = useMemo(
    () =>
      takeItems(discountSourceQuery.data, 24)
        .filter((product) => toNumber(product.oldPrice) > toNumber(product.price))
        .slice(0, 8),
    [discountSourceQuery.data],
  );

  const featuredProduct = discountProducts[0] ?? featuredQuery.data?.items[0];

  return (
    <main className="home">
      <div className="home_inner">
        <HomeHero categories={categories} featuredProduct={featuredProduct} />
        <Benefits />
        <QuickCategories categories={categories} isLoading={categoriesLoading} isError={categoriesError} />
        <ProductSection
          title="Новинки каталога"
          subtitle="Свежие позиции, которые только появились в TechMarket."
          products={takeItems(newestQuery.data, 8)}
          isLoading={newestQuery.isLoading}
          isError={newestQuery.isError}
        />
        <ProductSection
          title="Скидки недели"
          subtitle="Товары с выгодной старой ценой из актуального каталога."
          products={discountProducts}
          isLoading={discountSourceQuery.isLoading}
          isError={discountSourceQuery.isError}
        />
        <ProductSection
          title="Премиальная техника"
          subtitle="Флагманские модели для тех, кто выбирает максимум возможностей."
          products={takeItems(featuredQuery.data, 8)}
          isLoading={featuredQuery.isLoading}
          isError={featuredQuery.isError}
        />
      </div>
    </main>
  );
}
