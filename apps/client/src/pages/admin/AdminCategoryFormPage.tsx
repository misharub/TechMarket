import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { uploadImage } from "../../lib/admin-api";
import {
  createCategoryCollection,
  deleteAdminCollection,
  getCategoryCollections,
  updateCategoryCollection,
  type CategoryCollectionPayload,
} from "../../lib/category-collections-api";
import { getBrands, type Brand } from "../../lib/brands-api";
import { createCategory, getCategories, getCategory, updateCategory, type CategoryPayload } from "../../lib/categories-api";
import { isValidSlug, slugify } from "../../lib/slug-utils";
import {
  getSpecificationTemplateByCategory,
  type Specification,
  type SpecificationTemplate,
} from "../../lib/specification-templates-api";
import { useToastStore } from "../../lib/toast-store";
import { AdminImageUploadField } from "./AdminImageUploadField";
import { getCategoryDepth, getChildCategories, getRootCategories } from "./admin-utils";

type CollectionConditionDraft = {
  groupId: string;
  specificationId: string;
  operator: CollectionOperator;
  value: string;
  optionId: string;
};

type CollectionOperator = "equals" | "notEquals" | "greaterThan" | "lessThan";

type CollectionDraft = {
  name: string;
  slug: string;
  conditions: CollectionConditionDraft[];
  sortOrder: number;
  legacyBrandSlug?: string;
};

const NEW_FIRST_LEVEL = "__new_first_level__";
const NEW_SECOND_LEVEL = "__new_second_level__";

const emptyCondition = (): CollectionConditionDraft => ({
  groupId: "",
  specificationId: "",
  operator: "equals",
  value: "",
  optionId: "",
});

const emptyCollection = (): CollectionDraft => ({
  name: "",
  slug: "",
  conditions: [],
  sortOrder: 0,
});

function getSpecification(specificationId: string, template: SpecificationTemplate | null | undefined) {
  return template?.groups.flatMap((group) => group.specifications).find((specification) => specification.id === specificationId);
}

function getGroupIdForSpecification(specificationId: string, template: SpecificationTemplate | null | undefined) {
  return template?.groups.find((group) => group.specifications.some((specification) => specification.id === specificationId))?.id ?? "";
}

function conditionFromRule(
  rule: { specificationId?: string; operator?: unknown; value?: unknown; optionId?: string },
  template: SpecificationTemplate | null | undefined,
): CollectionConditionDraft | null {
  if (!rule.specificationId) {
    return null;
  }

  const specification = getSpecification(rule.specificationId, template);

  if (!specification) {
    return null;
  }

  return {
    groupId: getGroupIdForSpecification(specification.id, template),
    specificationId: specification.id,
    operator: normalizeOperator(rule.operator, specification),
    value: rule.value === undefined || rule.value === null ? "" : String(rule.value),
    optionId: rule.optionId ?? "",
  };
}

function conditionFromLegacySpec(
  key: string,
  value: unknown,
  template: SpecificationTemplate | null | undefined,
): CollectionConditionDraft | null {
  const specification = template?.groups
    .flatMap((group) => group.specifications)
    .find((item) => item.key === key);

  if (!specification) {
    return null;
  }

  return {
    groupId: getGroupIdForSpecification(specification.id, template),
    specificationId: specification.id,
    operator: "equals" as const,
    value: specification.type === "SELECT" ? "" : String(value ?? ""),
    optionId:
      specification.type === "SELECT"
        ? specification.options.find((option) => option.value === String(value))?.id ?? ""
        : "",
  };
}

function isNumericSelectSpecification(specification: Specification | undefined) {
  return Boolean(
    specification &&
      specification.type === "SELECT" &&
      specification.options.length > 0 &&
      specification.options.every((option) => option.value.trim() !== "" && Number.isFinite(Number(option.value))),
  );
}

function getOperatorsForSpecification(specification: Specification | undefined): Array<{
  value: CollectionOperator;
  label: string;
}> {
  if (specification?.type === "NUMBER" || isNumericSelectSpecification(specification)) {
    return [
      { value: "equals", label: "Равно" },
      { value: "notEquals", label: "Не равно" },
      { value: "greaterThan", label: "Больше" },
      { value: "lessThan", label: "Меньше" },
    ];
  }

  return [
    { value: "equals", label: "Равно" },
    { value: "notEquals", label: "Не равно" },
  ];
}

function normalizeOperator(operator: unknown, specification: Specification): CollectionOperator {
  const allowedOperators = getOperatorsForSpecification(specification).map((item) => item.value);
  return typeof operator === "string" && allowedOperators.includes(operator as CollectionOperator)
    ? (operator as CollectionOperator)
    : "equals";
}

function getOperatorLabel(operator: CollectionOperator) {
  return [
    { value: "equals", label: "Равно" },
    { value: "notEquals", label: "Не равно" },
    { value: "greaterThan", label: "Больше" },
    { value: "lessThan", label: "Меньше" },
  ].find((item) => item.value === operator)?.label ?? "Равно";
}

function summarizeCollectionConditions(
  collection: { conditions: Record<string, unknown> },
  template: SpecificationTemplate | null | undefined,
  brands: Brand[],
) {
  const conditions = collection.conditions as {
    brandSlug?: string;
    specs?: Record<string, unknown>;
    rules?: Array<{ specificationId?: string; operator?: CollectionOperator; value?: unknown; optionId?: string }>;
  };
  const labels: string[] = [];

  for (const rule of conditions.rules ?? []) {
    const specification = rule.specificationId ? getSpecification(rule.specificationId, template) : undefined;

    if (!specification) {
      continue;
    }

    const value =
      specification.type === "SELECT"
        ? specification.options.find((option) => option.id === rule.optionId)?.value
        : rule.value;

    if (value !== undefined && value !== null && value !== "") {
      labels.push(`${specification.name} ${getOperatorLabel(rule.operator ?? "equals").toLowerCase()} ${String(value)}`);
    }
  }

  for (const [key, value] of Object.entries(conditions.specs ?? {})) {
    const specification = template?.groups.flatMap((group) => group.specifications).find((item) => item.key === key);
    labels.push(`${specification?.name ?? key} = ${String(value)}`);
  }

  if (conditions.brandSlug) {
    const brandName = brands.find((brand) => brand.slug === conditions.brandSlug)?.name ?? conditions.brandSlug;
    labels.push(`Бренд = ${brandName}`);
  }

  return labels.length ? labels.join(", ") : "Без условий";
}

export function AdminCategoryFormPage({ collectionsOnly = false }: { collectionsOnly?: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const showToast = useToastStore((state) => state.showToast);
  const [form, setForm] = useState<CategoryPayload>({
    name: "",
    slug: "",
    description: "",
    image: "",
    sortOrder: 0,
    parentId: searchParams.get("parentId"),
    isActive: true,
  });
  const [error, setError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [collectionSlugEdited, setCollectionSlugEdited] = useState(false);
  const [collectionDraft, setCollectionDraft] = useState<CollectionDraft>(emptyCollection);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);
  const [firstLevelId, setFirstLevelId] = useState("");
  const [secondLevelId, setSecondLevelId] = useState("");
  const [sortOrderDraft, setSortOrderDraft] = useState("0");

  const categoryQuery = useQuery({ queryKey: ["admin", "category", id], queryFn: () => getCategory(id!), enabled: isEdit });
  const categoriesQuery = useQuery({ queryKey: ["admin", "categories"], queryFn: () => getCategories(true) });
  const categories = categoriesQuery.data ?? [];
  const firstLevelCategories = useMemo(
    () => getRootCategories(categories).filter((category) => category.id !== id),
    [categories, id],
  );
  const secondLevelCategories = useMemo(
    () =>
      firstLevelId && firstLevelId !== NEW_FIRST_LEVEL
        ? getChildCategories(categories, firstLevelId).filter((category) => category.id !== id)
        : [],
    [categories, firstLevelId, id],
  );
  const currentCategory = categories.find((category) => category.id === id);
  const isSecondLevelCategory = Boolean(currentCategory && getCategoryDepth(currentCategory, categories) === 1);
  const collectionsQuery = useQuery({
    queryKey: ["admin", "category_collections", id],
    queryFn: () => getCategoryCollections(id!),
    enabled: isEdit && isSecondLevelCategory,
  });
  const templateQuery = useQuery({
    queryKey: ["admin", "specification_template_by_category", id],
    queryFn: () => getSpecificationTemplateByCategory(id!),
    enabled: isEdit && isSecondLevelCategory,
  });
  const brandsQuery = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => getBrands({ includeInactive: true }),
    enabled: isEdit && isSecondLevelCategory,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      id
        ? updateCategory(id, payload)
        : createCategory({
            name: payload.name,
            slug: payload.slug,
            description: payload.description,
            image: payload.image,
            sortOrder: payload.sortOrder,
            parentId: payload.parentId ?? undefined,
          }),
    onSuccess: async (category) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
      if (!id) {
        navigate(`/admin/categories/${category.id}/edit`, { replace: true });
        showToast("Категория создана");
        return;
      }

      showToast("Изменения сохранены");
    },
  });
  const createCollectionMutation = useMutation({
    mutationFn: (payload: CategoryCollectionPayload) => createCategoryCollection(id!, payload),
    onSuccess: async () => {
      setCollectionDraft(emptyCollection());
      setCollectionSlugEdited(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "category_collections", id] });
      showToast("Подборка создана");
    },
  });
  const updateCollectionMutation = useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: Partial<CategoryCollectionPayload> }) =>
      updateCategoryCollection(id!, collectionId, payload),
    onSuccess: async () => {
      setEditingCollectionId(null);
      setCollectionDraft(emptyCollection());
      setCollectionSlugEdited(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "category_collections", id] });
      showToast("Изменения сохранены");
    },
  });
  const deleteCollectionMutation = useMutation({
    mutationFn: (collectionId: string) => deleteAdminCollection(collectionId),
    onSuccess: async () => {
      setDeletingCollectionId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "category_collections", id] });
      showToast("Подборка удалена", "danger");
    },
    onError: (nextError) => showToast(nextError instanceof Error ? nextError.message : "Не удалось удалить подборку", "error"),
  });

  useEffect(() => {
    if (categoryQuery.data) {
      const parent = categories.find((category) => category.id === categoryQuery.data.parentId);
      const grandParent = parent?.parentId ? categories.find((category) => category.id === parent.parentId) : undefined;

      setForm({
        name: categoryQuery.data.name,
        slug: categoryQuery.data.slug,
        description: categoryQuery.data.description ?? "",
        image: categoryQuery.data.image ?? "",
        sortOrder: categoryQuery.data.sortOrder,
        parentId: categoryQuery.data.parentId,
        isActive: categoryQuery.data.isActive,
      });
      setSortOrderDraft(String(categoryQuery.data.sortOrder));
      setFirstLevelId(grandParent?.id ?? parent?.id ?? "");
      setSecondLevelId(grandParent ? parent?.id ?? "" : "");
      setSlugEdited(true);
    }
  }, [categories, categoryQuery.data]);

  useEffect(() => {
    if (isEdit || !form.parentId || !categories.length) {
      return;
    }

    const parent = categories.find((category) => category.id === form.parentId);
    const grandParent = parent?.parentId ? categories.find((category) => category.id === parent.parentId) : undefined;

    setFirstLevelId(grandParent?.id ?? parent?.id ?? "");
    setSecondLevelId(grandParent ? parent?.id ?? "" : "");
  }, [categories, form.parentId, isEdit]);

  useEffect(() => {
    if (isEdit || !categories.length) {
      return;
    }

    const targetParentId = form.parentId ?? null;
    const siblings = categories.filter((category) => category.parentId === targetParentId);
    const nextSortOrder = siblings.length ? Math.max(...siblings.map((category) => category.sortOrder)) + 1 : 1;

    setForm((current) => (current.sortOrder === nextSortOrder ? current : { ...current, sortOrder: nextSortOrder }));
    setSortOrderDraft(String(nextSortOrder));
  }, [categories, form.parentId, isEdit]);

  function updateCategoryLevel(nextFirstLevelId: string, nextSecondLevelId: string) {
    setFirstLevelId(nextFirstLevelId);
    setSecondLevelId(nextSecondLevelId);
    setForm((current) => ({
      ...current,
      parentId:
        nextFirstLevelId === NEW_FIRST_LEVEL
          ? null
          : nextSecondLevelId === NEW_SECOND_LEVEL
            ? nextFirstLevelId || null
            : nextSecondLevelId || nextFirstLevelId || null,
    }));
  }

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
      setError(nextError instanceof Error ? nextError.message : "Не удалось сохранить категорию");
    }
  }

  async function handleImageUpload(file: File) {
    setImageBusy(true);
    setError("");
    try {
      const result = await uploadImage(file, "categories");
      setForm((current) => ({ ...current, image: result.url }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить изображение");
    } finally {
      setImageBusy(false);
    }
  }

  async function handleCollectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;

    if (!isValidSlug(collectionDraft.slug)) {
      showToast("Адрес страницы подборки заполнен некорректно", "error");
      return;
    }

    if (!collectionDraft.conditions.length && !collectionDraft.legacyBrandSlug) {
      showToast("Добавьте хотя бы одно условие подборки", "error");
      return;
    }

    try {
      const rules = collectionDraft.conditions.map((condition) => {
        const specification = getSpecification(condition.specificationId, templateQuery.data);

        if (!specification) {
          throw new Error("Выберите характеристику для каждого условия");
        }

        if (specification.type === "SELECT") {
          if (!condition.optionId) {
            throw new Error("Выберите вариант значения");
          }

          return {
            specificationId: specification.id,
            operator: normalizeOperator(condition.operator, specification),
            optionId: condition.optionId,
          };
        }

        if (specification.type === "NUMBER") {
          const value = Number(condition.value);

          if (!Number.isFinite(value)) {
            throw new Error("Введите числовое значение");
          }

          return {
            specificationId: specification.id,
            operator: normalizeOperator(condition.operator, specification),
            value,
          };
        }

        if (specification.type === "BOOLEAN") {
          if (condition.value !== "true" && condition.value !== "false") {
            throw new Error("Выберите значение Да или Нет");
          }

          return {
            specificationId: specification.id,
            operator: normalizeOperator(condition.operator, specification),
            value: condition.value === "true",
          };
        }

        if (!condition.value.trim()) {
          throw new Error("Заполните значение для текстовой характеристики");
        }

        return {
          specificationId: specification.id,
          operator: normalizeOperator(condition.operator, specification),
          value: condition.value.trim(),
        };
      });

      const payload: CategoryCollectionPayload = {
        name: collectionDraft.name,
        slug: collectionDraft.slug,
        sortOrder: collectionDraft.sortOrder,
        conditions: {
          ...(collectionDraft.legacyBrandSlug ? { brandSlug: collectionDraft.legacyBrandSlug } : {}),
          rules,
        },
      };

      if (editingCollectionId) {
        await updateCollectionMutation.mutateAsync({ collectionId: editingCollectionId, payload });
        return;
      }
      await createCollectionMutation.mutateAsync(payload);
    } catch (nextError) {
      showToast(nextError instanceof Error ? nextError.message : "Не удалось сохранить изменения", "error");
    }
  }

  function startEditCollection(collection: { id: string; name: string; slug: string; sortOrder: number; conditions: Record<string, unknown> }) {
    const conditions = collection.conditions as {
      brandSlug?: string;
      specs?: Record<string, unknown>;
      rules?: Array<{ specificationId?: string; operator?: unknown; value?: unknown; optionId?: string }>;
    };
    const template = templateQuery.data;
    const modernConditions = (conditions.rules ?? [])
      .map((rule) => conditionFromRule(rule, template))
      .filter((condition): condition is CollectionConditionDraft => Boolean(condition));
    const legacyConditions = Object.entries(conditions.specs ?? {})
      .map(([key, value]) => conditionFromLegacySpec(key, value, template))
      .filter((condition): condition is CollectionConditionDraft => Boolean(condition));

    setEditingCollectionId(collection.id);
    setCollectionSlugEdited(true);
    setCollectionDraft({
      name: collection.name,
      slug: collection.slug,
      sortOrder: collection.sortOrder,
      conditions: modernConditions.length ? modernConditions : legacyConditions,
      legacyBrandSlug: conditions.brandSlug,
    });
  }

  const collections = useMemo(() => collectionsQuery.data ?? [], [collectionsQuery.data]);
  const template = templateQuery.data;
  const brands = brandsQuery.data ?? [];

  function addCondition() {
    setCollectionDraft((current) => ({
      ...current,
      conditions: [...current.conditions, emptyCondition()],
    }));
  }

  function updateCondition(index: number, patch: Partial<CollectionConditionDraft>) {
    setCollectionDraft((current) => ({
      ...current,
      conditions: current.conditions.map((condition, currentIndex) =>
        currentIndex === index ? { ...condition, ...patch } : condition,
      ),
    }));
  }

  function removeCondition(index: number) {
    setCollectionDraft((current) => ({
      ...current,
      conditions: current.conditions.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">
          {collectionsOnly ? "Подборки категории" : isEdit ? "Редактировать категорию" : "Новая категория"}
        </h1>
        <Link className="admin_button_muted" to="/admin/categories">Назад</Link>
      </header>

      {!collectionsOnly ? <form className="admin_panel admin_form" onSubmit={handleSubmit}>
        <div className="admin_form_grid">
          <label className="admin_field admin_category_name_field"><span>Название</span><input className="admin_input" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: slugEdited ? current.slug : slugify(event.target.value) }))} /></label>
          <label className="admin_field admin_category_slug_field"><span>Адрес страницы</span><p className="admin_hint">Латинские буквы, цифры и дефисы без пробелов.</p><input className="admin_input" required value={form.slug} onChange={(event) => { setSlugEdited(true); setForm((current) => ({ ...current, slug: event.target.value })); }} /></label>
          <label className="admin_field">
            <span>1-й уровень</span>
            <select
              className="admin_select"
              value={firstLevelId}
              onChange={(event) => updateCategoryLevel(event.target.value, "")}
            >
              {!firstLevelId ? <option value="" disabled hidden>Выберите категорию</option> : null}
              <option value={NEW_FIRST_LEVEL}>Новый 1-й уровень</option>
              {firstLevelCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="admin_field">
            <span>2-й уровень</span>
            <select
              className="admin_select"
              disabled={!firstLevelId || firstLevelId === NEW_FIRST_LEVEL}
              value={secondLevelId}
              onChange={(event) => updateCategoryLevel(firstLevelId, event.target.value)}
            >
              {!secondLevelId ? <option value="" disabled hidden>Выберите категорию</option> : null}
              {firstLevelId && firstLevelId !== NEW_FIRST_LEVEL ? (
                <option value={NEW_SECOND_LEVEL}>Новый 2-й уровень</option>
              ) : null}
              {secondLevelCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <p className="admin_hint admin_field_full">
            Новый 1-й уровень создаёт корневую категорию. Новый 2-й уровень — раздел внутри выбранного 1-го уровня.
          </p>
          <label className="admin_field"><span>Порядок</span><input className="admin_input" inputMode="numeric" min={0} type="number" value={sortOrderDraft} onChange={(event) => { const value = event.target.value; setSortOrderDraft(value); if (value !== "") setForm((current) => ({ ...current, sortOrder: Number(value) })); }} onBlur={() => { const normalized = sortOrderDraft === "" ? 0 : Number(sortOrderDraft); setSortOrderDraft(String(normalized)); setForm((current) => ({ ...current, sortOrder: normalized })); }} /></label>
          <label className="admin_field admin_field_full"><span>Описание</span><textarea className="admin_textarea" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
          <AdminImageUploadField
            label="Изображение"
            images={form.image ? [form.image] : []}
            onSelect={(files) => {
              const file = files?.[0];
              if (file) void handleImageUpload(file);
            }}
            onRemove={() => setForm((current) => ({ ...current, image: "" }))}
          />
          <label className="admin_checkbox"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />Активна</label>
        </div>
        {imageBusy ? <p>Загрузка изображения...</p> : null}
        {error ? <p className="admin_error">{error}</p> : null}
        <div className="admin_form_actions"><button className="admin_button" type="submit">Сохранить</button></div>
      </form> : null}

      {id && collectionsOnly && isSecondLevelCategory ? (
        <>
          <section className="admin_panel admin_form">
            <h2>Подборки</h2>
            <form className="admin_form" onSubmit={handleCollectionSubmit}>
              <div className="admin_form_grid">
                <label className="admin_field admin_category_name_field"><span>Название</span><input className="admin_input" required value={collectionDraft.name} onChange={(event) => setCollectionDraft((current) => ({ ...current, name: event.target.value, slug: collectionSlugEdited ? current.slug : slugify(event.target.value) }))} /></label>
                <label className="admin_field admin_category_slug_field"><span>Адрес страницы</span><p className="admin_hint">Латинские буквы, цифры и дефисы без пробелов.</p><input className="admin_input" required value={collectionDraft.slug} onChange={(event) => { setCollectionSlugEdited(true); setCollectionDraft((current) => ({ ...current, slug: event.target.value })); }} /></label>
                <label className="admin_field"><span>Порядок</span><input className="admin_input" type="number" min={0} value={collectionDraft.sortOrder} onChange={(event) => setCollectionDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))} /></label>
                <label className="admin_field">
                  <span>Бренд</span>
                  <select
                    className="admin_select"
                    value={collectionDraft.legacyBrandSlug ?? ""}
                    onChange={(event) =>
                      setCollectionDraft((current) => ({
                        ...current,
                        legacyBrandSlug: event.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Любой бренд</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.slug}>{brand.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <section className="admin_collection_conditions">
                <div className="admin_panel_title">
                  <span>Условия подборки</span>
                  <button className="admin_button_muted" type="button" onClick={addCondition}>Добавить условие</button>
                </div>

                {!collectionDraft.conditions.length ? <p className="admin_empty">Добавьте первое условие подборки.</p> : null}

                {collectionDraft.conditions.map((condition, conditionIndex) => {
                  const group = template?.groups.find((item) => item.id === condition.groupId);
                  const specification = getSpecification(condition.specificationId, template);

                  return (
                    <article className="admin_collection_condition" key={`condition-${conditionIndex}`}>
                      <header className="admin_specification_header">
                        <span>Условие {conditionIndex + 1}</span>
                        <strong>{specification?.name ?? "Новая характеристика"}</strong>
                      </header>

                      <div className="admin_form_grid">
                        <label className="admin_field">
                          <span>Категория характеристик</span>
                          <select
                            className="admin_select"
                            required
                            value={condition.groupId}
                            onChange={(event) =>
                              updateCondition(conditionIndex, {
                                groupId: event.target.value,
                                specificationId: "",
                                operator: "equals",
                                value: "",
                                optionId: "",
                              })
                            }
                          >
                            <option value="">Выберите категорию</option>
                            {(template?.groups ?? []).map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="admin_field">
                          <span>Характеристика</span>
                          <select
                            className="admin_select"
                            required
                            disabled={!group}
                            value={condition.specificationId}
                            onChange={(event) =>
                              updateCondition(conditionIndex, {
                                specificationId: event.target.value,
                                operator: "equals",
                                value: "",
                                optionId: "",
                              })
                            }
                          >
                            <option value="">Выберите характеристику</option>
                            {(group?.specifications ?? []).map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="admin_field">
                          <span>Оператор</span>
                          <select
                            className="admin_select"
                            value={condition.operator}
                            onChange={(event) =>
                              updateCondition(conditionIndex, { operator: event.target.value as CollectionOperator })
                            }
                          >
                            {getOperatorsForSpecification(specification).map((operator) => (
                              <option key={operator.value} value={operator.value}>{operator.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="admin_field">
                          <span>Значение</span>
                          {specification?.type === "SELECT" ? (
                            <select
                              className="admin_select"
                              required
                              value={condition.optionId}
                              onChange={(event) => updateCondition(conditionIndex, { optionId: event.target.value })}
                            >
                              <option value="">Выберите значение</option>
                              {specification.options.map((option) => (
                                <option key={option.id} value={option.id}>{option.value}</option>
                              ))}
                            </select>
                          ) : specification?.type === "BOOLEAN" ? (
                            <select
                              className="admin_select"
                              required
                              value={condition.value}
                              onChange={(event) => updateCondition(conditionIndex, { value: event.target.value })}
                            >
                              <option value="">Выберите значение</option>
                              <option value="true">Да</option>
                              <option value="false">Нет</option>
                            </select>
                          ) : (
                            <input
                              className="admin_input"
                              required
                              type={specification?.type === "NUMBER" ? "number" : "text"}
                              value={condition.value}
                              onChange={(event) => updateCondition(conditionIndex, { value: event.target.value })}
                            />
                          )}
                        </label>
                      </div>

                      <div className="admin_inline_actions">
                        <button className="admin_button_danger" type="button" onClick={() => removeCondition(conditionIndex)}>
                          Удалить условие
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>

              <div className="admin_form_actions"><button className="admin_button" type="submit">{editingCollectionId ? "Сохранить подборку" : "Добавить подборку"}</button>{editingCollectionId ? <button className="admin_button_muted" type="button" onClick={() => { setEditingCollectionId(null); setCollectionDraft(emptyCollection()); setCollectionSlugEdited(false); }}>Отмена</button> : null}</div>
            </form>
            <div className="admin_table_wrap"><table className="admin_table"><thead><tr><th>Название</th><th>Адрес страницы</th><th>Условия</th><th>Действие</th></tr></thead><tbody>{collections.map((collection) => <tr key={collection.id}><td>{collection.name}</td><td>{collection.slug}</td><td>{summarizeCollectionConditions(collection, template, brands)}</td><td><div className="admin_inline_actions"><button className="admin_button_muted" type="button" onClick={() => startEditCollection(collection)}>Редактировать</button><button className="admin_button_danger" type="button" onClick={() => setDeletingCollectionId(collection.id)}>Удалить</button></div></td></tr>)}</tbody></table></div>
          </section>
        </>
      ) : id && collectionsOnly ? (
        <section className="admin_panel"><p className="admin_empty">Подборки доступны только у категорий 2-го уровня.</p></section>
      ) : null}

      {deletingCollectionId ? (
        <div className="admin_confirm_backdrop" role="presentation">
          <section aria-modal="true" className="admin_confirm_dialog" role="dialog">
            <h2>Удалить подборку?</h2>
            <p>Вы уверены, что хотите удалить эту подборку?</p>
            <div className="admin_form_actions">
              <button className="admin_button_muted" type="button" onClick={() => setDeletingCollectionId(null)}>Отмена</button>
              <button className="admin_button_danger" type="button" onClick={() => deleteCollectionMutation.mutate(deletingCollectionId)}>Удалить</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
