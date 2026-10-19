import { forwardRef, useId } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Input } from "../primitives/Input";
import { isValidCnpj, maskCnpj, normalizeCnpj } from "../../lib/br";

/**
 * CnpjInput — campo de CNPJ numérico ou alfanumérico com máscara
 * `00.000.000/0000-00` e validação oficial dos dígitos verificadores.
 * -----------------------------------------------------------------------------
 * Controlado em STRING MASCARADA (`value` = "11.222.333/0001-81"). A validação
 * só acusa erro quando os 14 caracteres estão preenchidos — não "grita" enquanto o
 * usuário ainda digita. Se usado dentro do FormControl da camada Form, o `invalid`
 * e a mensagem do zod assumem; standalone, ele mostra a própria mensagem.
 *
 * Acessível: mono (assinatura fiscal), aria-invalid, e mensagem ligada por
 * aria-describedby (role=alert) quando inválido.
 */
export type CnpjInputProps = {
  /** CNPJ mascarado (ex.: "11.222.333/0001-81"). */
  value?: string;
  /** Recebe o valor mascarado a cada digitação. */
  onChange?: (masked: string) => void;
  /** Chamado quando o CNPJ se torna VÁLIDO (transição inválido/incompleto → válido). */
  onComplete?: (cnpj: string) => void;
  /** Força o estado de erro externamente (ex.: vindo do FormControl). */
  invalid?: boolean;
  /** Esconde a mensagem de validação própria (quando o Form já cuida do erro). */
  hideMessage?: boolean;
  /** Texto de erro próprio (padrão: "CNPJ inválido."). */
  errorMessage?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "maxLength"
>;

export const CnpjInput = forwardRef<HTMLInputElement, CnpjInputProps>(
  function CnpjInput(
    {
      value = "",
      onChange,
      onComplete,
      invalid,
      hideMessage,
      errorMessage = "CNPJ inválido.",
      className,
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const msgId = `${id ?? autoId}-cnpj-msg`;

    const normalized = normalizeCnpj(value);
    const complete = normalized.length === 14;
    const ownInvalid = complete && !isValidCnpj(value);
    const showInvalid = invalid || ownInvalid;
    const showOwnMessage = !hideMessage && ownInvalid;

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const next = maskCnpj(e.target.value);
      onChange?.(next);
      // Dispara só na borda inválido/incompleto → VÁLIDO (não gasta consulta de
      // API com CNPJ errado) — mesmo padrão do CpfInput.
      const wasValid = normalizeCnpj(value).length === 14 && isValidCnpj(value);
      const isNowValid = normalizeCnpj(next).length === 14 && isValidCnpj(next);
      if (!wasValid && isNowValid) onComplete?.(next);
    }

    return (
      <div className="space-y-1.5">
        <Input
          ref={ref}
          id={id}
          mono
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          invalid={showInvalid}
          value={value}
          onChange={handleChange}
          placeholder="00.000.000/0000-00"
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
