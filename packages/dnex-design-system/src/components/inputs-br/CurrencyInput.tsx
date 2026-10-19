import { forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "../primitives/Input";
import { centsToBRL, parseBRLToCents } from "../../lib/br";

/**
 * CurrencyInput — valor monetário em Real (BRL).
 * -----------------------------------------------------------------------------
 * Comportamento "caixa registradora": o usuário digita só números e o valor
 * cresce da direita para a esquerda — `1` → R$ 0,01, `12` → R$ 0,12,
 * `1234` → R$ 12,34. Apagar/colar funcionam (sempre relê os dígitos).
 *
 * MODELO DE VALOR: o componente é controlado em CENTAVOS (inteiro) — é a forma
 * segura de lidar com dinheiro (sem float). Use `value` + `onChange(cents)`.
 *   <CurrencyInput value={cents} onChange={setCents} />
 * Para reais, faça a conversão na borda do app: `cents / 100`.
 *
 * Integra com a camada Form via `value`/`onChange` controlados (não é o
 * onChange de evento nativo — ver `onChange(cents: number)`). Alinhado à
 * direita, mono (assinatura fiscal). Acessível: aceita id/aria do FormControl.
 */
export type CurrencyInputProps = {
  /** Valor em CENTAVOS (inteiro). Ex.: 123456 = R$ 1.234,56. */
  value?: number;
  /** Recebe o novo valor em CENTAVOS a cada digitação. */
  onChange?: (cents: number) => void;
  /** Estado de erro (borda/anel danger + aria-invalid). */
  invalid?: boolean;
  /** Mostrar o símbolo "R$ " no campo (padrão: true). */
  withSymbol?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
>;

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    { value, onChange, invalid, withSymbol = true, className, ...props },
    ref,
  ) {
    const display =
      value === undefined ? "" : centsToBRL(value, withSymbol);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      onChange?.(parseBRLToCents(e.target.value));
    }

    return (
      <Input
        ref={ref}
        mono
        inputMode="numeric"
        invalid={invalid}
        value={display}
        onChange={handleChange}
        placeholder={withSymbol ? "R$ 0,00" : "0,00"}
        className={className ? `text-right ${className}` : "text-right"}
        {...props}
      />
    );
  },
);
