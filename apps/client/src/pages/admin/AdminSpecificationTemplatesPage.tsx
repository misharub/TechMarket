import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  deleteSpecificationTemplate,
  getSpecificationTemplates,
} from "../../lib/specification-templates-api";
import { useToastStore } from "../../lib/toast-store";
import { formatDate } from "./admin-utils";

export function AdminSpecificationTemplatesPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const templatesQuery = useQuery({
    queryKey: ["admin", "specification_templates"],
    queryFn: getSpecificationTemplates,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSpecificationTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "specification_templates"] });
      showToast("Шаблон характеристик удалён", "danger");
    },
    onError: (error) => showToast(error instanceof Error ? error.message : "Не удалось удалить запись", "error"),
  });

  return (
    <>
      <header className="admin_header">
        <h1 className="admin_title">Шаблоны характеристик</h1>
        <Link className="admin_button" to="/admin/specification-templates/new">
          Создать шаблон
        </Link>
      </header>

      <section className="admin_card admin_table_wrap">
        <table className="admin_table admin_full_table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория товара</th>
              <th>Кол-во групп</th>
              <th>Создан</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {(templatesQuery.data ?? []).map((template) => (
              <tr key={template.id}>
                <td>{template.id}</td>
                <td>{template.name}</td>
                <td>{template.category.name}</td>
                <td>{template._count.groups}</td>
                <td>{formatDate(template.createdAt)}</td>
                <td>
                  <div className="admin_inline_actions">
                    <Link
                      aria-label="????????????? ??????"
                      className="admin_icon_button"
                      title="????????????? ??????"
                      to={`/admin/specification-templates/${template.id}/edit`}
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      aria-label="??????? ??????"
                      className="admin_icon_button admin_icon_button_danger"
                      title="??????? ??????"
                      type="button"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!templatesQuery.isLoading && !(templatesQuery.data ?? []).length ? (
          <p className="admin_empty">Шаблоны пока не созданы.</p>
        ) : null}
      </section>
    </>
  );
}
