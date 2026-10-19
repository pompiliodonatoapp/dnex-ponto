import { useId, type ReactNode } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Dialog / Modal — acessível sobre Radix Dialog. Foco preso, ESC fecha, overlay
 * sólido e véu sem desfoque. Compartilha a superfície do ConfirmDialog.
 */
export const Dialog = RDialog.Root;
export const DialogTrigger = RDialog.Trigger;
export const DialogClose = RDialog.Close;

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: ReactNode;
  className?: string;
  title: string;
  description?: string;
}) {
  const descriptionId = useId();
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="dnex-overlay dnex-dialog-backdrop fixed inset-0 z-[var(--z-overlay)]" />
      <RDialog.Content
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "dnex-pop dnex-dialog-panel fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 p-6",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <RDialog.Title className="dnex-dialog-title font-display">
              {title}
            </RDialog.Title>
            {description && (
              <RDialog.Description id={descriptionId} className="dnex-dialog-description">
                {description}
              </RDialog.Description>
            )}
          </div>
          <RDialog.Close
            aria-label="Fechar"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <X className="h-4 w-4" />
          </RDialog.Close>
        </div>
        <div className="mt-4">{children}</div>
      </RDialog.Content>
    </RDialog.Portal>
  );
}
