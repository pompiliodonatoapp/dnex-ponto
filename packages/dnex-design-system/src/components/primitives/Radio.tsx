import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RRadio from "@radix-ui/react-radio-group";
import { cn } from "../../lib/cn";

/**
 * RadioGroup + RadioItem — seleção única acessível (Radix).
 */

export const RadioGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RRadio.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return (
    <RRadio.Root
      ref={ref}
      className={cn("flex flex-col gap-2.5", className)}
      {...props}
    />
  );
});

export const RadioItem = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof RRadio.Item>
>(function RadioItem({ className, ...props }, ref) {
  return (
    <RRadio.Item
      ref={ref}
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line-strong bg-[var(--surface)] outline-none transition-colors",
        "data-[state=checked]:border-action",
        "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <RRadio.Indicator className="block h-2.5 w-2.5 rounded-full bg-action" />
    </RRadio.Item>
  );
});
