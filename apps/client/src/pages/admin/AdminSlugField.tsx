type AdminSlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AdminSlugField({ value, onChange }: AdminSlugFieldProps) {
  return (
    <label className="admin_field admin_category_slug_field">
      <span>Адрес страницы</span>
      <p className="admin_hint">Латинские буквы, цифры и дефисы без пробелов.</p>
      <input className="admin_input" required value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
