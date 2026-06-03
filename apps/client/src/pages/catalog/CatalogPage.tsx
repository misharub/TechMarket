import { useQuery } from "@tanstack/react-query";
import {
  BatteryCharging,
  BookOpen,
  Briefcase,
  Cable,
  Camera,
  Cctv,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
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
import { useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "../../components/product/ProductCard";
import { getBrands } from "../../lib/brands-api";
import { getCategoryTree, type CategoryNode } from "../../lib/categories-api";
import { getProducts, type Product, type ProductSort } from "../../lib/products-api";
import {
  getSpecificationTemplateByCategory,
  type Specification,
  type SpecificationTemplate,
} from "../../lib/specification-templates-api";
import "./CatalogPage.css";

const catalogLimit = 12;
const specFilterPrefix = "spec_";
const facetSampleLimit = 48;
const prioritySpecKeys = ["storage", "ram", "os", "screenSize"];

type SpecFacetOption = {
  value: string;
  label: string;
  count: number;
};

type CatalogSpecFilter = {
  specification: Specification;
  kind: "options" | "range" | "boolean";
  options: SpecFacetOption[];
};

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

function getSpecFilterEntries(searchParams: URLSearchParams) {
  return Array.from(searchParams.entries())
    .filter(([key, value]) => key.startsWith(specFilterPrefix) && value)
    .map(([key, value]) => [key.slice(specFilterPrefix.length), value] as const);
}

function getSpecFilterParam(entries: Array<readonly [string, string]>) {
  return entries.map(([key, value]) => `${key}:${value}`).join("|") || undefined;
}

function getSelectedSpecValues(searchParams: URLSearchParams, specification: Specification) {
  const value = searchParams.get(`${specFilterPrefix}${specification.key}`) ?? "";

  return value.split(",").filter(Boolean);
}

function getSpecUnit(specification: Specification) {
  if (!specification.unit) {
    return "";
  }

  return specification.unit === "дюйма" ? "дюйм" : specification.unit;
}

function formatSpecOptionLabel(specification: Specification, value: string) {
  const unit = getSpecUnit(specification);

  return unit && !value.toLowerCase().includes(unit.toLowerCase()) ? `${value} ${unit}` : value;
}

function normalizeSpecValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function getSpecFacetOptions(specification: Specification, products: Product[]) {
  const counts = new Map<string, number>();

  products.forEach((product) => {
    const value = normalizeSpecValue(product.specs?.[specification.key]);

    if (value) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  });

  const optionValues =
    specification.type === "SELECT" && specification.options.length
      ? specification.options.map((option) => option.value)
      : Array.from(counts.keys());

  return optionValues
    .map((value) => ({
      value,
      label: formatSpecOptionLabel(specification, value),
      count: counts.get(value) ?? 0,
    }))
    .filter((option) => option.count > 0 || specification.type === "SELECT")
    .sort((left, right) => {
      const leftNumber = Number(left.value);
      const rightNumber = Number(right.value);

      if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
        return leftNumber - rightNumber;
      }

      return left.label.localeCompare(right.label, "ru");
    });
}

function getCatalogSpecFilters(template: SpecificationTemplate | null | undefined, products: Product[]) {
  const specifications = template?.groups.flatMap((group) => group.specifications) ?? [];
  const filters = specifications
    .map((specification): CatalogSpecFilter | null => {
      if (specification.type === "BOOLEAN") {
        return { specification, kind: "boolean", options: [] };
      }

      if (specification.key === "screenSize") {
        return { specification, kind: "range", options: buildScreenSizeRanges(specification, products) };
      }

      const options = getSpecFacetOptions(specification, products);

      if (!options.length || (specification.type !== "SELECT" && !prioritySpecKeys.includes(specification.key))) {
        return null;
      }

      return { specification, kind: "options", options };
    })
    .filter((filter): filter is CatalogSpecFilter => Boolean(filter));

  return filters.sort((left, right) => {
    const leftPriority = prioritySpecKeys.indexOf(left.specification.key);
    const rightPriority = prioritySpecKeys.indexOf(right.specification.key);
    const normalizedLeftPriority = leftPriority === -1 ? Number.MAX_SAFE_INTEGER : leftPriority;
    const normalizedRightPriority = rightPriority === -1 ? Number.MAX_SAFE_INTEGER : rightPriority;

    if (normalizedLeftPriority !== normalizedRightPriority) {
      return normalizedLeftPriority - normalizedRightPriority;
    }

    if (left.kind === "boolean" && right.kind !== "boolean") return 1;
    if (left.kind !== "boolean" && right.kind === "boolean") return -1;

    return left.specification.sortOrder - right.specification.sortOrder;
  });
}

function buildScreenSizeRanges(specification: Specification, products: Product[]): SpecFacetOption[] {
  const ranges = [
    { value: "..6.09", label: "6.09 и менее", min: undefined, max: 6.09 },
    { value: "6.1..6.29", label: "6.1 - 6.29", min: 6.1, max: 6.29 },
    { value: "6.3..6.49", label: "6.3 - 6.49", min: 6.3, max: 6.49 },
    { value: "6.5..6.59", label: "6.5 - 6.59", min: 6.5, max: 6.59 },
    { value: "6.6..6.79", label: "6.6 - 6.79", min: 6.6, max: 6.79 },
    { value: "6.8..", label: "6.8 и более", min: 6.8, max: undefined },
  ];
  const values = products
    .map((product) => Number(product.specs?.[specification.key]))
    .filter((value) => Number.isFinite(value));

  return ranges.map((range) => ({
    value: range.value,
    label: range.label,
    count: values.filter((value) => (range.min === undefined || value >= range.min) && (range.max === undefined || value <= range.max)).length,
  }));
}

function buildPageItems(currentPage: number, pages: number): Array<number | "ellipsis"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", pages];
  if (currentPage >= pages - 3) return [1, "ellipsis", pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pages];
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
    <span className={`catalog_page_category_visual catalog_page_category_visual__${size}`} aria-hidden="true">
      <Icon />
    </span>
  );
}

function CatalogSkeletons() {
  return (
    <div className="catalog_page_grid" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="catalog_page_skeleton_card" key={index}>
          <div className="catalog_page_skeleton_media" />
          <div className="catalog_page_skeleton_line catalog_page_skeleton_line__wide" />
          <div className="catalog_page_skeleton_line" />
          <div className="catalog_page_skeleton_line catalog_page_skeleton_line__short" />
        </div>
      ))}
    </div>
  );
}

function CategoryTile({ category, kind = "catalog" }: { category: CategoryNode; kind?: "catalog" | "subcategory" }) {
  return (
    <a className={`catalog_page_category_card catalog_page_category_card__${kind}`} href={`/catalog/${category.slug}`}>
      <CategoryVisual category={category} size={kind === "catalog" ? "large" : "small"} />
      <span>{category.name}</span>
    </a>
  );
}

function CollectionStrip({
  category,
  activeSlug,
}: {
  category: CategoryNode;
  activeSlug: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  function scrollCollections(direction: "left" | "right") {
    stripRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  }

  return (
    <section className="catalog_page_collection_strip" aria-label="Подборки категории">
      <button
        className="catalog_page_collection_arrow"
        type="button"
        aria-label="Прокрутить подборки влево"
        onClick={() => scrollCollections("left")}
      >
        <ChevronLeft />
      </button>
      <div className="catalog_page_collection_track" ref={stripRef}>
        {category.collections.map((collection) => (
          <a
            className={
              collection.slug === activeSlug
                ? "catalog_page_collection_link catalog_page_collection_link__active"
                : "catalog_page_collection_link"
            }
            href={`/catalog/${category.slug}?collection=${collection.slug}`}
            key={collection.id}
          >
            {collection.name}
          </a>
        ))}
      </div>
      <button
        className="catalog_page_collection_arrow"
        type="button"
        aria-label="Прокрутить подборки вправо"
        onClick={() => scrollCollections("right")}
      >
        <ChevronRight />
      </button>
    </section>
  );
}

function CategoryState({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "error" }) {
  return (
    <div className={`catalog_page_state ${tone === "error" ? "catalog_page_state__error" : ""}`} role="status">
      {children}
    </div>
  );
}

function CatalogPagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  return (
    <div className="catalog_page_pagination" aria-label="Пагинация">
      <button className="catalog_page_page_button" type="button" disabled={page <= 1} onClick={() => onChange(Math.max(1, page - 1))}>
        {"<"}
      </button>
      {buildPageItems(page, pages).map((item, index) =>
        item === "ellipsis" ? (
          <span className="catalog_page_page_ellipsis" key={`ellipsis-${index}`}>
            ...
          </span>
        ) : (
          <button
            className={`catalog_page_page_button ${item === page ? "catalog_page_page_button__active" : ""}`}
            key={item}
            type="button"
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button className="catalog_page_page_button" type="button" disabled={page >= pages} onClick={() => onChange(Math.min(pages, page + 1))}>
        {">"}
      </button>
    </div>
  );
}

export function CatalogPage() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") ?? "";
  const brandSlug = searchParams.get("brand") ?? "";
  const collectionSlug = searchParams.get("collection") ?? "";
  const priceFrom = getNumberParam(searchParams, "priceFrom");
  const priceTo = getNumberParam(searchParams, "priceTo");
  const inStock = searchParams.get("inStock") === "true";
  const sort = (searchParams.get("sort") as ProductSort | null) ?? "newest";
  const page = getPage(searchParams);
  const specFilterEntries = getSpecFilterEntries(searchParams);
  const specFilters = getSpecFilterParam(specFilterEntries);

  const categoriesQuery = useQuery({
    queryKey: ["categories", "tree", "catalog"],
    queryFn: getCategoryTree,
  });

  const categories = categoriesQuery.data ?? [];
  const activePath = useMemo(() => findCategoryPath(categories, categorySlug), [categories, categorySlug]);
  const activeCategory = activePath[activePath.length - 1];
  const activeCollection = activeCategory?.collections.find((collection) => collection.slug === collectionSlug);
  const rootCategory = activePath[0];
  const isCatalogRoot = !categorySlug;
  const isKnownCategory = !categorySlug || Boolean(activeCategory);
  const isRootCategoryLanding = Boolean(activeCategory && activePath.length === 1 && activeCategory.children.length > 0);
  const isRootSearchListing = isCatalogRoot && Boolean(q.trim());
  const isProductListing = Boolean((activeCategory && !isRootCategoryLanding) || isRootSearchListing);

  const brandsQuery = useQuery({
    queryKey: ["brands", "catalog"],
    queryFn: () => getBrands(),
    enabled: isProductListing,
  });

  const specificationTemplateQuery = useQuery({
    queryKey: ["specification-template", "catalog", activeCategory?.id],
    queryFn: () => getSpecificationTemplateByCategory(activeCategory!.id),
    enabled: isProductListing && Boolean(activeCategory?.id),
  });

  const brands = brandsQuery.data ?? [];
  const selectedBrand = brands.find((brand) => brand.slug === brandSlug);
  const brandId = brandSlug ? selectedBrand?.id ?? "__missing_brand__" : undefined;

  const productsQuery = useQuery({
    queryKey: ["products", "catalog", categorySlug, collectionSlug, q, brandId, priceFrom, priceTo, inStock, specFilters, sort, page],
    queryFn: () =>
      getProducts({
        search: q || undefined,
        categorySlug,
        collectionSlug: collectionSlug || undefined,
        brandId,
        specFilters,
        priceFrom,
        priceTo,
        inStock: inStock || undefined,
        sort,
        page,
        limit: catalogLimit,
    }),
    enabled: isProductListing && (!brandSlug || !brandsQuery.isLoading),
  });

  const catalogLandingCountQuery = useQuery({
    queryKey: ["products", "catalog-landing-count", isCatalogRoot ? "root" : activeCategory?.slug],
    queryFn: () =>
      getProducts({
        categorySlug: isCatalogRoot ? undefined : activeCategory?.slug,
        page: 1,
        limit: 1,
        sort: "newest",
      }),
    enabled: isCatalogRoot || isRootCategoryLanding,
  });

  const facetProductsQuery = useQuery({
    queryKey: ["products", "catalog-facets", categorySlug, collectionSlug, q, brandId, priceFrom, priceTo, inStock],
    queryFn: () =>
      getProducts({
        search: q || undefined,
        categorySlug,
        collectionSlug: collectionSlug || undefined,
        brandId,
        priceFrom,
        priceTo,
        inStock: inStock || undefined,
        sort: "newest",
        page: 1,
        limit: facetSampleLimit,
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

  const updateSpecFilter = (specification: Specification, value: string, checked = true, multi = true) => {
    const paramKey = `${specFilterPrefix}${specification.key}`;
    const currentValues = getSelectedSpecValues(searchParams, specification);
    const nextValues = multi
      ? checked
        ? Array.from(new Set([...currentValues, value]))
        : currentValues.filter((item) => item !== value)
      : checked
        ? [value]
        : [];

    updateParams({ [paramKey]: nextValues.join(",") || undefined });
  };

  const updateAllSpecOptions = (specification: Specification, options: SpecFacetOption[], checked: boolean) => {
    updateParams({
      [`${specFilterPrefix}${specification.key}`]: checked ? options.map((option) => option.value).join(",") : undefined,
    });
  };

  const handleRangeSubmit = (event: FormEvent<HTMLFormElement>, specification: Specification) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const from = String(formData.get("rangeFrom") ?? "").trim();
    const to = String(formData.get("rangeTo") ?? "").trim();

    updateParams({ [`${specFilterPrefix}${specification.key}`]: from || to ? `${from}..${to}` : undefined });
  };

  const total = isProductListing ? (productsQuery.data?.total ?? 0) : (catalogLandingCountQuery.data?.total ?? 0);
  const isTotalLoading = isProductListing ? productsQuery.isLoading : catalogLandingCountQuery.isLoading;
  const pages = productsQuery.data?.pages ?? 1;
  const products = productsQuery.data?.items ?? [];
  const facetProducts = facetProductsQuery.data?.items ?? products;
  const filterableSpecs = getCatalogSpecFilters(specificationTemplateQuery.data, facetProducts);
  const activeFiltersCount = [q, brandSlug, priceFrom, priceTo, inStock, ...specFilterEntries.map(([, value]) => value)].filter(Boolean).length;
  const title = isRootSearchListing ? `Поиск: ${q.trim()}` : (activeCollection?.name ?? activeCategory?.name ?? "Каталог");
  return (
    <main className="catalog_page">
      <div className="catalog_page_inner">
        <nav className="catalog_page_breadcrumbs" aria-label="Навигация">
          <a href="/">Главная</a>
          <ChevronRight />
          <a href="/catalog">Каталог</a>
          {activePath.map((category) => (
            <span className="catalog_page_breadcrumb_item" key={category.id}>
              <ChevronRight />
              <a href={`/catalog/${category.slug}`}>{category.name}</a>
            </span>
          ))}
        </nav>

        <section className="catalog_page_header">
          <div>
            <h1>
              {title} <strong>{isTotalLoading ? "..." : total}</strong>
            </h1>
          </div>
        </section>

        {categoriesQuery.isLoading ? (
          <div className="catalog_page_catalog_grid" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="catalog_page_category_card catalog_page_category_card__skeleton" key={index} />
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

        {!categoriesQuery.isLoading && !categoriesQuery.isError && isCatalogRoot && !isRootSearchListing ? (
          <section className="catalog_page_catalog_grid" aria-label="Основные разделы каталога">
            {categories.map((category) => (
              <CategoryTile category={category} key={category.id} />
            ))}
          </section>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && isRootCategoryLanding && activeCategory ? (
          <section className="catalog_page_category_layout">
            <aside className="catalog_page_side_nav" aria-label="Разделы каталога">
              <h2>Категории</h2>
              {categories.map((category) => (
                <a
                  className={
                    category.slug === rootCategory?.slug
                      ? "catalog_page_side_link catalog_page_side_link__active"
                      : "catalog_page_side_link"
                  }
                  href={`/catalog/${category.slug}`}
                  key={category.id}
                >
                  {category.name}
                </a>
              ))}
            </aside>

            <div className="catalog_page_subcategories">
              <div className="catalog_page_subcategory_grid">
                {activeCategory.children.map((category) => (
                  <CategoryTile category={category} kind="subcategory" key={category.id} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {!categoriesQuery.isLoading &&
        !categoriesQuery.isError &&
        isProductListing &&
        activeCategory?.collections.length ? (
          <CollectionStrip category={activeCategory} activeSlug={collectionSlug} />
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && isProductListing ? (
          <div className="catalog_page_layout">
            <aside className="catalog_page_filters" aria-label="Фильтры каталога">
              <div className="catalog_page_filters_title">
                <Filter />
                <span>Фильтры</span>
                {activeFiltersCount ? <b>{activeFiltersCount}</b> : null}
              </div>

              <form className="catalog_page_search" onSubmit={handleSearch}>
                <input name="q" type="search" placeholder="Поиск по товарам" defaultValue={q} />
                <button type="submit" aria-label="Искать">
                  <Search />
                </button>
              </form>

              <div className="catalog_page_filter_block">
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

              <form className="catalog_page_filter_block" onSubmit={handlePriceSubmit}>
                <h2>Цена, BYN</h2>
                <div className="catalog_page_price_row">
                  <input name="priceFrom" type="number" min="0" placeholder="от" defaultValue={priceFrom ?? ""} />
                  <input name="priceTo" type="number" min="0" placeholder="до" defaultValue={priceTo ?? ""} />
                </div>
                <button className="catalog_page_apply" type="submit">
                  Применить
                </button>
              </form>

              {filterableSpecs.length ? (
                <div className="catalog_page_filter_block catalog_page_spec_filters">
                  <h2>Характеристики</h2>
                  {filterableSpecs.map(({ specification, kind, options }) => {
                    const currentValue = searchParams.get(`${specFilterPrefix}${specification.key}`) ?? "";
                    const selectedValues = getSelectedSpecValues(searchParams, specification);
                    const selectedOptionsCount = options.filter((option) => selectedValues.includes(option.value)).length;
                    const allOptionsSelected = options.length > 0 && selectedOptionsCount === options.length;
                    const [rangeFrom = "", rangeTo = ""] = kind === "range" && currentValue.includes("..") ? currentValue.split("..") : ["", ""];

                    return (
                      <details className="catalog_page_spec_group" key={specification.id} open>
                        <summary>
                          <ChevronUp />
                          <span>
                            {specification.name}
                            {specification.unit ? ` (${getSpecUnit(specification)})` : ""}
                          </span>
                        </summary>

                        {kind === "options" ? (
                          <div className="catalog_page_spec_options">
                            {options.length > 1 ? (
                              <label className="catalog_page_check catalog_page_check__compact">
                                <input
                                  type="checkbox"
                                  checked={allOptionsSelected}
                                  onChange={(event) => updateAllSpecOptions(specification, options, event.target.checked)}
                                />
                                <span>Выбрать все</span>
                              </label>
                            ) : null}
                            {options.map((option) => (
                              <label className="catalog_page_check catalog_page_check__compact" key={option.value}>
                                <input
                                  type="checkbox"
                                  value={option.value}
                                  checked={selectedValues.includes(option.value)}
                                  onChange={(event) => updateSpecFilter(specification, option.value, event.target.checked)}
                                />
                                <span>{option.label}</span>
                                <small>{option.count}</small>
                              </label>
                            ))}
                          </div>
                        ) : null}

                        {kind === "range" ? (
                          <>
                            <form className="catalog_page_range_form" onSubmit={(event) => handleRangeSubmit(event, specification)}>
                              <input name="rangeFrom" type="number" step="0.01" placeholder="от 5.45" defaultValue={rangeFrom} />
                              <input name="rangeTo" type="number" step="0.01" placeholder="до 10.2" defaultValue={rangeTo} />
                              <button type="submit" aria-label={`Применить ${specification.name}`}>
                                <Check />
                              </button>
                            </form>
                            <div className="catalog_page_range_options">
                              <label className="catalog_page_radio">
                                <input
                                  type="radio"
                                  checked={!currentValue}
                                  onChange={() => updateParams({ [`${specFilterPrefix}${specification.key}`]: undefined })}
                                />
                                <span>Все</span>
                              </label>
                              {options.map((option) => (
                                <label className="catalog_page_radio" key={option.value}>
                                  <input
                                    type="radio"
                                    value={option.value}
                                    checked={currentValue === option.value}
                                    onChange={(event) => updateSpecFilter(specification, option.value, event.target.checked, false)}
                                  />
                                  <span>{option.label}</span>
                                  <small>{option.count}</small>
                                </label>
                              ))}
                            </div>
                          </>
                        ) : null}

                        {kind === "boolean" ? (
                          <label className="catalog_page_check catalog_page_check__compact">
                            <input
                              type="checkbox"
                              checked={currentValue === "true"}
                              onChange={(event) => updateSpecFilter(specification, "true", event.target.checked, false)}
                            />
                            <span>Да</span>
                          </label>
                        ) : null}
                      </details>
                    );
                  })}
                </div>
              ) : null}

              <label className="catalog_page_check catalog_page_check__availability">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(event) => updateParams({ inStock: event.target.checked })}
                />
                <span>Только в наличии</span>
              </label>

              <button className="catalog_page_reset" type="button" onClick={resetFilters}>
                <RotateCcw />
                Сбросить фильтры
              </button>
            </aside>

            <section className="catalog_page_results" aria-labelledby="catalog_results_heading">
              <div className="catalog_page_toolbar">
                <div>
                  <h2 id="catalog_results_heading">{title}</h2>
                  <p>{productsQuery.isError ? "Каталог временно недоступен" : null}</p>
                </div>
                <label className="catalog_page_sort">
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
                  <div className="catalog_page_grid">
                    {products.map((product) => (
                      <ProductCard product={product} key={product.id} />
                    ))}
                  </div>

                  <CatalogPagination page={page} pages={pages} onChange={(nextPage) => updateParams({ page: nextPage }, false)} />
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
