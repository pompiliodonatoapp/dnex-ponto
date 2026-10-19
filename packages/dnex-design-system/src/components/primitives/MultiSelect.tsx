import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import * as RPopover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  filterOptions,
  nextEnabledIndex,
  type ComboOption,
} from "./comboboxShared";

export type MultiSelectProps = {
  /** Valores selecionados (controlado). */
  value: string[];
  onValueChange: (value: string[]) => void;
  options: ComboOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Limite opcional de seleções; ao atingir, as demais ficam indisponíveis. */
  max?: number;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  contentClassName?: string;
  container?: HTMLElement | null;
  "aria-label"?: string;
};

const triggerCls =
  "flex min-h-11 w-full items-center justify-between gap-2 rounded-[var(--radius-control)] " +
  "border border-line bg-[var(--surface)] px-2.5 py-1.5 text-left text-[0.95rem] text-fg " +
  "transition-colors duration-200 outline-none " +
  "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * MultiSelect — seleção múltipla com chips removíveis. Mesma base do Combobox
 * (Popover + filtragem própria, tolerante a acentos), mas mantém o painel aberto
 * ao marcar/desmarcar. Chips com botão "remover"; teclado completo na lista e
 * Backspace remove o último chip quando a busca está vazia. role=listbox
 * aria-multiselectable. Opcionalmente limita por `max`.
 */
export function MultiSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecione…",
  searchPlaceholder = "Buscar…",
  emptyText = "Nada encontrado.",
  max,
  disabled,
  invalid,
  className,
  contentClassName,
  container,
  ...aria
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(
    () => filterOptions(options, query),
    [options, query],
  );
  const selectedSet = useMemo(() => new Set(value), [value]);
  const selectedOptions = useMemo(
    () => options.filter((o) => selectedSet.has(o.value)),
    [options, selectedSet],
  );
  const atMax = max != null && value.length >= max;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(nextEnabledIndex(filtered, -1, 1));
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setActive((a) => {
      if (filtered.length === 0) return -1;
      if (a < 0 || a >= filtered.length || filtered[a]?.disabled) {
        return nextEnabledIndex(filtered, -1, 1);
      }
      return a;
    });
  }, [filtered]);

  function toggle(val: string) {
    if (selectedSet.has(val)) {
      onValueChange(value.filter((v) => v !== val));
    } else {
      if (atMax) return;
      onValueChange([...value, val]);
    }
  }

  function commit(idx: number) {
    const opt = filtered[idx];
    if (!opt || opt.disabled) return;
    if (atMax && !selectedSet.has(opt.value)) return;
    toggle(opt.value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => nextEnabledIndex(filtered, a, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => nextEnabledIndex(filtered, a, -1));
        break;
      case "Home":
        e.preventDefault();
        setActive(nextEnabledIndex(filtered, -1, 1));
        break;
      case "End":
        e.preventDefault();
        setActive(nextEnabledIndex(filtered, 0, -1));
        break;
      case "Enter":
        e.preventDefault();
        commit(active);
        break;
      case "Backspace":
        if (query === "" && value.length > 0) {
          e.preventDefault();
          onValueChange(value.slice(0, -1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }

  return (
    <RPopover.Root open={open} onOpenChange={setOpen}>
      <RPopover.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={aria["aria-label"]}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className={cn(
            triggerCls,
            invalid && "border-[var(--color-danger)]",
            className,
          )}
        >
          <span className="flex flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length === 0 ? (
              <span className="px-1 text-fg-subtle">{placeholder}</span>
            ) : (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[rgba(79,70,229,0.3)] bg-[rgba(79,70,229,0.14)] py-0.5 pl-2.5 pr-1 text-[0.8rem] font-medium text-fg"
                >
                  {opt.label}
                  {/* "remover chip": só visual (X decorativo). Evitamos aninhar
                      elemento interativo dentro do <button> do gatilho (HTML
                      inválido). Mouse remove pelo clique; AT remove desmarcando
                      o item na lista (role=option aria-selected). */}
                  <span
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(opt.value);
                    }}
                    className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-[rgba(79,70,229,0.3)] hover:text-fg"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
          </span>
          <ChevronsUpDown
            className="h-4 w-4 shrink-0 self-start text-fg-subtle"
            aria-hidden="true"
          />
        </button>
      </RPopover.Trigger>

      <RPopover.Portal container={container ?? undefined}>
        <RPopover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "dnex-pop z-[var(--z-popover)] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface-2)] shadow-[var(--shadow-lg)] glass-edge",
            contentClassName,
          )}
        >
          <div className="flex items-center gap-2 border-b border-line px-3 transition-colors focus-within:border-action">
            <Search
              className="h-4 w-4 shrink-0 text-fg-subtle"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              aria-autocomplete="list"
              aria-controls={listId}
              aria-activedescendant={
                active >= 0 ? `${listId}-opt-${active}` : undefined
              }
              className="h-11 w-full bg-transparent text-[0.92rem] text-fg placeholder:text-fg-subtle outline-none focus-visible:outline-none!"
            />
          </div>

          {max != null && (
            <p className="border-b border-line px-3 py-1.5 text-[0.72rem] text-fg-subtle">
              {value.length}/{max} selecionados
            </p>
          )}

          <ul
            id={listId}
            role="listbox"
            aria-multiselectable
            aria-label={aria["aria-label"] ?? "Opções"}
            className="max-h-64 overflow-y-auto p-1.5"
          >
            {filtered.length === 0 ? (
              <li
                role="presentation"
                className="px-3 py-6 text-center text-[0.88rem] text-fg-subtle"
              >
                {emptyText}
              </li>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = selectedSet.has(opt.value);
                const isActive = i === active;
                const blocked = atMax && !isSelected;
                return (
                  <li
                    key={opt.value}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || blocked || undefined}
                    onMouseEnter={() => !opt.disabled && setActive(i)}
                    onClick={() => commit(i)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center gap-2 rounded-[8px] py-2 pl-8 pr-3 text-[0.92rem] text-fg-muted outline-none",
                      isActive && "bg-[var(--surface-hover)] text-fg",
                      isSelected && "text-fg",
                      (opt.disabled || blocked) &&
                        "pointer-events-none opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-2 inline-flex h-4 w-4 items-center justify-center rounded-[4px] border",
                        isSelected
                          ? "border-action bg-action"
                          : "border-line-strong bg-[var(--surface)]",
                      )}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <Check
                          className="h-3 w-3 text-fg-on-action"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}

export type { ComboOption } from "./comboboxShared";
