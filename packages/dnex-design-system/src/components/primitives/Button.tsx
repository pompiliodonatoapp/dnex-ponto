import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "danger"
  | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Ícone à esquerda do label. */
  leadingIcon?: ReactNode;
  /** Ícone à direita do label. */
  trailingIcon?: ReactNode;
  /** Renderiza no elemento filho (ex.: <a>) via Radix Slot. */
  asChild?: boolean;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 font-display font-semibold " +
  "whitespace-nowrap select-none transition-colors duration-150 " +
  "cursor-pointer disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

const variants: Record<ButtonVariant, string> = {
  // Primário e destaque são planos: sem sombra decorativa (decisão do dono, 10/10/2026).
  primary:
    "rounded-[var(--radius-control)] text-fg-on-action bg-action hover:bg-action-hover",
  accent:
    "rounded-[var(--radius-control)] bg-accent text-[var(--color-amber-950)] hover:bg-accent-hover",
  secondary:
    "rounded-[var(--radius-control)] bg-[var(--surface-2)] text-fg " +
    "hover:bg-[var(--surface-hover)]",
  ghost:
    "rounded-[var(--radius-control)] text-fg-muted hover:text-fg " +
    "hover:[background:var(--surface-hover)]",
  danger:
    "rounded-[var(--radius-control)] bg-[var(--tone-danger-bg)] " +
    "text-[var(--tone-danger-fg)] hover:brightness-95",
  link:
    "rounded-[6px] text-[var(--tone-action-fg)] hover:text-[var(--tone-action-fg)] underline-offset-4 hover:underline px-0",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3.5 h-[38px]",
  md: "text-[0.85rem] px-4 h-10",
  lg: "text-[0.9rem] px-5 h-11",
  icon: "h-9 w-9 p-0",
};

/**
 * Button — primitivo de ação do DNEX DS.
 * Variantes: primary · accent · secondary · ghost · danger · link.
 * Tamanhos: sm · md · lg · icon. Estados: loading (spinner + aria-busy),
 * disabled, hover/active/focus.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    leadingIcon,
    trailingIcon,
    asChild = false,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const classes = cn(base, variants[variant], sizes[size], className);

  // asChild: o Slot mescla as props no elemento do usuário (ex.: <a>).
  // <Slottable> marca o filho-alvo, permitindo ícones ao redor sem quebrar o Slot.
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={classes}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 dnex-spin" />
        ) : (
          leadingIcon
        )}
        <Slottable>{children}</Slottable>
        {!loading && trailingIcon}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...props}
    >
      <span className="relative inline-flex items-center gap-2">
        {loading ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 dnex-spin" />
        ) : (
          leadingIcon
        )}
        {children}
        {!loading && trailingIcon}
      </span>
    </button>
  );
});
