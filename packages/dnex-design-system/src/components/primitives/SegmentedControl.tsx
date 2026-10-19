import type { ReactNode } from "react";
import * as RToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "../../lib/cn";

export type SegmentedItem<T extends string> = {
  value: T;
  label: ReactNode;
  /** Ícone opcional à esquerda do rótulo. */
  icon?: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string> = {
  /** Valor selecionado (controlado, seleção única). */
  value: T;
  onValueChange: (value: T) => void;
  items: SegmentedItem<T>[];
  /** Rótulo acessível do grupo. */
  "aria-label": string;
  /** Tamanho do controle. */
  size?: "sm" | "md";
  /** Ocupa toda a largura, distribuindo os segmentos igualmente. */
  fullWidth?: boolean;
  className?: string;
};

const sizes: Record<NonNullable<SegmentedControlProps<string>["size"]>, string> =
  {
    sm: "h-[var(--selection-height-sm)] text-[length:var(--text-small)]",
    md: "h-[var(--selection-height)] text-[length:var(--selection-font-size)]",
  };

/**
 * SegmentedControl — seleção única em pílulas adjacentes (Radix ToggleGroup).
 * Promoção oficial do SegmentedToggle do showcase. O segmento ativo recebe
 * fundo índigo translúcido; navegação por setas e roles vêm do Radix.
 * Use para alternar visões/modos (não para ações). Para tema, ver ThemeToggle.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  items,
  size = "md",
  fullWidth = false,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  return (
    <RToggleGroup.Root
      type="single"
      value={value}
      aria-label={aria["aria-label"]}
      // Radix permite desmarcar (value=""); aqui mantemos seleção sempre ativa.
      onValueChange={(v) => {
        if (v) onValueChange(v as T);
      }}
      className={cn(
        "inline-flex items-center gap-[var(--selection-gap)] rounded-[var(--radius-control)] border border-line bg-[var(--surface)] p-[var(--selection-inset)]",
        fullWidth && "flex w-full",
        className,
      )}
    >
      {items.map((item) => (
        <RToggleGroup.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-[var(--selection-item-radius)] px-[var(--selection-padding-inline)] font-medium outline-none transition-colors",
            "text-fg-muted hover:text-fg",
            "data-[state=on]:bg-[var(--selection-active-background)] data-[state=on]:text-fg",
            "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
            "disabled:pointer-events-none disabled:opacity-40",
            sizes[size],
            fullWidth && "flex-1",
          )}
        >
          {item.icon}
          {item.label}
        </RToggleGroup.Item>
      ))}
    </RToggleGroup.Root>
  );
}
