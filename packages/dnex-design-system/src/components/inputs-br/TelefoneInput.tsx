import { forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "../primitives/Input";
import { maskTelefone } from "../../lib/br";

/**
 * TelefoneInput — campo de telefone com a máscara `(00) 000000000` (padrão
 * DNEX): DDD entre parênteses + espaço, número SEM hífen. Aceita fixo (8
 * dígitos após o DDD) e celular (9 dígitos).
 * -----------------------------------------------------------------------------
 * Controlado em STRING MASCARADA (`value` = "(77) 999795492"). Sem validação
 * de dígito verificador (telefone não tem); só formato. Mono + ARIA acessível,
 * mesmo idioma dos demais inputs-br (Cpf/Cnpj/Cep).
 */
export type TelefoneInputProps = {
  /** Telefone mascarado (ex.: "(77) 999795492"). */
  value?: string;
  /** Recebe o valor mascarado a cada digitação. */
  onChange?: (masked: string) => void;
  /** Estado de erro (borda/anel danger + aria-invalid). */
  invalid?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "maxLength"
>;

export const TelefoneInput = forwardRef<HTMLInputElement, TelefoneInputProps>(
  function TelefoneInput({ value = "", onChange, invalid, className, ...props }, ref) {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      onChange?.(maskTelefone(e.target.value));
    }

    return (
      <Input
        ref={ref}
        mono
        inputMode="tel"
        autoComplete="tel"
        invalid={invalid}
        // Máscara também na EXIBIÇÃO (idempotente): valores salvos antes da máscara
        // existir (ou vindos de import) chegam como dígitos crus do banco.
        value={maskTelefone(value)}
        onChange={handleChange}
        placeholder="(71) 999999999"
        className={className}
        {...props}
      />
    );
  },
);
