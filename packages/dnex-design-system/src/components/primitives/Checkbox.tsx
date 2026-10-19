import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RCheckbox from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";

export type CheckboxProps = ComponentPropsWithoutRef<typeof RCheckbox.Root>;

/**
 * Checkbox — caixa de seleção acessível (Radix). Suporta estado indeterminado.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <RCheckbox.Root
        ref={ref}
        className={cn(
          "group inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-line-strong bg-[var(--surface)] outline-none transition-colors",
          "data-[state=checked]:border-action data-[state=checked]:bg-action",
          "data-[state=indeterminate]:border-action data-[state=indeterminate]:bg-action",
          "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <RCheckbox.Indicator className="text-fg-on-action">
          <Check className="h-3.5 w-3.5 group-data-[state=indeterminate]:hidden" aria-hidden="true" strokeWidth={3} />
          <Minus className="hidden h-3.5 w-3.5 group-data-[state=indeterminate]:block" aria-hidden="true" strokeWidth={3} />
        </RCheckbox.Indicator>
      </RCheckbox.Root>
    );
  },
);
