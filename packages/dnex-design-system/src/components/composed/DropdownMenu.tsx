import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RDropdown from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * DropdownMenu — menu de ações acessível (Radix). Teclado, foco e roles inclusos.
 */
export const DropdownMenu = RDropdown.Root;
export const DropdownMenuTrigger = RDropdown.Trigger;
export const DropdownMenuGroup = RDropdown.Group;

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RDropdown.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <RDropdown.Portal>
      <RDropdown.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "dnex-pop z-[var(--z-popover)] min-w-44 overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface-2)] p-1.5 shadow-[var(--shadow-lg)] glass-edge",
          className,
        )}
        {...props}
      />
    </RDropdown.Portal>
  );
});

export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RDropdown.Item> & { destructive?: boolean }
>(function DropdownMenuItem({ className, destructive, ...props }, ref) {
  return (
    <RDropdown.Item
      ref={ref}
      className={cn(
        // Realce por FUNDO (índigo translúcido). Sem outline com offset, que
        // seria cortado pelo painel overflow-hidden ao navegar por teclado.
        "flex cursor-pointer select-none items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[0.9rem] text-fg-muted outline-none focus-visible:outline-none! transition-colors",
        "data-[highlighted]:bg-[var(--surface-hover)] data-[highlighted]:text-fg",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-fg-subtle",
        destructive &&
          "text-[#f87171] data-[highlighted]:bg-[rgba(239,68,68,0.12)] data-[highlighted]:text-[#f87171] [&>svg]:text-[#f87171]",
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RDropdown.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <RDropdown.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-[8px] py-2 pl-8 pr-2.5 text-[0.9rem] text-fg-muted outline-none focus-visible:outline-none! transition-colors",
        "data-[highlighted]:bg-[var(--surface-hover)] data-[highlighted]:text-fg",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 inline-flex w-4 items-center justify-center">
        <RDropdown.ItemIndicator>
          <Check className="h-4 w-4 text-[var(--tone-action-fg)]" aria-hidden="true" />
        </RDropdown.ItemIndicator>
      </span>
      {children}
    </RDropdown.CheckboxItem>
  );
});

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RDropdown.Label>) {
  return (
    <RDropdown.Label
      className={cn(
        "px-2.5 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RDropdown.Separator>) {
  return (
    <RDropdown.Separator
      className={cn("my-1 h-px bg-line", className)}
      {...props}
    />
  );
}
