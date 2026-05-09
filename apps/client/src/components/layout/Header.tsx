import {
  MapPin,
  Menu,
  Phone,
  Scale,
  Search,
  ShoppingBasket,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import techMarketMark from "../../assets/techmarket-mark.svg";

type HeaderAction = {
  label: string;
  href: string;
  icon: ReactNode;
  hideOnTablet?: boolean;
};

const headerActions: HeaderAction[] = [
  
  {
    label: "Контакты",
    href: "/help",
    icon: <Phone className="h-7 w-7 stroke-[1.7]" />,
    hideOnTablet: true,
  },
  {
    label: "Найти салон",
    href: "/stores",
    icon: <MapPin className="h-7 w-7 stroke-[1.7]" />,
    hideOnTablet: true,
  },
  {
    label: "Войти",
    href: "/login",
    icon: <User className="h-7 w-7 stroke-[1.7]" />,
  },
  {
    label: "Сравнение",
    href: "/compare",
    icon: <Scale className="h-7 w-7 stroke-[1.7]" />,
  },
  {
    label: "Корзина",
    href: "/cart",
    icon: <ShoppingBasket className="h-7 w-7 stroke-[1.7]" />,
  },
];

function TechMarketLogo() {
  return (
    <a href="/" className="shrink-0" aria-label="Перейти на главную страницу">
      <span className="flex h-12 items-center gap-1">
        <img className="h-9 w-8 text-teal-700 sm:h-11 sm:w-10" src={techMarketMark} alt="" aria-hidden="true" />
        <span className="text-[25px] font-bold leading-none text-teal-800 min-[390px]:text-[20px] sm:text-[25px]">TechMarket</span>
      </span>
    </a>
  );
}

function HeaderActionButton({ action }: { action: HeaderAction }) {
  return (
    <a
      href={action.href}
      className={`group flex min-w-[50px] cursor-pointer flex-col items-center justify-start gap-1 px-1.5 pt-1 text-center text-slate-950 transition hover:text-teal-700 sm:min-w-[68px] sm:px-2 xl:min-w-[82px] ${
        action.hideOnTablet ? "hidden xl:flex" : ""
      }`}
      aria-label={action.label}
    >
      <span className="flex h-7 items-center justify-center">{action.icon}</span>
      <span className="hidden max-w-[92px] text-xs font-normal leading-tight xl:block">{action.label}</span>
    </a>
  );
}

function HeaderActions() {
  return (
    <div className="relative flex shrink-0 items-center justify-end gap-1 lg:order-last lg:ml-4" data-name="headerActions">
      {headerActions.map((action) => (
        <HeaderActionButton key={action.label} action={action} />
      ))}
    </div>
  );
}

function MobileCatalogButton() {
  return (
    <div className="flex shrink-0 items-center lg:order-first lg:mr-6 xl:hidden">
      <button className="flex text-slate-950 transition hover:text-teal-700" type="button" aria-label="Открыть меню категорий">
        <Menu className="h-9 w-9 stroke-[1.7]" />
      </button>
    </div>
  );
}

function SearchComponent() {
  return (
    <form className="group/presearch mt-3 h-16 w-full grow basis-full lg:ml-6 lg:mt-0 lg:basis-1/3 xl:max-w-[812px]" data-role="searchComponent">
      <div className="relative z-0 h-full w-full rounded-2xl bg-[#f7f7f7] transition-[background,box-shadow] duration-300 group-hover/presearch:z-[4]
      //  group-hover/presearch:bg-white group-hover/presearch:shadow-[0_0_0_1px_#0000000a,0_4px_4px_#0000000a]">
        <input
          className="h-full w-full rounded-2xl border-0 border-b border-transparent bg-transparent py-0 pl-5 pr-16 text-2xl font-normal text-[#333] outline-none transition-colors duration-300 placeholder:text-[#777] group-hover/presearch:border-b-[#eee]"
          name="q"
          type="search"
          enterKeyHint="search"
          placeholder="Поиск по сайту"
          autoComplete="off"
          maxLength={100}
          aria-label="Поиск"
        />

        <button
          type="submit"
          className="absolute right-5 top-0 flex h-full w-9 items-center justify-center text-[#afafaf] outline-none transition hover:text-teal-700"
          title="search-button"
          aria-label="Найти"
        >
          <Search className="h-8 w-8 stroke-[1.8]" />
        </button>
      </div>
    </form>
  );
}

export function Header() {
  return (
    <header data-name="appHeader" className="relative z-40 w-full bg-white print:hidden lg:sticky lg:top-0">
      <div className="relative z-50 border-b border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] transition-shadow duration-300 xl:shadow-none">
        <div className="mx-auto flex max-w-[1536px] flex-wrap items-center px-4 py-3 lg:min-h-[88px] lg:flex-nowrap lg:px-8 xl:min-h-[96px]">
          <TechMarketLogo />
          <HeaderActions />

          <div className="basis-full lg:hidden" />

          <MobileCatalogButton />
          <SearchComponent />
        </div>
      </div>
    </header>
  );
}
