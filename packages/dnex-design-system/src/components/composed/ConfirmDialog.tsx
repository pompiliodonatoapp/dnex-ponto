import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "../primitives/Button";

export type ConfirmTone = "default" | "danger";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Identifica o registro sem sobrecarregar o título da confirmação. */
  subject?: string;
  subjectLabel?: string;
  /** Texto do botão de confirmação. */
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` pinta o ícone e o botão de confirmar em vermelho. */
  tone?: ConfirmTone;
  /** Spinner + bloqueio enquanto a ação assíncrona corre. */
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

/**
 * ConfirmDialog — diálogo de confirmação sobre o Radix Dialog (mesma base do
 * Dialog do DS). Variante `danger` para ações destrutivas, estado `loading` no
 * confirmar (desabilita ambos os botões e mostra spinner). Controlado.
 *
 * Para uso imperativo (sem montar JSX), envolva a árvore em <ConfirmProvider> e
 * chame `const confirm = useConfirm(); await confirm({ title, tone: "danger" })`.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  subject,
  subjectLabel = "Item selecionado",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = tone === "danger";
  const cancelRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const hasDescription = Boolean(description || subject);
  const descriptionId = useId();

  return (
    <RDialog.Root
      open={open}
      onOpenChange={(next) => {
        // Não fecha por Esc/overlay enquanto a ação assíncrona corre.
        if (loading && !next) return;
        if (!next) onCancel?.();
        onOpenChange(next);
      }}
    >
      <RDialog.Portal>
        <RDialog.Overlay className="dnex-overlay dnex-dialog-backdrop fixed inset-0 z-[var(--z-overlay)]" />
        <RDialog.Content
          role="alertdialog"
          aria-describedby={hasDescription ? descriptionId : undefined}
          aria-busy={loading || undefined}
          className="dnex-pop dnex-dialog-panel dnex-confirm fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-[30rem] -translate-x-1/2 -translate-y-1/2"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            cancelRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            if (returnFocusRef.current?.isConnected) {
              event.preventDefault();
              returnFocusRef.current.focus();
            }
          }}
          onEscapeKeyDown={(e) => loading && e.preventDefault()}
          onInteractOutside={(e) => loading && e.preventDefault()}
        >
          <div className="dnex-confirm-body">
            <div className="dnex-confirm-heading">
              {isDanger && (
                <span aria-hidden="true" className="dnex-confirm-icon">
                  <AlertTriangle className="h-5 w-5" />
                </span>
              )}
              <RDialog.Title className="dnex-dialog-title font-display">
                {title}
              </RDialog.Title>
            </div>
            {hasDescription && (
              <RDialog.Description id={descriptionId} asChild>
                <div className="dnex-confirm-description">
                  {subject && (
                    <div className="dnex-confirm-subject">
                      <span className="dnex-confirm-subject-label">{subjectLabel}</span>
                      <span className="dnex-confirm-subject-name">{subject}</span>
                    </div>
                  )}
                  {description && <div className="dnex-dialog-description">{description}</div>}
                </div>
              </RDialog.Description>
            )}
          </div>

          <div className="dnex-confirm-footer">
            <Button
              ref={cancelRef}
              type="button"
              variant="secondary"
              size="lg"
              className="h-auto min-h-11 whitespace-normal py-2.5"
              disabled={loading}
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={isDanger ? "danger" : "primary"}
              size="lg"
              className={isDanger
                ? "dnex-confirm-action h-auto min-h-11 whitespace-normal border-[var(--danger-action)] bg-[var(--danger-action)] py-2.5 text-[var(--danger-action-fg)] hover:border-[var(--danger-action-hover)] hover:bg-[var(--danger-action-hover)] hover:brightness-100"
                : "dnex-confirm-action h-auto min-h-11 whitespace-normal py-2.5"}
              data-tone={tone}
              loading={loading}
              onClick={() => onConfirm?.()}
            >
              {confirmLabel}
            </Button>
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   useConfirm — API imperativa (promise-based) opcional.
   ════════════════════════════════════════════════════════════════════════════ */

type ConfirmOptions = Omit<
  ConfirmDialogProps,
  "open" | "onOpenChange" | "loading" | "onConfirm" | "onCancel"
>;

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * ConfirmProvider — monta um único ConfirmDialog reutilizável e expõe a função
 * `confirm` via contexto. Resolve `true` (confirmou) ou `false` (cancelou).
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
  }>({ open: false, options: { title: "" } });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setState({ open: true, options });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        onOpenChange={(next) => {
          if (!next) settle(false);
        }}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
        {...state.options}
      />
    </ConfirmContext.Provider>
  );
}

/** Hook que devolve a função `confirm` imperativa. Requer <ConfirmProvider>. */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>.");
  }
  return ctx;
}
