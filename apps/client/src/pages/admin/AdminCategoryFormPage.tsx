import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { uploadImage } from "../../lib/admin-api";
import {
  createCategoryCollection,
  deleteCategoryCollection,
  getCategoryCollections,
  updateCategoryCollection,
  type CategoryCollectionPayload,
} from "../../lib/category-collections-api";
import { createCategory, getCategories, getCategory, updateCategory, type CategoryPayload } from "../../lib/categories-api";

const emptyCollection = {
  name: "",
  slug: "",
  field: "purpose",
  value: "",
  sortOrder: 0,
};

type CollectionDraft = typeof emptyCollection;

export function AdminCategoryFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
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
  const [collectionDraft, setCollectionDraft] = useState<CollectionDraft>(emptyCollection);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);

  const categoryQuery = useQuery({ queryKey: ["admin", "category", id], queryFn: () => getCategory(id!), enabled: isEdit });
  const categoriesQuery = useQuery({ queryKey: ["admin", "categories"], queryFn: () => getCategories(true) });
  const isSection = Boolean(form.parentId);
  const collectionsQuery = useQuery({
    queryKey: ["admin", "category_collections", id],
    queryFn: () => getCategoryCollections(id!, true),
    enabled: isEdit && isSection,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      id
        ? updateCategory(id, payload)
        : createCategory({ ...payload, parentId: payload.parentId ?? undefined }),
    onSuccess: async (category) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
      if (!id) navigate(`/admin/categories/${category.id}/edit`, { replace: true });
    },
  });
  const createCollectionMutation = useMutation({
    mutationFn: (payload: CategoryCollectionPayload) => createCategoryCollection(id!, payload),
    onSuccess: async () => {
      setCollectionDraft(emptyCollection);
      await queryClient.invalidateQueries({ queryKey: ["admin", "category_collections", id] });
    },
  });
  const updateCollectionMutation = useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: Partial<CategoryCollectionPayload> }) =>
      updateCategoryCollection(id!, collectionId, payload),
    onSuccess: async () => {
      setEditingCollectionId(null);
      setCollectionDraft(emptyCollection);
      await queryClient.invalidateQueries({ queryKey: ["admin", "category_collections", id] });
    },
  });
  const deleteCollectionMutation = useMutation({
    mutationFn: (collectionId: string) => deleteCategoryCollection(id!, collectionId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["admin", "category_collections", id] }),
  });

  useEffect(() => {
    if (categoryQuery.data) {
      setForm({
        name: categoryQuery.data.name,
        slug: categoryQuery.data.slug,
        description: categoryQuery.data.description ?? "",
        image: categoryQuery.data.image ?? "",
        sortOrder: categoryQuery.data.sortOrder,
        parentId: categoryQuery.data.parentId,
        isActive: categoryQuery.data.isActive,
      });
    }
  }, [categoryQuery.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
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
    const payload: CategoryCollectionPayload = {
      name: collectionDraft.name,
      slug: collectionDraft.slug,
      sortOrder: collectionDraft.sortOrder,
      conditions:
        collectionDraft.field === "brandSlug"
          ? { brandSlug: collectionDraft.value }
          : { specs: { [collectionDraft.field]: collectionDraft.value } },
    };
    if (editingCollectionId) {
      await updateCollectionMutation.mutateAsync({ collectionId: editingCollectionId, payload });
      return;
    }
    await createCollectionMutation.mutateAsync(payload);
  }

  function startEditCollection(collection: { id: string; name: string; slug: string; sortOrder: number; conditions: Record<string, unknown> }) {
    const conditions = collection.conditions as { brandSlug?: string; specs?: Record<string, string> };
    const field = conditions.brandSlug ? "brandSlug" : Object.keys(conditions.specs ?? {})[0] ?? "purpose";
    const value = conditions.brandSlug ?? String(conditions.specs?.[field] ?? "");
    setEditingCollectionId(collection.id);
    setCollectionDraft({ name: collection.name, slug: collection.slug, sortOrder: collection.sortOrder, field, value });
  }

  const collections = useMemo(() => collectionsQuery.data ?? [], [collectionsQuery.data]);

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">{isEdit ? "Редактировать категорию" : "Новая категория"}</h1>
        <Link className="admin_button_muted" to="/admin/categories">Назад</Link>
      </header>

      <form className="admin_panel admin_form" onSubmit={handleSubmit}>
        <div className="admin_form_grid">
          <label className="admin_field"><span>Название</span><input className="admin_input" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label className="admin_field"><span>Slug</span><input className="admin_input" required value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} /></label>
          <label className="admin_field"><span>Родитель</span><select className="admin_select" value={form.parentId ?? ""} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value || null }))}><option value="">Без родителя</option>{(categoriesQuery.data ?? []).filter((category) => category.id !== id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="admin_field"><span>Порядок</span><input className="admin_input" type="number" min={0} value={form.sortOrder ?? 0} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} /></label>
          <label className="admin_field admin_field_full"><span>Описание</span><textarea className="admin_textarea" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
          <label className="admin_field"><span>Изображение</span><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleImageUpload(file); }} /></label>
          <label className="admin_checkbox"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />Активна</label>
        </div>
        {form.image ? <p>Изображение: {form.image}</p> : null}
        {imageBusy ? <p>Загрузка изображения...</p> : null}
        {error ? <p className="admin_error">{error}</p> : null}
        <div className="admin_form_actions"><button className="admin_button" type="submit">Сохранить</button></div>
      </form>

      {id && isSection ? (
        <>
          <section className="admin_panel admin_form">
            <h2>Подборки</h2>
            <form className="admin_form" onSubmit={handleCollectionSubmit}>
              <div className="admin_form_grid">
                <label className="admin_field"><span>Название</span><input className="admin_input" required value={collectionDraft.name} onChange={(event) => setCollectionDraft((current) => ({ ...current, name: event.target.value }))} /></label>
                <label className="admin_field"><span>Slug</span><input className="admin_input" required value={collectionDraft.slug} onChange={(event) => setCollectionDraft((current) => ({ ...current, slug: event.target.value }))} /></label>
                <label className="admin_field"><span>Поле</span><select className="admin_select" value={collectionDraft.field} onChange={(event) => setCollectionDraft((current) => ({ ...current, field: event.target.value }))}><option value="purpose">Назначение</option><option value="os">ОС</option><option value="processorFamily">Семейство процессора</option><option value="gpuSeries">Серия видеокарты</option><option value="brandSlug">Бренд</option></select></label>
                <label className="admin_field"><span>Значение</span><input className="admin_input" required value={collectionDraft.value} onChange={(event) => setCollectionDraft((current) => ({ ...current, value: event.target.value }))} /></label>
                <label className="admin_field"><span>Порядок</span><input className="admin_input" type="number" min={0} value={collectionDraft.sortOrder} onChange={(event) => setCollectionDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))} /></label>
              </div>
              <div className="admin_form_actions"><button className="admin_button" type="submit">{editingCollectionId ? "Сохранить подборку" : "Добавить подборку"}</button>{editingCollectionId ? <button className="admin_button_muted" type="button" onClick={() => { setEditingCollectionId(null); setCollectionDraft(emptyCollection); }}>Отмена</button> : null}</div>
            </form>
            <div className="admin_table_wrap"><table className="admin_table"><thead><tr><th>Название</th><th>Slug</th><th>Условие</th><th>Действие</th></tr></thead><tbody>{collections.map((collection) => <tr key={collection.id}><td>{collection.name}</td><td>{collection.slug}</td><td>{JSON.stringify(collection.conditions)}</td><td><div className="admin_inline_actions"><button className="admin_button_muted" type="button" onClick={() => startEditCollection(collection)}>Редактировать</button><button className="admin_button_danger" type="button" onClick={() => deleteCollectionMutation.mutate(collection.id)}>Удалить</button></div></td></tr>)}</tbody></table></div>
          </section>
        </>
      ) : id ? (
        <section className="admin_panel"><p className="admin_empty">Подборки доступны только у разделов категорий.</p></section>
      ) : null}
    </>
  );
}
