import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { uploadImage } from "../../lib/admin-api";
import { getAdminHomeSlider, updateHomeSlider, type HomeSliderPayload } from "../../lib/home-slider-api";
import { AdminImageUploadField } from "./AdminImageUploadField";

const initialForm: HomeSliderPayload = {
  kicker: "Умная витрина TechMarket",
  title: "Техника для работы, учебы и дома без лишнего шума",
  description:
    "Главная собирает категории, новинки и скидки прямо из API. Видны наличие, цена, рейтинг и быстрый переход в каталог.",
  primaryText: "",
  primaryLabel: "",
  secondaryText: "",
  secondaryLabel: "",
  panelKicker: "Price watch",
  panelTitle: "Подборка товаров со старой ценой",
  panelDescription: "Запустите API, чтобы увидеть актуальные товары и скидки.",
  imageUrl: "",
  isActive: true,
};

export function AdminHomeSliderPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HomeSliderPayload>(initialForm);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const sliderQuery = useQuery({
    queryKey: ["admin", "home-slider"],
    queryFn: getAdminHomeSlider,
  });

  const saveMutation = useMutation({
    mutationFn: updateHomeSlider,
    onSuccess: async (slider) => {
      setSaved(true);
      setForm(toForm(slider));
      await queryClient.invalidateQueries({ queryKey: ["admin", "home-slider"] });
      await queryClient.invalidateQueries({ queryKey: ["home-slider"] });
    },
  });

  useEffect(() => {
    if (sliderQuery.data) {
      setForm(toForm(sliderQuery.data));
    }
  }, [sliderQuery.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);

    try {
      await saveMutation.mutateAsync(form);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось сохранить слайдер");
    }
  }

  async function handleImageUpload(file: File) {
    try {
      const result = await uploadImage(file, "general");
      setForm((current) => ({ ...current, imageUrl: result.url }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить изображение");
    }
  }

  function updateField(name: keyof HomeSliderPayload, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Главный слайдер</h1>
        <Link className="admin_button_muted" to="/">
          На сайт
        </Link>
      </header>

      <form className="admin_panel admin_form" onSubmit={handleSubmit}>
        <div className="admin_form_grid">
          <label className="admin_field">
            <span>Бейдж</span>
            <input
              className="admin_input"
              required
              value={form.kicker}
              onChange={(event) => updateField("kicker", event.target.value)}
            />
          </label>
          <label className="admin_checkbox">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Показывать слайдер
          </label>
          <label className="admin_field admin_field_full">
            <span>Заголовок</span>
            <input
              className="admin_input"
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>
          <label className="admin_field admin_field_full">
            <span>Описание</span>
            <textarea
              className="admin_textarea"
              required
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>
          <div className="admin_field_full">
            <AdminImageUploadField
              label="Картинка"
              images={form.imageUrl ? [form.imageUrl] : []}
              onSelect={(files) => {
                const file = files?.[0];
                if (file) {
                  void handleImageUpload(file);
                }
              }}
              onRemove={() => setForm((current) => ({ ...current, imageUrl: "" }))}
            />
            <p className="admin_hint">Если картинку не выбрать, на главной останется исходное изображение.</p>
          </div>
        </div>

        {error ? <p className="admin_error">{error}</p> : null}
        {saved ? <p className="admin_success">Слайдер сохранен.</p> : null}

        <div className="admin_form_actions">
          <button className="admin_button" type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </form>
    </>
  );
}

function toForm(slider: HomeSliderPayload): HomeSliderPayload {
  return {
    kicker: slider.kicker,
    title: slider.title,
    description: slider.description,
    primaryText: slider.primaryText ?? "",
    primaryLabel: slider.primaryLabel ?? "",
    secondaryText: slider.secondaryText ?? "",
    secondaryLabel: slider.secondaryLabel ?? "",
    panelKicker: slider.panelKicker,
    panelTitle: slider.panelTitle,
    panelDescription: slider.panelDescription,
    imageUrl: slider.imageUrl ?? "",
    isActive: slider.isActive,
  };
}
