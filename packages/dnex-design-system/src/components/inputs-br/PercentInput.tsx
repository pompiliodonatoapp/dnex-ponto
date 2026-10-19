import { forwardRef } from "react";
import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from "react";
import { Input } from "../primitives/Input";
import { clamp, formatPercent, parsePercent } from "../../lib/br";

/**
 * PercentInput — campo de percentual `12,34%`.
 * -----------------------------------------------------------------------------
 * Comportamento "caixa registradora" com `decimals` casas: o usuário digita só
 * números e o valor cresce da direita. Controlado em NÚMERO (`value` = 12.34,
 * representando 12,34%). `min`/`max` aplicados no blur (não trava a digitação,
 * só normaliza ao sair). Mono + alinhado à direita.
 *
 *   <PercentInput value={pct} onChange={setPct} decimals={2} min={0} max={100} />
 */
export type PercentInputProps = {
  /** Valor numérico do percentual (ex.: 12.34 = 12,34%). */
  value?: number;
  /** Recebe o novo número a cada digitação. */
  onChange?: (value: number) => void;
  /** Casas decimais (padrão: 2). */
  decimals?: number;
  /** Mínimo aplicado no blur. */
  min?: number;
  /** Máximo aplicado no blur. */
  max?: number;
  /** Estado de erro (borda/anel danger + aria-invalid). */
  invalid?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "min" | "max"
>;

export const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(
  function PercentInput(
    {
      value,
      onChange,
      decimals = 2,
      min,
      max,
      invalid,
      className,
      onBlur,
      ...props
    },
    ref,
  ) {
    const display =
      value === undefined ? "" : formatPercent(value, decimals);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      onChange?.(parsePercent(e.target.value, decimals));
    }

    function handleBlur(e: FocusEvent<HTMLInputElement>) {
      if (value !== undefined && (min !== undefined || max !== undefined)) {
        const clamped = clamp(value, min, max);
        if (clamped !== value) onChange?.(clamped);
      }
      onBlur?.(e);
    }

    return (
      <Input
        ref={ref}
        mono
        inputMode="numeric"
        invalid={invalid}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={`0${decimals > 0 ? "," + "0".repeat(decimals) : ""}%`}
        className={className ? `text-right ${className}` : "text-right"}
        {...props}
      />
    );
  },
);
