import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RPopover from "@radix-ui/react-popover";
import { cn } from "../../lib/cn";

/**
 * Popover — superfície flutuante acessível (Radix). Base do DatePicker e do
 * NotificationCenter. Foco, teclado, posicionamento (Popper) e dispensa por
 * Esc/clique-fora inclusos. A entrada/saída usa as animações .dnex-pop do
 * theme.css (respeitam reduced-motion).
 *
 * Diferença de uso vs. DropdownMenu: Popover hospeda conteúdo arbitrário
 * (calendário, lista, formulário); DropdownMenu é uma lista de ações com
 * navegação por setas e roles de menu.
 */
export const Popover = RPopover.Root;
export const PopoverTrigger = RPopover.Trigger;
export const PopoverAnchor = RPopover.Anchor;
export const PopoverClose = RPopover.Close;

export type PopoverContentProps = ComponentPropsWithoutRef<
  typeof RPopover.Content
> & {
  /** Nó-alvo do Portal — permite conter o painel num frame (ex.: device mobile). */
  container?: HTMLElement | null;
};

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    { className, sideOffset = 8, align = "start", container, ...props },
    ref,
  ) {
    return (
      <RPopover.Portal container={container ?? undefined}>
        <RPopover.Content
          ref={ref}
          sideOffset={sideOffset}
          align={align}
          collisionPadding={12}
          className={cn(
            "dnex-pop z-[var(--z-popover)] rounded-[var(--radius-card)] border border-line bg-[var(--surface-2)] p-1.5 shadow-[var(--shadow-lg)] glass-edge outline-none",
            className,
          )}
          {...props}
        />
      </RPopover.Portal>
    );
  },
);
