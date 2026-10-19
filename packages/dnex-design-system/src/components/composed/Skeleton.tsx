import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

/**
 * Skeleton — placeholder de carregamento com shimmer. Desenhado, nunca spinner
 * genérico. Use blocos com a forma do conteúdo real.
 */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-[8px] bg-[var(--skeleton-base)]",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--skeleton-shine)] to-transparent [animation:skeleton-shimmer_1.6s_infinite] motion-reduce:hidden" />
    </div>
  );
}

/** Skeleton pré-montado de uma linha de KPI/card — exemplo de composição. */
export function SkeletonStat() {
  return (
    <div className="rounded-[var(--radius-card)] glass glass-edge p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-4 h-3 w-20" />
    </div>
  );
}
