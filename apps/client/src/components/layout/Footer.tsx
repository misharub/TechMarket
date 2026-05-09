const footerSections = [
  {
    title: "Покупателям",
    links: ["Доставка", "Оплата", "Гарантия", "Возврат"],
  },
  {
    title: "Каталог",
    links: ["Ноутбуки", "Смартфоны", "Бытовая техника", "Gaming"],
  },
  {
    title: "TechMarket",
    links: ["О магазине", "Контакты", "Политика конфиденциальности", "Помощь"],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      {/* Footer завершает публичные страницы и хранит вторичную навигацию магазина. */}
      <div className="mx-auto grid max-w-[1264px] gap-10 px-4 py-10 md:grid-cols-[1.3fr_repeat(3,1fr)] lg:px-0">
        <div>
          <div className="text-2xl font-bold text-teal-800">TechMarket</div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Интернет-магазин бытовой и компьютерной техники с каталогом, корзиной, заказами и AI-сравнением товаров.
          </p>
          <p className="mt-5 text-sm font-semibold text-slate-900">support@techmarket.local</p>
          <p className="mt-1 text-sm text-slate-600">Минск, демонстрационный проект</p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">{section.title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="/" className="transition hover:text-teal-700">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-[1264px] flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-0">
          <span>© 2026 TechMarket. Дипломный проект.</span>
          <span>Frontend: React + Vite + TypeScript</span>
        </div>
      </div>
    </footer>
  );
}
