import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type BadgeTone =
  | "neutral"
  | "action"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** Pequeno ponto de status à esquerda. */
  dot?: boolean;
};

const tones: Record<BadgeTone, string> = {
  neutral: "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-border)]",
  action: "bg-[var(--tone-action-bg)] text-[var(--tone-action-fg)] border-[var(--tone-action-border)]",
  accent: "bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)] border-[var(--tone-warning-border)]",
  success: "bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)] border-[var(--tone-success-border)]",
  warning: "bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)] border-[var(--tone-warning-border)]",
  danger: "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-border)]",
};

const dotColors: Record<BadgeTone, string> = {
  neutral: "bg-fg-subtle",
  action: "bg-action",
  accent: "bg-accent",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
};

/**
 * Badge / Tag — rótulo de status compacto. Pills pastel por tom.
 * Âmbar (accent/warning) usado com parcimônia — só status real de destaque.
 */
export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-[0.75rem] font-medium leading-5",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[tone])}
        />
      )}
      {children}
    </span>
  );
}
