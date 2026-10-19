import type { ReactNode } from "react";
import * as RTooltip from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

/** Provider — envolva a app uma vez para habilitar tooltips. */
export const TooltipProvider = RTooltip.Provider;

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

/**
 * Tooltip — dica contextual acessível (Radix). Requer <TooltipProvider> acima.
 */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(
            "dnex-pop z-[var(--z-tooltip)] max-w-xs rounded-[8px] border border-line bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.8rem] text-fg shadow-[var(--shadow-lg)]",
            className,
          )}
        >
          {content}
          <RTooltip.Arrow className="fill-[var(--surface-2)]" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
