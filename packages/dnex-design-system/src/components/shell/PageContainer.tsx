import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type PageContainerProps = HTMLAttributes<HTMLElement>;

/** Área canônica de uma página interna: largura máxima e ritmo vertical V1. */
export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[var(--shell-content-max-width)] space-y-[var(--shell-section-gap)]",
        className,
      )}
      {...props}
    />
  );
}
