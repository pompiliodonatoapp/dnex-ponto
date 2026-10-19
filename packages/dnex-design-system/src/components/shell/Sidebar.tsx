import { useId, type ReactNode } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { X, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../../lib/cn";
import { iniciais } from "../../lib/iniciais";
import { Logo } from "../brand/Logo";
import {
  getGlobalRailAvailability,
  getGlobalRailAvailabilityLabel,
  getGlobalRailDescription,
  isGlobalRailActionable,
  type GlobalRailAvailabilityItem,
} from "./globalRailAvailability";

export type SidebarNavLink = {
  id: string;
  label: string;
  /**
   * Opcional. Sem ícone, o item mostra as INICIAIS do rótulo — nunca um quadro vazio.
   * Medido em 26/08/2026 na primeira renderização do shell: no modo recolhido só o ícone aparece,
   * e como a navegação montada a partir do manifesto não traz ícone por módulo, o menu recolhido
   * ficava EM BRANCO — itens invisíveis e inclicáveis. Só a captura de tela revelou; nenhum
   * typecheck e nenhum teste de leitura pegariam.
   */
  icon?: ReactNode;
  /** Contador opcional (ex.: pendências). */
  badge?: string | number;
};

/** Cabeçalho de seção — agrupa itens de navegação (ex.: "Crescimento"). Não é
 *  clicável; some no modo recolhido (vira só um respiro). */
export type SidebarNavHeading = {
  kind: "heading";
  id: string;
  label: string;
};

export type SidebarNavItem = SidebarNavLink | SidebarNavHeading;

/**
 * Iniciais de reserva para item sem ícone. Implementação em `src/lib/iniciais.ts` (sem JSX,
 * segura sob `noUncheckedIndexedAccess`); re-exportada aqui para manter a API pública.
 */
export { iniciais };

function isHeading(item: SidebarNavItem): item is SidebarNavHeading {
  return "kind" in item && item.kind === "heading";
}

export type SidebarProps = {
  items: SidebarNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Rodapé opcional (ex.: usuário, ajuda). Oculto no modo recolhido. */
  footer?: ReactNode;
  /**
   * Slot sob a marca — é POR AQUI que a produção passa o seletor de contexto: o `AppLayout`
   * repassa `sidebarHeader` para cá. Ver o teste `slots-prometidos`.
   */
  headerAddon?: ReactNode;
  /**
   * Slot acima da navegação — o seletor de contexto do produto (ex.: cliente/empresa ativa).
   * NÃO é decorativo: a produção do DNEX Fiscal o usa para trocar de cliente. Ficou marcado como
   * `@deprecated` e sem renderização entre 23/08 e 25/08/2026, mantendo a prop no tipo: quem
   * passava compilava sem erro e o seletor sumia da tela, em silêncio. Se um dia sair de novo,
   * REMOVA a prop do tipo junto — quebrar o build é o comportamento correto.
   */
  workspace?: ReactNode;
  /** Cartão de estado no rodapé. O `AppLayout` repassa `sidebarPulse` para cá. */
  pulse?: ReactNode;
  /**
   * @deprecated Superfície única no V1.1 — a prop é ACEITA e IGNORADA de propósito, para não
   * quebrar quem ainda a passa. É a única exceção consciente ao teste `slots-prometidos`.
   */
  variant?: "default" | "brand";
  /** Modo recolhido: só ícones + tooltip (largura estreita). */
  collapsed?: boolean;
  /** Alterna recolher/expandir — exibe o botão de toggle quando definido. */
  onToggleCollapse?: () => void;
  /** Exibe o botão "Sair" no rodapé quando definido. */
  onLogout?: () => void;
  /** Marca customizada (ex.: <DnexProductLogo product="Contratos" />). Default: <Logo> genérico. */
  logo?: ReactNode;
  /**
   * Marca do modo recolhido (só o símbolo — o lockup completo não cabe em 4.5rem
   * e cortaria). Default: símbolo do <Logo> genérico do DNEX.
   */
  logoCollapsed?: ReactNode;
  className?: string;
};

/**
 * Lista de navegação compartilhada entre a Sidebar (desktop) e o
 * SidebarDrawer (mobile). Mantém um único contrato visual: pill ativo tinted,
 * itens que respiram, badge âmbar com parcimônia.
 */
function SidebarNav({
  items,
  activeId,
  onSelect,
  collapsed = false,
}: Pick<SidebarProps, "items" | "activeId" | "onSelect"> & {
  collapsed?: boolean;
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className="mt-2 flex flex-col gap-0.5"
    >
      {items.map((item) => {
        if (isHeading(item)) {
          // Cabeçalho de seção — no modo recolhido vira só um separador fino.
          return collapsed ? (
            <div
              key={item.id}
              className="mx-2 my-2 border-t border-white/10"
              aria-hidden
            />
          ) : (
            <p
              key={item.id}
              className="mt-4 mb-1 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#9da1cf] first:mt-1"
            >
              {item.label}
            </p>
          );
        }
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            onClick={() => onSelect(item.id)}
            className={cn(
              "group flex items-center rounded-[10px] text-[length:var(--text-small)] font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
              collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2.5",
              active
                ? "bg-[linear-gradient(90deg,rgba(99,102,241,0.34),rgba(99,102,241,0.16))] text-white"
                : "text-[#c8cae5] hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <span
              className={cn(
                "shrink-0 transition-colors [&>svg]:h-[18px] [&>svg]:w-[18px]",
                active ? "text-white" : "text-[#9da1cf] group-hover:text-white",
              )}
            >
              {item.icon ?? (
                <span
                  aria-hidden
                  className="grid h-[18px] w-[18px] place-items-center text-[10px] font-bold uppercase tracking-tight"
                >
                  {iniciais(item.label)}
                </span>
              )}
            </span>
            {!collapsed && (
              <span className="flex-1 text-left">{item.label}</span>
            )}
            {!collapsed && item.badge != null && (
              <span className="rounded-[var(--radius-pill)] bg-[rgba(245,158,11,0.16)] px-1.5 py-0.5 font-mono text-[0.68rem] font-medium text-amber-400">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Sidebar — navegação lateral do hub (desktop). Pill ativo tinted (índigo),
 * itens que respiram, logo no topo. Marca em pé via <Logo>.
 *
 * No mobile, prefira <SidebarDrawer> (off-canvas acessível): a Sidebar fixa é
 * escondida com `hidden md:block` no app shell.
 */
export function Sidebar({
  items,
  activeId,
  onSelect,
  footer,
  headerAddon,
  workspace,
  pulse,
  collapsed = false,
  onToggleCollapse,
  onLogout,
  logo,
  logoCollapsed,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "dnex-brand-sidebar relative isolate flex h-full shrink-0 flex-col gap-1 overflow-hidden border-r border-white/[0.08] bg-[image:var(--shell-sidebar-bg)] px-[var(--shell-sidebar-padding-inline)] pt-[var(--shell-sidebar-padding-block)] pb-3.5 text-white transition-[width] duration-200 ease-[var(--ease-out-soft)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[image:var(--shell-sidebar-atmosphere)]",
        collapsed
          ? "w-[var(--shell-sidebar-collapsed-width)]"
          : "w-[var(--shell-sidebar-width)]",
        className,
      )}
    >
      {/* topo: marca + botão recolher/expandir */}
      <div
        className={cn(
          "py-3",
          collapsed
            ? "flex flex-col items-center gap-2"
            : "flex items-center justify-between px-2 pb-2",
        )}
      >
        {collapsed
          ? (logoCollapsed ?? <Logo height={26} symbolOnly tone="inverse" />)
          : (logo ?? <Logo height={26} tone="inverse" />)}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-pressed={collapsed}
            title={collapsed ? "Expandir" : "Recolher"}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-[#9da1cf] outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>

      {(headerAddon ?? workspace) && !collapsed && (
        <div className="px-0.5">{headerAddon ?? workspace}</div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SidebarNav
          items={items}
          activeId={activeId}
          onSelect={onSelect}
          collapsed={collapsed}
        />
      </div>

      {(footer || pulse || onLogout) && (
        <div className="shrink-0 flex flex-col gap-1 pt-3">
          {pulse && !collapsed && <div className="pb-2">{pulse}</div>}
          {footer && !collapsed && <div>{footer}</div>}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title={collapsed ? "Sair" : undefined}
              className={cn(
                "group flex items-center rounded-[10px] text-[length:var(--text-small)] font-medium text-[#c8cae5] outline-none transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-300",
                collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2.5",
              )}
            >
              <LogOut
                className="h-[18px] w-[18px] shrink-0 text-[#9da1cf] transition-colors group-hover:text-white"
                aria-hidden="true"
              />
              {!collapsed && <span>Sair</span>}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

export type SidebarDrawerProps = SidebarProps & {
  /** Aberto/fechado (controlado). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Gatilho opcional (ex.: botão de menu da Topbar). Use asChild no elemento.
   * Se omitido, controle abertura via `open`/`onOpenChange`.
   */
  trigger?: ReactNode;
  /**
   * Onde o drawer é portado. No frame de demonstração mobile, passe o nó do
   * frame para o overlay/drawer ficarem CONTIDOS no device (e não em tela cheia).
   * Em app real, omita (portal no <body>).
   */
  container?: HTMLElement | null;
  /**
   * Navegação global opcional, exibida antes da navegação contextual no
   * mobile. Representa o rail de produtos quando os dois níveis do App Shell
   * se tornam um único drawer na tela estreita.
   */
  globalItems?: readonly SidebarDrawerGlobalItem[];
  activeGlobalId?: string;
  onGlobalSelect?: (id: string) => void;
};

export type SidebarDrawerGlobalItem = GlobalRailAvailabilityItem & {
  id: string;
  icon: ReactNode;
  badge?: string | number;
};

/**
 * SidebarDrawer — navegação em tela cheia para mobile. Construído sobre Radix
 * Dialog: foco preso, ESC fecha, `aria-modal` e rótulo — tudo acessível. Ao
 * escolher um item, fecha o menu. O nome é mantido por compatibilidade de API.
 */
export function SidebarDrawer({
  headerAddon,
  workspace,
  pulse,
  items,
  activeId,
  onSelect,
  footer,
  open,
  onOpenChange,
  trigger,
  container,
  logo,
  globalItems,
  activeGlobalId,
  onGlobalSelect,
  className,
}: SidebarDrawerProps) {
  const globalDescriptionScope = useId();

  function handleSelect(id: string) {
    onSelect(id);
    onOpenChange(false); // fecha ao navegar — comportamento esperado no mobile
  }

  function handleGlobalSelect(id: string) {
    onGlobalSelect?.(id);
    onOpenChange(false);
  }

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger}
      <RDialog.Portal container={container ?? undefined}>
        <RDialog.Overlay
          className={cn(
            "dnex-overlay z-[var(--z-overlay)] bg-[rgba(5,4,18,0.6)] backdrop-blur-sm",
            // contido no container quando portado no frame; senão tela cheia
            container ? "absolute inset-0" : "fixed inset-0",
          )}
        />
        <RDialog.Content
          className={cn(
            "dnex-drawer dnex-brand-sidebar z-[var(--z-modal)] flex flex-col gap-1 overflow-hidden bg-[linear-gradient(180deg,#201d58_0%,#17143f_58%,#100e2d_100%)] px-3.5 pt-5 pb-3.5 text-white shadow-[var(--shadow-lg)]",
            container
              ? "absolute inset-0"
              : "fixed inset-0 h-[100dvh] w-screen",
            className,
          )}
        >
          {/* Título/descrição exigidos pelo Radix Dialog p/ leitores de tela —
              ocultos visualmente (sr-only), presentes na árvore de acessibilidade. */}
          <RDialog.Title className="sr-only">Menu de navegação</RDialog.Title>
          <RDialog.Description className="sr-only">
            Navegação principal do hub DNEX.
          </RDialog.Description>

          <div className="flex items-center justify-between px-2 pb-4">
            {logo ?? <Logo height={26} tone="inverse" />}
            <RDialog.Close
              aria-label="Fechar menu"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-[#c8cae5] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              <X className="h-4 w-4" />
            </RDialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {globalItems && globalItems.length > 0 && (
              <section
                aria-label="Aplicativos DNEX"
                className="border-b border-white/10 pb-4"
              >
                <p className="px-3 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#9da1cf]">
                  Aplicativos
                </p>
                <div className="grid grid-cols-4 gap-1.5 px-1">
                  {globalItems.map((item) => {
                    const availability = getGlobalRailAvailability(item);
                    const actionable = isGlobalRailActionable(item);
                    const active = item.id === activeGlobalId && actionable;
                    const availabilityLabel =
                      getGlobalRailAvailabilityLabel(item);
                    const descriptionId = `${globalDescriptionScope}-${item.id}`;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={
                          actionable
                            ? item.label
                            : `${availabilityLabel}: ${getGlobalRailDescription(item)}`
                        }
                        aria-label={
                          actionable
                            ? `Abrir DNEX ${item.label}`
                            : `DNEX ${item.label} — ${availabilityLabel}`
                        }
                        aria-describedby={
                          actionable ? undefined : descriptionId
                        }
                        aria-disabled={actionable ? undefined : true}
                        aria-current={active ? "page" : undefined}
                        data-availability={availability}
                        onClick={
                          actionable
                            ? () => handleGlobalSelect(item.id)
                            : undefined
                        }
                        className={cn(
                          "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-[0.62rem] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
                          active && actionable
                            ? "bg-[linear-gradient(180deg,rgba(99,102,241,0.38),rgba(99,102,241,0.18))] text-white"
                            : actionable
                              ? "text-[#c8cae5] hover:bg-white/[0.07] hover:text-white"
                              : "cursor-not-allowed text-[#c8cae5] opacity-45 saturate-50",
                        )}
                      >
                        <span className="grid h-7 w-7 place-items-center [&>img]:h-7 [&>img]:w-7">
                          {item.icon}
                        </span>
                        <span className="max-w-full truncate">
                          {item.label}
                        </span>
                        {item.badge != null && (
                          <span className="absolute right-1 top-1 rounded-[var(--radius-pill)] bg-amber-400 px-1 font-mono text-[0.56rem] font-semibold leading-4 text-[var(--color-deep)]">
                            {item.badge}
                          </span>
                        )}
                        {!actionable && (
                          <span id={descriptionId} className="sr-only">
                            {getGlobalRailDescription(item)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
            {globalItems && globalItems.length > 0 && (
              <p className="mt-4 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#9da1cf]">
                No módulo atual
              </p>
            )}
            {/*
            O tipo aceitava `headerAddon`/`workspace`/`pulse` e o componente os DESCARTAVA — o
            consumidor passava, compilava sem erro e nada aparecia. Medido em 27/08: no celular a
            gaveta não mostrava o seletor de empresa, num produto cujo escopo inteiro é o tenant.
            É a MESMA falha do slot que já sumiu uma vez; prop no tipo é promessa.
          */}
            {(headerAddon ?? workspace) && (
              <div className="px-0.5 pb-2">{headerAddon ?? workspace}</div>
            )}

            <SidebarNav
              items={items}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </div>

          {(pulse || footer) && (
            <div className="mt-auto space-y-2 pt-3">
              {pulse}
              {footer}
            </div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export const SidebarDrawerTrigger = RDialog.Trigger;

export type MobileMenuProps = SidebarProps & {
  /** Aberto/fechado (controlado). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Gatilho opcional (use asChild). Se omitido, controle via open/onOpenChange. */
  trigger?: ReactNode;
  /**
   * Onde o painel é portado. No frame de demonstração mobile, passe o nó do
   * frame para o overlay full-screen ficar CONTIDO no device. Em app real, omita
   * (portal no <body>, cobrindo 100vw×100vh).
   */
  container?: HTMLElement | null;
};

/**
 * MobileMenu — navegação mobile em OVERLAY FULL-SCREEN (estilo "fullscreen menu").
 * Cobre a tela inteira com fundo índigo profundo, itens em fonte grande
 * centralizados vertical e horizontalmente. Construído sobre Radix Dialog: foco
 * preso, ESC fecha, `aria-modal`, rótulos para leitor de tela — de graça.
 *
 * Acessibilidade/UX:
 *  - botão de fechar (X) no topo direito;
 *  - fecha ao escolher um item (handleSelect);
 *  - fecha no ESC e ao clicar no overlay (Radix);
 *  - entrada com fade + leve scale do painel e stagger dos itens (CSS), tudo
 *    zerado em prefers-reduced-motion pelo bloco global de theme.css.
 *
 * Portabilidade no showcase: quando `container` é o frame de device, o painel é
 * `absolute inset-0` (cobre o frame). Em app real (container omitido) é
 * `fixed inset-0` cobrindo a viewport inteira.
 */
export function MobileMenu({
  items,
  activeId,
  onSelect,
  footer,
  open,
  onOpenChange,
  trigger,
  container,
  logo,
  className,
}: MobileMenuProps) {
  function handleSelect(id: string) {
    onSelect(id);
    onOpenChange(false); // fecha ao navegar — comportamento esperado no mobile
  }

  const contained = container != null;

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger}
      <RDialog.Portal container={container ?? undefined}>
        {/* Overlay = o próprio fundo índigo profundo que cobre tudo. O painel de
            conteúdo é transparente por cima dele. */}
        <RDialog.Overlay
          className={cn(
            "dnex-overlay z-[var(--z-overlay)] bg-[color-mix(in_srgb,var(--color-indigo-950)_95%,transparent)] backdrop-blur-md",
            contained ? "absolute inset-0" : "fixed inset-0",
          )}
        />
        <RDialog.Content
          aria-label="Menu de navegação"
          className={cn(
            "dnex-fsmenu z-[var(--z-modal)] flex flex-col outline-none",
            // cobre 100% — frame (absolute) ou viewport inteira (fixed: 100vw×100vh)
            contained
              ? "absolute inset-0"
              : "fixed inset-0 h-[100dvh] w-screen",
            className,
          )}
        >
          {/* Título/descrição exigidos pelo Radix p/ leitores de tela. */}
          <RDialog.Title className="sr-only">Menu de navegação</RDialog.Title>
          <RDialog.Description className="sr-only">
            Navegação principal do hub DNEX — escolha uma seção.
          </RDialog.Description>

          {/* Topo: marca + botão de fechar */}
          <div className="flex items-center justify-between p-5">
            {logo ?? <Logo height={26} tone="inverse" />}
            <RDialog.Close
              aria-label="Fechar menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] text-[var(--color-indigo-200)] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <X className="h-5 w-5" />
            </RDialog.Close>
          </div>

          {/* Miolo: itens grandes, centralizados vertical e horizontalmente */}
          <nav
            aria-label="Navegação principal"
            className="flex flex-1 flex-col items-center justify-center gap-1 px-6"
          >
            {items
              .filter((it): it is SidebarNavLink => !isHeading(it))
              .map((item, i) => {
                const active = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleSelect(item.id)}
                    style={{ animationDelay: `${60 + i * 55}ms` }}
                    className={cn(
                      "dnex-fsmenu-item group inline-flex items-center gap-3.5 rounded-[var(--radius-pill)] px-6 py-3 font-display text-[clamp(1.6rem,1.1rem+3vw,2.4rem)] font-semibold tracking-tight outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
                      active
                        ? "text-white"
                        : "text-[var(--color-indigo-200)] hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 transition-colors [&>svg]:h-[1.1em] [&>svg]:w-[1.1em]",
                        active
                          ? "text-accent"
                          : "text-[var(--color-indigo-400)] group-hover:text-[var(--color-indigo-300)]",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge != null && (
                      <span className="rounded-[var(--radius-pill)] bg-[rgba(245,158,11,0.18)] px-2 py-0.5 font-mono text-[0.5em] font-medium text-amber-400">
                        {item.badge}
                      </span>
                    )}
                    {/* sublinhado âmbar do item ativo (acento com avareza) */}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="ml-1 h-1.5 w-1.5 rounded-full bg-accent"
                      />
                    )}
                  </button>
                );
              })}
          </nav>

          {footer && <div className="p-5">{footer}</div>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export const MobileMenuTrigger = RDialog.Trigger;
