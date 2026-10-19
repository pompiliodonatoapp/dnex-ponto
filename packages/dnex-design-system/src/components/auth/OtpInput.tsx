import { useId, useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { cn } from "../../lib/cn";

/**
 * OtpInput — entrada de código (MFA / verificação) do DNEX DS.
 *
 * UX completa:
 *  - N caixas (default 6), uma por dígito, em IBM Plex Mono;
 *  - digitar avança o foco; Backspace volta; ←/→ navegam;
 *  - COLAR (paste) distribui o código entre as caixas e foca a próxima vazia;
 *  - filtra para apenas dígitos; `onComplete` dispara quando preenche tudo.
 *
 * Controlado: `value` (string) + `onChange`. Acessível: cada caixa tem
 * aria-label "Dígito N de M"; o grupo recebe role="group" + rótulo.
 * Estado de erro pinta a borda em danger e expõe aria-invalid.
 *
 * Zero valor mágico — cores/raios/anel de foco via tokens.
 */

export type OtpInputProps = {
  /** Valor atual (string de dígitos, até `length`). */
  value: string;
  onChange: (value: string) => void;
  /** Quantidade de dígitos. Default: 6. */
  length?: number;
  /** Dispara quando todas as caixas estão preenchidas. */
  onComplete?: (value: string) => void;
  /** Estado de erro (borda danger + aria-invalid no grupo). */
  invalid?: boolean;
  /** Desabilita a entrada (ex.: durante a verificação). */
  disabled?: boolean;
  /** Foca a 1ª caixa ao montar. */
  autoFocus?: boolean;
  /** Rótulo acessível do grupo. Default: "Código de verificação". */
  "aria-label"?: string;
  /** id de descrição (ex.: mensagem de erro) repassado ao grupo. */
  "aria-describedby"?: string;
  className?: string;
};

export function OtpInput({
  value,
  onChange,
  length = 6,
  onComplete,
  invalid,
  disabled,
  autoFocus,
  "aria-label": ariaLabel = "Código de verificação",
  "aria-describedby": ariaDescribedBy,
  className,
}: OtpInputProps) {
  const groupId = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.split("").slice(0, length);

  function focusBox(i: number) {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  }

  function commit(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "");
    if (!digit) return;
    // pega o último dígito digitado (caso o campo já tivesse um)
    const arr = chars.slice();
    arr[index] = digit[digit.length - 1]!;
    const joined = arr.join("").slice(0, length);
    commit(joined);
    if (index < length - 1) focusBox(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = chars.slice();
      if (arr[index]) {
        arr[index] = "";
        commit(arr.join(""));
      } else if (index > 0) {
        arr[index - 1] = "";
        commit(arr.join(""));
        focusBox(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    commit(pasted.slice(0, length));
    focusBox(Math.min(pasted.length, length - 1));
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid || undefined}
      className={cn("flex items-center gap-2 sm:gap-2.5", className)}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={`${groupId}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          // separador visual no meio (xxx-xxx) sem quebrar o fluxo de foco
          aria-label={`Dígito ${i + 1} de ${length}`}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={chars[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 rounded-[var(--radius-control)] border bg-[var(--surface)] text-center font-mono text-[1.15rem] font-semibold text-fg outline-none transition-colors sm:h-14 sm:w-12",
            "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            invalid
              ? "border-[var(--color-danger)]"
              : "border-line-strong",
          )}
        />
      ))}
    </div>
  );
}
