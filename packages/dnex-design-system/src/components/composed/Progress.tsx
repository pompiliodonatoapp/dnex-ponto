import * as RProgress from "@radix-ui/react-progress";
import { cn } from "../../lib/cn";

export type ProgressProps = {
  /** 0–100. Omita (ou null) para barra indeterminada. */
  value?: number | null;
  className?: string;
  tone?: "action" | "success" | "warning" | "danger";
  "aria-label"?: string;
};

/**
 * Progress — barra de progresso acessível (Radix). Determinada (value) ou
 * indeterminada (sem value). Preenchimento com gradiente índigo da marca.
 */
export function Progress({ value, className, tone = "action", ...aria }: ProgressProps) {
  const indeterminate = value == null;
  const indicator = {
    action: "bg-action",
    success: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    danger: "bg-[var(--color-danger)]",
  }[tone];
  return (
    <RProgress.Root
      value={indeterminate ? undefined : value}
      aria-label={aria["aria-label"]}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--surface-hover)]",
        className,
      )}
    >
      {indeterminate ? (
        <div className="h-full w-1/3 rounded-[var(--radius-pill)] bg-gradient-to-r from-indigo-500 to-indigo-400 [animation:progress-indeterminate_1.4s_ease-in-out_infinite] motion-reduce:w-1/2" />
      ) : (
        <RProgress.Indicator
          className={cn("h-full rounded-[var(--radius-pill)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", indicator)}
          style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
        />
      )}
    </RProgress.Root>
  );
}
