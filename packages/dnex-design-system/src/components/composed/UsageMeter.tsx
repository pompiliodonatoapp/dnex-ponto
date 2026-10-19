import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type UsageMeterProps = {
  /** Rótulo do recurso (ex.: "Notas fiscais"). */
  label: ReactNode;
  /** Consumo atual. */
  value: number;
  /** Limite do plano. Omita (ou null) para "ilimitado". */
  limit?: number | null;
  /** Sufixo da unidade (ex.: "GB", "NFs"). Opcional. */
  unit?: string;
  /** Limiar (0–1) a partir do qual entra no estado "próximo do limite". */
  warnAt?: number;
  className?: string;
  /** Formata os números (default: pt-BR com separador de milhar). */
  formatValue?: (n: number) => string;
};

const fmtBR = (n: number) => n.toLocaleString("pt-BR");

/**
 * UsageMeter — uso vs. limite de um recurso do plano. Barra (reusa a estética
 * do Progress) + números em IBM Plex Mono, com três estados de cor: normal
 * (índigo), próximo do limite (âmbar — acento usado só aqui, com propósito) e
 * estourado (vermelho). "Ilimitado" quando `limit` é null. Acessível via
 * role=meter + aria-valuenow/min/max.
 */
export function UsageMeter({
  label,
  value,
  limit,
  unit,
  warnAt = 0.8,
  className,
  formatValue = fmtBR,
}: UsageMeterProps) {
  const unlimited = limit == null;
  const ratio = unlimited ? 0 : limit === 0 ? 1 : value / limit;
  const pct = Math.min(100, Math.max(0, ratio * 100));

  const over = !unlimited && value > (limit as number);
  const near = !unlimited && !over && ratio >= warnAt;

  const barColor = over
    ? "bg-[var(--color-danger)]"
    : near
      ? "bg-gradient-to-r from-amber-500 to-amber-400"
      : "bg-gradient-to-r from-indigo-600 to-indigo-400";

  const valueColor = over
    ? "text-[#f87171]"
    : near
      ? "text-amber-400"
      : "text-fg";

  const suffix = unit ? ` ${unit}` : "";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.85rem] text-fg-muted">{label}</span>
        <span className="font-mono text-[0.85rem] tabular-nums">
          <span className={cn("font-semibold", valueColor)}>
            {formatValue(value)}
          </span>
          <span className="text-fg-subtle">
            {unlimited
              ? `${suffix} / ilimitado`
              : ` / ${formatValue(limit as number)}${suffix}`}
          </span>
        </span>
      </div>

      <div
        role="meter"
        aria-label={typeof label === "string" ? label : undefined}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={unlimited ? undefined : (limit as number)}
        className="relative h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--surface-hover)]"
      >
        {unlimited ? (
          // ilimitado: faixa decorativa sutil, sem preenchimento de "uso"
          <div className="h-full w-full bg-[linear-gradient(90deg,rgba(79,70,229,0.25),rgba(79,70,229,0.05))]" />
        ) : (
          <div
            className={cn(
              "h-full rounded-[var(--radius-pill)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              barColor,
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      {over && (
        <p className="text-[0.78rem] text-[#f87171]">
          Limite do plano excedido.
        </p>
      )}
      {near && (
        <p className="text-[0.78rem] text-amber-400">
          Você está perto do limite.
        </p>
      )}
    </div>
  );
}
