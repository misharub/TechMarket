import {
  ArrowUpRight,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Scale,
  Search,
  Shield,
  ShoppingBasket,
  User,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import techMarketMark from "../../assets/techmarket-mark.svg";
import { useAuthStore } from "../../lib/auth-store";
import { useCartSummary } from "../../lib/cart-hooks";
import { getCompareProductIds, subscribeCompareProducts } from "../../lib/compare-store";
import { getBrands } from "../../lib/brands-api";
import { getCategoryTree, type CategoryNode } from "../../lib/categories-api";
import { getProducts } from "../../lib/products-api";
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

function flattenCategories(categories: CategoryNode[]): CategoryNode[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children)]);
}

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

type SearchCategorySuggestion = Pick<CategoryNode, "id" | "name" | "slug">;

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
  const [compareProductIds, setCompareProductIds] = useState<string[]>(() => getCompareProductIds());
  const cartSummary = useCartSummary();

  useEffect(() => subscribeCompareProducts(setCompareProductIds), []);

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
        action.href === "/compare" ? (
          <div className="header_compare-action" key={action.label}>
            <HeaderActionButton action={action} />
            {compareProductIds.length ? <span>{compareProductIds.length}</span> : null}
          </div>
        ) : action.href === "/cart" ? (
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
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeSearchTerm(debouncedQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(trimmedQuery), 180);

    return () => window.clearTimeout(timeoutId);
  }, [trimmedQuery]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlQuery = searchParams.get("q") ?? "";

    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [location.search]);

  const productsQuery = useQuery({
    queryKey: ["header-search", "products", normalizedQuery],
    queryFn: () => getProducts({ search: normalizedQuery, page: 1, limit: 6 }),
    enabled: normalizedQuery.length >= 2,
  });
  const brandsQuery = useQuery({
    queryKey: ["header-search", "brands", normalizedQuery],
    queryFn: () => getBrands({ search: normalizedQuery }),
    enabled: normalizedQuery.length >= 2,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories", "tree", "header-search"],
    queryFn: getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

  const products = productsQuery.data?.items ?? [];
  const categories = useMemo(() => flattenCategories(categoriesQuery.data ?? []), [categoriesQuery.data]);
  const categorySuggestions = useMemo(() => {
    const bySlug = new Map<string, SearchCategorySuggestion>();

    products.forEach((product) => bySlug.set(product.category.slug, product.category));
    categories
      .filter((category) => normalizeSearchTerm(`${category.name} ${category.slug}`).includes(normalizedQuery))
      .forEach((category) => bySlug.set(category.slug, category));

    return Array.from(bySlug.values()).slice(0, 3);
  }, [categories, normalizedQuery, products]);
  const quickTerms = useMemo(() => {
    const terms = [
      ...(brandsQuery.data ?? []).map((brand) => brand.name),
      ...products.map((product) => product.brand.name),
    ];

    return Array.from(new Set(terms.map((term) => normalizeSearchTerm(term)).filter(Boolean))).slice(0, 4);
  }, [brandsQuery.data, products]);
  const categorySearchTerm = quickTerms[0] ?? trimmedQuery;
  const productSuggestions = products.slice(0, Math.max(2, 7 - categorySuggestions.length));
  const showSuggestions = isFocused && trimmedQuery.length >= 2;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    goToSearch(trimmedQuery);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      goToSearch(trimmedQuery);
    }
  }

  function goToSearch(value: string) {
    const nextQuery = value.trim();

    setQuery(nextQuery);
    setDebouncedQuery(nextQuery);
    navigate(nextQuery ? `/catalog?q=${encodeURIComponent(nextQuery)}` : "/catalog");
    setIsFocused(false);
  }

  function goToCategory(category: SearchCategorySuggestion) {
    navigate(`/catalog/${category.slug}?q=${encodeURIComponent(categorySearchTerm)}`);
    setIsFocused(false);
  }

  function clearSearch() {
    setQuery("");
    setDebouncedQuery("");
    setIsFocused(true);
  }

  return (
    <form className={`presearch${showSuggestions ? " presearch--active" : ""}`} data-role="searchComponent" onSubmit={handleSubmit}>
      <div className="presearch_wrapper">
        <input
          className="presearch_input"
          name="q"
          type="search"
          value={query}
          enterKeyHint="search"
          placeholder="Поиск по каталогу"
          autoComplete="off"
          maxLength={100}
          aria-label="Поиск"
          onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />

        {query ? (
          <button type="button" className="presearch_clear" aria-label="Очистить поиск" onClick={clearSearch}>
            <X />
          </button>
        ) : null}

        <button type="submit" className="presearch_submit" title="search-button" aria-label="Найти">
          <Search className="presearch_submit-icon" />
        </button>

        {showSuggestions ? (
          <div className="presearch_suggestions" onMouseDown={(event) => event.preventDefault()}>
            {quickTerms.length ? (
              <div className="presearch_chips">
                {quickTerms.map((term) => (
                  <button className="presearch_chip" type="button" key={term} onClick={() => goToSearch(term)}>
                    {term}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="presearch_suggestion-list">
              <button className="presearch_suggestion" type="button" onClick={() => goToSearch(trimmedQuery)}>
                <Search />
                <span>{trimmedQuery}</span>
                <ArrowUpRight />
              </button>

              {categorySuggestions.map((category) => (
                <button className="presearch_suggestion" type="button" key={category.id} onClick={() => goToCategory(category)}>
                  <Search />
                  <span>
                    <strong>{categorySearchTerm}</strong>
                    <span className="presearch_suggestion-category"> - {category.name}</span>
                  </span>
                  <ArrowUpRight />
                </button>
              ))}

              {productSuggestions.map((product) => (
                <button className="presearch_suggestion" type="button" key={product.id} onClick={() => goToSearch(product.title)}>
                  <Search />
                  <span>{product.title}</span>
                  <ArrowUpRight />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}

export function Header() {
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [compactCatalogMode, setCompactCatalogMode] = useState(false);
  const [desktopCatalogMode, setDesktopCatalogMode] = useState(false);
  const compactCatalogModeRef = useRef(false);
  const hoverCatalogMode = compactCatalogMode && desktopCatalogMode;

  useEffect(() => {
    const updateCompactMode = () => {
      const scrollY = window.scrollY;
      const shouldBeCompact = compactCatalogModeRef.current ? scrollY > 4 : scrollY > 132;

      if (shouldBeCompact === compactCatalogModeRef.current) {
        return;
      }

      compactCatalogModeRef.current = shouldBeCompact;
      setCompactCatalogMode(shouldBeCompact);

      if (!shouldBeCompact && scrollY <= 4) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (window.scrollY < 80) {
              window.scrollTo({ top: 0, behavior: "auto" });
            }
          });
        });
      }
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
