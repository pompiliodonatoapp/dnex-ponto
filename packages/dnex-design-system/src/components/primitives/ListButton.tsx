import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type ListButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Realça a linha como seleção atual. */
  active?: boolean;
};

/**
 * ListButton — ação de linha para listas ricas, calendários e cartões
 * selecionáveis. Diferente de Button, não cria wrapper interno e permite grids
 * complexos sem reimplementar foco, hover e seleção em cada produto.
 */
export const ListButton = forwardRef<HTMLButtonElement, ListButtonProps>(
  function ListButton({ active = false, className, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        data-active={active || undefined}
        className={cn(
          "w-full rounded-[var(--radius-control)] text-left text-fg outline-none transition-colors",
          "hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
          "disabled:pointer-events-none disabled:opacity-50",
          active && "bg-action-tint",
          className,
        )}
        {...props}
      />
    );
  },
);
