type AdminPaginationProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
};

export function AdminPagination({ page, pages, onChange }: AdminPaginationProps) {
  return (
    <div className="admin_pagination admin_pagination_compact">
      <button className="admin_page_button" type="button" disabled={page <= 1} onClick={() => onChange(Math.max(1, page - 1))}>
        {"<"}
      </button>
      {buildPageItems(page, pages).map((item, index) =>
        item === "ellipsis" ? (
          <span className="admin_page_ellipsis" key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            className={`admin_page_button ${item === page ? "active" : ""}`}
            key={item}
            type="button"
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button className="admin_page_button" type="button" disabled={page >= pages} onClick={() => onChange(Math.min(pages, page + 1))}>
        {">"}
      </button>
    </div>
  );
}

function buildPageItems(currentPage: number, pages: number): Array<number | "ellipsis"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", pages];
  if (currentPage >= pages - 3) return [1, "ellipsis", pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pages];
}
