import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "../lib/cn";
import { PageHeader } from "../components/shell/PageHeader";
import type { PageHeaderProps } from "../components/shell/PageHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/composed/DropdownMenu";

/**
 * SettingsLayout — sub-shell de configurações: navegação lateral de seções +
 * área de conteúdo. Pensado para viver DENTRO do AppLayout (a área de conteúdo
 * do app), nas telas de settings (D1–D8 do blueprint).
 *
 * No desktop, a nav de seções fica numa coluna fixa à esquerda (pill ativo
 * tinted, no mesmo idioma da Sidebar). No mobile, vira uma faixa horizontal
 * rolável acima do conteúdo. Tudo via tokens; foco/teclado/ARIA inclusos.
 */

export type SettingsNavItem = {
  id: string;
  label: string;
  /** Ícone opcional à esquerda. */
  icon?: ReactNode;
  /** Descrição curta opcional (aparece no desktop). */
  description?: string;
};

export type SettingsLayoutProps = {
  items: SettingsNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Cabeçalho da área de settings (opcional). */
  pageHeader?: PageHeaderProps;
  /** Conteúdo da seção ativa. */
  children: ReactNode;
  className?: string;
};

export function SettingsLayout({
  items,
  activeId,
  onSelect,
  pageHeader,
  children,
  className,
}: SettingsLayoutProps) {
  const nav = (
    <nav aria-label="Seções de configuração" className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(item.id)}
            className={cn(
              "group flex shrink-0 items-start gap-3 rounded-[9px] px-3 py-2.5 text-left text-[length:var(--text-small)] font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
              active
                ? "bg-[var(--action-tint)] text-fg"
                : "text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg",
              "[&>svg]:h-[18px] [&>svg]:w-[18px]",
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  "mt-0.5 shrink-0 transition-colors [&>svg]:h-[18px] [&>svg]:w-[18px]",
                  active ? "text-[var(--tone-action-fg)]" : "text-fg-subtle group-hover:text-fg",
                )}
              >
                {item.icon}
              </span>
            )}
            <span className="min-w-0">
              <span className="block">{item.label}</span>
              {item.description && (
                <span className="mt-0.5 hidden text-[0.75rem] font-normal leading-snug text-fg-subtle lg:block">
                  {item.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className={cn("w-full", className)}>
      {pageHeader && <PageHeader {...pageHeader} />}

      <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6">
        {/* desktop: coluna fixa */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-[var(--radius-card)] border border-line bg-[var(--surface-2)] p-3">{nav}</div>
        </aside>

        {/* mobile: a faixa horizontal de pills não escalava bem com muitas
            seções — vira um botão com dropdown (mesmo padrão do seletor de
            período no Dashboard). */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-line bg-[var(--surface)] px-3.5 py-2 text-[0.85rem] font-medium text-fg outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] hover:bg-[var(--surface-hover)] [&>svg]:h-4 [&>svg]:w-4",
                )}
              >
                <Menu aria-hidden="true" />
                {items.find((i) => i.id === activeId)?.label ?? "Seções"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {items.map((item) => {
                const active = item.id === activeId;
                return (
                  <DropdownMenuItem key={item.id} onSelect={() => onSelect(item.id)}>
                    {item.icon}
                    <span className={active ? "text-fg" : undefined}>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* conteúdo da seção */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
