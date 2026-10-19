import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";
import { FeatureList } from "./FeatureList";
import type { FeatureItem } from "./FeatureList";

export type BillingPeriod = "mensal" | "anual";

export type PricingCardProps = {
  /** Nome do plano (ex.: "Essencial"). */
  name: string;
  /** Descrição curta de posicionamento. */
  description?: string;
  /**
   * Preço formatado já como string (ex.: "R$ 0", "R$ 149"). Mantém o controle
   * de formatação com quem chama — o componente só apresenta em mono.
   */
  price: ReactNode;
  /** Sufixo do preço (ex.: "/mês", "/usuário/mês"). */
  pricePeriod?: string;
  /** Nota abaixo do preço (ex.: "cobrado anualmente"). */
  priceNote?: ReactNode;
  /** Período selecionado — só informativo aqui (o toggle vive na página). */
  period?: BillingPeriod;
  /** Features do plano. */
  features: FeatureItem[];
  /** Texto do botão de ação. */
  ctaLabel?: string;
  onCtaClick?: () => void;
  /** Destaque "recomendado" — borda/realce em âmbar (acento, com parcimônia). */
  highlighted?: boolean;
  /** Selo "Recomendado" no topo (default segue `highlighted`). */
  badgeLabel?: string;
  /** Marca como o plano atual do usuário — selo + CTA desabilitado. */
  current?: boolean;
  className?: string;
};

/**
 * PricingCard / PlanCard — cartão de plano pronto para Stripe: nome, preço em
 * IBM Plex Mono, descrição, FeatureList e CTA. Variante `highlighted`
 * (recomendado) usa o acento âmbar com avareza — só o plano em destaque o
 * recebe. `current` marca o plano vigente (selo + CTA inerte).
 *
 * Conteúdo de planos/preços é responsabilidade de quem chama — use rótulos de
 * exemplo na vitrine; nada real aqui.
 */
export function PricingCard({
  name,
  description,
  price,
  pricePeriod,
  priceNote,
  features,
  ctaLabel = "Assinar",
  onCtaClick,
  highlighted = false,
  badgeLabel,
  current = false,
  className,
}: PricingCardProps) {
  const label = badgeLabel ?? (highlighted ? "Recomendado" : undefined);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[var(--radius-card)] p-6",
        highlighted
          ? "bg-[var(--surface-2)] ring-2 ring-[var(--accent)]"
          : "bg-[var(--surface)]",
        className,
      )}
    >
      {/* selo de destaque (âmbar) — canto superior */}
      {label && (
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--accent)] px-3 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#1a1203] shadow-[0_4px_14px_-2px_rgba(245,158,11,0.5)]">
          {label}
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-[1.15rem] font-semibold tracking-tight text-fg">
          {name}
        </h3>
        {current && (
          <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-[rgba(129,139,246,0.3)] bg-[rgba(79,70,229,0.14)] px-2.5 py-0.5 text-[0.7rem] font-medium text-indigo-300">
            Plano atual
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1.5 text-[0.88rem] leading-relaxed text-fg-muted">
          {description}
        </p>
      )}

      {/* preço — número em mono (assinatura da marca) */}
      <div className="mt-5 flex items-end gap-1.5">
        <span className="font-mono text-[length:var(--text-kpi)] font-semibold leading-none tracking-tight text-fg">
          {price}
        </span>
        {pricePeriod && (
          <span className="pb-1 text-[0.85rem] text-fg-subtle">
            {pricePeriod}
          </span>
        )}
      </div>
      {priceNote && (
        <p className="mt-1.5 text-[0.78rem] text-fg-subtle">{priceNote}</p>
      )}

      <div className="mt-6">
        <Button
          variant={highlighted ? "primary" : "secondary"}
          className="w-full"
          disabled={current}
          onClick={onCtaClick}
        >
          {current ? "Plano atual" : ctaLabel}
        </Button>
      </div>

      <div className="my-6 h-px bg-line" />

      <FeatureList items={features} className="flex-1" />
    </div>
  );
}
