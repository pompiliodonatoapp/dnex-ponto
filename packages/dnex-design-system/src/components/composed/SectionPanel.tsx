import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type SectionPanelProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
  action?: ReactNode;
  contentClassName?: string;
};

/**
 * SectionPanel — composição de conteúdo padrão da V1 para módulos de produto.
 * Mantém título, contexto, ação e conteúdo na mesma superfície sem obrigar cada
 * página a recriar borda, espaçamento e hierarquia tipográfica.
 */
export function SectionPanel({
  title,
  description,
  eyebrow,
  icon,
  action,
  contentClassName,
  className,
  children,
  ...props
}: SectionPanelProps) {
  return (
    <section
      className={cn(
        "dnex-v1-card min-w-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface)]",
        className,
      )}
      {...props}
    >
      <header className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-action-tint text-[var(--tone-action-fg)] [&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="mb-1 block text-[0.64rem] font-extrabold uppercase tracking-[0.14em] text-accent">
                {eyebrow}
              </span>
            )}
            <h2 className="font-display text-[1.05rem] font-bold tracking-tight text-fg">{title}</h2>
            {description && <p className="mt-1 text-xs leading-relaxed text-fg-subtle">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}
