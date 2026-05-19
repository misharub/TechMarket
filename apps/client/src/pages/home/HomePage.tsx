import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  PackageCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useMemo } from "react";
import heroImage from "../../assets/hero.png";
import { ProductCard, toNumber } from "../../components/product/ProductCard";
import { getCategoryTree, type CategoryNode } from "../../lib/categories-api";
import { getHomeSlider, type HomeSlider } from "../../lib/home-slider-api";
import { getProducts, resolveUploadUrl, type Product, type ProductListResponse } from "../../lib/products-api";
import "./HomePage.css";

const defaultHomeSlider: HomeSlider = {
  id: "default",
  kicker: "Умная витрина TechMarket",
  title: "Техника для работы, учебы и дома без лишнего шума",
  description:
    "Главная собирает категории, новинки и скидки прямо из API. Видны наличие, цена, рейтинг и быстрый переход в каталог.",
  primaryText: null,
  primaryLabel: null,
  secondaryText: null,
  secondaryLabel: null,
  panelKicker: "Price watch",
  panelTitle: "Подборка товаров со старой ценой",
  panelDescription: "Запустите API, чтобы увидеть актуальные товары и скидки.",
  imageUrl: null,
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

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

function HomeHero({ slider }: { slider: HomeSlider }) {
  const resolvedImage = resolveUploadUrl(slider.imageUrl) ?? heroImage;

  return (
    <section className="home_hero">
      <div className="home_hero_content">
        <span className="home_hero_kicker">
          <Sparkles className="home_hero_kicker_icon" />
          {slider.kicker}
        </span>
        <h1>{slider.title}</h1>
        <p>{slider.description}</p>
      </div>
      <div className="home_hero_media" aria-hidden="true">
        <img src={resolvedImage} alt="" />
      </div>
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

  const sliderQuery = useQuery({
    queryKey: ["home-slider"],
    queryFn: getHomeSlider,
  });

  return (
    <main className="home">
      <div className="home_inner">
        <HomeHero slider={sliderQuery.data ?? defaultHomeSlider} />
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
