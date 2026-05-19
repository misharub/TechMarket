import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Plus,
  RotateCcw,
  ShoppingCart,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard, formatPrice, getDiscountPercent } from "../../components/product/ProductCard";
import { useAddToCart } from "../../lib/cart-hooks";
import { compareProducts, type CompareProductSummary, type CompareRow } from "../../lib/compare-api";
import {
  getCompareProductIds,
  removeCompareProductId,
  setCompareProductIds,
  subscribeCompareProducts,
} from "../../lib/compare-store";
import { getProducts, resolveUploadUrl, type Product } from "../../lib/products-api";
import "./ComparePage.css";

const defaultCategorySlug = "smartphones";
const maxCompareProducts = 3;

const sectionLabels = [
  { name: "Общие сведения", keys: ["modelLine", "releaseYear", "color", "os", "waterResistance", "bodyMaterial"] },
  { name: "Экран", keys: ["screenSize", "screenType", "resolution", "refreshRate", "peakBrightness"] },
  { name: "Производительность", keys: ["processor", "cpuCores", "ram", "storage"] },
  { name: "Камеры", keys: ["mainCamera", "ultraWideCamera", "frontCamera", "videoRecording"] },
  { name: "Связь", keys: ["simCount", "esim", "nfc", "network5g", "network4g", "gps", "bluetooth", "wifi"] },
  { name: "Питание и корпус", keys: ["battery", "chargingPort", "wirelessCharging", "weight"] },
];

function productToCompareSummary(product: Product): CompareProductSummary {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    oldPrice: product.oldPrice === null ? null : Number(product.oldPrice),
    stock: product.stock,
    images: product.images,
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug,
    },
  };
}

function formatCompareValue(row: CompareRow, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (row.type === "BOOLEAN") {
    return value === true ? (
      <span className="compare_page_bool compare_page_bool__yes" aria-label="Да">
        <Check />
      </span>
    ) : (
      <span className="compare_page_bool compare_page_bool__no" aria-label="Нет">
        <X />
      </span>
    );
  }

  const normalizedValue = String(value);

  if (row.unit && !normalizedValue.toLowerCase().includes(row.unit.toLowerCase())) {
    return `${normalizedValue} ${row.unit}`;
  }

  return normalizedValue;
}

function groupRows(rows: CompareRow[]) {
  const usedKeys = new Set<string>();
  const sections = sectionLabels
    .map((section) => {
      const sectionRows = section.keys
        .map((key) => rows.find((row) => row.key === key))
        .filter((row): row is CompareRow => Boolean(row));

      sectionRows.forEach((row) => usedKeys.add(row.key));

      return { name: section.name, rows: sectionRows };
    })
    .filter((section) => section.rows.length > 0);
  const otherRows = rows.filter((row) => !usedKeys.has(row.key));

  return otherRows.length ? [...sections, { name: "Дополнительно", rows: otherRows }] : sections;
}

function CompareProductImage({ product }: { product: CompareProductSummary }) {
  const imageUrl = resolveUploadUrl(product.images[0]);

  if (!imageUrl) {
    return <div className="compare_page_product_placeholder">{product.brand.name.slice(0, 2).toUpperCase()}</div>;
  }

  return <img src={imageUrl} alt={product.title} loading="lazy" />;
}

function CompareProductCard({ product, sourceProduct }: { product: CompareProductSummary; sourceProduct?: Product }) {
  const discountPercent = sourceProduct ? getDiscountPercent(sourceProduct) : null;
  const { addProduct, isPending } = useAddToCart();

  return (
    <article className="compare_page_product">
      {discountPercent ? <span className="compare_page_product_badge">-{discountPercent}%</span> : null}
      <button
        className="compare_page_remove"
        type="button"
        aria-label={`Убрать ${product.title} из сравнения`}
        onClick={() => removeCompareProductId(product.id)}
      >
        <Trash2 />
      </button>
      <a className="compare_page_product_media" href={`/product/${product.slug}`}>
        <CompareProductImage product={product} />
      </a>
      <div className="compare_page_product_body">
        <div className="compare_page_product_meta">
          <span>{product.brand.name}</span>
          <span className={product.stock > 0 ? "compare_page_stock" : "compare_page_stock compare_page_stock__empty"}>
            {product.stock > 0 ? "В наличии" : "Под заказ"}
          </span>
        </div>
        <h3>{product.title}</h3>
        <div className="compare_page_product_rating" aria-label="Демо-рейтинг">
          <Star />
          <span>4.9</span>
          <span>12 отзывов</span>
        </div>
        <div className="compare_page_price">
          {formatPrice(product.price)}
          {product.oldPrice ? <span className="compare_page_old_price">{formatPrice(product.oldPrice)}</span> : null}
        </div>
        <button
          className="compare_page_cart"
          type="button"
          disabled={!sourceProduct || product.stock <= 0 || isPending}
          onClick={() => sourceProduct && void addProduct(sourceProduct)}
        >
          <ShoppingCart />
          <span>{isPending ? "Добавляем..." : "В корзину"}</span>
        </button>
      </div>
    </article>
  );
}

export function ComparePage() {
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareProductIds());
  const [addProductId, setAddProductId] = useState("");

  useEffect(() => subscribeCompareProducts(setCompareIds), []);

  const catalogQuery = useQuery({
    queryKey: ["products", "compare-catalog", defaultCategorySlug],
    queryFn: () => getProducts({ categorySlug: defaultCategorySlug, limit: 8, sort: "newest" }),
  });

  const catalogProducts = catalogQuery.data?.items ?? [];
  const selectedIds = compareIds;
  const canCompare = selectedIds.length >= 2;

  const compareQuery = useQuery({
    queryKey: ["products", "compare", selectedIds],
    queryFn: () => compareProducts(selectedIds),
    enabled: canCompare,
  });

  const fallbackProducts = useMemo(
    () => selectedIds.map((id) => catalogProducts.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)),
    [catalogProducts, selectedIds],
  );
  const products = canCompare ? compareQuery.data?.products ?? fallbackProducts.map(productToCompareSummary) : fallbackProducts.map(productToCompareSummary);
  const sourceProductsById = useMemo(() => new Map(catalogProducts.map((product) => [product.id, product])), [catalogProducts]);
  const groupedRows = canCompare ? groupRows(compareQuery.data?.rows ?? []) : [];
  const availableProducts = catalogProducts.filter((product) => !selectedIds.includes(product.id));

  const handleAddProduct = () => {
    if (!addProductId) {
      return;
    }

    setCompareProductIds([...selectedIds, addProductId].slice(0, maxCompareProducts));
    setAddProductId("");
  };

  const handleResetToDemo = () => {
    setCompareProductIds(catalogProducts.slice(0, 2).map((product) => product.id));
  };

  return (
    <main className="compare_page">
      <div className="compare_page_inner">
        <nav className="compare_page_breadcrumbs" aria-label="Навигация">
          <a href="/">Главная</a>
          <ChevronRight />
          <span>Сравнить товары</span>
        </nav>

        <div className="compare_page_title_row">
          <div>
            <h1>Сравнить товары</h1>
          </div>
          <div className="compare_page_tools" aria-label="Инструменты сравнения">
            <button className="compare_page_icon_button" type="button" aria-label="Сбросить к демо-сравнению" onClick={handleResetToDemo}>
              <RotateCcw />
            </button>
          </div>
        </div>

        {catalogQuery.isLoading ? <div className="compare_page_state">Загружаем смартфоны для сравнения...</div> : null}

        {!catalogQuery.isLoading && catalogQuery.isError ? (
          <div className="compare_page_state compare_page_state__error">Не удалось загрузить каталог. Проверьте, что backend запущен.</div>
        ) : null}

        {!catalogQuery.isLoading && !catalogQuery.isError && products.length === 0 ? (
          <section className="compare_page_empty">
            <h2>В сравнении пока мало товаров</h2>
            <p>Добавьте минимум два смартфона из каталога или включите демо-набор, чтобы увидеть таблицу характеристик и вывод ИИ.</p>
            <div className="compare_page_empty_actions">
              <a href="/catalog/smartphones">Открыть смартфоны</a>
              <button type="button" onClick={handleResetToDemo}>
                Включить демо
              </button>
            </div>
          </section>
        ) : null}

        {products.length > 0 ? (
          <div className="compare_page_layout">
            <aside className="compare_page_sidebar" aria-label="Разделы сравнения">
              <h2>Сравнение</h2>
              <div className="compare_page_tabs">
                <a className="compare_page_tab compare_page_tab__active" href="#compare-products">
                  Товары <span>{products.length}</span>
                </a>
                <a className="compare_page_tab" href="#compare-specs">
                  Характеристики <span>{canCompare ? compareQuery.data?.rows.length ?? 0 : 0}</span>
                </a>
                <a className="compare_page_tab" href="#compare-ai">
                  Вывод ИИ <span>beta</span>
                </a>
              </div>

              <h2>Добавить товар</h2>
              <div className="compare_page_add_row">
                <select value={addProductId} onChange={(event) => setAddProductId(event.target.value)} disabled={selectedIds.length >= maxCompareProducts}>
                  <option value="">Выберите смартфон</option>
                  {availableProducts.map((product) => (
                    <option value={product.id} key={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
                <button className="compare_page_add_button" type="button" aria-label="Добавить товар" disabled={!addProductId} onClick={handleAddProduct}>
                  <Plus />
                </button>
              </div>
              <p className="compare_page_hint">Можно сравнить от 2 до 3 товаров одной категории. Кнопки сравнения в каталоге также добавляют сюда смартфоны.</p>
            </aside>

            <div className="compare_page_main">
              <section className="compare_page_products" id="compare-products" aria-label="Выбранные товары">
                {products.map((product) => (
                  <CompareProductCard product={product} sourceProduct={sourceProductsById.get(product.id)} key={product.id} />
                ))}
              </section>

              {compareQuery.isLoading ? <div className="compare_page_state">Строим таблицу характеристик...</div> : null}

              {!compareQuery.isLoading && compareQuery.isError ? (
                <div className="compare_page_state compare_page_state__error">
                  Сравнение доступно для товаров одной категории. Уберите лишний товар или включите демо-набор.
                </div>
              ) : null}

              {!canCompare ? (
                <div className="compare_page_state">Добавьте еще один товар, чтобы увидеть таблицу характеристик и вывод ИИ.</div>
              ) : null}

              {!compareQuery.isLoading && !compareQuery.isError && groupedRows.length ? (
                <section className="compare_page_table" id="compare-specs" aria-label="Характеристики">
                  <h2>Характеристики</h2>
                  {groupedRows.map((section) => (
                    <div className="compare_page_section" key={section.name}>
                      <button className="compare_page_section_header" type="button">
                        <span>{section.name}</span>
                        <ChevronDown />
                      </button>
                      {section.rows.map((row) => (
                        <div className="compare_page_spec_row" key={row.key}>
                          <div className="compare_page_spec_label">
                            <CircleHelp />
                            <span>{row.label}</span>
                          </div>
                          {products.map((product) => (
                            <div
                              className={
                                row.bestProductIds.includes(product.id)
                                  ? "compare_page_spec_value compare_page_spec_value__best"
                                  : "compare_page_spec_value"
                              }
                              key={product.id}
                            >
                              {formatCompareValue(row, row.values[product.id])}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, maxCompareProducts - products.length) }).map((_, index) => (
                            <div className="compare_page_spec_value" key={`empty-${row.key}-${index}`}>
                              —
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              ) : null}

              {canCompare && compareQuery.data ? (
                <section className="compare_page_ai" id="compare-ai" aria-labelledby="compare_ai_title">
                  <div className="compare_page_ai_title">
                    <h2 id="compare_ai_title">Вывод ИИ</h2>
                    <span className="compare_page_ai_badge">
                      {compareQuery.data.aiSummaryMeta.isFallback ? "заглушка" : compareQuery.data.aiSummaryMeta.provider}
                    </span>
                  </div>
                  <p>{compareQuery.data.aiSummary}</p>
                  <span className="compare_page_ai_note">
                    Это заглушка: backend уже возвращает место под AI-вывод, реальное подключение можно заменить в сервисе интеграции.
                  </span>
                </section>
              ) : null}
            </div>
          </div>
        ) : null}

        {!catalogQuery.isLoading && !catalogQuery.isError && catalogProducts.length > 2 ? (
          <section className="compare_page_recommendations" aria-label="Еще смартфоны">
            <h2>Еще смартфоны для сравнения</h2>
            <div className="compare_page_recommendation_grid">
              {catalogProducts.slice(0, 4).map((product) => (
                <ProductCard product={product} view="compact" key={product.id} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
