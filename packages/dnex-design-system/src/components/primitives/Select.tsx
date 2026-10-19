import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as RSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Select — dropdown acessível sobre Radix Select.
 * API compacta com `items`, valor controlado ou defaultValue.
 * ref/onBlur apontam para o trigger; name/required/form integram o formulário.
 * onCloseAutoFocus permite preservar o foco de editores após formatar o texto.
 */

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  items: SelectOption[];
  disabled?: boolean;
  name?: string;
  required?: boolean;
  form?: string;
  onBlur?: ComponentPropsWithoutRef<typeof RSelect.Trigger>["onBlur"];
  onCloseAutoFocus?: ComponentPropsWithoutRef<typeof RSelect.Content>["onCloseAutoFocus"];
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

const triggerCls =
  "inline-flex h-11 min-w-0 w-full items-center justify-between gap-2 rounded-[var(--radius-control)] " +
  "border border-line bg-[var(--surface)] px-3.5 text-[0.95rem] text-fg " +
  "transition-colors duration-200 outline-none data-[placeholder]:text-fg-subtle " +
  "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select({
  id,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Selecione…",
  items,
  disabled,
  name,
  required,
  form,
  onBlur,
  onCloseAutoFocus,
  invalid,
  className,
  ...aria
}, ref) {
  return (
    <RSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => {
        // Radix can echo an empty change while its hidden form select syncs
        // asynchronous options. Controlled clearing belongs to the value prop:
        // Select.Item forbids empty values, so this is never an item choice.
        if (value !== undefined && nextValue === "") return;
        onValueChange?.(nextValue);
      }}
      disabled={disabled}
      name={name}
      required={required}
      form={form}
    >
      <RSelect.Trigger
        ref={ref}
        id={id}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-label={aria["aria-label"]}
        aria-describedby={aria["aria-describedby"]}
        className={cn(
          triggerCls,
          invalid && "border-[var(--color-danger)]",
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          <RSelect.Value placeholder={placeholder} />
        </span>
        <RSelect.Icon className="shrink-0">
          <ChevronDown className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
        </RSelect.Icon>
      </RSelect.Trigger>

      <RSelect.Portal>
        <RSelect.Content
          onCloseAutoFocus={onCloseAutoFocus}
          position="popper"
          sideOffset={6}
          className="dnex-pop z-[var(--z-popover)] max-h-72 w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface-2)] p-1.5 shadow-[var(--shadow-lg)] glass-edge"
        >
          <RSelect.Viewport>
            {items.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </SelectItem>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
});

const SelectItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RSelect.Item> & { children: ReactNode }
>(function SelectItem({ children, className, ...props }, ref) {
  return (
    <RSelect.Item
      ref={ref}
      className={cn(
        // Realce por FUNDO (índigo translúcido via --surface-hover). Suprimimos
        // qualquer outline com offset: o item recebe foco real do Radix e o anel
        // global seria cortado pelo painel overflow-hidden.
        "relative flex min-h-11 cursor-pointer select-none items-center whitespace-normal rounded-[8px] py-2 pl-8 pr-3 text-[0.92rem] text-fg-muted [overflow-wrap:anywhere] outline-none focus-visible:outline-none!",
        "data-[highlighted]:bg-[var(--surface-hover)] data-[highlighted]:text-fg",
        "data-[state=checked]:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 inline-flex w-4 items-center justify-center">
        <RSelect.ItemIndicator>
          <Check className="h-4 w-4 text-[var(--tone-action-fg)]" aria-hidden="true" />
        </RSelect.ItemIndicator>
      </span>
      <RSelect.ItemText>{children}</RSelect.ItemText>
    </RSelect.Item>
  );
});
