import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

/**
 * Toast — notificações empilhadas estilo sonner, sem dependência externa.
 * Provider expõe um hook `useToast().toast({...})`. Slide-in via CSS
 * (.dnex-toast), respeitando reduced-motion. aria-live para leitores de tela.
 */

type ToastTone = "default" | "success" | "warning" | "danger" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
};

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIcon: Record<ToastTone, ReactNode> = {
  default: <Info className="h-4.5 w-4.5 text-indigo-300" aria-hidden="true" />,
  info: <Info className="h-4.5 w-4.5 text-indigo-300" aria-hidden="true" />,
  success: (
    <CheckCircle2 className="h-4.5 w-4.5 text-[#4ade80]" aria-hidden="true" />
  ),
  warning: (
    <AlertTriangle className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
  ),
  danger: <XCircle className="h-4.5 w-4.5 text-[#f87171]" aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, tone = "default", duration = 4000 }: ToastInput) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, title, description, tone, duration }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            aria-live="polite"
            aria-atomic="false"
            className="pointer-events-none fixed bottom-4 right-4 z-[var(--z-toast)] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5"
          >
            {items.map((t) => (
              <div
                key={t.id}
                role="status"
                className="dnex-toast pointer-events-auto flex items-start gap-3 rounded-[var(--radius-card)] glass glass-edge p-3.5 shadow-[var(--shadow-lg)]"
              >
                <span className="mt-0.5 shrink-0">{toneIcon[t.tone]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[0.92rem] font-semibold text-fg">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-[0.85rem] leading-snug text-fg-muted">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Dispensar"
                  onClick={() => dismiss(t.id)}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-[6px] text-fg-subtle transition-colors hover:bg-[var(--surface-hover)] hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
  }
  return ctx;
}
