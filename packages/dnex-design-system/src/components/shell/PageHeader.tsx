import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type PageHeaderBadge = {
  label: string;
  icon?: ReactNode;
  /** Classe de cor do badge. Default: tom de ação (índigo) da marca. */
  className?: string;
};

export type PageHeaderProps = {
  title: string;
  /** Rótulo curto acima do título (ex.: "OPERAÇÃO DO HUB"). */
  eyebrow?: string;
  description?: string;
  /** Alias de `description` (mesmo papel; existe para apps que já chamavam essa prop de "subtitle"). Tem precedência sobre `description` quando ambos são passados. */
  subtitle?: ReactNode;
  /** Trilha opcional acima do título (ex.: <Breadcrumb>). Ignorado quando `leading`/`variant="bar"` são usados. */
  breadcrumb?: ReactNode;
  /** Ícone inline no h1. */
  icon?: ReactNode;
  /**
   * Elemento à esquerda do bloco título (ex.: uma caixa colorida com ícone).
   * Quando presente, o layout do bloco título usa `items-center gap-3`.
   */
  leading?: ReactNode;
  /** Badges ao lado da descrição/subtítulo (ex.: "3 vínculos", "2 sem KPI"). */
  badges?: PageHeaderBadge[];
  /** Ações à direita no desktop, abaixo do título em telas estreitas. Grupos próprios devem permitir quebra de linha. */
  actions?: ReactNode;
  /** Linha extra abaixo do título — filtros, busca, selects. */
  children?: ReactNode;
  /**
   * "plain" (padrão): cabeçalho simples, sem faixa própria — herda o espaçamento
   * da área de conteúdo em volta. "bar": barra full-bleed com superfície e borda
   * inferior (estilo dashboards com header fixo).
   */
  variant?: "plain" | "bar" | "standard" | "detail" | "welcome" | "immersive";
  /**
   * Alinhamento vertical da linha título×ações. "start" (padrão) topo-alinha —
   * bom para títulos com descrição/badges altos. "center" centraliza — uso
   * comum com `leading` + ações.
   */
  align?: "start" | "center";
  className?: string;
};

const BADGE_BASE =
  "inline-flex max-w-full items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border [overflow-wrap:anywhere]";
// bg-action-tint/border-action: tokens do DS reservados para chips/badges de
// destaque (ver theme.css — habilita bg-action-tint para chips e realces).
const BADGE_DEFAULT =
  "text-[var(--tone-action-fg)] bg-[var(--tone-action-bg)] border-[var(--tone-action-border)]";

/**
 * PageHeader — cabeçalho de página de conteúdo do hub. Título display,
 * descrição apagada, ações à direita. Respira no topo da área de conteúdo.
 * Suporta padrões mais ricos (ícone/leading/badges/variant/align) usados por
 * apps com cabeçalhos mais elaborados — tudo aditivo, sem afetar o uso simples
 * (title/description/breadcrumb/actions).
 */
export function PageHeader({
  title,
  eyebrow,
  description,
  subtitle,
  breadcrumb,
  icon,
  leading,
  badges,
  actions,
  children,
  variant = "plain",
  align = "start",
  className,
}: PageHeaderProps) {
  const desc = subtitle ?? description;
  const normalizedVariant = variant === "plain" ? "standard" : variant;
  const isBar = normalizedVariant === "bar";
  const resolvedEyebrow = eyebrow ?? "DNEX";

  const titleBlock = (
    <div className={cn("min-w-0 w-full sm:flex-1", !leading && "sm:basis-80", normalizedVariant === "immersive" && "text-center")}>
      {resolvedEyebrow && (
        <span className={cn(
          "mb-[7px] flex items-center gap-[var(--page-header-eyebrow-gap)] text-[length:var(--page-header-eyebrow-size)] font-extrabold uppercase tracking-[0.16em] text-[var(--tone-action-fg)]",
          normalizedVariant === "immersive" && "justify-center",
        )}>
          <span
            aria-hidden="true"
            className="block h-[var(--page-header-accent-height)] w-[var(--page-header-accent-width)] shrink-0 rounded-[var(--radius-pill)] bg-[var(--page-header-accent-color)]"
          />
          <span>{resolvedEyebrow}</span>
        </span>
      )}
      <h1
        className={cn(
          "font-display font-bold leading-[1.1] tracking-[-0.035em] text-fg",
          normalizedVariant === "detail"
            ? "text-[length:var(--page-header-title-size-detail)]"
            : normalizedVariant === "welcome"
              ? "text-[length:var(--page-header-title-size-welcome)]"
              : "text-[length:var(--page-header-title-size)]",
          "flex items-center gap-2",
          normalizedVariant === "immersive" && "justify-center",
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
      </h1>
      {(desc || badges?.length) && (
        <div className={cn(
          "mt-2 flex flex-wrap items-center gap-2",
          normalizedVariant === "immersive" && "justify-center",
        )}>
          {desc && (
            <p className="min-w-0 [overflow-wrap:anywhere] max-w-[var(--page-header-description-max-width)] text-[length:var(--page-header-description-size)] leading-relaxed text-fg-muted">
              {desc}
            </p>
          )}
          {badges?.map((b) => (
            <span key={b.label} className={cn(BADGE_BASE, b.className ?? BADGE_DEFAULT)}>
              {b.icon}
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        isBar
          ? "border-b border-line bg-[var(--surface)] px-4 py-4 sm:px-6"
          : "mb-[var(--page-header-margin-bottom)] flex flex-col gap-[var(--page-header-block-gap)]",
        normalizedVariant === "immersive" && "text-center",
        className,
      )}
    >
      {!isBar && breadcrumb}
      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:flex-wrap justify-between gap-3",
            align === "center" ? "items-center" : "items-start",
          )}
        >
          {leading ? (
            <div className="flex w-full min-w-0 sm:flex-1 sm:basis-96 items-center gap-3">
              {leading}
              {titleBlock}
            </div>
          ) : (
            titleBlock
          )}
          {actions && (
            <div className={cn(
              "flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 sm:w-auto [&>*]:min-w-0 [&>*]:max-w-full",
              "[&_:is(button,a)]:max-w-full [&_:is(button,a)]:whitespace-normal [&_:is(button,a)]:[overflow-wrap:anywhere] [&_:is(button,a)>span]:min-w-0 [&_:is(button,a)_svg]:shrink-0",
              // Preserva a altura mínima de cada tamanho do Button; multilinha pode crescer.
              // O tamanho icon (h-9) não é alterado.
              "[&_:is(button,a).h-10]:h-auto [&_:is(button,a).h-10]:min-h-10",
              "[&_:is(button,a).h-11]:h-auto [&_:is(button,a).h-11]:min-h-11",
              "[&_:is(button,a)[class~='h-[38px]']]:h-auto [&_:is(button,a)[class~='h-[38px]']]:min-h-[38px]",
            )}>{actions}</div>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}
