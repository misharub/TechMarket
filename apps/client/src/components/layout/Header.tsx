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
import { useState } from "react";
import techMarketMark from "../../assets/techmarket-mark.svg";
import { CatalogNavigation } from "./CatalogNavigation";
import "./Header.css";

type HeaderAction = {
  label: string;
  href: string;
  icon: ReactNode;
  hideOnSmall?: boolean;
};

const iconClassName = "header_action-svg";

const headerActions: HeaderAction[] = [
  {
    label: "Контакты",
    href: "/help",
    icon: <Phone className={iconClassName} />,
    hideOnSmall: true,
  },
  {
    label: "Найти салон",
    href: "/stores",
    icon: <MapPin className={iconClassName} />,
    hideOnSmall: true,
  },
  {
    label: "Сравнение",
    href: "/compare",
    icon: <Scale className={iconClassName} />,
  },
  {
    label: "Корзина",
    href: "/cart",
    icon: <ShoppingBasket className={iconClassName} />,
  },
  {
    label: "Войти",
    href: "/login",
    icon: <User className={iconClassName} />,
  },
];

function TechMarketLogo() {
  return (
    <a href="/" className="header_logo" aria-label="Перейти на главную страницу">
      <span className="header_logo-inner">
        <img className="header_logo-mark" src={techMarketMark} alt="" aria-hidden="true" />
        <span className="header_logo-text">TechMarket</span>
      </span>
    </a>
  );
}

function HeaderActionButton({ action }: { action: HeaderAction }) {
  return (
    <a
      href={action.href}
      className={`header_action${action.hideOnSmall ? " header_action--small-hidden" : ""}`}
      aria-label={action.label}
    >
      <span className="header_action-icon">{action.icon}</span>
      <span className="header_action-label">{action.label}</span>
    </a>
  );
}

function HeaderActions() {
  return (
    <div className="header_actions" data-name="headerActions">
      {headerActions.map((action) => (
        <HeaderActionButton key={action.label} action={action} />
      ))}
    </div>
  );
}

function MobileCatalogButton({ mobileOpen, onClick }: { mobileOpen: boolean; onClick: () => void }) {
  return (
    <div className="header_mobile-catalog">
      <button
        aria-expanded={mobileOpen}
        className="header_mobile-catalog-button"
        type="button"
        aria-label="Открыть меню категорий"
        onClick={onClick}
      >
        <Menu className="header_mobile-catalog-icon" />
      </button>
    </div>
  );
}

function SearchComponent() {
  return (
    <form className="presearch" data-role="searchComponent">
      <div className="presearch_wrapper">
        <input
          className="presearch_input"
          name="q"
          type="search"
          enterKeyHint="search"
          placeholder="Поиск по каталогу"
          autoComplete="off"
          maxLength={100}
          aria-label="Поиск"
        />

        <button type="submit" className="presearch_submit" title="search-button" aria-label="Найти">
          <Search className="presearch_submit-icon" />
        </button>
      </div>
    </form>
  );
}

export function Header() {
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);

  return (
    <header data-name="appHeader" className="header">
      <div className="header_bar">
        <div className="header_inner">
          <TechMarketLogo />
          <HeaderActions />

          <div className="header_mobile-break" />

          <MobileCatalogButton
            mobileOpen={mobileCatalogOpen}
            onClick={() => setMobileCatalogOpen((isOpen) => !isOpen)}
          />
          <SearchComponent />
        </div>
      </div>

      <CatalogNavigation mobileOpen={mobileCatalogOpen} onMobileClose={() => setMobileCatalogOpen(false)} />
    </header>
  );
}
