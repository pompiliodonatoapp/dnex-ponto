import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Sheet / Drawer — painel deslizante genérico sobre o Radix Dialog.
 * Foco preso, ESC fecha, overlay com blur, ARIA de diálogo — tudo herdado do
 * Radix. Reutilizável para filtros, detalhes, formulários laterais.
 *
 * NÃO confundir com o MobileMenu do app-shell (Sidebar.tsx): aquele é a
 * navegação off-canvas do hub; este é um overlay de propósito geral.
 *
 * Composição:
 *   <Sheet>
 *     <SheetTrigger asChild><Button>Abrir</Button></SheetTrigger>
 *     <SheetContent side="right" size="md">
 *       <SheetHeader title="Filtros" description="..." />
 *       <SheetBody>…</SheetBody>
 *       <SheetFooter>…</SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 */
export const Sheet = RDialog.Root;
export const SheetTrigger = RDialog.Trigger;
export const SheetClose = RDialog.Close;

export type SheetSide = "left" | "right" | "top" | "bottom";
export type SheetSize = "sm" | "md" | "lg" | "full";

/** Posição de origem do painel → eixo + classes de animação (theme.css). */
const sidePos: Record<SheetSide, string> = {
  left: "inset-y-0 left-0 h-full border-r dnex-sheet-left",
  right: "inset-y-0 right-0 h-full border-l dnex-sheet-right",
  top: "inset-x-0 top-0 w-full border-b dnex-sheet-top",
  bottom: "inset-x-0 bottom-0 w-full border-t dnex-sheet-bottom",
};

/** Largura (left/right) ou altura (top/bottom) por tamanho. */
const sideSize: Record<SheetSide, Record<SheetSize, string>> = {
  left: {
    sm: "w-[min(20rem,90vw)]",
    md: "w-[min(26rem,92vw)]",
    lg: "w-[min(34rem,94vw)]",
    full: "w-screen",
  },
  right: {
    sm: "w-[min(20rem,90vw)]",
    md: "w-[min(26rem,92vw)]",
    lg: "w-[min(34rem,94vw)]",
    full: "w-screen",
  },
  top: {
    sm: "h-[min(16rem,50vh)]",
    md: "h-[min(22rem,60vh)]",
    lg: "h-[min(30rem,75vh)]",
    full: "h-screen",
  },
  bottom: {
    sm: "h-[min(16rem,50vh)]",
    md: "h-[min(22rem,60vh)]",
    lg: "h-[min(30rem,75vh)]",
    full: "h-screen",
  },
};

export type SheetContentProps = ComponentPropsWithoutRef<
  typeof RDialog.Content
> & {
  side?: SheetSide;
  size?: SheetSize;
  /** Esconde o botão "X" do canto (quando o header já provê o fechar). */
  hideClose?: boolean;
  /**
   * Cobre a tela inteira em telas estreitas (< sm), tipo app nativo — em vez do
   * painel lateral/drawer parcial. O tamanho (`size`) segue valendo a partir de sm.
   */
  fullOnMobile?: boolean;
  /** Nó-alvo do Portal — permite conter o painel num frame (ex.: device). */
  container?: HTMLElement | null;
  closeLabel?: string;
  children: ReactNode;
};

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  function SheetContent(
    {
      side = "right",
      size = "md",
      hideClose = false,
      fullOnMobile = false,
      container,
      closeLabel = "Fechar",
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <RDialog.Portal container={container ?? undefined}>
        <RDialog.Overlay className="dnex-overlay fixed inset-0 z-[var(--z-overlay)] bg-[rgba(5,4,18,0.6)] backdrop-blur-sm" />
        <RDialog.Content
          ref={ref}
          className={cn(
            "fixed z-[var(--z-modal)] flex flex-col border-line bg-[var(--surface-2)] shadow-[var(--shadow-lg)] outline-none",
            sidePos[side],
            sideSize[side][size],
            fullOnMobile && "max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-screen max-sm:border-none",
            className,
          )}
          {...props}
        >
          {!hideClose && (
            <RDialog.Close
              aria-label={closeLabel}
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-[8px] text-fg-subtle transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <X className="h-4 w-4" />
            </RDialog.Close>
          )}
          {children}
        </RDialog.Content>
      </RDialog.Portal>
    );
  },
);

/** Cabeçalho do Sheet — título (Radix Title) + descrição (Radix Description). */
export function SheetHeader({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header
      className={cn("shrink-0 border-b border-line px-6 py-5 pr-14", className)}
    >
      <RDialog.Title className="font-display text-lg font-semibold tracking-tight text-fg">
        {title}
      </RDialog.Title>
      {description && (
        <RDialog.Description className="mt-1 text-[0.9rem] leading-relaxed text-fg-muted">
          {description}
        </RDialog.Description>
      )}
      {children}
    </header>
  );
}

/** Corpo rolável do Sheet — ocupa o espaço livre, scroll vertical interno. */
export function SheetBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)}>
      {children}
    </div>
  );
}

/** Rodapé do Sheet — área de ações fixa ao fim do painel. */
export function SheetFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <footer
      className={cn(
        "shrink-0 border-t border-line px-6 py-4",
        "flex items-center justify-end gap-2",
        className,
      )}
    >
      {children}
    </footer>
  );
}
