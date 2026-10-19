import * as RSeparator from "@radix-ui/react-separator";
import { cn } from "../../lib/cn";

export type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
  /** Rótulo opcional centralizado (apenas horizontal). */
  label?: string;
};

/**
 * Separator — divisória semântica (Radix). Suporta rótulo central.
 */
export function Separator({
  orientation = "horizontal",
  className,
  label,
}: SeparatorProps) {
  if (label && orientation === "horizontal") {
    return (
      <div className={cn("flex items-center gap-3", className)} role="separator">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-fg-subtle">
          {label}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }
  return (
    <RSeparator.Root
      orientation={orientation}
      decorative
      className={cn(
        "bg-line",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
