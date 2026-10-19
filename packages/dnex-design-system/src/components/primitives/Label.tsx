import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RLabel from "@radix-ui/react-label";
import { cn } from "../../lib/cn";

export type LabelProps = ComponentPropsWithoutRef<typeof RLabel.Root> & {
  /** Marca o campo como obrigatório (asterisco âmbar). */
  required?: boolean;
};

/**
 * Label — rótulo acessível (Radix Label) para campos de formulário.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required, children, ...props },
  ref,
) {
  return (
    <RLabel.Root
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 text-[0.85rem] font-medium text-fg-muted",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-accent">
          *
        </span>
      )}
    </RLabel.Root>
  );
});
