import { forwardRef, useId } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Input } from "../primitives/Input";
import { isValidCpf, maskCpf, onlyDigits } from "../../lib/br";

/**
 * CpfInput — campo de CPF com máscara `000.000.000-00` e validação dos dígitos
 * verificadores (algoritmo próprio em `lib/br.ts`).
 * -----------------------------------------------------------------------------
 * Controlado em STRING MASCARADA (`value` = "529.982.247-25"). A validação só
 * acusa erro com os 11 dígitos preenchidos. Dentro do FormControl, o erro do
 * zod assume; standalone, mostra a própria mensagem. Mono + ARIA acessível.
 */
export type CpfInputProps = {
  /** CPF mascarado (ex.: "529.982.247-25"). */
  value?: string;
  /** Recebe o valor mascarado a cada digitação. */
  onChange?: (masked: string) => void;
  /** Chamado quando o CPF se torna VÁLIDO (transição inválido/incompleto → válido). */
  onComplete?: (cpf: string) => void;
  /** Força o estado de erro externamente (ex.: vindo do FormControl). */
  invalid?: boolean;
  /** Esconde a mensagem de validação própria (quando o Form já cuida do erro). */
  hideMessage?: boolean;
  /** Texto de erro próprio (padrão: "CPF inválido."). */
  errorMessage?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "maxLength"
>;

export const CpfInput = forwardRef<HTMLInputElement, CpfInputProps>(
  function CpfInput(
    {
      value = "",
      onChange,
      onComplete,
      invalid,
      hideMessage,
      errorMessage = "CPF inválido.",
      className,
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const msgId = `${id ?? autoId}-cpf-msg`;

    const digits = onlyDigits(value);
    const complete = digits.length === 11;
    const ownInvalid = complete && !isValidCpf(value);
    const showInvalid = invalid || ownInvalid;
    const showOwnMessage = !hideMessage && ownInvalid;

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const next = maskCpf(e.target.value);
      onChange?.(next);
      // Dispara só na borda inválido/incompleto → VÁLIDO (não gasta consulta de
      // API com CPF errado — diferente do CepInput, que não tem dígito verificador).
      const wasValid = onlyDigits(value).length === 11 && isValidCpf(value);
      const isNowValid = onlyDigits(next).length === 11 && isValidCpf(next);
      if (!wasValid && isNowValid) onComplete?.(next);
    }

    return (
      <div className="space-y-1.5">
        <Input
          ref={ref}
          id={id}
          mono
          inputMode="numeric"
          autoComplete="off"
          invalid={showInvalid}
          value={value}
          onChange={handleChange}
          placeholder="000.000.000-00"
          aria-describedby={cn(describedBy, showOwnMessage && msgId) || undefined}
          className={className}
          {...props}
        />
        {showOwnMessage && (
          <p
            id={msgId}
            role="alert"
            className="text-[0.8rem] font-medium text-[var(--color-danger)]"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
