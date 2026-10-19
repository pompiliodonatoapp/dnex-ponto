import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

/**
 * Kbd — representação de tecla/atalho. Mono para precisão.
 */
export function Kbd({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-[6px] border border-line bg-[var(--surface)] px-1.5 font-mono text-[0.72rem] font-medium text-fg-muted shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
