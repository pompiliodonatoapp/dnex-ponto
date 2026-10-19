import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type StatsGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  label: string;
  className?: string;
};

/** Grade responsiva canônica para métricas operacionais. */
export function StatsGrid({ children, columns = 4, label, className }: StatsGridProps) {
  const grid = columns === 2
    ? "sm:grid-cols-2"
    : columns === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <section className={cn("grid gap-3", grid, className)} aria-label={label}>
      {children}
    </section>
  );
}
