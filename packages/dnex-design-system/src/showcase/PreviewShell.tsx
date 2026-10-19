import { useId, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { DnexSymbol } from "../components/brand/Logo";
import { ProductGlyph } from "../components/brand/ProductGlyph";
import { ThemeToggle } from "./parts";

export type PreviewNavigation = { label: string; icon: LucideIcon };
export type PreviewProduct = { key: string; name: string };
type Panel =
  | "navigation"
  | "products"
  | "search"
  | "companies"
  | "help"
  | "notifications"
  | "profile";
const companies = ["Workspace demo", "Estúdio Horizonte", "Grupo Aurora"];

/** Estrutura compartilhada somente pela vitrine. Nenhum acesso, dado ou operação real. */
export function PreviewShell({
  product,
  products,
  onProductChange,
  navigation,
  active,
  onNavigate,
  children,
  label,
}: {
  product: PreviewProduct;
  products: readonly PreviewProduct[];
  onProductChange?: (index: number) => void;
  navigation: readonly PreviewNavigation[];
  active: number;
  onNavigate: (index: number) => void;
  children: ReactNode;
  label: string;
}) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [company, setCompany] = useState(companies[0]);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(true);
  const trigger = useRef<HTMLElement | null>(null);
  const shell = useRef<HTMLDivElement | null>(null);
  const scope = useId();
  const open = (target: Panel, element: HTMLElement) => {
    trigger.current = element;
    setQuery("");
    setPanel(target);
  };
  const go = (index: number) => {
    onNavigate(index);
    setPanel(null);
  };
  const chooseProduct = (index: number) => {
    onProductChange?.(index);
    setPanel(null);
  };
  const titles: Record<Panel, string> = {
    navigation: `Navegar no DNEX ${product.name}`,
    products: "Seus produtos",
    search: `Buscar no DNEX ${product.name}`,
    companies: "Selecionar empresa",
    help: "Como podemos ajudar?",
    notifications: "Sua central de notificações",
    profile: "Seu perfil",
  };

  const sidebar = (mobile = false) => (
    <div className="ds-wb-sidebar-content">
      {!mobile && (
        <div className="ds-wb-sidebar-heading">
          <div className="ds-wb-wordmark">
            DNEX <span>{product.name}</span>
          </div>
          <button
            type="button"
            className="ds-wb-sidebar-toggle"
            aria-label={sidebarCollapsed ? "Expandir menu do produto" : "Recolher menu do produto"}
            aria-expanded={!sidebarCollapsed}
            aria-controls={`${scope}-sidebar-pages`}
            title={sidebarCollapsed ? "Expandir menu do produto" : "Recolher menu do produto"}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
          </button>
        </div>
      )}
      <button
        className="ds-wb-company"
        type="button"
        aria-label={`Selecionar empresa: ${company}`}
        title={!mobile && sidebarCollapsed ? company : undefined}
        onClick={(event) => open("companies", event.currentTarget)}
      >
        <Building2 size={19} aria-hidden="true" />
        <span>
          {company}
          <small>Ambiente demonstrativo</small>
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      <nav id={mobile ? undefined : `${scope}-sidebar-pages`} className="ds-wb-pages" aria-label={`Páginas de ${product.name}`}>
        <p>ESPAÇO DE TRABALHO</p>
        {navigation.map(({ label, icon: Icon }, index) => (
          <button
            type="button"
            key={label}
            aria-label={label}
            title={!mobile && sidebarCollapsed ? label : undefined}
            aria-current={index === active ? "page" : undefined}
            onClick={() => go(index)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            {index === active && <i />}
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div ref={shell} className="ds-workbench" data-sidebar-collapsed={sidebarCollapsed} role="region" aria-label={label}>
      <nav className="ds-wb-rail" aria-label={`Produtos · ${label}`}>
        <DnexSymbol size={32} tone="inverse" />
        <div>
          {products.map((item, index) => (
            <button
              key={item.key}
              type="button"
              title={`DNEX ${item.name}`}
              aria-label={`Abrir DNEX ${item.name}`}
              aria-pressed={item.key === product.key}
              onClick={() => chooseProduct(index)}
            >
              <ProductGlyph product={item.key} size={28} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <button
          className="ds-wb-product-catalog"
          type="button"
          aria-label="Explorar produtos"
          onClick={(event) => open("products", event.currentTarget)}
        >
          <LayoutGrid size={21} />
          <span>Produtos</span>
        </button>
        <span className="ds-wb-rail-end" aria-hidden="true" />
      </nav>
      <aside
        className="ds-wb-sidebar"
        data-collapsed={sidebarCollapsed}
        aria-label={`Menu lateral · ${product.name}`}
      >
        {sidebar()}
      </aside>
      <div className="ds-wb-main">
        <header className="ds-wb-topbar">
          <button
            type="button"
            className="ds-wb-menu-toggle"
            aria-label={`Abrir navegação de ${product.name}`}
            aria-expanded={panel === "navigation"}
            onClick={(event) => open("navigation", event.currentTarget)}
          >
            <Menu size={21} />
          </button>
          <div className="ds-wb-breadcrumb">
            <span>DNEX {product.name}</span>
            <ChevronRight size={14} aria-hidden="true" />
            <strong>{navigation[active]?.label}</strong>
          </div>
          <div className="ds-wb-topbar-actions" aria-label="Ações rápidas">
            <button
              className="ds-wb-topbar-search"
              type="button"
              aria-label="Buscar no módulo"
              onClick={(event) => open("search", event.currentTarget)}
            >
              <Search size={17} aria-hidden="true" />
              <span>Buscar no módulo</span>
              <kbd aria-hidden="true">⌘ K</kbd>
            </button>
            <button
              className="ds-wb-topbar-icon"
              type="button"
              aria-label="Abrir notificações"
              onClick={(event) => open("notifications", event.currentTarget)}
            >
              <Bell size={18} aria-hidden="true" />
              {unread && <i aria-hidden="true" />}
            </button>
            <button
              className="ds-wb-topbar-icon"
              type="button"
              aria-label="Abrir ajuda e suporte"
              onClick={(event) => open("help", event.currentTarget)}
            >
              <CircleHelp size={19} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            className="ds-wb-profile"
            aria-label="Abrir perfil do usuário"
            onClick={(event) => open("profile", event.currentTarget)}
          >
            <span className="ds-wb-avatar">PD</span>
            <span className="ds-wb-profile-name">
              Pompílio Donato<small>Administrador · demo</small>
            </span>
            <ChevronDown size={13} aria-hidden="true" />
          </button>
        </header>
        <div className="ds-wb-content">{children}</div>
      </div>

      <Dialog.Root
        open={panel !== null}
        onOpenChange={(value) => {
          if (!value) setPanel(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="ds-wb-overlay" />
          <Dialog.Content
            className={`ds-wb-dialog ${panel === "navigation" ? "ds-wb-drawer" : ""}`}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              const element = trigger.current;
              if (element?.isConnected && element.getClientRects().length)
                element.focus();
              else
                (
                  shell.current?.querySelector(
                    ".ds-wb-menu-toggle",
                  ) as HTMLButtonElement | null
                )?.focus();
            }}
          >
            <div className="ds-wb-dialog-heading">
              <div>
                <Dialog.Title>
                  {panel ? titles[panel] : "Navigation"}
                </Dialog.Title>
                <Dialog.Description>
                  Prévia DNEX · dados e ações demonstrativos
                </Dialog.Description>
              </div>
              <Dialog.Close aria-label="Fechar painel">
                <X size={21} />
              </Dialog.Close>
            </div>
            {panel === "navigation" && (
              <>
                <div
                  className="ds-wb-mobile-products"
                  aria-label="Trocar produto"
                >
                  {products.map((item, index) => (
                    <button
                      type="button"
                      key={item.key}
                      aria-label={`Abrir DNEX ${item.name}`}
                      aria-pressed={item.key === product.key}
                      onClick={() => chooseProduct(index)}
                    >
                      <ProductGlyph product={item.key} size={28} />
                      {item.name}
                    </button>
                  ))}
                </div>
                {sidebar(true)}
              </>
            )}
            {panel === "products" && (
              <div className="ds-wb-choice-list">
                {products.map((item, index) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => chooseProduct(index)}
                  >
                    <ProductGlyph product={item.key} size={32} />
                    <span>DNEX {item.name}</span>
                    {item.key === product.key && <Check size={18} />}
                  </button>
                ))}
                <a href="#identidade-produtos" onClick={() => setPanel(null)}>
                  Conhecer a família completa <ArrowRight size={17} />
                </a>
              </div>
            )}
            {panel === "companies" && (
              <div className="ds-wb-choice-list">
                {companies.map((name) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => {
                      setCompany(name);
                      setPanel(null);
                    }}
                  >
                    <Building2 size={22} />
                    <span>
                      {name}
                      <small>Empresa fictícia</small>
                    </span>
                    {company === name && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
            {panel === "search" && (
              <>
                <label
                  className="ds-wb-search-input"
                  htmlFor={`${scope}-search`}
                >
                  <Search size={19} />
                  <input
                    autoFocus
                    aria-label="Buscar páginas"
                    id={`${scope}-search`}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Qual página você procura?"
                  />
                </label>
                <div className="ds-wb-choice-list">
                  {navigation
                    .map((item, index) => ({ ...item, index }))
                    .filter((item) =>
                      item.label
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLocaleLowerCase()
                        .includes(
                          query
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .toLocaleLowerCase(),
                        ),
                    )
                    .map(({ icon: Icon, label, index }) => (
                      <button
                        type="button"
                        key={label}
                        onClick={() => go(index)}
                      >
                        <Icon size={20} />
                        <span>{label}</span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                </div>
                {!navigation.some((item) =>
                  item.label
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .includes(
                      query
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLowerCase(),
                    ),
                ) && (
                  <p className="ds-wb-empty" role="status">
                    Nenhuma página encontrada. Tente outro termo.
                  </p>
                )}
              </>
            )}
            {panel === "notifications" && (
              <div className="ds-wb-notifications">
                <div className="ds-wb-notification-summary">
                  <span role="status">
                    {unread
                      ? "2 atualizações para você"
                      : "Tudo lido. Você está em dia."}
                  </span>
                  <button
                    type="button"
                    disabled={!unread}
                    onClick={() => setUnread(false)}
                  >
                    Marcar como lidas
                  </button>
                </div>
                {[
                  "Seu resumo do workspace está disponível",
                  "Uma nova versão do design system está pronta",
                ].map((message, index) => (
                  <article key={message}>
                    <span className="ds-wb-note-icon">
                      <Check size={19} />
                    </span>
                    <div>
                      <h4>{message}</h4>
                      <p>
                        Notificação de exemplo, sem vínculo com operações reais.
                      </p>
                      <small>
                        {index === 0 ? "Há 5 minutos" : "Há 1 hora"}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {panel === "help" && (
              <div className="ds-wb-help">
                <span className="ds-wb-help-mark">
                  <CircleHelp size={30} />
                </span>
                <h3>Um caminho mais simples.</h3>
                <p>
                  Use a busca para encontrar uma página. Troque o produto pela
                  navegação e mantenha o contexto da empresa à vista.
                </p>
                <button type="button" onClick={() => setPanel("search")}>
                  Encontrar uma página <Search size={17} />
                </button>
                <a href="#command" onClick={() => setPanel(null)}>
                  Conhecer atalhos do design system <ArrowRight size={17} />
                </a>
                <small>
                  Esta demonstração não abre chamados nem envia mensagens.
                </small>
              </div>
            )}
            {panel === "profile" && (
              <div className="ds-wb-profile-panel">
                <span className="ds-wb-avatar">PD</span>
                <h3>Pompílio Donato</h3>
                <p>Perfil ilustrativo · administrador</p>
                <div>
                  <ShieldCheck size={19} /> Ambiente de demonstração
                </div>
                <div>
                  <span>Aparência da interface</span>
                  <ThemeToggle />
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
