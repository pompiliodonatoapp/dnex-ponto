import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type ErrorStateProps = {
  /**
   * Ilustração DNEX protagonista (ex.: <Illustration404 />, <Illustration500 />,
   * <IllustrationNoPermission />, <IllustrationNoConnection />).
   */
  illustration?: ReactNode;
  /** Código discreto acima do título (ex.: "404", "500"). Opcional. */
  code?: string;
  title: string;
  description?: string;
  /** Ação primária (ex.: <Button>Voltar ao início</Button>). */
  action?: ReactNode;
  /** Ação secundária (ex.: <Button variant="ghost">Tentar de novo</Button>). */
  secondaryAction?: ReactNode;
  className?: string;
};

/**
 * ErrorState — bloco de erro reutilizável (404 / 500 / sem-permissão / offline)
 * com ilustração própria, código discreto, título, descrição e até duas ações.
 * Voz de parceiro (Manual §5): "Esse erro é nosso, não seu". Centralizado e
 * acessível; a ilustração já carrega seu próprio rótulo (role=img) quando tem
 * `title`. Reage ao tema via tokens.
 */
export function ErrorState({
  illustration,
  code,
  title,
  description,
  action,
  secondaryAction,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-14 text-center",
        className,
      )}
    >
      {illustration && (
        <span className="[&>svg]:h-auto [&>svg]:w-[clamp(140px,34vw,200px)]">
          {illustration}
        </span>
      )}

      <div className="space-y-1.5">
        {code && (
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-fg-subtle">
            Erro {code}
          </p>
        )}
        <h2 className="font-display text-[length:var(--text-h3)] font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {description && (
          <p className="mx-auto max-w-md text-[0.92rem] leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
