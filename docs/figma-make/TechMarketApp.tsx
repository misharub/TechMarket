type IconName = "search" | "compare" | "heart" | "user" | "bell" | "cart" | "menu" | "chevron" | "star";

const categories = [
  "Ноутбуки и компьютеры",
  "Комплектующие",
  "Периферия",
  "Gaming",
  "Телефоны и часы",
  "Бытовая техника",
  "ТВ и аудио",
  "Умный дом",
  "Фото",
];

const products = [
  {
    brand: "Lenovo",
    category: "Ноутбуки",
    title: "Lenovo IdeaPad 5 16",
    price: "2 599 BYN",
    oldPrice: "2 899 BYN",
    stock: "В наличии: 12",
    kind: "laptop",
    promo: true,
  },
  {
    brand: "Apple",
    category: "Ноутбуки",
    title: "MacBook Air 13 M3",
    price: "4 399 BYN",
    stock: "В наличии: 7",
    kind: "laptop",
  },
  {
    brand: "Samsung",
    category: "Смартфоны",
    title: "Galaxy S25 256GB",
    price: "3 199 BYN",
    oldPrice: "3 499 BYN",
    stock: "В наличии: 18",
    kind: "phone",
    promo: true,
  },
  {
    brand: "Huawei",
    category: "Wearables",
    title: "Watch Fit 5 Pro",
    price: "949 BYN",
    oldPrice: "1 149 BYN",
    stock: "В наличии: 9",
    kind: "watch",
    promo: true,
  },
  {
    brand: "HP",
    category: "Ноутбуки",
    title: "HP Pavilion 15",
    price: "2 199 BYN",
    stock: "В наличии: 15",
    kind: "laptop",
  },
];

const compareRows = [
  ["Цена", "2 599 BYN", "4 399 BYN", "2 199 BYN", 2],
  ["Экран", "16 дюйм", "13.6 дюйм", "15.6 дюйм", 0],
  ["Процессор", "Intel Core i5", "Apple M3", "AMD Ryzen 5", -1],
  ["RAM", "16 GB", "16 GB", "16 GB", 0],
  ["SSD", "512 GB", "512 GB", "512 GB", 0],
  ["Наличие", "12 шт", "7 шт", "15 шт", 2],
] as const;

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="7" {...common} />
          <path d="M16.5 16.5 21 21" {...common} />
        </>
      )}
      {name === "compare" && (
        <>
          <path d="M6 4v16M6 4h6v6H6M18 4v16M12 14h6v6h-6" {...common} />
        </>
      )}
      {name === "heart" && <path d="M12 20s-7-4.4-8.6-9.2C2.1 6.7 6.5 4 9.2 6.7L12 9.5l2.8-2.8c2.7-2.7 7.1 0 5.8 4.1C19 15.6 12 20 12 20Z" {...common} />}
      {name === "user" && (
        <>
          <circle cx="12" cy="8" r="3.2" {...common} />
          <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" {...common} />
        </>
      )}
      {name === "bell" && (
        <>
          <path d="M6 17h12c-1.2-1.5-1.7-3-1.7-6a4.3 4.3 0 0 0-8.6 0c0 3-.5 4.5-1.7 6Z" {...common} />
          <path d="M10 19a2.2 2.2 0 0 0 4 0" {...common} />
        </>
      )}
      {name === "cart" && (
        <>
          <path d="M4 5h2l2 10h9.5l2-7H7" {...common} />
          <circle cx="10" cy="19" r="1.4" {...common} />
          <circle cx="17" cy="19" r="1.4" {...common} />
        </>
      )}
      {name === "menu" && (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" {...common} />
        </>
      )}
      {name === "chevron" && <path d="m7 10 5 5 5-5" {...common} />}
      {name === "star" && <path d="m12 3 2.6 5.7 6.2.7-4.6 4.2 1.2 6.1L12 16.6 6.6 19.7l1.2-6.1-4.6-4.2 6.2-.7L12 3Z" {...common} />}
    </svg>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-9 w-8 text-teal-700">
        <div className="absolute left-0 top-0 h-9 w-2 rounded-sm bg-current" />
        <div className="absolute left-2 top-0 h-9 w-2 origin-top -skew-x-[34deg] rounded-sm bg-current" />
        <div className="absolute bottom-0 left-4 h-4 w-3 origin-bottom skew-x-[34deg] rounded-sm bg-current" />
      </div>
      <span className="text-[27px] font-bold leading-none text-teal-800">TechMarket</span>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[106px] max-w-[1264px] items-center gap-8">
        <Logo />

        <div className="flex h-12 flex-1 items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
          <input
            className="h-full min-w-0 flex-1 px-5 text-sm outline-none placeholder:text-slate-400"
            placeholder="Поиск техники, бренда или артикула"
          />
          <button className="hidden h-full items-center gap-2 border-l border-slate-200 px-5 text-sm font-medium text-slate-700 md:flex">
            везде
            <Icon name="chevron" className="h-4 w-4 text-slate-500" />
          </button>
          <button className="flex h-full w-14 items-center justify-center bg-blue-700 text-white">
            <Icon name="search" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <HeaderIcon name="compare" />
          <HeaderIcon name="heart" />
          <HeaderIcon name="user" />
          <HeaderIcon name="bell" badge="3" />
          <button className="flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white">
            <Icon name="cart" className="h-5 w-5" />
            <span>2</span>
          </button>
        </div>
      </div>

      <nav className="bg-slate-100">
        <div className="mx-auto flex h-[52px] max-w-[1264px] items-center gap-8 overflow-hidden whitespace-nowrap text-sm font-medium text-slate-800">
          {categories.map((category, index) => (
            <span key={category} className={index === 0 ? "font-semibold text-slate-950" : ""}>
              {category}
            </span>
          ))}
          <span className="ml-auto border-l border-slate-400 pl-8 font-semibold">Услуги</span>
        </div>
      </nav>
    </header>
  );
}

function HeaderIcon({ name, badge }: { name: IconName; badge?: string }) {
  return (
    <button className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900">
      <Icon name={name} />
      {badge && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function DeviceArt({ kind = "laptop", small = false }: { kind?: string; small?: boolean }) {
  const scale = small ? "scale-[0.78]" : "";

  if (kind === "phone") {
    return (
      <div className={`relative h-32 w-32 ${scale}`}>
        <div className="absolute left-9 top-0 h-32 w-[70px] rounded-[14px] bg-slate-950 shadow-lg">
          <div className="absolute inset-x-2 top-3 h-[106px] rounded-[10px] bg-blue-100">
            <div className="absolute left-4 top-5 h-11 w-9 rounded-full bg-blue-700" />
            <div className="absolute bottom-5 right-3 h-8 w-8 rounded-full bg-teal-300" />
          </div>
        </div>
      </div>
    );
  }

  if (kind === "watch") {
    return (
      <div className={`relative h-32 w-32 ${scale}`}>
        <div className="absolute left-[52px] top-0 h-10 w-7 rounded-lg bg-slate-800" />
        <div className="absolute left-8 top-8 h-[72px] w-[72px] rounded-[18px] bg-slate-950 shadow-lg">
          <div className="absolute inset-3 rounded-[14px] bg-teal-100">
            <div className="absolute left-4 top-4 h-6 w-8 rounded-full bg-teal-600" />
          </div>
        </div>
        <div className="absolute bottom-0 left-[52px] h-10 w-7 rounded-lg bg-slate-800" />
      </div>
    );
  }

  return (
    <div className={`relative h-32 w-40 ${scale}`}>
      <div className="absolute left-1 top-1 h-[96px] w-[150px] rounded-lg bg-slate-950 shadow-lg">
        <div className="absolute inset-[10px] rounded-md bg-blue-100">
          <div className="absolute left-5 top-9 h-3 w-24 rounded-full bg-blue-700" />
          <div className="absolute right-4 top-12 h-3 w-16 rounded-full bg-teal-500" />
        </div>
      </div>
      <div className="absolute bottom-3 left-0 h-4 w-40 rounded-md bg-slate-300" />
      <div className="absolute bottom-2 left-8 h-2 w-24 rounded-full bg-slate-400/60" />
    </div>
  );
}

function ProductCard({ product }: { product: (typeof products)[number] }) {
  return (
    <article className="relative flex h-[330px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      {product.promo && (
        <div className="absolute right-0 top-0 z-10 rounded-bl-lg bg-red-600 px-4 py-2 text-xs font-bold text-white">
          Акция
        </div>
      )}
      <div className="flex h-36 items-center justify-center bg-slate-50">
        <DeviceArt kind={product.kind} small />
      </div>
      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="text-xs font-semibold uppercase text-teal-700">{product.brand}</div>
        <div className="mt-2 min-h-[44px] text-base font-semibold leading-[22px] text-slate-950">{product.title}</div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            {product.oldPrice && <div className="text-xs text-slate-400 line-through">{product.oldPrice}</div>}
            <div className="text-[22px] font-bold leading-7 text-slate-950">{product.price}</div>
            <div className="mt-1 text-sm text-emerald-700">{product.stock}</div>
          </div>
          <button className="flex h-10 w-24 items-center justify-center rounded-md bg-teal-700 text-sm font-bold text-white">
            В корзину
          </button>
        </div>
      </div>
    </article>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto mt-5 h-[284px] max-w-[1264px] overflow-hidden rounded-[28px] bg-blue-100">
      <div className="absolute left-16 top-12">
        <h1 className="text-[34px] font-semibold leading-[42px] text-slate-950">Купи технику сейчас</h1>
        <div className="mt-1 text-[48px] font-bold leading-[56px] text-slate-950">плати позже</div>
        <div className="mt-5 flex h-[72px] w-[390px] items-center rounded-full bg-yellow-300 px-8 text-[38px] font-bold text-black">
          36 платежей 0%
        </div>
        <div className="mt-3 flex h-[42px] w-[410px] items-center rounded-full bg-black px-9 text-[17px] font-bold text-white">
          и первый платёж через 6 месяцев
        </div>
      </div>

      <div className="absolute right-[390px] top-[68px]">
        <DeviceArt />
      </div>
      <div className="absolute right-[190px] top-[48px] scale-110">
        <DeviceArt />
      </div>
      <div className="absolute right-16 top-[58px]">
        <DeviceArt kind="phone" />
      </div>

      <button className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-blue-700 bg-white text-sm font-bold text-blue-700">
        II
      </button>
    </section>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main>
        <Hero />

        <div className="mx-auto mt-3 grid max-w-[1264px] grid-cols-6 gap-5 text-center text-sm font-medium text-slate-800">
          {["Скидки недели", "Новый ноутбук?", "Компоненты до -45%", "AI сравнение", "Gaming", "Умный дом"].map((item, index) => (
            <div key={item}>
              <div className={`mb-2 h-1 rounded-full ${index === 3 ? "bg-teal-700" : "bg-slate-200"}`} />
              <span className={index === 3 ? "font-bold text-teal-700" : ""}>{item}</span>
            </div>
          ))}
        </div>

        <section className="mx-auto mt-16 max-w-[1264px]">
          <h2 className="text-[28px] font-bold text-slate-950">Популярные категории</h2>
          <div className="mt-6 flex gap-4">
            {["Ноутбуки", "Смартфоны", "Пылесосы", "ТВ и аудио", "Gaming", "Умный дом"].map((item, index) => (
              <button
                key={item}
                className={`h-9 rounded-full border px-6 text-sm font-semibold ${
                  index === 0 ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[1264px]">
          <h2 className="text-[30px] font-bold text-slate-950">Новинки и предложения</h2>
          <div className="mt-7 grid grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.title} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 flex max-w-[1264px] items-center justify-between rounded-[20px] border border-teal-100 bg-teal-50 px-11 py-10">
          <div>
            <h2 className="text-[28px] font-bold text-teal-900">AI-помощник выбора</h2>
            <p className="mt-4 max-w-[780px] text-[17px] leading-7 text-slate-800">
              Сравните до 3 товаров: таблица характеристик покажет лучшие параметры, а Gemini сформирует понятное заключение для покупателя.
            </p>
          </div>
          <button className="h-[50px] rounded-lg bg-teal-700 px-8 text-base font-bold text-white">Открыть сравнение</button>
        </section>

        <section className="mx-auto mt-16 max-w-[1264px]">
          <h2 className="text-[30px] font-bold text-slate-950">Сравнение ноутбуков</h2>
          <p className="mt-3 text-base text-slate-500">Лучшие характеристики подсвечены автоматически. Ниже — заключение Gemini AI.</p>
          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-[260px_repeat(3,1fr)] bg-white">
              <div className="border-b border-slate-200 p-5 text-sm font-semibold text-slate-500">Характеристика</div>
              {["Lenovo IdeaPad 5 16", "MacBook Air 13 M3", "HP Pavilion 15"].map((item) => (
                <div key={item} className="border-b border-l border-slate-200 p-5 text-center">
                  <div className="mx-auto flex h-24 items-center justify-center">
                    <DeviceArt small />
                  </div>
                  <div className="mt-3 text-sm font-bold text-slate-950">{item}</div>
                </div>
              ))}
            </div>
            {compareRows.map((row, rowIndex) => (
              <div key={row[0]} className="grid grid-cols-[260px_repeat(3,1fr)] border-t border-slate-200">
                <div className="bg-slate-50 p-5 text-sm font-semibold text-slate-900">{row[0]}</div>
                {[row[1], row[2], row[3]].map((value, colIndex) => {
                  const best = row[4] === colIndex || (row[4] === 0 && rowIndex >= 3);
                  return (
                    <div key={value} className="border-l border-slate-200 p-5 text-center text-sm font-medium">
                      <span className={best ? "rounded-md bg-teal-50 px-4 py-2 font-bold text-teal-900" : "text-slate-800"}>{value}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[18px] border border-teal-100 bg-teal-50 p-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[26px] font-bold text-teal-900">Заключение Gemini AI</h3>
              <span className="rounded-full bg-teal-700 px-5 py-2 text-xs font-bold text-white">provider: gemini</span>
            </div>
            <p className="mt-5 max-w-[980px] text-base leading-7 text-slate-800">
              Для универсальной работы самым сбалансированным выглядит Lenovo IdeaPad 5 16: у него большой экран, хорошая цена и достаточный запас на складе. HP Pavilion 15 выгоднее по цене и наличию. MacBook Air 13 M3 стоит дороже, но подойдёт тем, кому важны macOS и экосистема Apple.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return <HomePage />;
}
