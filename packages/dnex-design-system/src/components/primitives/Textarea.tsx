import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

/**
 * Textarea — campo multilinha do DS. Mesma linguagem visual do Input.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full min-h-24 resize-y bg-[var(--surface)] text-fg placeholder:text-fg-subtle",
          "rounded-[var(--radius-control)] border border-line px-3.5 py-3 text-[0.95rem] leading-relaxed",
          "transition-colors duration-200 outline-none",
          "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          invalid &&
            "border-[var(--color-danger)] focus-visible:border-[var(--color-danger)] focus-visible:ring-[rgba(239,68,68,0.3)]",
          className,
        )}
        {...props}
      />
    );
  },
);
