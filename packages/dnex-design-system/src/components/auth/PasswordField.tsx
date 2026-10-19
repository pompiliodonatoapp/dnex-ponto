import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "../../lib/cn";
import { Input } from "../primitives/Input";

/**
 * PasswordField — campo de senha do DNEX DS.
 *
 * - Botão mostrar/ocultar acessível (aria-pressed + aria-label dinâmico).
 * - Medidor de força opcional (fraca/média/forte/muito forte) com avaliação
 *   pura e local (NUNCA envia a senha a lugar nenhum). A barra é decorativa
 *   (aria-hidden) e a força é anunciada por texto em aria-live="polite".
 * - Reusa o <Input> do DS: herda densidade, foco, estado de erro e tokens.
 *
 * Acessibilidade: o cadeado e o ícone do toggle são aria-hidden; o rótulo do
 * campo vem do <FormLabel>/<Label> de fora (ou via aria-label). Zero valor
 * mágico — cores via tokens semânticos de status.
 */

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  /** Estado de erro (borda/anel danger + aria-invalid) — repassado ao Input. */
  invalid?: boolean;
  /** Mostra o medidor de força abaixo do campo. Default: false. */
  showStrength?: boolean;
  /**
   * Valor controlado para o cálculo de força. Se omitido e showStrength=true,
   * o componente observa o próprio valor digitado (modo não-controlado).
   */
  value?: string;
  /** Ícone à esquerda. Default: cadeado. Passe `null` para nenhum. */
  leadingIcon?: ReactNode | null;
};

/** Heurística local e simples de força (0–4). Não é política de servidor. */
export function scorePassword(pw: string): PasswordStrength {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4) as PasswordStrength;
}

const STRENGTH_META: Record<
  Exclude<PasswordStrength, 0>,
  { label: string; bar: string; text: string; filled: number }
> = {
  1: {
    label: "Fraca",
    bar: "bg-[var(--color-danger)]",
    text: "text-[#fca5a5]",
    filled: 1,
  },
  2: {
    label: "Razoável",
    bar: "bg-[var(--color-warning)]",
    text: "text-amber-300",
    filled: 2,
  },
  3: {
    label: "Forte",
    bar: "bg-action",
    text: "text-indigo-300",
    filled: 3,
  },
  4: {
    label: "Muito forte",
    bar: "bg-[var(--color-success)]",
    text: "text-[#86efac]",
    filled: 4,
  },
};

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    {
      invalid,
      showStrength = false,
      leadingIcon,
      className,
      value,
      onChange,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const [internal, setInternal] = useState("");
    const meterId = useId();

    const current = value ?? internal;
    const strength = scorePassword(current);
    const meta = strength === 0 ? null : STRENGTH_META[strength];

    const describedBy = [ariaDescribedBy, showStrength ? meterId : undefined]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={visible ? "text" : "password"}
            invalid={invalid}
            leadingIcon={leadingIcon === null ? undefined : (leadingIcon ?? <Lock />)}
            aria-describedby={describedBy || undefined}
            // espaço à direita para o botão de toggle
            className={cn("pr-11", className)}
            value={value}
            onChange={(e) => {
              if (value === undefined) setInternal(e.target.value);
              onChange?.(e);
            }}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            className={cn(
              "absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[8px]",
              "text-fg-subtle outline-none transition-colors hover:text-fg",
              "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
            )}
            // não rouba o foco do campo ao alternar
            tabIndex={0}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {showStrength && (
          <div id={meterId} className="space-y-1.5">
            {/* barra segmentada — decorativa */}
            <div className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-[var(--radius-pill)] transition-colors duration-200",
                    meta && i < meta.filled
                      ? meta.bar
                      : "bg-[var(--line-strong)]",
                  )}
                />
              ))}
            </div>
            {/* texto da força — anunciado a leitores de tela */}
            <p
              aria-live="polite"
              className={cn(
                "text-[0.78rem] font-medium",
                meta ? meta.text : "text-fg-subtle",
              )}
            >
              {meta
                ? `Força da senha: ${meta.label}`
                : "Use 8+ caracteres, com maiúsculas, números e símbolos."}
            </p>
          </div>
        )}
      </div>
    );
  },
);
