import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * AuthCard — moldura comum das telas de auth, FRAMELESS: título display +
 * subtítulo apagado, corpo (slot do formulário) e rodapé opcional (links).
 *
 * Sem cartão/borda/sombra — os campos ficam direto sobre o fundo da coluna
 * (estilo split: marca à esquerda, formulário limpo à direita). Título alinhado
 * à esquerda; rodapé centralizado. Zero valor mágico (tokens do DS).
 */

export type AuthCardProps = {
  /** Ícone/ilustração opcional acima do título. */
  media?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Rodapé (links de navegação entre telas) — centralizado. */
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({
  media,
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className={cn("w-full min-w-0 max-w-full [overflow-wrap:anywhere]", className)}>
      {media && <div className="mb-4 flex items-center">{media}</div>}
      <h1 className="font-display text-[length:var(--text-h2)] font-bold leading-tight tracking-tight text-fg">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-sm text-[0.92rem] leading-relaxed text-fg-muted">
          {description}
        </p>
      )}

      <div className="mt-6">{children}</div>

      {footer && (
        <div className="mt-6 text-center text-[0.88rem] text-fg-muted">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Link textual de troca de tela (ex.: "Criar conta"). Usa a cor de ação. */
export function AuthLink({
  onClick,
  href,
  children,
}: {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const cls =
    // text-[0.85rem] explícito: como <button>, sem ele o link cai no font-size
    // default do browser (16px) e desalinha do label vizinho (ex.: "Senha").
    "text-[0.85rem] font-medium text-[var(--tone-action-fg)] underline-offset-4 outline-none transition-colors hover:text-[var(--tone-action-fg)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] rounded-[4px]";
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
