import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BatteryCharging,
  BookOpen,
  Briefcase,
  Cable,
  Camera,
  Cctv,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cpu,
  Drone,
  Filter,
  Gamepad2,
  HardDrive,
  Headphones,
  Home,
  Laptop,
  Lightbulb,
  Monitor,
  Mouse,
  Package,
  Plug,
  Printer,
  Projector,
  Refrigerator,
  RotateCcw,
  Search,
  Server,
  SlidersHorizontal,
  Smartphone,
  Speaker,
  Sprout,
  Tablet,
  Tv,
  Video,
  WashingMachine,
  Watch,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "../../components/product/ProductCard";
import { getBrands } from "../../lib/brands-api";
import { getCategoryTree, type CategoryNode } from "../../lib/categories-api";
import { getProducts, type ProductSort } from "../../lib/products-api";
import "./CatalogPage.css";

const catalogLimit = 12;

const sortLabels: Record<ProductSort, string> = {
  newest: "Сначала новинки",
  priceAsc: "Сначала дешевле",
  priceDesc: "Сначала дороже",
  titleAsc: "По названию",
};

const categoryIconBySlug: Record<string, typeof Laptop> = {
  "laptops-computers": Laptop,
  notebooks: Laptop,
  "gaming-notebooks": Gamepad2,
  "business-notebooks": Briefcase,
  "home-notebooks": Laptop,
  "apple-macbook": Laptop,
  "desktop-computers": Monitor,
  "gaming-pcs": Gamepad2,
  "office-pcs": Briefcase,
  "all-in-one-pcs": Monitor,
  "mini-pcs": Cpu,
  "servers-components": Server,
  servers: Server,
  "server-drives": HardDrive,
  "server-memory": Cpu,
  "network-cards": Cpu,
  "server-ups": BatteryCharging,
  tablets: Tablet,
  "apple-ipad": Tablet,
  "samsung-tablets": Tablet,
  "lenovo-tablets": Tablet,
  "xiaomi-tablets": Tablet,
  "graphics-tablets": Tablet,
  "e-readers": BookOpen,
  "kindle-e-readers": BookOpen,
  "pocketbook-e-readers": BookOpen,
  accessories: Cable,
  "notebook-accessories": Mouse,
  "tablet-accessories": Tablet,
  "phone-watch-accessories": Smartphone,
  "cables-power": Cable,
  "usb-cables": Cable,
  "usb-c-cables": Cable,
  "hdmi-cables": Cable,
  chargers: Plug,
  adapters: Plug,
  consumables: Printer,
  "printer-cartridges": Printer,
  "printer-toners": Printer,
  "phones-smartwatch": Smartphone,
  smartphones: Smartphone,
  "apple-iphone": Smartphone,
  "samsung-galaxy": Smartphone,
  "xiaomi-smartphones": Smartphone,
  "5g-smartphones": Smartphone,
  smartwatches: Watch,
  "sport-watches": Watch,
  "fitness-bands": Watch,
  "phone-accessories": Headphones,
  "phone-headphones": Headphones,
  "accessory-phone-headphones": Headphones,
  powerbanks: BatteryCharging,
  "accessory-powerbanks": BatteryCharging,
  "home-appliances": Home,
  "kitchen-appliances": Refrigerator,
  refrigerators: Refrigerator,
  dishwashers: WashingMachine,
  microwaves: Package,
  blenders: Package,
  "electric-kettles": Coffee,
  "air-fryers": Package,
  "home-care-appliances": WashingMachine,
  "washing-machines": WashingMachine,
  dryers: WashingMachine,
  "vacuum-cleaners": Home,
  "robot-vacuums": Home,
  "personal-care": Package,
  "coffee-equipment": Coffee,
  "coffee-machines": Coffee,
  "coffee-grinders": Coffee,
  "tv-audio": Tv,
  tvs: Tv,
  "budget-tvs": Tv,
  "4k-tvs": Tv,
  "oled-tvs": Tv,
  "qled-tvs": Tv,
  "smart-tv": Tv,
  "projectors-screens": Projector,
  projectors: Projector,
  audio: Speaker,
  soundbars: Speaker,
  speakers: Speaker,
  microphones: Speaker,
  "rtv-accessories": Cable,
  "smart-home": Lightbulb,
  "intelligent-home": Lightbulb,
  "security-cameras": Cctv,
  "smart-lighting": Lightbulb,
  "video-doorbells": Cctv,
  "voice-assistants": Speaker,
  sensors: Lightbulb,
  "smart-garden": Sprout,
  "robot-lawn-mowers": Sprout,
  "watering-controllers": Sprout,
  "smart-rtv-agd": Home,
  "smart-robot-vacuums": Home,
  "photo-video": Camera,
  cameras: Camera,
  "compact-cameras": Camera,
  "mirrorless-cameras": Camera,
  "dslr-cameras": Camera,
  "video-cameras": Video,
  camcorders: Video,
  "action-cameras": Video,
  drones: Drone,
  "camera-drones": Drone,
  "dji-drones": Drone,
  "photo-accessories": Camera,
};

function findCategoryPath(categories: CategoryNode[], slug: string | undefined): CategoryNode[] {
  if (!slug) {
    return [];
  }

  for (const category of categories) {
    if (category.slug === slug) {
      return [category];
    }

    const childPath = findCategoryPath(category.children, slug);

    if (childPath.length > 0) {
      return [category, ...childPath];
    }
  }

  return [];
}

function getNumberParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getPage(searchParams: URLSearchParams) {
  const page = getNumberParam(searchParams, "page") ?? 1;

  return Math.max(1, page);
}

function getCategoryIcon(category: CategoryNode) {
  if (categoryIconBySlug[category.slug]) {
    return categoryIconBySlug[category.slug];
  }

  const slug = category.slug.toLowerCase();
  const name = category.name.toLowerCase();
  const value = `${slug} ${name}`;

  if (value.includes("ноут") || value.includes("laptop") || value.includes("notebook")) return Laptop;
  if (value.includes("смартф") || value.includes("phone") || value.includes("iphone") || value.includes("galaxy")) return Smartphone;
  if (value.includes("час") || value.includes("watch")) return Watch;
  if (value.includes("планш") || value.includes("tablet") || value.includes("ipad")) return Tablet;
  if (value.includes("сервер") || value.includes("server")) return Server;
  if (value.includes("комп") || value.includes("pc") || value.includes("monitor")) return Monitor;
  if (value.includes("тв") || value.includes("tv") || value.includes("телевиз")) return Tv;
  if (value.includes("камер") || value.includes("camera") || value.includes("фото")) return Camera;
  if (value.includes("видео") || value.includes("video")) return Video;
  if (value.includes("дрон") || value.includes("drone")) return Drone;
  if (value.includes("науш") || value.includes("audio") || value.includes("sound")) return Headphones;
  if (value.includes("кабель") || value.includes("cable") || value.includes("hdmi") || value.includes("usb")) return Cable;
  if (value.includes("заряд") || value.includes("power") || value.includes("battery")) return BatteryCharging;
  if (value.includes("кофе") || value.includes("coffee")) return Coffee;
  if (value.includes("холод") || value.includes("refrigerator")) return Refrigerator;
  if (value.includes("стир") || value.includes("посуд") || value.includes("washing") || value.includes("dryer")) return WashingMachine;
  if (value.includes("умн") || value.includes("smart") || value.includes("light")) return Lightbulb;

  return Package;
}

function CategoryVisual({ category, size = "large" }: { category: CategoryNode; size?: "large" | "small" }) {
  const Icon = getCategoryIcon(category);

  return (
    <span className={`catalog-page_category-visual catalog-page_category-visual--${size}`} aria-hidden="true">
      <Icon />
    </span>
  );
}

function CatalogSkeletons() {
  return (
    <div className="catalog-page_grid" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="catalog-page_skeleton-card" key={index}>
          <div className="catalog-page_skeleton-media" />
          <div className="catalog-page_skeleton-line catalog-page_skeleton-line--wide" />
          <div className="catalog-page_skeleton-line" />
          <div className="catalog-page_skeleton-line catalog-page_skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

function CategoryTile({ category, kind = "catalog" }: { category: CategoryNode; kind?: "catalog" | "subcategory" }) {
  return (
    <a className={`catalog-page_category-card catalog-page_category-card--${kind}`} href={`/catalog/${category.slug}`}>
      <CategoryVisual category={category} size={kind === "catalog" ? "large" : "small"} />
      <span>{category.name}</span>
    </a>
  );
}

function CategoryState({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "error" }) {
  return (
    <div className={`catalog-page_state ${tone === "error" ? "catalog-page_state--error" : ""}`} role="status">
      {children}
    </div>
  );
}

export function CatalogPage() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") ?? "";
  const brandSlug = searchParams.get("brand") ?? "";
  const priceFrom = getNumberParam(searchParams, "priceFrom");
  const priceTo = getNumberParam(searchParams, "priceTo");
  const inStock = searchParams.get("inStock") === "true";
  const sort = (searchParams.get("sort") as ProductSort | null) ?? "newest";
  const page = getPage(searchParams);

  const categoriesQuery = useQuery({
    queryKey: ["categories", "tree", "catalog"],
    queryFn: getCategoryTree,
  });

  const categories = categoriesQuery.data ?? [];
  const activePath = useMemo(() => findCategoryPath(categories, categorySlug), [categories, categorySlug]);
  const activeCategory = activePath[activePath.length - 1];
  const rootCategory = activePath[0];
  const isCatalogRoot = !categorySlug;
  const isKnownCategory = !categorySlug || Boolean(activeCategory);
  const isRootCategoryLanding = Boolean(activeCategory && activePath.length === 1 && activeCategory.children.length > 0);
  const isProductListing = Boolean(activeCategory && !isRootCategoryLanding);

  const brandsQuery = useQuery({
    queryKey: ["brands", "catalog"],
    queryFn: () => getBrands(),
    enabled: isProductListing,
  });

  const brands = brandsQuery.data ?? [];
  const selectedBrand = brands.find((brand) => brand.slug === brandSlug);
  const brandId = brandSlug ? selectedBrand?.id ?? "__missing_brand__" : undefined;

  const productsQuery = useQuery({
    queryKey: ["products", "catalog", categorySlug, q, brandId, priceFrom, priceTo, inStock, sort, page],
    queryFn: () =>
      getProducts({
        search: q || undefined,
        categorySlug,
        brandId,
        priceFrom,
        priceTo,
        inStock: inStock || undefined,
        sort,
        page,
        limit: catalogLimit,
      }),
    enabled: isProductListing && (!brandSlug || !brandsQuery.isLoading),
  });

  const updateParams = (updates: Record<string, string | number | boolean | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (resetPage) {
      next.delete("page");
    }

    navigate({ pathname: categorySlug ? `/catalog/${categorySlug}` : "/catalog", search: next.toString() });
  };

  const resetFilters = () => {
    navigate(categorySlug ? `/catalog/${categorySlug}` : "/catalog");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateParams({ q: String(formData.get("q") ?? "").trim() });
  };

  const handlePriceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateParams({
      priceFrom: String(formData.get("priceFrom") ?? "").trim(),
      priceTo: String(formData.get("priceTo") ?? "").trim(),
    });
  };

  const total = productsQuery.data?.total ?? 0;
  const pages = productsQuery.data?.pages ?? 1;
  const products = productsQuery.data?.items ?? [];
  const activeFiltersCount = [q, brandSlug, priceFrom, priceTo, inStock].filter(Boolean).length;
  const title = activeCategory?.name ?? "Каталог";
  return (
    <main className="catalog-page">
      <div className="catalog-page_inner">
        <nav className="catalog-page_breadcrumbs" aria-label="Навигация">
          <a href="/">Главная</a>
          <ChevronRight />
          <a href="/catalog">Каталог</a>
          {activePath.map((category) => (
            <span className="catalog-page_breadcrumb-item" key={category.id}>
              <ChevronRight />
              <a href={`/catalog/${category.slug}`}>{category.name}</a>
            </span>
          ))}
        </nav>

        <section className="catalog-page_header">
          <div>
            <h1>{title}(<strong className="max-h-1">{productsQuery.isLoading ? "..." : total}</strong>)</h1>
          </div>
        </section>

        {categoriesQuery.isLoading ? (
          <div className="catalog-page_catalog-grid" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="catalog-page_category-card catalog-page_category-card--skeleton" key={index} />
            ))}
          </div>
        ) : null}

        {!categoriesQuery.isLoading && categoriesQuery.isError ? (
          <CategoryState tone="error">Категории временно недоступны. Проверьте, что backend запущен.</CategoryState>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && !isKnownCategory ? (
          <CategoryState>
            <strong>Раздел не найден</strong>
            <span>Вернитесь в общий каталог и выберите актуальную категорию.</span>
            <button type="button" onClick={() => navigate("/catalog")}>
              Открыть каталог
            </button>
          </CategoryState>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && isCatalogRoot ? (
          <section className="catalog-page_catalog-grid" aria-label="Основные разделы каталога">
            {categories.map((category) => (
              <CategoryTile category={category} key={category.id} />
            ))}
          </section>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && isRootCategoryLanding && activeCategory ? (
          <section className="catalog-page_category-layout">
            <aside className="catalog-page_side-nav" aria-label="Разделы каталога">
              <h2>Категории</h2>
              {categories.map((category) => (
                <a
                  className={
                    category.slug === rootCategory?.slug
                      ? "catalog-page_side-link catalog-page_side-link--active"
                      : "catalog-page_side-link"
                  }
                  href={`/catalog/${category.slug}`}
                  key={category.id}
                >
                  {category.name}
                </a>
              ))}
            </aside>

            <div className="catalog-page_subcategories">
              <div className="catalog-page_subcategory-grid">
                {activeCategory.children.map((category) => (
                  <CategoryTile category={category} kind="subcategory" key={category.id} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && isProductListing ? (
          <div className="catalog-page_layout">
            <aside className="catalog-page_filters" aria-label="Фильтры каталога">
              <div className="catalog-page_filters-title">
                <Filter />
                <span>Фильтры</span>
                {activeFiltersCount ? <b>{activeFiltersCount}</b> : null}
              </div>

              <form className="catalog-page_search" onSubmit={handleSearch}>
                <input name="q" type="search" placeholder="Поиск по товарам" defaultValue={q} />
                <button type="submit" aria-label="Искать">
                  <Search />
                </button>
              </form>

              <div className="catalog-page_filter-block">
                <h2>Бренд</h2>
                <select value={brandSlug} onChange={(event) => updateParams({ brand: event.target.value })}>
                  <option value="">Все бренды</option>
                  {brands.map((brand) => (
                    <option value={brand.slug} key={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <form className="catalog-page_filter-block" onSubmit={handlePriceSubmit}>
                <h2>Цена, BYN</h2>
                <div className="catalog-page_price-row">
                  <input name="priceFrom" type="number" min="0" placeholder="от" defaultValue={priceFrom ?? ""} />
                  <input name="priceTo" type="number" min="0" placeholder="до" defaultValue={priceTo ?? ""} />
                </div>
                <button className="catalog-page_apply" type="submit">
                  Применить
                </button>
              </form>

              <label className="catalog-page_check">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(event) => updateParams({ inStock: event.target.checked })}
                />
                <span>Только в наличии</span>
              </label>

              <button className="catalog-page_reset" type="button" onClick={resetFilters}>
                <RotateCcw />
                Сбросить фильтры
              </button>
            </aside>

            <section className="catalog-page_results" aria-labelledby="catalog-results-heading">
              <div className="catalog-page_toolbar">
                <div>
                  <h2 id="catalog-results-heading">{activeCategory?.name}</h2>
                  <p>{productsQuery.isError ? "Каталог временно недоступен" : null}</p>
                </div>
                <label className="catalog-page_sort">
                  <SlidersHorizontal />
                  <select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}>
                    {Object.entries(sortLabels).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {productsQuery.isLoading || productsQuery.isFetching ? <CatalogSkeletons /> : null}

              {!productsQuery.isLoading && !productsQuery.isFetching && productsQuery.isError ? (
                <CategoryState tone="error">Не удалось загрузить товары. Проверьте, что backend запущен.</CategoryState>
              ) : null}

              {!productsQuery.isLoading && !productsQuery.isFetching && !productsQuery.isError && products.length === 0 ? (
                <CategoryState>
                  <strong>Ничего не найдено</strong>
                  <span>Попробуйте убрать часть фильтров или изменить поисковый запрос.</span>
                  <button type="button" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                </CategoryState>
              ) : null}

              {!productsQuery.isLoading && !productsQuery.isFetching && !productsQuery.isError && products.length > 0 ? (
                <>
                  <div className="catalog-page_grid">
                    {products.map((product) => (
                      <ProductCard product={product} key={product.id} />
                    ))}
                  </div>

                  <div className="catalog-page_pagination" aria-label="Пагинация">
                    <button type="button" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 }, false)}>
                      <ChevronLeft />
                      Назад
                    </button>
                    <span>
                      {page} / {pages}
                    </span>
                    <button type="button" disabled={page >= pages} onClick={() => updateParams({ page: page + 1 }, false)}>
                      Вперед
                      <ArrowRight />
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
