import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Card, CardBody } from "./Card";

export type StatCardProps = {
  /** Rótulo apagado (uppercase pequeno no variant "kpi"; texto normal no "horizontal"). */
  label: string;
  /** Valor — número grande. Mono + assinatura fiscal no variant "kpi". */
  value: ReactNode;
  /** Variação percentual; sinal define cor (verde/vermelho). Só no variant "kpi". */
  delta?: number;
  /** Texto auxiliar do delta (ex.: "vs. mês anterior"). Só no variant "kpi". */
  deltaLabel?: string;
  /** Linha secundária opcional ao lado do valor. Só no variant "horizontal" (token `--text-label`, 12px, `fg-muted` AA). */
  description?: string;
  /** Ícone. Posição depende do variant ("kpi": direita, pequeno; "horizontal": caixa à esquerda). */
  icon?: ReactNode;
  /** Classe da caixa do ícone no variant "horizontal". Default: tint de ação. */
  iconWrapClassName?: string;
  /** Override do estilo do valor no variant "horizontal". */
  valueClassName?: string;
  /** Conteúdo extra à direita no variant "horizontal" (ex.: sparkline). */
  trailing?: ReactNode;
  /** Tom semântico da caixa de ícone e do valor auxiliar. */
  tone?: "action" | "success" | "warning" | "danger";
  /**
   * "kpi" (padrão): número grande em mono + label apagada + delta colorido —
   * a assinatura fiscal da marca (todo valor de dinheiro/imposto).
   * "horizontal": ícone numa caixa à esquerda + valor/label/descrição
   * empilhados — layout compacto para grades densas de métricas.
   */
  variant?: "kpi" | "horizontal";
  className?: string;
};

/** StatCard / KPI — ver variantes em `StatCardProps`. */
export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  description,
  icon,
  iconWrapClassName,
  valueClassName,
  trailing,
  tone = "action",
  variant = "kpi",
  className,
}: StatCardProps) {
  const toneClass = {
    action: "bg-[var(--tone-action-bg)] text-[var(--tone-action-fg)]",
    success: "bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)]",
    warning: "bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)]",
    danger: "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]",
  }[tone];

  if (variant === "horizontal") {
    return (
      <Card variant="solid" className={className}>
        <CardBody className="flex items-start gap-[13px]">
            {icon && (
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] [&>svg]:h-[18px] [&>svg]:w-[18px]",
                  iconWrapClassName ?? toneClass,
                )}
              >
                {icon}
              </div>
            )}
            <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1">
              <p className="col-span-2 text-[length:var(--text-label)] leading-snug text-fg-muted">{label}</p>
              <strong
                className={cn(
                  "font-mono text-2xl font-bold leading-none tracking-[-0.05em] text-fg",
                  valueClassName,
                )}
              >
                {value}
              </strong>
              {description && (
                <span className="text-right text-[length:var(--text-label)] leading-snug text-fg-muted">{description}</span>
              )}
              {trailing && <div className="col-span-2 mt-1">{trailing}</div>}
            </div>
        </CardBody>
      </Card>
    );
  }

  const positive = (delta ?? 0) >= 0;
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-fg-subtle">
          {label}
        </p>
        {icon && (
          <span className={cn("grid h-9 w-9 place-items-center rounded-[10px] [&>svg]:h-4.5 [&>svg]:w-4.5", toneClass)}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-mono text-[length:var(--text-kpi)] font-semibold leading-none tracking-tight text-fg">
        {value}
      </p>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-[0.8rem]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-[var(--radius-pill)] px-1.5 py-0.5 font-mono font-medium",
              positive
                ? "bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)]"
                : "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {positive ? "+" : ""}
            {delta}%
          </span>
          {deltaLabel && <span className="text-fg-subtle">{deltaLabel}</span>}
        </div>
      )}
    </Card>
  );
}
