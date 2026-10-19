import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Kbd } from "./Kbd";

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  /** Valor controlado da busca. */
  value: string;
  /** Recebe o novo texto (string crua, não evento) — controlado. */
  onValueChange: (value: string) => void;
  /** Estado de erro (borda/anel em danger + aria-invalid). */
  invalid?: boolean;
  /** Atalho exibido à direita quando o campo está vazio (ex.: ⌘K). Decorativo. */
  shortcut?: ReactNode;
  /** Rótulo do botão limpar (a11y). */
  clearLabel?: string;
  /** Aparência compacta e sutil para a barra superior do app. */
  variant?: "default" | "topbar";
};

const fieldBase =
  "w-full text-fg placeholder:text-fg-subtle rounded-[var(--radius-control)] border border-line " +
  "transition-colors duration-200 outline-none " +
  "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * SearchInput — campo de busca do DS: ícone de lupa à esquerda, botão "limpar"
 * que aparece quando há texto, e um slot opcional de atalho (⌘K) quando vazio.
 * Controlado (value/onValueChange). Use com aria-label ou <Label> associado.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onValueChange,
      invalid,
      shortcut,
      clearLabel = "Limpar busca",
      variant = "default",
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const hasValue = value.length > 0;
    const descId = useId();

    return (
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
        />
        <input
          ref={ref}
          type="search"
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            fieldBase,
            variant === "topbar"
              ? "h-[38px] bg-[var(--surface-2)] text-xs shadow-[var(--shadow-sm)]"
              : "h-11 bg-[var(--surface)] text-[0.95rem]",
            "pl-10",
            // espaço à direita: para o botão limpar (com valor) ou para o atalho (vazio)
            hasValue ? "pr-10" : shortcut ? "pr-16" : "pr-3.5",
            // esconde o "x" nativo de inputs type=search (usamos o nosso)
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
            invalid &&
              "border-[var(--color-danger)] focus-visible:border-[var(--color-danger)] focus-visible:ring-[var(--tone-danger-border)]",
            className,
          )}
          {...props}
        />

        {hasValue ? (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => onValueChange("")}
            disabled={disabled}
            className={cn(
              "absolute right-2.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center",
              "rounded-[6px] text-fg-subtle outline-none transition-colors",
              "hover:bg-[var(--surface-hover)] hover:text-fg",
              "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : shortcut ? (
          <span
            aria-hidden="true"
            id={descId}
            className="pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1"
          >
            {typeof shortcut === "string" ? <Kbd>{shortcut}</Kbd> : shortcut}
          </span>
        ) : null}
      </div>
    );
  },
);
