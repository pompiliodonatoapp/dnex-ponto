import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type EmptyStateProps = {
  /** Ícone ilustrativo (lucide). Ignorado quando `illustration` é passada. */
  icon?: ReactNode;
  /**
   * Ilustração própria DNEX (ex.: <IllustrationEmpty />). Tem precedência sobre
   * `icon` — renderiza maior, como protagonista do estado vazio.
   */
  illustration?: ReactNode;
  title: string;
  description?: string;
  /** Ação primária (ex.: <Button>). */
  action?: ReactNode;
  className?: string;
};

/**
 * EmptyState — estado vazio com voz de parceiro (Manual §5):
 * "Ainda sem lançamentos este mês. Quando você registrar o primeiro, aparece aqui."
 * Nunca uma tela em branco. Aceita um ícone (lucide) OU uma ilustração DNEX.
 */
export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {illustration ? (
        <span className="mb-1 [&>svg]:h-auto [&>svg]:w-[clamp(120px,30vw,160px)]">
          {illustration}
        </span>
      ) : (
        icon && (
          <span className="grid h-14 w-14 place-items-center rounded-[var(--radius-card)] bg-[var(--tone-action-bg)] text-[var(--tone-action-fg)] [&>svg]:h-6 [&>svg]:w-6">
            {icon}
          </span>
        )
      )}
      <div className="space-y-1">
        <p className="font-display text-[1.05rem] font-semibold text-fg">
          {title}
        </p>
        {description && (
          <p className="mx-auto max-w-sm text-[0.9rem] leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
