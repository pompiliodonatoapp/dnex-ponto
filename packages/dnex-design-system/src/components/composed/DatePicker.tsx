import { useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange, Matcher } from "react-day-picker";
import { cn } from "../../lib/cn";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

/**
 * DatePicker — campo de data do DS: um gatilho (estilo Input) que abre um
 * Popover com o <Calendar> da marca. Dois modos:
 *   - "single" (padrão): seleciona UMA data.  value: Date | undefined
 *   - "range": seleciona um INTERVALO.        value: DateRange | undefined
 *
 * Controlado: passe `value` + `onChange`. O componente é genérico no tipo do
 * valor conforme o `mode`, então o consumidor recebe o tipo certo no callback.
 *
 * Acessibilidade: o gatilho é um <button> rotulado (aria-label / aria-haspopup
 * via Radix Popover); o Calendar interno traz teclado e ARIA do react-day-picker.
 * Datas exibidas em mono (assinatura fiscal). Locale pt-BR.
 */

const triggerBase =
  "inline-flex h-11 w-full items-center gap-2.5 rounded-[var(--radius-control)] " +
  "border border-line bg-[var(--surface)] px-3.5 text-[0.95rem] text-fg outline-none " +
  "transition-colors duration-200 hover:border-line-strong " +
  "focus-visible:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

function Trigger({
  display,
  placeholder,
  invalid,
  disabled,
  empty,
  className,
}: {
  display: ReactNode;
  placeholder: string;
  invalid?: boolean;
  disabled?: boolean;
  empty: boolean;
  className?: string;
}) {
  return (
    <PopoverTrigger
      type="button"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        triggerBase,
        invalid &&
          "border-[var(--color-danger)] focus-visible:border-[var(--color-danger)] focus-visible:ring-[rgba(239,68,68,0.3)]",
        className,
      )}
    >
      <CalendarDays
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-fg-subtle"
      />
      <span
        className={cn(
          "truncate font-mono tracking-tight",
          empty && "text-fg-subtle",
        )}
      >
        {empty ? placeholder : display}
      </span>
    </PopoverTrigger>
  );
}

const fmt = (d: Date) => format(d, "dd MMM yyyy", { locale: ptBR });

/* ---------- Modo single ---------- */
export type DatePickerSingleProps = {
  mode?: "single";
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** Datas desabilitadas — repassado ao Calendar (ex.: { before: new Date() }). */
  disabledDays?: Matcher | Matcher[];
  className?: string;
  "aria-label"?: string;
};

/* ---------- Modo range ---------- */
export type DatePickerRangeProps = {
  mode: "range";
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  disabledDays?: Matcher | Matcher[];
  className?: string;
  "aria-label"?: string;
};

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

export function DatePicker(props: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const {
    placeholder = props.mode === "range"
      ? "Selecione um período"
      : "Selecione uma data",
    invalid,
    disabled,
    disabledDays,
    className,
  } = props;
  const ariaLabel = props["aria-label"];

  if (props.mode === "range") {
    const v = props.value;
    const empty = !v?.from;
    const display =
      v?.from && v?.to
        ? `${fmt(v.from)} — ${fmt(v.to)}`
        : v?.from
          ? `${fmt(v.from)} — …`
          : "";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Trigger
          display={display}
          placeholder={placeholder}
          invalid={invalid}
          disabled={disabled}
          empty={empty}
          className={className}
        />
        <PopoverContent
          aria-label={ariaLabel ?? "Calendário de período"}
          className="p-3"
        >
          <Calendar
            mode="range"
            selected={v}
            onSelect={(r) => {
              props.onChange?.(r);
              if (r?.from && r?.to) setOpen(false);
            }}
            disabled={disabledDays}
            numberOfMonths={1}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  const v = props.value;
  const empty = !v;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Trigger
        display={v ? fmt(v) : ""}
        placeholder={placeholder}
        invalid={invalid}
        disabled={disabled}
        empty={empty}
        className={className}
      />
      <PopoverContent
        aria-label={ariaLabel ?? "Calendário"}
        className="p-3"
      >
        <Calendar
          mode="single"
          selected={v}
          onSelect={(d) => {
            props.onChange?.(d);
            setOpen(false);
          }}
          disabled={disabledDays}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
