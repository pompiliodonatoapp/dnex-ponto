import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RHoverCard from "@radix-ui/react-hover-card";
import { cn } from "../../lib/cn";

/**
 * HoverCard — preview flutuante ao passar o mouse (ou focar) num gatilho:
 * cartão de usuário, empresa, termo etc. Sobre @radix-ui/react-hover-card
 * (peer compatível com React 19). Acessível: abre também no foco por teclado,
 * fecha no blur/Esc; o conteúdo é não-interativo por design (preview).
 *
 * Para conteúdo clicável/acionável use Popover; HoverCard é só leitura.
 *
 * Uso:
 *   <HoverCard>
 *     <HoverCardTrigger asChild><a href="…">@donato</a></HoverCardTrigger>
 *     <HoverCardContent>…preview…</HoverCardContent>
 *   </HoverCard>
 */
export const HoverCard = RHoverCard.Root;
export const HoverCardTrigger = RHoverCard.Trigger;

export type HoverCardContentProps = ComponentPropsWithoutRef<
  typeof RHoverCard.Content
> & {
  /** Nó-alvo do Portal — permite conter o painel num frame (ex.: device). */
  container?: HTMLElement | null;
};

export const HoverCardContent = forwardRef<
  HTMLDivElement,
  HoverCardContentProps
>(function HoverCardContent(
  { className, sideOffset = 8, align = "center", container, ...props },
  ref,
) {
  return (
    <RHoverCard.Portal container={container ?? undefined}>
      <RHoverCard.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(
          "dnex-pop z-[var(--z-popover)] w-72 rounded-[var(--radius-card)] border border-line bg-[var(--surface-2)] p-4 shadow-[var(--shadow-lg)] glass-edge outline-none",
          className,
        )}
        {...props}
      >
        {props.children}
        <RHoverCard.Arrow className="fill-[var(--surface-2)]" />
      </RHoverCard.Content>
    </RHoverCard.Portal>
  );
});
