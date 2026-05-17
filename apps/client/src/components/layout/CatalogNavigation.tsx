import { useQuery } from "@tanstack/react-query";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCategoryTree, type CategoryNode } from "../../lib/categories-api";
import "./CatalogNavigation.css";

type CatalogNavigationProps = {
  compactMode: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

function categoryHref(category: CategoryNode) {
  return `/catalog/${category.slug}`;
}

function collectionHref(category: CategoryNode, collectionSlug: string) {
  return `/catalog/${category.slug}?collection=${collectionSlug}`;
}

function CategoryLink({ category, className }: { category: CategoryNode; className: string }) {
  return (
    <a className={className} href={categoryHref(category)}>
      {category.name}
    </a>
  );
}

function DesktopMegaMenu({
  activeRoot,
  activeChild,
  onChildChange,
}: {
  activeRoot: CategoryNode;
  activeChild: CategoryNode | undefined;
  onChildChange: (category: CategoryNode) => void;
}) {
  return (
    <div className="catalog_mega" role="group" aria-label={`Раздел ${activeRoot.name}`}>
      <div className="catalog_mega-inner">
        <aside className="catalog_side">
          {activeRoot.children.map((category) => (
            <a
              className={`catalog_side-link${activeChild?.slug === category.slug ? " catalog_side-link--active" : ""}`}
              href={categoryHref(category)}
              key={category.slug}
              onFocus={() => onChildChange(category)}
              onMouseEnter={() => onChildChange(category)}
            >
              <span>{category.name}</span>
              <ChevronRight className="catalog_side-icon" />
            </a>
          ))}
        </aside>

        <div className="catalog_panel">
          <div className="catalog_panel-heading">
            <CategoryLink category={activeChild ?? activeRoot} className="catalog_panel-title" />
          </div>

          <div className="catalog_grid">
            {activeChild?.collections.length
              ? activeChild.collections.map((collection) => (
                  <a
                    className="catalog_grid-link"
                    href={collectionHref(activeChild, collection.slug)}
                    key={collection.slug}
                  >
                    {collection.name}
                  </a>
                ))
              : activeChild?.children.map((category) => (
                  <CategoryLink category={category} className="catalog_grid-link" key={category.slug} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileCatalog({
  categories,
  mobileOpen,
  onMobileClose,
}: {
  categories: CategoryNode[];
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const [openCategorySlug, setOpenCategorySlug] = useState<string | null>(null);

  useEffect(() => {
    if (!mobileOpen) {
      setOpenCategorySlug(null);
    }
  }, [mobileOpen]);

  return (
    <div className={`catalog_mobile${mobileOpen ? " catalog_mobile--open" : ""}`} aria-hidden={!mobileOpen}>
      <div className="catalog_mobile-header">
        <span className="catalog_mobile-title">Каталог</span>
        <button className="catalog_mobile-close" type="button" aria-label="Закрыть каталог" onClick={onMobileClose}>
          <X className="catalog_mobile-close-icon" />
        </button>
      </div>

      <div className="catalog_mobile-list">
        {categories.map((category) => {
          const isOpen = openCategorySlug === category.slug;

          return (
            <details className="catalog_mobile-group" key={category.slug} open={isOpen}>
              <summary
                className="catalog_mobile-summary"
                aria-expanded={isOpen}
                onClick={(event) => {
                  event.preventDefault();
                  setOpenCategorySlug((currentSlug) => (currentSlug === category.slug ? null : category.slug));
                }}
              >
                <span>{category.name}</span>
                <ChevronRight className="catalog_mobile-summary-icon" />
              </summary>
              <div className="catalog_mobile-children">
                <CategoryLink category={category} className="catalog_mobile-link catalog_mobile-link--root" />
                {category.children.map((child) => (
                  <div className="catalog_mobile-nested" key={child.slug}>
                    <CategoryLink category={child} className="catalog_mobile-link" />
                    {child.collections.map((collection) => (
                      <a
                        className="catalog_mobile-link catalog_mobile-link--collection"
                        href={collectionHref(child, collection.slug)}
                        key={collection.slug}
                      >
                        {collection.name}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

export function CatalogNavigation({ compactMode, mobileOpen, onMobileClose }: CatalogNavigationProps) {
  const { data: categories = [], isError, isLoading } = useQuery({
    queryKey: ["categories", "tree"],
    queryFn: getCategoryTree,
  });
  const [activeRootSlug, setActiveRootSlug] = useState<string | null>(null);
  const [activeChildSlug, setActiveChildSlug] = useState<string | null>(null);
  const openDelayTimerRef = useRef<number | null>(null);
  const menuOpen = activeRootSlug !== null;
  const activeRoot = useMemo(
    () => categories.find((category) => category.slug === activeRootSlug),
    [activeRootSlug, categories],
  );
  const activeChild = useMemo(() => {
    if (!activeRoot) {
      return undefined;
    }

    return activeRoot.children.find((category) => category.slug === activeChildSlug) ?? activeRoot.children[0];
  }, [activeChildSlug, activeRoot]);

  const clearOpenDelayTimer = () => {
    if (openDelayTimerRef.current !== null) {
      window.clearTimeout(openDelayTimerRef.current);
      openDelayTimerRef.current = null;
    }
  };

  const openCategory = (category: CategoryNode) => {
    setActiveRootSlug(category.slug);
    setActiveChildSlug(category.children[0]?.slug ?? null);
  };

  const openCategoryWithDelay = (category: CategoryNode) => {
    clearOpenDelayTimer();

    if (activeRootSlug !== null) {
      openCategory(category);
      return;
    }

    openDelayTimerRef.current = window.setTimeout(() => {
      openCategory(category);
      openDelayTimerRef.current = null;
    }, 180);
  };

  const closeCategory = () => {
    clearOpenDelayTimer();
    setActiveRootSlug(null);
    setActiveChildSlug(null);
  };

  useEffect(() => clearOpenDelayTimer, []);

  if (isLoading) {
    return <div className="catalog catalog--loading" aria-label="Каталог загружается" />;
  }

  if (isError || categories.length === 0) {
    return (
      <div className="catalog catalog--error" role="status">
        Каталог временно недоступен
      </div>
    );
  }

  return (
    <nav
      className={`catalog${menuOpen ? " catalog--open" : ""}${compactMode ? " catalog--compact" : ""}${
        mobileOpen ? " catalog--mobile-open" : ""
      }`}
      aria-label="Каталог товаров"
      onMouseLeave={() => {
        closeCategory();
      }}
    >
      <div className="catalog_bar">
        <div className="catalog_inner">
          {categories.map((category) => (
            <a
              aria-expanded={activeRoot?.slug === category.slug}
              className={`catalog_root-link${activeRoot?.slug === category.slug ? " catalog_root-link--active" : ""}`}
              href={categoryHref(category)}
              key={category.slug}
              onFocus={() => {
                clearOpenDelayTimer();
                openCategory(category);
              }}
              onMouseEnter={() => {
                openCategoryWithDelay(category);
              }}
              onMouseLeave={clearOpenDelayTimer}
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      <div
        className="catalog_backdrop"
        aria-hidden="true"
        onMouseEnter={() => {
          closeCategory();
        }}
      />

      {activeRoot ? (
        <DesktopMegaMenu
          activeRoot={activeRoot}
          activeChild={activeChild}
          onChildChange={(category) => setActiveChildSlug(category.slug)}
        />
      ) : null}

      <MobileCatalog categories={categories} mobileOpen={mobileOpen} onMobileClose={onMobileClose} />
    </nav>
  );
}
