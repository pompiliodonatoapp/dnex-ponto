import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Menu, MoreHorizontal } from "lucide-react";
import { cn } from "../lib/cn";
import { Sidebar, SidebarDrawer } from "../components/shell/Sidebar";
import type { SidebarDrawerGlobalItem, SidebarNavItem, SidebarNavLink } from "../components/shell/Sidebar";
import { Topbar } from "../components/shell/Topbar";
import { PageHeader } from "../components/shell/PageHeader";
import type { PageHeaderProps } from "../components/shell/PageHeader";

/**
 * AppLayout — shell completo de aplicação do hub DNEX.
 *
 * Compõe os componentes de shell JÁ existentes (não recria nada):
 *   Sidebar (desktop) + SidebarDrawer (tela cheia, < md) + Topbar + área de
 *   conteúdo + slot opcional de <PageHeader>.
 *
 * Responsivo: a Sidebar fixa some em telas estreitas (`hidden md:flex`) e dá
 * lugar ao botão de menu na Topbar, que abre o SidebarDrawer em tela cheia (Radix Dialog: foco
 * preso, Esc, ARIA). Estado do menu é interno por padrão; pode ser controlado.
 *
 * O `topbarLeft`/`topbarRight` recebem o conteúdo da Topbar (AppLauncher,
 * busca, NotificationCenter, TenantSwitcher, Avatar…), montado pelo app — o
 * layout só garante a estrutura e o botão de menu mobile.
 *
 * Acessibilidade: <main> rotulado; o conteúdo é a região de scroll própria.
 * Zero valor mágico — alturas/tokens do shell.
 */

export type AppLayoutProps = {
  /** Itens de navegação da Sidebar/SidebarDrawer. */
  navItems: SidebarNavItem[];
  /** Id do item ativo. */
  activeId: string;
  onNavSelect: (id: string) => void;
  /** Rodapé da Sidebar (ex.: bloco de usuário). */
  sidebarFooter?: ReactNode;
  /** Bloco abaixo da marca na Sidebar (ex.: seletor de workspace). */
  sidebarHeader?: ReactNode;
  /** @deprecated Use `sidebarHeader`. Compatibilidade temporária V1.0. */
  sidebarWorkspace?: ReactNode;
  /** Bloco operacional acima da conta (ex.: Pulso DNEX). */
  sidebarPulse?: ReactNode;
  /** @deprecated O App Shell V1.1 possui uma única superfície visual. */
  sidebarVariant?: "default" | "brand";
  /** Rodapé do SidebarDrawer (sobre fundo índigo — use tons claros). */
  mobileMenuFooter?: ReactNode;
  /**
   * Marca customizada da Sidebar/SidebarDrawer (ex.: <DnexProductLogo product="Contratos" />).
   * Default: <Logo> genérico do DNEX. No SidebarDrawer (fundo índigo escuro) é envolvida
   * automaticamente em `text-white` — o texto do lockup de produto usa currentColor.
   */
  logo?: ReactNode;
  /** Marca do sidebar RECOLHIDO — só o símbolo (o lockup completo corta em 4.5rem). */
  logoCollapsed?: ReactNode;
  /** Permite recolher a navegação no desktop. O contrato V1 usa largura fixa por padrão. */
  sidebarCollapsible?: boolean;
  /** Conteúdo à esquerda da Topbar (após o botão de menu): AppLauncher, busca… */
  topbarLeft?: ReactNode;
  /** Conteúdo central da Topbar (normalmente a busca global). */
  topbarCenter?: ReactNode;
  /** Conteúdo à direita da Topbar: NotificationCenter, tema, Avatar… */
  topbarRight?: ReactNode;
  /** PageHeader opcional no topo da área de conteúdo. */
  pageHeader?: PageHeaderProps;
  /** Banner full-width acima do PageHeader (ex.: PlanBanner/TrialBanner). */
  banner?: ReactNode;
  /** Conteúdo da página. */
  children: ReactNode;
  /** Controle externo opcional do SidebarDrawer. */
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  /** Container do portal do SidebarDrawer (frame de device no showcase). */
  menuContainer?: HTMLElement | null;
  /** Produtos do rail global para a versão mobile do App Shell. */
  mobileGlobalItems?: readonly SidebarDrawerGlobalItem[];
  activeMobileGlobalId?: string;
  onMobileGlobalSelect?: (id: string) => void;
  /** Força o layout estreito (dentro de DeviceFrame). Default: responsivo. */
  forceMobile?: boolean;
  className?: string;
};

export function AppLayout({
  navItems,
  activeId,
  onNavSelect,
  sidebarFooter,
  sidebarHeader,
  sidebarWorkspace,
  sidebarPulse,
  mobileMenuFooter,
  logo,
  logoCollapsed,
  sidebarCollapsible = true,
  topbarLeft,
  topbarCenter,
  topbarRight,
  pageHeader,
  banner,
  children,
  mobileMenuOpen,
  onMobileMenuOpenChange,
  menuContainer,
  mobileGlobalItems,
  activeMobileGlobalId,
  onMobileGlobalSelect,
  forceMobile = false,
  className,
}: AppLayoutProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = mobileMenuOpen ?? internalOpen;
  const setOpen = onMobileMenuOpenChange ?? setInternalOpen;

  // Recolher/expandir a Sidebar (desktop) — preferência do usuário, persistida.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("dnex-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem("dnex-sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      /* localStorage indisponível — ignora. */
    }
  }, [collapsed]);

  // Barra de navegação inferior (mobile, estilo app nativo) — só os primeiros
  // itens cabem; o resto (e "Mais") abrem o SidebarDrawer.
  const MAX_TABS = 5;
  // A barra inferior (mobile) só mostra LINKS — headings de grupo não têm ícone
  // nem rota, então são filtrados antes de fatiar em abas.
  // Nomeia o tipo em vez de deduzi-lo pela PRESENÇA de `icon`: quando `icon` virou opcional (para
  // que item sem ícone mostre iniciais em vez de quadro vazio), `Extract<…, { icon: unknown }>`
  // passou a devolver `never` e tudo abaixo virou erro. Discriminar por propriedade que pode
  // sumir é frágil; o discriminante honesto aqui é `kind`.
  const linkItems = navItems.filter(
    (it): it is SidebarNavLink => !("kind" in it && it.kind === "heading"),
  );
  const tabItems = linkItems.length <= MAX_TABS ? linkItems : linkItems.slice(0, MAX_TABS - 1);
  const hasOverflow = linkItems.length > MAX_TABS;

  return (
    <div
      className={cn(
        "flex bg-[var(--bg)] text-fg",
        // App-shell de ALTURA FIXA: o root trava na altura do viewport e não
        // rola; quem rola é o <main> (overflow-y-auto). Com min-h (crescendo
        // com o conteúdo) o <main> virava um scroll-container que engolia o
        // wheel/touch sem rolar nada — só a barra do navegador funcionava.
        forceMobile ? "h-full" : "h-[100dvh] overflow-hidden",
        forceMobile && "relative",
        className,
      )}
    >
      {/* Sidebar fixa — escondida no estreito (e sempre escondida em forceMobile) */}
      {!forceMobile && (
        <div className="hidden md:flex">
          <Sidebar
            items={navItems}
            activeId={activeId}
            onSelect={onNavSelect}
            footer={sidebarFooter}
            headerAddon={sidebarHeader ?? sidebarWorkspace}
            pulse={sidebarPulse}
            logo={logo}
            logoCollapsed={logoCollapsed}
            collapsed={sidebarCollapsible && collapsed}
            onToggleCollapse={sidebarCollapsible ? () => setCollapsed((v) => !v) : undefined}
            className="sticky top-0 h-[100dvh]"
          />
        </div>
      )}

      {/* No V1, a navegação móvel preserva a sidebar índigo em um drawer lateral. */}
      <SidebarDrawer
        items={navItems}
        activeId={activeId}
        onSelect={onNavSelect}
        footer={mobileMenuFooter}
        headerAddon={sidebarHeader ?? sidebarWorkspace}
        pulse={sidebarPulse}
        open={open}
        onOpenChange={setOpen}
        container={forceMobile ? menuContainer : null}
        logo={logo && <span className="text-white">{logo}</span>}
        globalItems={mobileGlobalItems}
        activeGlobalId={activeMobileGlobalId}
        onGlobalSelect={onMobileGlobalSelect}
      />

      {/* coluna de conteúdo */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar
          left={
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Abrir menu"
                onClick={() => setOpen(true)}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-[10px] text-fg-muted transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                  forceMobile ? "grid" : "md:hidden",
                )}
              >
                <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
              {topbarLeft}
            </div>
          }
          center={topbarCenter}
          right={topbarRight}
        />

        <main
          aria-label="Conteúdo principal"
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            forceMobile
              ? "px-[var(--shell-content-padding-inline-mobile)] pt-5 pb-20"
              : "px-[var(--shell-content-padding-inline-mobile)] pt-5 pb-24 sm:px-6 md:pb-[var(--shell-content-padding-bottom)] lg:px-[var(--shell-content-padding-inline)] lg:pt-[var(--shell-content-padding-top)]",
          )}
        >
          <div className="mx-auto w-full max-w-[var(--shell-content-max-width)]">
            {banner && <div className="mb-5">{banner}</div>}
            {pageHeader && <PageHeader {...pageHeader} />}
            {children}
          </div>
        </main>
      </div>

      {/* Barra inferior (mobile, estilo app nativo) — some quando o SidebarDrawer abre. */}
      <nav
        aria-label="Navegação principal (barra inferior)"
        className={cn(
          "fixed inset-x-0 bottom-0 z-[var(--z-sticky)] flex items-stretch border-t border-line bg-[var(--surface)]/95 backdrop-blur-md transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          forceMobile ? "flex" : "flex md:hidden",
          open && "translate-y-full",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabItems.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavSelect(item.id)}
              data-bottom-nav-item={item.id}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[0.68rem] font-medium outline-none transition-colors focus-visible:bg-[var(--surface-hover)]"
            >
              <span className={cn("[&>svg]:h-5 [&>svg]:w-5", active ? "text-[var(--tone-action-fg)]" : "text-fg-subtle")}>
                {item.icon}
              </span>
              <span className={cn("block min-w-0 max-w-full truncate px-1", active ? "text-fg" : "text-fg-subtle")}>{item.label}</span>
            </button>
          );
        })}
        {hasOverflow && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-bottom-nav-item="more"
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[0.68rem] font-medium text-fg-subtle outline-none transition-colors focus-visible:bg-[var(--surface-hover)]"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            <span className="block min-w-0 max-w-full truncate px-1">Mais</span>
          </button>
        )}
      </nav>
    </div>
  );
}
