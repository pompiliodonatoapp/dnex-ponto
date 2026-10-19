import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Vidro com borda iluminada (default). `solid` usa superfície opaca. */
  variant?: "glass" | "solid";
  /** Eleva no hover (uso em cards clicáveis). */
  interactive?: boolean;
  /**
   * @deprecated Sem efeito visual desde a decisão de DS plano (2026-10-10).
   * Mantida apenas por compatibilidade de API. Cards são sempre planos:
   * separação por superfície (`--surface` sobre `--bg`), sem sombra nem borda.
   */
  elevated?: boolean;
};

/**
 * Card — superfície base do DS. Sempre PLANA (decisão 2026-10-10): separação
 * por cor de superfície (`--surface` sobre `--bg`), sem sombra nem borda de
 * contorno. A prop `elevated` é mantida apenas por compatibilidade de API e
 * não aplica nenhum estilo visual. Vidro (`variant="glass"`) mantém o efeito
 * translúcido mas também sem sombra/borda de contorno. Compose com
 * Card.Header/Body/Footer.
 */
export function Card({
  variant = "solid",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // min-w-0: como filho de grid/flex, o Card deve encolher até a largura
        // disponível — sem isso, conteúdo largo por dentro (ex.: DataTable) força
        // o próprio Card (e a página) a ficar mais largo que a tela no mobile.
        "min-w-0 rounded-[var(--radius-card)]",
        variant === "glass" ? "glass" : "bg-[var(--surface)]",
        interactive &&
          "transition-colors duration-150 hover:bg-[var(--surface-hover)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Subcomponentes do Card. O padding interno segue `--card-pad` (densidade):
 * comfortable = p-5 de hoje; compact relaxa menos. O Footer mantém o pad-top
 * reduzido proporcional.
 */
export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 p-[var(--card-pad)] pb-0", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-[1.05rem] font-semibold tracking-tight text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[0.9rem] leading-relaxed text-fg-muted", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-[var(--card-pad)]", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-[var(--card-pad)] pt-2",
        className,
      )}
      {...props}
    />
  );
}
