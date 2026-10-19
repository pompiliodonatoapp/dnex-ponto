import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

export type AlertProps = {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
  /** Ação opcional à direita (ex.: botão). */
  action?: ReactNode;
};

const config: Record<
  AlertTone,
  { ring: string; icon: ReactNode; text: string }
> = {
  info: {
    ring: "border-[var(--tone-action-border)] bg-[var(--tone-action-bg)]",
    icon: <Info className="h-4.5 w-4.5 text-[var(--tone-action-fg)]" aria-hidden="true" />,
    text: "text-[var(--tone-action-fg)]",
  },
  success: {
    ring: "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)]",
    icon: (
      <CheckCircle2 className="h-4.5 w-4.5 text-[var(--tone-success-fg)]" aria-hidden="true" />
    ),
    text: "text-[var(--tone-success-fg)]",
  },
  warning: {
    ring: "border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)]",
    icon: (
      <AlertTriangle className="h-4.5 w-4.5 text-[var(--tone-warning-fg)]" aria-hidden="true" />
    ),
    text: "text-[var(--tone-warning-fg)]",
  },
  danger: {
    ring: "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)]",
    icon: <XCircle className="h-4.5 w-4.5 text-[var(--tone-danger-fg)]" aria-hidden="true" />,
    text: "text-[var(--tone-danger-fg)]",
  },
};

/**
 * Alert / Banner — mensagem contextual inline. Tom define cor e ícone.
 * Voz de parceiro nas mensagens (Manual §5): "Esse erro é nosso, não seu."
 */
export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: AlertProps) {
  const c = config[tone];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-card)] border p-4",
        c.ring,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{c.icon}</span>
      <div className="min-w-0 flex-1">
        {title && (
          <p className={cn("font-display text-[0.95rem] font-semibold", c.text)}>
            {title}
          </p>
        )}
        {children && (
          <div
            className={cn(
              "text-[0.88rem] leading-relaxed text-fg-muted",
              title && "mt-0.5",
            )}
          >
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
