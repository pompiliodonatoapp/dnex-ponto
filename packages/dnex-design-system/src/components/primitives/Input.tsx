import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Ícone decorativo à esquerda (ex.: lupa). */
  leadingIcon?: ReactNode;
  /** Estado de erro (borda/anel em danger + aria-invalid). */
  invalid?: boolean;
  /** Use a fonte mono — para valores fiscais, datas, códigos. */
  mono?: boolean;
};

const fieldBase =
  "w-full min-w-0 max-w-full bg-[var(--surface)] text-fg placeholder:text-fg-subtle " +
  "rounded-[var(--radius-control)] border border-line " +
  "transition-colors duration-200 outline-none " +
  "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Input — campo de texto do DS. Suporta ícone à esquerda, estado de erro e
 * variante mono (números fiscais). Use sempre com <Label> ou aria-label.
 *
 * Densidade: altura e padding-inline seguem `--control-h` / `--control-px`, então
 * o campo compacta junto com a densidade global (DensityProvider). Comfortable
 * = h-11/px-3.5 de hoje; compact ≈ h-9.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leadingIcon, invalid, mono, className, ...props },
  ref,
) {
  const field = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        // Altura/padding via tokens de densidade (h-11/px-3.5 no comfortable).
        // Como classes (não style inline), o tailwind-merge deixa o className do
        // chamador sobrescrever (ex.: DateInputBR usa pr-11; leadingIcon usa pl-10).
        // 16px evita a ampliação automática ao focar no iOS, sem bloquear zoom.
        "h-[var(--control-h)] min-h-11 px-[var(--control-px)] text-base md:min-h-0",
        mono && "font-mono tracking-tight",
        leadingIcon && "pl-10",
        invalid &&
          "border-[var(--color-danger)] focus-visible:border-[var(--color-danger)] focus-visible:ring-[rgba(239,68,68,0.3)]",
        className,
      )}
      {...props}
    />
  );

  if (!leadingIcon) return field;

  return (
    <div className="relative min-w-0 max-w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle [&>svg]:h-4 [&>svg]:w-4"
      >
        {leadingIcon}
      </span>
      {field}
    </div>
  );
});
