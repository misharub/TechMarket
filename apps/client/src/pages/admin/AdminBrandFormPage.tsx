import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { uploadImage } from "../../lib/admin-api";
import { createBrand, getBrand, updateBrand, type BrandPayload } from "../../lib/brands-api";
import { isValidSlug, slugify } from "../../lib/slug-utils";
import { AdminImageUploadField } from "./AdminImageUploadField";

export function AdminBrandFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<BrandPayload>({
    name: "",
    slug: "",
    description: "",
    logo: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const brandQuery = useQuery({
    queryKey: ["admin", "brand", id],
    queryFn: () => getBrand(id!),
    enabled: isEdit,
  });
  const saveMutation = useMutation({
    mutationFn: (payload: BrandPayload) => {
      if (id) {
        return updateBrand(id, payload);
      }

      const { isActive, ...createPayload } = payload;

      return createBrand(createPayload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "catalog_stats"] });
      navigate("/admin/brands");
    },
  });

  useEffect(() => {
    if (brandQuery.data) {
      setForm({
        name: brandQuery.data.name,
        slug: brandQuery.data.slug,
        description: brandQuery.data.description ?? "",
        logo: brandQuery.data.logo ?? "",
        isActive: brandQuery.data.isActive,
      });
      setSlugEdited(true);
    }
  }, [brandQuery.data]);

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
      setError(nextError instanceof Error ? nextError.message : "Не удалось сохранить бренд");
    }
  }

  async function handleLogoUpload(file: File) {
    try {
      const result = await uploadImage(file, "brands");
      setForm((current) => ({ ...current, logo: result.url }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить логотип");
    }
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">{isEdit ? "Редактировать бренд" : "Новый бренд"}</h1>
        <Link className="admin_button_muted" to="/admin/brands">
          Назад
        </Link>
      </header>

      <form className="admin_panel admin_form" onSubmit={handleSubmit}>
        <div className="admin_form_grid">
          <label className="admin_field admin_category_name_field">
            <span>Название</span>
            <input
              className="admin_input"
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
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
          <label className="admin_field admin_field_full">
            <span>Описание</span>
            <textarea
              className="admin_textarea"
              value={form.description ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <AdminImageUploadField
            label="Логотип"
            images={form.logo ? [form.logo] : []}
            onSelect={(files) => {
              const file = files?.[0];
              if (file) {
                void handleLogoUpload(file);
              }
            }}
            onRemove={() => setForm((current) => ({ ...current, logo: "" }))}
          />
          <label className="admin_checkbox">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Активен
          </label>
        </div>

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
