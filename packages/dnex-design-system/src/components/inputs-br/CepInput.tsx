import { forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "../primitives/Input";
import { isCompleteCep, maskCep } from "../../lib/br";

/**
 * CepInput — campo de CEP com máscara `00000-000`.
 * -----------------------------------------------------------------------------
 * Controlado em STRING MASCARADA (`value` = "40015-010"). Quando os 8 dígitos
 * são preenchidos, dispara `onComplete(cep)` UMA vez (na transição de incompleto
 * → completo) — útil para o app fazer a busca de endereço. AQUI não há fetch
 * algum: validamos só o FORMATO. Mono + ARIA acessível.
 */
export type CepInputProps = {
  /** CEP mascarado (ex.: "40015-010"). */
  value?: string;
  /** Recebe o valor mascarado a cada digitação. */
  onChange?: (masked: string) => void;
  /** Chamado quando o CEP atinge 8 dígitos (transição incompleto → completo). */
  onComplete?: (cep: string) => void;
  /** Estado de erro (borda/anel danger + aria-invalid). */
  invalid?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "maxLength"
>;

export const CepInput = forwardRef<HTMLInputElement, CepInputProps>(
  function CepInput(
    { value = "", onChange, onComplete, invalid, className, ...props },
    ref,
  ) {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const next = maskCep(e.target.value);
      onChange?.(next);
      // Dispara só na borda incompleto → completo (evita repetir a cada tecla
      // quando já estava completo, ex.: o usuário cola e edita).
      if (!isCompleteCep(value) && isCompleteCep(next)) {
        onComplete?.(next);
      }
    }

    return (
      <Input
        ref={ref}
        mono
        inputMode="numeric"
        autoComplete="postal-code"
        invalid={invalid}
        value={value}
        onChange={handleChange}
        placeholder="00000-000"
        className={className}
        {...props}
      />
    );
  },
);
