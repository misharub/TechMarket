import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  deleteSpecificationTemplate,
  getSpecificationTemplates,
} from "../../lib/specification-templates-api";
import { formatDate } from "./admin-utils";

export function AdminSpecificationTemplatesPage() {
  const queryClient = useQueryClient();
  const templatesQuery = useQuery({
    queryKey: ["admin", "specification_templates"],
    queryFn: getSpecificationTemplates,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSpecificationTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "specification_templates"] });
    },
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
        <table className="admin_table">
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
                    <Link className="admin_button_muted" to={`/admin/specification-templates/${template.id}/edit`}>
                      Редактировать
                    </Link>
                    <button
                      className="admin_button_danger"
                      type="button"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      Удалить
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
