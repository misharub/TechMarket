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
import { Link } from "react-router-dom";
import techMarketMark from "../../assets/techmarket-mark.svg";
import { useAuthStore } from "../../lib/auth-store";
import { useCartSummary } from "../../lib/cart-hooks";
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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const cartSummary = useCartSummary();
  const actions: HeaderAction[] = [
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
    ...(!user
      ? [
          {
          label: "Войти",
          href: "/login",
          icon: <User className={iconClassName} />,
          },
        ]
      : []),
  ];

  return (
    <div className="header_actions" data-name="headerActions">
      {actions.map((action) =>
        action.label === "Корзина" ? (
          <div className="header_cart-action" key={action.label}>
            <HeaderActionButton action={action} />
            {cartSummary?.totalQuantity ? <span>{cartSummary.totalQuantity}</span> : null}
          </div>
        ) : (
          <HeaderActionButton key={action.label} action={action} />
        ),
      )}
      {user ? (
        <div
          className="header_account"
          onMouseEnter={() => setAccountMenuOpen(true)}
          onMouseLeave={() => setAccountMenuOpen(false)}
        >
          <button
            type="button"
            className="header_action header_account-trigger"
            aria-expanded={accountMenuOpen}
            onFocus={() => setAccountMenuOpen(true)}
          >
            <span className="header_action-icon">
              <User className={iconClassName} />
            </span>
            <span className="header_action-label">{[user.firstName, user.lastName].filter(Boolean).join(" ")}</span>
          </button>

          {accountMenuOpen ? (
            <div className="header_account-menu">
              <Link to="/account/profile" onClick={() => setAccountMenuOpen(false)}>
                Личные данные
              </Link>
              <Link to="/account/orders" onClick={() => setAccountMenuOpen(false)}>
                Мои заказы
              </Link>
              <Link to="/account/addresses" onClick={() => setAccountMenuOpen(false)}>
                Адреса доставки
              </Link>
              <Link to="/account/favorites" onClick={() => setAccountMenuOpen(false)}>
                Избранное
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  void signOut();
                }}
              >
                <LogOut />
                <span>Выйти</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
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
