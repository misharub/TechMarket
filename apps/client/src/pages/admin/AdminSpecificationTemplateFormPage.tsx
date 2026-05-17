import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategories, type CategoryNode } from "../../lib/categories-api";
import {
  createSpecificationTemplate,
  getSpecificationTemplate,
  updateSpecificationTemplate,
  type SpecificationTemplatePayload,
} from "../../lib/specification-templates-api";
import { useToastStore } from "../../lib/toast-store";

type DraftOption = SpecificationTemplatePayload["groups"][number]["specifications"][number]["options"][number];
type DraftSpecification = SpecificationTemplatePayload["groups"][number]["specifications"][number];
type DraftGroup = SpecificationTemplatePayload["groups"][number];

const emptyGroup = (): DraftGroup => ({
  name: "",
  sortOrder: 1,
  specifications: [],
});

const emptySpecification = (): DraftSpecification => ({
  name: "",
  type: "STRING",
  unit: "",
  isRequired: false,
  sortOrder: 1,
  options: [],
});

function buildCategoryLabel(category: CategoryNode, categoriesById: Map<string, CategoryNode>) {
  const path: string[] = [];
  let current: CategoryNode | undefined = category;

  while (current) {
    path.unshift(current.name);
    current = current.parentId ? categoriesById.get(current.parentId) : undefined;
  }

  return path.join(" / ");
}

export function AdminSpecificationTemplateFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const showToast = useToastStore((state) => state.showToast);
  const [form, setForm] = useState<SpecificationTemplatePayload>({
    name: "",
    categoryId: "",
    groups: [],
  });
  const [error, setError] = useState("");
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => getCategories(true),
  });
  const templateQuery = useQuery({
    queryKey: ["admin", "specification_template", id],
    queryFn: () => getSpecificationTemplate(id!),
    enabled: isEdit,
  });
  const saveMutation = useMutation({
    mutationFn: (payload: SpecificationTemplatePayload) =>
      id ? updateSpecificationTemplate(id, payload) : createSpecificationTemplate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "specification_templates"] });
      showToast(id ? "Изменения сохранены" : "Шаблон характеристик создан");
      navigate("/admin/specification-templates");
    },
  });
  const categories = useMemo(() => {
    const items = categoriesQuery.data ?? [];
    const categoriesById = new Map(items.map((category) => [category.id, category]));

    return items
      .filter((category) => Boolean(category.parentId))
      .map((category) => ({
        ...category,
        label: buildCategoryLabel(category, categoriesById),
      }))
      .sort((left, right) => left.label.localeCompare(right.label, "ru"));
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (!templateQuery.data) {
      return;
    }

    setForm({
      name: templateQuery.data.name,
      categoryId: templateQuery.data.categoryId,
      groups: templateQuery.data.groups.map((group) => ({
        id: group.id,
        name: group.name,
        sortOrder: group.sortOrder,
        specifications: group.specifications.map((specification) => ({
          id: specification.id,
          name: specification.name,
          type: specification.type,
          unit: specification.unit ?? "",
          isRequired: specification.isRequired,
          sortOrder: specification.sortOrder,
          options: specification.options.map((option) => ({
            id: option.id,
            value: option.value,
            sortOrder: option.sortOrder,
          })),
        })),
      })),
    });
  }, [templateQuery.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await saveMutation.mutateAsync(form);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Не удалось сохранить изменения";
      setError(message);
      showToast(message, "error");
    }
  }

  function updateGroup(index: number, patch: Partial<DraftGroup>) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, currentIndex) => (currentIndex === index ? { ...group, ...patch } : group)),
    }));
  }

  function addGroup() {
    setForm((current) => ({
      ...current,
      groups: [...current.groups, { ...emptyGroup(), sortOrder: current.groups.length + 1 }],
    }));
    showToast("Категория характеристик создана");
  }

  function removeGroup(index: number) {
    setForm((current) => ({
      ...current,
      groups: current.groups.filter((_, currentIndex) => currentIndex !== index),
    }));
      showToast("Категория характеристик удалена", "danger");
  }

  function addSpecification(groupIndex: number) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, currentIndex) =>
        currentIndex === groupIndex
          ? {
              ...group,
              specifications: [
                ...group.specifications,
                { ...emptySpecification(), sortOrder: group.specifications.length + 1 },
              ],
            }
          : group,
      ),
    }));
    showToast("Характеристика создана");
  }

  function updateSpecification(groupIndex: number, specificationIndex: number, patch: Partial<DraftSpecification>) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              specifications: group.specifications.map((specification, currentSpecificationIndex) =>
                currentSpecificationIndex === specificationIndex ? { ...specification, ...patch } : specification,
              ),
            }
          : group,
      ),
    }));
  }

  function removeSpecification(groupIndex: number, specificationIndex: number) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              specifications: group.specifications.filter(
                (_, currentSpecificationIndex) => currentSpecificationIndex !== specificationIndex,
              ),
            }
          : group,
      ),
    }));
      showToast("Характеристика удалена", "danger");
  }

  function addOption(groupIndex: number, specificationIndex: number) {
    const option: DraftOption = { value: "", sortOrder: 1 };

    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              specifications: group.specifications.map((specification, currentSpecificationIndex) =>
                currentSpecificationIndex === specificationIndex
                  ? {
                      ...specification,
                      options: [...specification.options, { ...option, sortOrder: specification.options.length + 1 }],
                    }
                  : specification,
              ),
            }
          : group,
      ),
    }));
    showToast("Вариант создан");
  }

  function updateOption(groupIndex: number, specificationIndex: number, optionIndex: number, patch: Partial<DraftOption>) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              specifications: group.specifications.map((specification, currentSpecificationIndex) =>
                currentSpecificationIndex === specificationIndex
                  ? {
                      ...specification,
                      options: specification.options.map((option, currentOptionIndex) =>
                        currentOptionIndex === optionIndex ? { ...option, ...patch } : option,
                      ),
                    }
                  : specification,
              ),
            }
          : group,
      ),
    }));
  }

  function removeOption(groupIndex: number, specificationIndex: number, optionIndex: number) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              specifications: group.specifications.map((specification, currentSpecificationIndex) =>
                currentSpecificationIndex === specificationIndex
                  ? {
                      ...specification,
                      options: specification.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex),
                    }
                  : specification,
              ),
            }
          : group,
      ),
    }));
      showToast("Вариант удалён", "danger");
  }

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">{isEdit ? "Редактировать шаблон" : "Новый шаблон"}</h1>
        <Link className="admin_button_muted" to="/admin/specification-templates">
          Назад
        </Link>
      </header>

      <form className="admin_form admin_template_form" onSubmit={handleSubmit}>
        <section className="admin_panel admin_form admin_template_builder">
          <div className="admin_form_grid">
            <label className="admin_field">
              <span>Название шаблона</span>
              <input
                className="admin_input"
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="admin_field">
              <span>Категория товара</span>
              <select
                className="admin_select"
                required
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="admin_panel admin_form">
          <div className="admin_panel_title">
            <span>Категории характеристик</span>
            <button className="admin_button_muted" type="button" onClick={addGroup}>
              Добавить категорию
            </button>
          </div>

          {!form.groups.length ? <p className="admin_empty">Добавьте первую категорию характеристик.</p> : null}

          {form.groups.map((group, groupIndex) => (
            <details className="admin_spec_template_group" key={group.id ?? `group-${groupIndex}`} open>
              <summary>
                <strong>{group.name || "Новая категория"}</strong>
                <span>{group.specifications.length} характеристик</span>
              </summary>

              <div className="admin_spec_template_group_body">
                <div className="admin_form_grid">
                  <label className="admin_field">
                    <span>Название категории</span>
                    <input
                      className="admin_input"
                      required
                      value={group.name}
                      onChange={(event) => updateGroup(groupIndex, { name: event.target.value })}
                    />
                  </label>
                  <label className="admin_field">
                    <span>Порядок отображения</span>
                    <input
                      className="admin_input"
                      type="number"
                      min={0}
                      value={group.sortOrder}
                      onChange={(event) => updateGroup(groupIndex, { sortOrder: Number(event.target.value) })}
                    />
                  </label>
                </div>

                <div className="admin_inline_actions">
                  <button className="admin_button_muted" type="button" onClick={() => addSpecification(groupIndex)}>
                    Добавить характеристику
                  </button>
                  <button className="admin_button_danger" type="button" onClick={() => removeGroup(groupIndex)}>
                    Удалить категорию
                  </button>
                </div>

                {group.specifications.map((specification, specificationIndex) => (
                  <article
                    className="admin_specification_editor"
                    key={specification.id ?? `specification-${groupIndex}-${specificationIndex}`}
                  >
                    <header className="admin_specification_header">
                      <span>Характеристика {specificationIndex + 1}</span>
                      <strong>{specification.name || "Новая характеристика"}</strong>
                    </header>

                    <div className="admin_form_grid">
                      <label className="admin_field">
                        <span>Название характеристики</span>
                        <input
                          className="admin_input"
                          required
                          value={specification.name}
                          onChange={(event) =>
                            updateSpecification(groupIndex, specificationIndex, { name: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin_field">
                        <span>Тип поля</span>
                        <select
                          className="admin_select"
                          value={specification.type}
                          onChange={(event) =>
                            updateSpecification(groupIndex, specificationIndex, {
                              type: event.target.value as DraftSpecification["type"],
                              options: event.target.value === "SELECT" ? specification.options : [],
                            })
                          }
                        >
                          <option value="STRING">text</option>
                          <option value="NUMBER">number</option>
                          <option value="SELECT">select</option>
                          <option value="BOOLEAN">boolean</option>
                        </select>
                      </label>
                      <label className="admin_field">
                        <span>Единица измерения</span>
                        <input
                          className="admin_input"
                          value={specification.unit ?? ""}
                          onChange={(event) =>
                            updateSpecification(groupIndex, specificationIndex, { unit: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin_field">
                        <span>Порядок отображения</span>
                        <input
                          className="admin_input"
                          type="number"
                          min={0}
                          value={specification.sortOrder}
                          onChange={(event) =>
                            updateSpecification(groupIndex, specificationIndex, { sortOrder: Number(event.target.value) })
                          }
                        />
                      </label>
                    </div>

                    <div className="admin_inline_actions">
                      <label className="admin_checkbox">
                        <input
                          type="checkbox"
                          checked={specification.isRequired}
                          onChange={(event) =>
                            updateSpecification(groupIndex, specificationIndex, {
                              isRequired: event.target.checked,
                            })
                          }
                        />
                        Обязательная характеристика
                      </label>
                      <button
                        className="admin_button_danger"
                        type="button"
                        onClick={() => removeSpecification(groupIndex, specificationIndex)}
                      >
                        Удалить характеристику
                      </button>
                    </div>

                    {specification.type === "SELECT" ? (
                      <div className="admin_select_options">
                        <div className="admin_panel_title">
                          <span>Варианты выбора</span>
                          <button
                            className="admin_button_muted"
                            type="button"
                            onClick={() => addOption(groupIndex, specificationIndex)}
                          >
                            Добавить вариант
                          </button>
                        </div>
                        {specification.options.map((option, optionIndex) => (
                          <div className="admin_option_row" key={option.id ?? `option-${optionIndex}`}>
                            <input
                              className="admin_input"
                              required
                              value={option.value}
                              onChange={(event) =>
                                updateOption(groupIndex, specificationIndex, optionIndex, { value: event.target.value })
                              }
                            />
                            <input
                              className="admin_input"
                              type="number"
                              min={0}
                              value={option.sortOrder}
                              onChange={(event) =>
                                updateOption(groupIndex, specificationIndex, optionIndex, {
                                  sortOrder: Number(event.target.value),
                                })
                              }
                            />
                            <button
                              className="admin_button_danger"
                              type="button"
                              onClick={() => removeOption(groupIndex, specificationIndex, optionIndex)}
                            >
                              Удалить
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </details>
          ))}
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
