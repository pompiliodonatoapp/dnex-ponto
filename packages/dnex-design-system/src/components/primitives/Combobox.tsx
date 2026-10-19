import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import * as RPopover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  filterOptions,
  nextEnabledIndex,
  type ComboOption,
} from "./comboboxShared";

export type ComboboxProps = {
  /** Valor selecionado (controlado). undefined = nada selecionado. */
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  /** Placeholder do campo de busca dentro do painel. */
  searchPlaceholder?: string;
  /** Texto quando a busca não retorna nada. */
  emptyText?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  /** Largura do painel; por padrão acompanha o gatilho. */
  contentClassName?: string;
  /** Nó-alvo do Portal (ex.: frame de device). */
  container?: HTMLElement | null;
  "aria-label"?: string;
};

const triggerCls =
  "inline-flex h-11 w-full items-center justify-between gap-2 rounded-[var(--radius-control)] " +
  "border border-line bg-[var(--surface)] px-3.5 text-[0.95rem] text-fg " +
  "transition-colors duration-200 outline-none " +
  "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Combobox — select com busca. Filtragem própria (sem cmdk), tolerante a
 * acentos/caixa. Teclado completo: ↑/↓ navegam, Enter seleciona, Esc fecha,
 * Home/End vão aos extremos. Acessível: role=listbox/option, aria-activedescendant,
 * aria-selected. Construído sobre o Popover (Radix) já presente no DS.
 */
export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Selecione…",
  searchPlaceholder = "Buscar…",
  emptyText = "Nada encontrado.",
  disabled,
  invalid,
  className,
  contentClassName,
  container,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(
    () => filterOptions(options, query),
    [options, query],
  );

  const selected = options.find((o) => o.value === value);

  // Ao abrir: limpa busca, foca o input e posiciona o realce no item atual.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const idx = filtered.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : nextEnabledIndex(filtered, -1, 1));
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reposiciona o realce quando a lista filtrada muda (mantém num índice válido).
  useEffect(() => {
    setActive((a) => {
      if (filtered.length === 0) return -1;
      if (a < 0 || a >= filtered.length || filtered[a]?.disabled) {
        return nextEnabledIndex(filtered, -1, 1);
      }
      return a;
    });
  }, [filtered]);

  function commit(idx: number) {
    const opt = filtered[idx];
    if (!opt || opt.disabled) return;
    onValueChange?.(opt.value);
    setOpen(false);
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
          <span className={cn("truncate", !selected && "text-fg-subtle")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown
            className="h-4 w-4 shrink-0 text-fg-subtle"
            aria-hidden="true"
          />
        </button>
      </RPopover.Trigger>

      <RPopover.Portal container={container ?? undefined}>
        <RPopover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          // mantém o foco no nosso input; o Radix não rouba o foco inicial
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "dnex-pop z-[var(--z-popover)] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface-2)] shadow-[var(--shadow-lg)] glass-edge",
            contentClassName,
          )}
        >
          {/* campo de busca */}
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

          {/* lista */}
          <ul
            id={listId}
            role="listbox"
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
                const isSelected = opt.value === value;
                const isActive = i === active;
                return (
                  <li
                    key={opt.value}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    onMouseEnter={() => !opt.disabled && setActive(i)}
                    onClick={() => commit(i)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center gap-2 rounded-[8px] py-2 pl-8 pr-3 text-[0.92rem] text-fg-muted outline-none",
                      isActive && "bg-[var(--surface-hover)] text-fg",
                      isSelected && "text-fg",
                      opt.disabled && "pointer-events-none opacity-40",
                    )}
                  >
                    {isSelected && (
                      <Check
                        className="absolute left-2 h-4 w-4 text-[var(--tone-action-fg)]"
                        aria-hidden="true"
                      />
                    )}
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
