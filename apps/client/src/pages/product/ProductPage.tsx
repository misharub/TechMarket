import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getCategorySpecs } from "../../lib/category-specs-api";
import { getProductBySlug, resolveUploadUrl } from "../../lib/products-api";
import "./ProductPage.css";

export function ProductPage() {
  const { slug = "" } = useParams();
  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
  const product = productQuery.data;
  const specsQuery = useQuery({
    queryKey: ["product", "category_specs", product?.categoryId],
    queryFn: () => getCategorySpecs(product!.categoryId),
    enabled: Boolean(product?.categoryId),
  });
  const visibleSpecs = useMemo(() => {
    if (!product) {
      return [];
    }

    return (specsQuery.data ?? [])
      .map((spec) => {
        const rawValue = product.specs[spec.key];

        if (rawValue === undefined || rawValue === null || rawValue === "") {
          return null;
        }

        return {
          label: spec.label,
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
      .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
  }, [product, specsQuery.data]);

  if (productQuery.isLoading) {
    return <main className="product_page"><p>Загрузка товара...</p></main>;
  }

  if (!product) {
    return <main className="product_page"><p>Товар не найден.</p></main>;
  }

  const imageUrl = resolveUploadUrl(product.images[0]);

  return (
    <main className="product_page">
      <div className="product_page_inner">
        <section className="product_page_hero">
          <div className="product_page_media">
            {imageUrl ? <img src={imageUrl} alt={product.title} /> : <span>{product.brand.name.slice(0, 2).toUpperCase()}</span>}
          </div>
          <div className="product_page_summary">
            <p>{product.brand.name}</p>
            <h1>{product.title}</h1>
            <strong>{Number(product.price).toLocaleString("ru-BY")} BYN</strong>
            <p>{product.description}</p>
          </div>
        </section>

        <section className="product_page_specs">
          <h2>Характеристики</h2>
          {visibleSpecs.length ? (
            <div className="product_page_specs_group">
              <dl>
                {visibleSpecs.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
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
        </section>
      </div>
    </main>
  );
}
