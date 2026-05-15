import {
  LogOut,
  MapPin,
  Menu,
  Phone,
  Scale,
  Search,
  Shield,
  ShoppingBasket,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import techMarketMark from "../../assets/techmarket-mark.svg";
import { useAuthStore } from "../../lib/auth-store";
import { CatalogNavigation } from "./CatalogNavigation";
import "./Header.css";

type HeaderAction = {
  label: string;
  href?: string;
  icon: ReactNode;
  hideOnSmall?: boolean;
  onClick?: () => void;
};

const iconClassName = "header_action-svg";

const baseHeaderActions: HeaderAction[] = [
  {
    label: "Контакты",
    href: "/contacts",
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
  const className = `header_action${action.hideOnSmall ? " header_action--small-hidden" : ""}`;

  if (action.onClick) {
    return (
      <button type="button" className={className} aria-label={action.label} onClick={action.onClick}>
        <span className="header_action-icon">{action.icon}</span>
        <span className="header_action-label">{action.label}</span>
      </button>
    );
  }

  return (
    <a href={action.href} className={className} aria-label={action.label}>
      <span className="header_action-icon">{action.icon}</span>
      <span className="header_action-label">{action.label}</span>
    </a>
  );
}

function HeaderActions() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const actions = [
    ...baseHeaderActions,
    ...(user?.role === "ADMIN"
      ? [
          {
            label: "Админ-панель",
            href: "/admin",
            icon: <Shield className={iconClassName} />,
          },
        ]
      : []),
    user
      ? {
          label: "Выйти",
          icon: <LogOut className={iconClassName} />,
          onClick: () => void signOut(),
        }
      : {
          label: "Войти",
          href: "/login",
          icon: <User className={iconClassName} />,
        },
  ];

  return (
    <div className="header_actions" data-name="headerActions">
      {actions.map((action) => (
        <HeaderActionButton key={action.label} action={action} />
      ))}
    </div>
  );
}

function MobileCatalogButton({
  mobileOpen,
  onClick,
  onMouseEnter,
}: {
  mobileOpen: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <div className="header_mobile-catalog" onMouseEnter={onMouseEnter}>
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
  const [compactCatalogMode, setCompactCatalogMode] = useState(false);
  const [desktopCatalogMode, setDesktopCatalogMode] = useState(false);
  const hoverCatalogMode = compactCatalogMode && desktopCatalogMode;

  useEffect(() => {
    const updateCompactMode = () => {
      setCompactCatalogMode((isCompact) => {
        if (isCompact) {
          return window.scrollY > 36;
        }

        return window.scrollY > 132;
      });
    };

    updateCompactMode();
    window.addEventListener("scroll", updateCompactMode, { passive: true });

    return () => window.removeEventListener("scroll", updateCompactMode);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const updateDesktopMode = () => setDesktopCatalogMode(mediaQuery.matches);

    updateDesktopMode();
    mediaQuery.addEventListener("change", updateDesktopMode);

    return () => mediaQuery.removeEventListener("change", updateDesktopMode);
  }, []);

  useEffect(() => {
    if (!compactCatalogMode) {
      setMobileCatalogOpen(false);
    }
  }, [compactCatalogMode]);

  return (
    <header
      data-name="appHeader"
      className={`header${compactCatalogMode ? " header--compact" : ""}`}
      onMouseLeave={() => {
        if (hoverCatalogMode) {
          setMobileCatalogOpen(false);
        }
      }}
    >
      <div className="header_bar">
        <div className="header_inner">
          <TechMarketLogo />
          <HeaderActions />

          <div className="header_mobile-break" />

          <MobileCatalogButton
            mobileOpen={mobileCatalogOpen}
            onClick={() => {
              if (hoverCatalogMode) {
                setMobileCatalogOpen(true);
                return;
              }

              setMobileCatalogOpen((isOpen) => !isOpen);
            }}
            onMouseEnter={() => {
              if (hoverCatalogMode) {
                setMobileCatalogOpen(true);
              }
            }}
          />
          <SearchComponent />
        </div>
      </div>

      <CatalogNavigation
        compactMode={compactCatalogMode}
        mobileOpen={mobileCatalogOpen}
        onMobileClose={() => setMobileCatalogOpen(false)}
      />
    </header>
  );
}
