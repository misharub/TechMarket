import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getProductBySlug, resolveUploadUrl } from "../../lib/products-api";
import { getSpecificationTemplateByCategory } from "../../lib/specification-templates-api";
import "./ProductPage.css";

export function ProductPage() {
  const { slug = "" } = useParams();
  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
  const product = productQuery.data;
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
        </section>
      </div>
    </main>
  );
}
