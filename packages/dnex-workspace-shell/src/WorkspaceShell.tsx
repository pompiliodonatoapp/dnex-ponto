import { useEffect, useId, useMemo, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { Building2, ChevronDown, ChevronUp, LayoutGrid, Menu, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { DnexSymbol, iniciais, Logo, ProductGlyph, Sheet, SheetBody, SheetContent, SheetHeader, Topbar, type DnexProductKey } from "@dnex/ds";

import { handleShellLinkClick, handleShellProductLinkClick, type ShellNavigate, type ShellProductNavigate } from "./navigation.js";
import { railScrollAvailability } from "./rail-scroll.js";
import {
  activeNavigationKey, ancestorKeysOf, filterNavigationSections, mobileNavigationLeaves, normalizeForSearch, navigationLeaves,
  visibleShellGlobalNavigation, visibleShellProducts,
  type ShellGlobalNavigationItem, type ShellNavigationGroup, type ShellNavigationItem, type ShellNavigationLeaf,
  type ShellNavigationSection, type ShellProduct,
} from "./manifest.js";

function ShellLink({ onNavigate, onProductNavigate, productKey, onActivate, onClick, href, ...props }: ComponentProps<"a"> & {
  onNavigate?: ShellNavigate; onProductNavigate?: ShellProductNavigate; productKey?: string; onActivate?: () => void;
}) {
  return <a {...props} href={href} onClick={(event) => {
    onClick?.(event);
    if (productKey !== undefined) handleShellProductLinkClick(event, productKey, href, onProductNavigate, onNavigate, onActivate);
    else handleShellLinkClick(event, href, onNavigate, onActivate);
  }} />;
}

/** Buttons represent local views. They keep native Enter/Space behavior and never fabricate a URL. */
function ContextControl({ item, onNavigate, onActivate, children, ...props }: {
  item: ShellNavigationLeaf; onNavigate?: ShellNavigate; onActivate?: () => void; children: ReactNode;
  className: string; title?: string; "aria-label"?: string; "aria-current"?: "page";
}) {
  if (item.kind === "action") return <button {...props} type="button" onClick={(event) => {
    if (event.defaultPrevented) return;
    item.onSelect();
    onActivate?.();
  }}>{children}</button>;
  return <ShellLink {...props} href={item.href} onNavigate={onNavigate} onActivate={onActivate}>{children}</ShellLink>;
}

function GlobalTopbarNavigation({ items, onNavigate, onActivate, mobile = false }: {
  items: readonly ShellGlobalNavigationItem[]; onNavigate?: ShellNavigate; onActivate?: () => void; mobile?: boolean;
}) {
  const visibleItems = visibleShellGlobalNavigation(items);
  if (!visibleItems.length) return null;
  return <nav className={mobile ? "dnex-shell-global-mobile" : "dnex-shell-global-topbar"} aria-label="Navegação geral">
    {visibleItems.map((item) => <ShellLink key={item.key} href={item.href} onNavigate={onNavigate} onActivate={onActivate}
      title={item.label} aria-label={item.label} className="dnex-shell-global-link">
      <span aria-hidden="true">{item.icon ?? iniciais(item.label)}</span>
      {mobile && <span>{item.label}</span>}
      {item.badge !== undefined && <span className="dnex-shell-badge">{item.badge}</span>}
    </ShellLink>)}
  </nav>;
}

function ProductLinks({ products, currentProductKey, onNavigate, onProductNavigate, onActivate }: {
  products: readonly ShellProduct[]; currentProductKey: string; onNavigate?: ShellNavigate; onProductNavigate?: ShellProductNavigate; onActivate?: () => void;
}) {
  return visibleShellProducts(products).map((product) => {
    const label = product.label.replace(/^DNEX\s+/i, "");
    const accessibleLabel = product.statusLabel ? product.label + " — " + product.statusLabel : product.label;
    return <ShellLink key={product.key} href={product.href} productKey={product.key} onProductNavigate={onProductNavigate}
      onNavigate={product.key === currentProductKey ? onNavigate : undefined} onActivate={onActivate}
      title={accessibleLabel} aria-label={accessibleLabel} aria-current={product.key === currentProductKey ? "page" : undefined}
      className="dnex-shell-product-link">
      <span className="dnex-shell-product-icon" aria-hidden="true">{product.icon ?? <ProductGlyph product={product.key as DnexProductKey} size={28} />}</span>
      <span className="dnex-shell-product-label">{label}</span>
      {product.badge !== undefined && <span className="dnex-shell-badge">{product.badge}</span>}
      {product.attention && <span className="dnex-shell-product-dot" aria-hidden="true" />}
    </ShellLink>;
  });
}

function ProductRail({ products, currentProductKey, hubHref, catalogHref, productsNotice, onNavigate, onProductNavigate }: {
  products: readonly ShellProduct[]; currentProductKey: string; hubHref: string; catalogHref?: string;
  productsNotice?: ReactNode; onNavigate?: ShellNavigate; onProductNavigate?: ShellProductNavigate;
}) {
  const railRef = useRef<HTMLElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [available, setAvailable] = useState({ previous: false, next: false });
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const next = railScrollAvailability(rail);
      // Keep keyboard focus in the list when a focused scroll control reaches its edge.
      if (rail.clientHeight > 0 && ((!next.previous && document.activeElement === previousRef.current)
        || (!next.next && document.activeElement === nextRef.current))) rail.focus({ preventScroll: true });
      setAvailable(current => current.previous === next.previous && current.next === next.next ? current : next);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule);
    observer?.observe(rail);
    // The viewport can stay fixed while product content/font dimensions change.
    for (const child of rail.children) observer?.observe(child);
    rail.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    measure();
    return () => {
      observer?.disconnect();
      rail.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [products]);
  const scroll = (direction: 1 | -1) => railRef.current?.scrollBy({
    top: direction * 176,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
  return <aside className="dnex-shell-product-rail" aria-label="Produtos DNEX">
    <ShellLink href={hubHref} onNavigate={onNavigate} className="dnex-shell-rail-brand" aria-label="Abrir Hub DNEX" title="Abrir Hub DNEX">
      <DnexSymbol size={32} tone="inverse" />
    </ShellLink>
    <button ref={previousRef} type="button" onClick={() => scroll(-1)} aria-label="Ver aplicativos anteriores"
      disabled={!available.previous} tabIndex={available.previous ? 0 : -1} aria-hidden={!available.previous}
      className="dnex-shell-rail-scroll"><ChevronUp size={16} /></button>
    <nav ref={railRef} tabIndex={-1} className="dnex-shell-product-list" aria-label="Aplicativos DNEX">
      <ProductLinks products={products} currentProductKey={currentProductKey} onNavigate={onNavigate} onProductNavigate={onProductNavigate} />
    </nav>
    {productsNotice && <div className="dnex-shell-products-notice">{productsNotice}</div>}
    {catalogHref && <ShellLink className="dnex-shell-product-catalog" href={catalogHref} onNavigate={onNavigate} aria-label="Abrir catálogo de produtos">
      <LayoutGrid size={20} aria-hidden="true" /><span>Produtos</span>
    </ShellLink>}
    <button ref={nextRef} type="button" onClick={() => scroll(1)} aria-label="Ver mais aplicativos"
      disabled={!available.next} tabIndex={available.next ? 0 : -1} aria-hidden={!available.next}
      className="dnex-shell-rail-scroll"><ChevronDown size={16} /></button>
  </aside>;
}

function WorkspaceContext({ workspaceLabel, workspaceHref, onNavigate, onActivate }: {
  workspaceLabel?: string; workspaceHref?: string; onNavigate?: ShellNavigate; onActivate?: () => void;
}) {
  if (!workspaceLabel) return null;
  const content = <><Building2 size={19} aria-hidden="true" /><span><strong>{workspaceLabel}</strong><small>Empresa ativa</small></span></>;
  return workspaceHref
    ? <ShellLink href={workspaceHref} onNavigate={onNavigate} onActivate={onActivate} className="dnex-shell-workspace" title={workspaceLabel} aria-label={"Empresa ativa: " + workspaceLabel}>{content}</ShellLink>
    : <div className="dnex-shell-workspace" title={workspaceLabel}>{content}</div>;
}

/** Recursive navigation item renderer — group or leaf. Groups never receive aria-current=page. */
function NavigationItem({
  item, expandedKeys, onToggle, activeKey, expandedGroups, onNavigate, onActivate, groupIdPrefix, isNested, searching,
}: {
  item: ShellNavigationItem;
  expandedKeys: ReadonlySet<string>;
  onToggle: (key: string) => void;
  activeKey: string | null;
  expandedGroups: ReadonlySet<string>;
  onNavigate?: ShellNavigate;
  onActivate?: () => void;
  groupIdPrefix: string;
  isNested?: boolean;
  searching?: boolean;
}) {
  if (item.kind === "group") {
    const isExpanded = expandedKeys.has(item.key);
    const isAncestorActive = expandedGroups.has(item.key);
    const groupId = `${groupIdPrefix}-${item.key}`;
    return (
      <li>
        <button
          type="button"
          className={`dnex-shell-context-group-toggle${isAncestorActive ? " dnex-shell-context-group-active-ancestor" : ""}`}
          onClick={() => !searching && onToggle(item.key)}
          aria-expanded={isExpanded}
          aria-controls={groupId}
          title={item.label}
          disabled={searching}
        >
          <span className="dnex-shell-context-icon" aria-hidden="true">{item.icon ?? iniciais(item.label)}</span>
          <span className="dnex-shell-context-label">{item.label}</span>
          {item.badge !== undefined && <span className="dnex-shell-context-badge">{item.badge}</span>}
          <span className={`dnex-shell-group-chevron${isExpanded ? " dnex-shell-group-chevron-open" : ""}`} aria-hidden="true">
            <ChevronDown size={14} />
          </span>
        </button>
        {/* Collapsed group hides all descendants and keyboard focus from assistive tech */}
        <ul
          id={groupId}
          className="dnex-shell-group-children"
          role="group"
          aria-label={`Submenu de ${item.label}`}
          hidden={!isExpanded}
        >
          {isExpanded && item.children.map((child) => (
            <NavigationItem
              key={child.key}
              item={child}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
              activeKey={activeKey}
              expandedGroups={expandedGroups}
              onNavigate={onNavigate}
              onActivate={onActivate}
              groupIdPrefix={groupIdPrefix}
              isNested
              searching={searching}
            />
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li>
      <ContextControl
        item={item}
        onNavigate={onNavigate}
        onActivate={onActivate}
        aria-label={item.label}
        title={item.label}
        aria-current={item.key === activeKey ? "page" : undefined}
        className="dnex-shell-context-link"
      >
        <span className="dnex-shell-context-icon" aria-hidden="true">{item.icon ?? iniciais(item.label)}</span>
        <span className="dnex-shell-context-label">{item.label}</span>
        {item.badge !== undefined && <span className="dnex-shell-context-badge">{item.badge}</span>}
        {item.key === activeKey && <span className="dnex-shell-active-dot" aria-hidden="true" />}
      </ContextControl>
    </li>
  );
}

/** Search input with accessible label (icon alone is not a label per WCAG). */
function NavigationSearch({
  query, onChange, onClear, label, searchId,
}: {
  query: string; onChange: (q: string) => void; onClear: () => void; label: string; searchId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="dnex-shell-nav-search" role="search">
      <label className="dnex-shell-nav-search-label" htmlFor={searchId}>
        <Search size={16} aria-hidden="true" />
        <span className="dnex-shell-nav-search-label-text">{label}</span>
      </label>
      <input
        ref={inputRef}
        id={searchId}
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="dnex-shell-nav-search-input"
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
      />
      {query && (
        <button type="button" onClick={() => { onClear(); inputRef.current?.focus(); }} className="dnex-shell-nav-search-clear" aria-label="Limpar busca">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/** Recursively collects all group keys from a filtered tree for search mode auto-expand. */
function collectAllGroupKeys(items: readonly ShellNavigationItem[]): string[] {
  const keys: string[] = [];
  for (const item of items) {
    if (item.kind === "group") {
      keys.push(item.key);
      keys.push(...collectAllGroupKeys(item.children));
    }
  }
  return keys;
}

function ContextNavigation({
  productLabel, sections, expandedKeys, onToggle, expandedGroups, onNavigate, onActivate,
  searchQuery, onSearchChange, onSearchClear, searchLabel, searchId, navigationId,
}: {
  productLabel: string; sections: readonly ShellNavigationSection[]; expandedKeys: ReadonlySet<string>;
  onToggle: (key: string) => void; expandedGroups: ReadonlySet<string>;
  onNavigate?: ShellNavigate; onActivate?: () => void;
  searchQuery?: string; onSearchChange?: (q: string) => void; onSearchClear?: () => void; searchLabel?: string;
  searchId: string; navigationId: string;
}) {
  const isSearching = Boolean(normalizeForSearch(searchQuery ?? ""));
  const filteredSections = isSearching ? filterNavigationSections(sections, searchQuery ?? "") : sections;
  const activeKey = activeNavigationKey(sections);

  // During search, auto-expand all groups in the filtered tree
  const searchExpandedKeys = useMemo(() => {
    if (!isSearching) return undefined;
    const allKeys = new Set<string>();
    for (const section of filteredSections) {
      for (const key of collectAllGroupKeys(section.items)) {
        allKeys.add(key);
      }
    }
    return allKeys;
  }, [isSearching, filteredSections]);

  const displayExpandedKeys = isSearching ? (searchExpandedKeys ?? new Set()) : expandedKeys;

  return (
    <nav aria-label={"Navegação de " + productLabel} className="dnex-shell-context-navigation">
      {searchLabel && onSearchChange && onSearchClear && (
        <NavigationSearch
          query={searchQuery ?? ""}
          onChange={onSearchChange}
          onClear={onSearchClear}
          label={searchLabel}
          searchId={searchId}
        />
      )}
      {filteredSections.length === 0 ? (
        <section aria-label="Resultados da busca" className="dnex-shell-context-section">
          <p className="dnex-shell-nav-search-empty" role="status" aria-live="polite">Nenhum item encontrado para &quot;{searchQuery}&quot;.</p>
        </section>
      ) : (
        filteredSections.map((section) => (
          <section key={section.key} aria-label={section.label} className="dnex-shell-context-section">
            {section.label && <h2>{section.label}</h2>}
            <ul className="dnex-shell-context-links" role="list">
              {section.items.map((item) => (
                <NavigationItem
                  key={item.key}
                  item={item}
                  expandedKeys={displayExpandedKeys}
                  onToggle={onToggle}
                  activeKey={activeKey}
                  expandedGroups={expandedGroups}
                  onNavigate={onNavigate}
                  onActivate={onActivate}
                  groupIdPrefix={navigationId}
                  searching={isSearching}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </nav>
  );
}

function ContextSidebar({
  productLabel, currentProductKey, sections, header, brand, workspaceLabel, workspaceHref, onNavigate, searchLabel,
}: {
  productLabel: string; currentProductKey: string; sections: readonly ShellNavigationSection[]; header?: ReactNode; brand?: ReactNode;
  workspaceLabel?: string; workspaceHref?: string; onNavigate?: ShellNavigate; searchLabel?: string;
}) {
  const navigationId = useId();
  const searchId = useId();
  const sectionsRef = useRef(sections);
  const previousProductRef = useRef(currentProductKey);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const activeKey = activeNavigationKey(sections);
  const expandedGroups = useMemo(() => new Set(ancestorKeysOf(activeKey ?? "", sections)), [activeKey, sections]);

  const storageKey = "dnex:context-sidebar:" + currentProductKey + ":collapsed";
  useEffect(() => {
    try { setCollapsed(window.localStorage.getItem(storageKey) === "true"); } catch { setCollapsed(false); }
  }, [storageKey]);
  const toggle = () => setCollapsed((current) => {
    const next = !current;
    try { window.localStorage.setItem(storageKey, String(next)); } catch { /* Keep navigation usable without storage. */ }
    return next;
  });

  // Keep ref in sync
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  // Reset expanded state and clear search when currentProductKey changes
  useEffect(() => {
    const newActiveKey = activeNavigationKey(sectionsRef.current);
    const newAncestors = ancestorKeysOf(newActiveKey ?? "", sectionsRef.current);
    setExpandedKeys(new Set(newAncestors));
    setSearchQuery("");
    previousProductRef.current = currentProductKey;
  }, [currentProductKey]);

  // Expand ancestors of the active leaf when activeKey changes (union, not replace)
  useEffect(() => {
    if (!activeKey) return;
    const ancestors = ancestorKeysOf(activeKey, sectionsRef.current);
    if (ancestors.length > 0) {
      setExpandedKeys((current) => {
        const next = new Set(current);
        for (const k of ancestors) next.add(k);
        return next;
      });
    }
  }, [activeKey]);

  const toggleGroup = (key: string) => {
    // When sidebar is collapsed and user opens a group, expand the sidebar and force group open.
    if (collapsed) {
      setCollapsed(false);
      try { window.localStorage.setItem(storageKey, "false"); } catch { /* ignore */ }
      setExpandedKeys((current) => new Set([...current, key]));
      return;
    }
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return <aside className="dnex-shell-context-sidebar" data-collapsed={collapsed} aria-label={"Módulo " + productLabel}>
    <div className="dnex-shell-context-heading">
      <div className="dnex-shell-context-brand">{brand ?? <Logo height={23} product={productLabel.replace(/^DNEX\s+/i, "")} />}</div>
      <button type="button" className="dnex-shell-context-toggle" onClick={toggle} aria-controls={navigationId}
        aria-expanded={!collapsed} aria-label={collapsed ? "Expandir menu do produto" : "Recolher menu do produto"}
        title={collapsed ? "Expandir menu do produto" : "Recolher menu do produto"}>
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
      </button>
    </div>
    <WorkspaceContext workspaceLabel={workspaceLabel} workspaceHref={workspaceHref} onNavigate={onNavigate} />
    {!collapsed && header && <div className="dnex-shell-sidebar-header">{header}</div>}
    <div id={navigationId} className="dnex-shell-context-scroll">
      <ContextNavigation
        productLabel={productLabel}
        sections={sections}
        expandedKeys={expandedKeys}
        onToggle={toggleGroup}
        expandedGroups={expandedGroups}
        onNavigate={onNavigate}
        onActivate={undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery("")}
        searchLabel={searchLabel}
        searchId={searchId}
        navigationId={navigationId}
      />
    </div>
  </aside>;
}

/** The DS Sheet supplies focus trapping and Escape. Actual navigation stays native links. */
function MobileDrawer({
  open, onClose, drawerId, opener, productLabel, products, sections, currentProductKey, header,
  workspaceLabel, workspaceHref, productsNotice, catalogHref, hubHref, globalNavigation, onNavigate, onProductNavigate,
  searchLabel, navigationId, searchId,
}: {
  open: boolean; onClose: () => void; drawerId: string; opener: RefObject<HTMLButtonElement | null>;
  productLabel: string; products: readonly ShellProduct[]; sections: readonly ShellNavigationSection[];
  currentProductKey: string; header?: ReactNode; workspaceLabel?: string; workspaceHref?: string;
  productsNotice?: ReactNode; catalogHref?: string; hubHref: string; globalNavigation: readonly ShellGlobalNavigationItem[];
  onNavigate?: ShellNavigate; onProductNavigate?: ShellProductNavigate; searchLabel?: string;
  navigationId: string; searchId: string;
}) {
  const sectionsRef = useRef(sections);
  const previousProductRef = useRef(currentProductKey);
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const activeKey = activeNavigationKey(sections);
  const expandedGroups = useMemo(() => new Set(ancestorKeysOf(activeKey ?? "", sections)), [activeKey, sections]);

  // Keep ref in sync
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  // Initialize and reset on product change: expand ancestors of active leaf, clear query
  useEffect(() => {
    const newActiveKey = activeNavigationKey(sectionsRef.current);
    const newAncestors = ancestorKeysOf(newActiveKey ?? "", sectionsRef.current);
    setExpandedKeys(new Set(newAncestors));
    setSearchQuery("");
    previousProductRef.current = currentProductKey;
  }, [currentProductKey]);

  // Expand ancestors of the active leaf when route changes (union, not replace)
  useEffect(() => {
    if (!activeKey) return;
    const ancestors = ancestorKeysOf(activeKey, sectionsRef.current);
    if (ancestors.length > 0) {
      setExpandedKeys((current) => {
        const next = new Set(current);
        for (const k of ancestors) next.add(k);
        return next;
      });
    }
  }, [activeKey]);

  const toggleGroup = (key: string) => {
    // Group toggle in mobile drawer does NOT close the drawer.
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Leaf activation closes drawer
  const handleLeafActivate = () => onClose();

  return <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <SheetContent id={drawerId} side="left" size="full" closeLabel="Fechar navegação" className="dnex-shell-mobile-drawer"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        const target = opener.current;
        if (target?.isConnected && target.getClientRects().length) target.focus();
        else document.getElementById("dnex-main")?.focus();
      }}>
      <SheetHeader title={"Navegação de " + productLabel} description="Aplicativos e páginas do módulo atual." />
      <SheetBody>
        <ShellLink href={hubHref} onNavigate={onNavigate} onActivate={onClose} className="dnex-shell-drawer-hub">Abrir Hub DNEX</ShellLink>
        <nav className="dnex-shell-mobile-products" aria-label="Aplicativos DNEX">
          <ProductLinks products={products} currentProductKey={currentProductKey} onNavigate={onNavigate} onProductNavigate={onProductNavigate} onActivate={onClose} />
        </nav>
        {productsNotice && <div className="dnex-shell-drawer-notice">{productsNotice}</div>}
        {catalogHref && <ShellLink href={catalogHref} onNavigate={onNavigate} onActivate={onClose} className="dnex-shell-drawer-hub">Abrir catálogo de produtos</ShellLink>}
        <WorkspaceContext workspaceLabel={workspaceLabel} workspaceHref={workspaceHref} onNavigate={onNavigate} onActivate={onClose} />
        {header && <div className="dnex-shell-sidebar-header">{header}</div>}
        <ContextNavigation
          productLabel={productLabel}
          sections={sections}
          expandedKeys={expandedKeys}
          onToggle={toggleGroup}
          expandedGroups={expandedGroups}
          onNavigate={onNavigate}
          onActivate={handleLeafActivate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={() => setSearchQuery("")}
          searchLabel={searchLabel}
          searchId={searchId}
          navigationId={navigationId}
        />
        <GlobalTopbarNavigation items={globalNavigation} onNavigate={onNavigate} onActivate={onClose} mobile />
      </SheetBody>
    </SheetContent>
  </Sheet>;
}

function MobileBottomNav({ sections, onOpenMenu, drawerId, drawerOpen, onNavigate }: {
  sections: readonly ShellNavigationSection[]; onOpenMenu: (button: HTMLButtonElement) => void;
  drawerId: string; drawerOpen: boolean; onNavigate?: ShellNavigate;
}) {
  const items = mobileNavigationLeaves(sections);
  if (!items.length) return null;
  const activeKey = activeNavigationKey(sections);
  return <nav className="dnex-shell-mobile-bottom-nav" aria-label="Atalhos do módulo">
    {items.map((item) => <ContextControl key={item.key} item={item} onNavigate={onNavigate}
      aria-current={item.key === activeKey ? "page" : undefined} className="dnex-shell-mobile-bottom-link">
      <span aria-hidden="true">{item.icon ?? iniciais(item.label)}</span><span>{item.label}</span>
    </ContextControl>)}
    <button type="button" onClick={(event) => onOpenMenu(event.currentTarget)} className="dnex-shell-mobile-bottom-link"
      aria-label="Mais opções do módulo" aria-controls={drawerId} aria-expanded={drawerOpen}>
      <MoreHorizontal size={20} /><span>Mais</span>
    </button>
  </nav>;
}

export type WorkspaceShellProps = {
  products: readonly ShellProduct[];
  currentProductKey: string;
  /** Fixed product name; variable page context belongs in pageLabel/topbarLeft. */
  productLabel: string;
  pageLabel?: string;
  sections: readonly ShellNavigationSection[];
  /** Host-owned company/customer selector, shared by desktop sidebar and mobile drawer. */
  sidebarHeader?: ReactNode;
  /** Optional desktop brand lockup. Page context and mobile navigation titles keep productLabel. */
  sidebarBrand?: ReactNode;
  globalNavigation?: readonly ShellGlobalNavigationItem[];
  hubHref?: string;
  /** @deprecated Use topbarCenter and topbarRight. */
  topbar?: ReactNode;
  topbarLeft?: ReactNode;
  topbarCenter?: ReactNode;
  /** Optional compact equivalent of topbarCenter, displayed at 700px and below. */
  topbarCenterCompact?: ReactNode;
  topbarRight?: ReactNode;
  /** Alias used by the Normas reference; topbarRight takes precedence. */
  topbarActions?: ReactNode;
  /** Account must go through TopbarGlobalActions in topbarRight, including its narrow-screen overflow. */
  account?: never;
  productsNotice?: ReactNode;
  catalogHref?: string;
  workspaceLabel?: string;
  workspaceHref?: string;
  onNavigate?: ShellNavigate;
  /** Opt-in interception of product links. Claim synchronously before any async exit guard. */
  onProductNavigate?: ShellProductNavigate;
  onSearchOpen?: () => void;
  /** Optional label for the navigation search input. When provided, search is enabled. */
  navigationSearchLabel?: string;
  chromeless?: boolean;
  children: ReactNode;
};

/** Layout and navigation only. Authorization, routing, data and session remain with the host. */
export function WorkspaceShell({
  products, currentProductKey, productLabel, pageLabel, sections, sidebarHeader, sidebarBrand, globalNavigation = [],
  hubHref = "https://hub.dnexsistemas.com.br/", topbar, topbarLeft, topbarCenter, topbarCenterCompact,
  topbarRight, topbarActions, productsNotice, catalogHref, workspaceLabel, workspaceHref,
  onNavigate, onProductNavigate, onSearchOpen, navigationSearchLabel, chromeless = false, children,
}: WorkspaceShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  const navigationId = useId();
  const searchId = useId();
  const opener = useRef<HTMLButtonElement>(null);
  const openMenu = (button: HTMLButtonElement) => { opener.current = button; setDrawerOpen(true); };
  const hasMobileNavigation = mobileNavigationLeaves(sections).length > 0;

  useEffect(() => {
    if (!drawerOpen) return;
    const desktop = window.matchMedia("(min-width: 1101px)");
    const closeOnDesktop = () => { if (desktop.matches) setDrawerOpen(false); };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [drawerOpen]);

  useEffect(() => { if (chromeless) setDrawerOpen(false); }, [chromeless]);

  useEffect(() => {
    if (chromeless || !onSearchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (drawerOpen || event.defaultPrevented || event.repeat || event.altKey
        || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      onSearchOpen();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [chromeless, drawerOpen, onSearchOpen]);

  if (chromeless) return <div className="dnex-shell-chromeless"><main id="dnex-main" tabIndex={-1}>{children}</main></div>;

  const context = topbarLeft ?? <div className="dnex-shell-page-label">{productLabel}{pageLabel && <><span aria-hidden="true"> › </span><span>{pageLabel}</span></>}</div>;
  return <div className="dnex-shell-root" data-mobile-navigation={hasMobileNavigation}>
    <a href="#dnex-main" className="dnex-shell-skip-link" onClick={(event) => {
      event.preventDefault();
      document.getElementById("dnex-main")?.focus();
    }}>Pular para o conteúdo</a>
    <div className="dnex-shell-frame">
      <ProductRail products={products} currentProductKey={currentProductKey} hubHref={hubHref} catalogHref={catalogHref} productsNotice={productsNotice} onNavigate={onNavigate} onProductNavigate={onProductNavigate} />
      <ContextSidebar productLabel={productLabel} currentProductKey={currentProductKey} sections={sections}
        header={sidebarHeader} brand={sidebarBrand} workspaceLabel={workspaceLabel} workspaceHref={workspaceHref}
        onNavigate={onNavigate} searchLabel={navigationSearchLabel} />
      <div className="dnex-shell-main-column">
        <Topbar className="dnex-shell-topbar"
          left={<><button type="button" className="dnex-shell-mobile-menu-trigger" onClick={(event) => openMenu(event.currentTarget)}
            aria-label="Abrir navegação" aria-controls={drawerId} aria-expanded={drawerOpen}><Menu size={20} /></button>{context}</>}
          center={topbarCenterCompact !== undefined ? <><div className="dnex-shell-center-wide">{topbarCenter}</div><div className="dnex-shell-center-compact">{topbarCenterCompact}</div></> : topbarCenter}
          right={<><GlobalTopbarNavigation items={globalNavigation} onNavigate={onNavigate} />{topbarRight ?? topbarActions ?? topbar}</>}
        />
        <main id="dnex-main" tabIndex={-1} className="dnex-shell-content"><div className="dnex-shell-page">{children}</div></main>
      </div>
    </div>
    <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} drawerId={drawerId} opener={opener} productLabel={productLabel}
      products={products} sections={sections} currentProductKey={currentProductKey} header={sidebarHeader}
      workspaceLabel={workspaceLabel} workspaceHref={workspaceHref} productsNotice={productsNotice} catalogHref={catalogHref}
      hubHref={hubHref} globalNavigation={globalNavigation} onNavigate={onNavigate} onProductNavigate={onProductNavigate}
      searchLabel={navigationSearchLabel} navigationId={navigationId} searchId={searchId} />
    <MobileBottomNav sections={sections} onOpenMenu={openMenu} drawerId={drawerId} drawerOpen={drawerOpen} onNavigate={onNavigate} />
  </div>;
}
