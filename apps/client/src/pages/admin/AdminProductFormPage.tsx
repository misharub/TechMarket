import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { uploadImage } from "../../lib/admin-api";
import { getBrands } from "../../lib/brands-api";
import { getCategories } from "../../lib/categories-api";
import { isValidSlug, slugify } from "../../lib/slug-utils";
import { getSpecificationTemplateByCategory, type Specification } from "../../lib/specification-templates-api";
import {
  createProduct,
  getProduct,
  updateProduct,
  type ProductAdditionalSpec,
  type ProductPayload,
} from "../../lib/products-api";
import { getChildCategories, getRootCategories } from "./admin-utils";
import { AdminImageUploadField } from "./AdminImageUploadField";

const emptyAdditionalSpec: ProductAdditionalSpec = { label: "", value: "" };

function isNumericSelectSpecification(specification: Specification) {
  return (
    specification.type === "SELECT" &&
    specification.options.length > 0 &&
    specification.options.every((option) => option.value.trim() !== "" && Number.isFinite(Number(option.value)))
  );
}

export function AdminProductFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [form, setForm] = useState<ProductPayload>({
    title: "",
    slug: "",
    sku: "",
    shortDescription: "",
    description: "",
    price: 0,
    oldPrice: undefined,
    stock: 0,
    images: [],
    specs: {},
    additionalSpecs: [],
    categoryId: "",
    brandId: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [additionalSpecDraft, setAdditionalSpecDraft] = useState<ProductAdditionalSpec>(emptyAdditionalSpec);
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => getCategories(true),
  });
  const brandsQuery = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => getBrands({ includeInactive: true }),
  });
  const productQuery = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => getProduct(id!),
    enabled: isEdit,
  });
  const categories = categoriesQuery.data ?? [];
  const parentCategories = useMemo(() => getRootCategories(categories), [categories]);
  const childCategories = useMemo(
    () => (parentCategoryId ? getChildCategories(categories, parentCategoryId) : []),
    [categories, parentCategoryId],
  );
  const templateQuery = useQuery({
    queryKey: ["admin", "specification_template_by_category", form.categoryId],
    queryFn: () => getSpecificationTemplateByCategory(form.categoryId),
    enabled: Boolean(form.categoryId),
  });
  const saveMutation = useMutation({
    mutationFn: (payload: ProductPayload) => {
      if (id) {
        return updateProduct(id, payload);
      }

      const { isActive, ...createPayload } = payload;

      return createProduct(createPayload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
      navigate("/admin/products");
    },
  });

  useEffect(() => {
    if (productQuery.data) {
      setParentCategoryId(productQuery.data.category.parentId ?? "");
      setForm({
        title: productQuery.data.title,
        slug: productQuery.data.slug,
        sku: productQuery.data.sku,
        shortDescription: productQuery.data.shortDescription ?? "",
        description: productQuery.data.description,
        price: Number(productQuery.data.price),
        oldPrice: productQuery.data.oldPrice === null ? undefined : Number(productQuery.data.oldPrice),
        stock: productQuery.data.stock,
        images: productQuery.data.images,
        specs: productQuery.data.specs,
        additionalSpecs: productQuery.data.additionalSpecs ?? [],
        categoryId: productQuery.data.categoryId,
        brandId: productQuery.data.brandId,
        isActive: productQuery.data.isActive,
      });
      setSlugEdited(true);
    }
  }, [productQuery.data]);

  const groupedSpecs = useMemo(() => templateQuery.data?.groups ?? [], [templateQuery.data]);
  const visibleSpecs = useMemo(() => groupedSpecs.flatMap((group) => group.specifications), [groupedSpecs]);

  useEffect(() => {
    if (!visibleSpecs.length) {
      return;
    }

    setForm((current) => {
      const nextSpecs = { ...current.specs };

      for (const spec of visibleSpecs) {
        if (!(spec.key in nextSpecs)) {
          nextSpecs[spec.key] = spec.type === "BOOLEAN" ? false : "";
        } else if (isNumericSelectSpecification(spec) && typeof nextSpecs[spec.key] === "string") {
          nextSpecs[spec.key] = Number(nextSpecs[spec.key]);
        }
      }

      return { ...current, specs: nextSpecs };
    });
  }, [visibleSpecs]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidSlug(form.slug)) {
      setError("Адрес страницы должен содержать только латинские буквы, цифры и одиночные дефисы.");
      return;
    }

    try {
      await saveMutation.mutateAsync(form);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось сохранить товар");
    }
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      const uploaded = await Promise.all([...files].map((file) => uploadImage(file, "products")));
      setForm((current) => ({
        ...current,
        images: [...(current.images ?? []), ...uploaded.map((item) => item.url)],
      }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить изображения");
    }
  }

  function updateSpecValue(key: string, value: unknown) {
    setForm((current) => ({
      ...current,
      specs: {
        ...current.specs,
        [key]: value,
      },
    }));
  }

  function addAdditionalSpec() {
    if (!additionalSpecDraft.label.trim() || !additionalSpecDraft.value.trim()) {
      return;
    }

    setForm((current) => ({
      ...current,
      additionalSpecs: [...(current.additionalSpecs ?? []), additionalSpecDraft],
    }));
    setAdditionalSpecDraft(emptyAdditionalSpec);
  }

  function removeAdditionalSpec(index: number) {
    setForm((current) => ({
      ...current,
      additionalSpecs: (current.additionalSpecs ?? []).filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">{isEdit ? "Редактировать товар" : "Новый товар"}</h1>
        <Link className="admin_button_muted" to="/admin/products">
          Назад
        </Link>
      </header>

      <form className="admin_form admin_product_form" onSubmit={handleSubmit}>
        <section className="admin_panel admin_product_section">
          <div className="admin_product_section_header">
            <h2>Основная информация</h2>
            <p>Название, код товара и место в каталоге.</p>
          </div>

          <div className="admin_form_grid admin_product_overview_grid">
          <label className="admin_field admin_category_name_field">
            <span>Название</span>
            <input
              className="admin_input"
              required
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                  slug: slugEdited ? current.slug : slugify(event.target.value),
                }))
              }
            />
          </label>
          <label className="admin_field admin_category_slug_field">
            <span>Адрес страницы</span>
            <p className="admin_hint">Латинские буквы, цифры и дефисы без пробелов.</p>
            <input
              className="admin_input"
              required
              value={form.slug}
              onChange={(event) => {
                setSlugEdited(true);
                setForm((current) => ({ ...current, slug: event.target.value }));
              }}
            />
          </label>
          <label className="admin_field">
            <span>Код товара</span>
            <p className="admin_hint">Уникальный код товара. Он не должен повторяться у других товаров.</p>
            <input
              className="admin_input"
              required
              value={form.sku}
              onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
            />
          </label>
          <label className="admin_field">
            <span>Родительская категория</span>
            <select
              className="admin_select"
              required
              value={parentCategoryId}
              onChange={(event) => {
                setParentCategoryId(event.target.value);
                setForm((current) => ({ ...current, categoryId: "", specs: {} }));
              }}
            >
              <option value="" disabled hidden>
                Выберите родителя
              </option>
              {parentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin_field">
            <span>Подкатегория</span>
            <select
              className="admin_select"
              required
              disabled={!parentCategoryId}
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  categoryId: event.target.value,
                  specs: {},
                }))
              }
            >
              <option value="" disabled hidden>
                Выберите подкатегорию
              </option>
              {childCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin_field">
            <span>Бренд</span>
            <select
              className="admin_select"
              required
              value={form.brandId}
              onChange={(event) => setForm((current) => ({ ...current, brandId: event.target.value }))}
            >
              <option value="" disabled hidden>
                Выберите бренд
              </option>
              {(brandsQuery.data ?? []).map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin_field admin_field_full">
            <span>Краткое описание</span>
            <p className="admin_hint">Короткая строка для верхнего блока карточки: например, «6 ядер, 8 ГБ, 1 SIM, OLED, NFC».</p>
            <input
              className="admin_input"
              maxLength={240}
              value={form.shortDescription ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
            />
          </label>
          <label className="admin_field admin_field_full">
            <span>Описание</span>
            <textarea
              className="admin_textarea"
              required
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          </div>
        </section>

        <section className="admin_panel admin_product_section">
          <div className="admin_product_section_header">
            <h2>Цена и остатки</h2>
            <p>Коммерческие данные, которые видит покупатель и использует магазин.</p>
          </div>

          <div className="admin_form_grid admin_product_commerce_grid">
            <label className="admin_field">
              <span>Цена</span>
              <input
                className="admin_input"
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
              />
            </label>
            <label className="admin_field">
              <span>Старая цена</span>
              <input
                className="admin_input"
                type="number"
                min="0.01"
                step="0.01"
                value={form.oldPrice ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    oldPrice: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
              />
            </label>
            <label className="admin_field">
              <span>Остаток</span>
              <input
                className="admin_input"
                type="number"
                min={0}
                value={form.stock ?? 0}
                onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value) }))}
              />
            </label>
          </div>
        </section>

        <section className="admin_panel admin_product_section">
          <div className="admin_product_section_header">
            <h2>Публикация</h2>
            <p>Изображения и доступность товара в каталоге.</p>
          </div>

          <div className="admin_product_publication">
            <AdminImageUploadField
              label="Изображения"
              images={form.images ?? []}
              multiple
              onSelect={(files) => void handleImageUpload(files)}
              onRemove={(image) =>
                setForm((current) => ({
                  ...current,
                  images: current.images?.filter((item) => item !== image),
                }))
              }
            />
            <label className="admin_checkbox admin_product_status">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              Товар активен
            </label>
          </div>
        </section>

        {visibleSpecs.length ? (
          <section className="admin_panel admin_product_section admin_specs_grid">
            <div className="admin_product_section_header">
              <h2>Характеристики товара</h2>
              <p>Поля подстраиваются под выбранную подкатегорию.</p>
            </div>
            {groupedSpecs.map((group) => (
              <div className="admin_specs_group" key={group.id}>
                <h3>{group.name}</h3>
                <div className="admin_form_grid">
                  {group.specifications.map((spec) => (
                    <label className="admin_field" key={spec.id}>
                      <span>
                        {spec.name}
                        {spec.unit ? `, ${spec.unit}` : ""}
                      </span>
                      {spec.type === "BOOLEAN" ? (
                        <input
                          type="checkbox"
                          checked={Boolean(form.specs[spec.key])}
                          onChange={(event) => updateSpecValue(spec.key, event.target.checked)}
                        />
                      ) : spec.type === "SELECT" ? (
                        <select
                          className="admin_select"
                          required={spec.isRequired}
                          value={String(form.specs[spec.key] ?? "")}
                          onChange={(event) =>
                            updateSpecValue(
                              spec.key,
                              isNumericSelectSpecification(spec) ? Number(event.target.value) : event.target.value,
                            )
                          }
                        >
                          <option value="" disabled hidden>
                            Выберите значение
                          </option>
                          {spec.options.map((option) => (
                            <option key={option.id} value={option.value}>
                              {option.value}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="admin_input"
                          required={spec.isRequired}
                          type={spec.type === "NUMBER" ? "number" : "text"}
                          value={String(form.specs[spec.key] ?? "")}
                          onChange={(event) =>
                            updateSpecValue(
                              spec.key,
                              spec.type === "NUMBER" ? Number(event.target.value) : event.target.value,
                            )
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : form.categoryId ? (
          <p className="admin_empty">У выбранной подкатегории пока нет шаблона характеристик.</p>
        ) : null}

        <section className="admin_panel admin_product_section admin_specs_grid">
          <div className="admin_product_section_header">
            <h2>Дополнительные характеристики</h2>
            <p>Добавляй только то, что не покрыто основным шаблоном.</p>
          </div>
          {(form.additionalSpecs ?? []).map((spec, index) => (
            <div className="admin_inline_actions" key={`${spec.label}-${index}`}>
              <span>
                {spec.label}: {spec.value}
              </span>
              <button className="admin_button_muted" type="button" onClick={() => removeAdditionalSpec(index)}>
                Убрать
              </button>
            </div>
          ))}
          <div className="admin_form_grid">
            <label className="admin_field">
              <span>Название</span>
              <input
                className="admin_input"
                value={additionalSpecDraft.label}
                onChange={(event) =>
                  setAdditionalSpecDraft((current) => ({ ...current, label: event.target.value }))
                }
              />
            </label>
            <label className="admin_field">
              <span>Значение</span>
              <input
                className="admin_input"
                value={additionalSpecDraft.value}
                onChange={(event) =>
                  setAdditionalSpecDraft((current) => ({ ...current, value: event.target.value }))
                }
              />
            </label>
          </div>
          <div className="admin_form_actions">
            <button className="admin_button_muted" type="button" onClick={addAdditionalSpec}>
              Добавить характеристику
            </button>
          </div>
        </section>

        {error ? <p className="admin_error">{error}</p> : null}

        <div className="admin_form_actions">
          <button className="admin_button" type="submit">
            Сохранить
          </button>
        </div>
      </form>
    </>
  );
}
