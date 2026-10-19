import { forwardRef, useId, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { CalendarDays } from "lucide-react";
import type { Matcher } from "react-day-picker";
import { cn } from "../../lib/cn";
import { Input } from "../primitives/Input";
import { Calendar } from "../composed/Calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "../composed/Popover";
import {
  formatDateBR,
  isValidDateBR,
  maskDateBR,
  onlyDigits,
  parseDateBR,
} from "../../lib/br";

/**
 * DateInputBR — campo de data digitável `dd/mm/aaaa` com validação de data REAL
 * (rejeita 31/02 etc.) e, opcionalmente, um botão que abre o <Calendar> do DS.
 * -----------------------------------------------------------------------------
 * Controlado em STRING MASCARADA (`value` = "29/02/2024"). A validação só acusa
 * erro com os 8 dígitos preenchidos. Não duplica o Calendar — REUSA o composto
 * existente dentro de um Popover; escolher um dia escreve a data mascarada de
 * volta no campo.
 *
 * - `withCalendar` (padrão true): mostra o botão de calendário à direita.
 * - `disabledDays`: repassado ao Calendar (ex.: { before: new Date() }).
 * Mono (assinatura fiscal), ARIA acessível, mensagem própria quando standalone.
 */
export type DateInputBRProps = {
  /** Data mascarada (ex.: "29/02/2024"). */
  value?: string;
  /** Recebe o valor mascarado a cada digitação ou escolha no calendário. */
  onChange?: (masked: string) => void;
  /** Força o estado de erro externamente (ex.: vindo do FormControl). */
  invalid?: boolean;
  /** Esconde a mensagem de validação própria (quando o Form cuida do erro). */
  hideMessage?: boolean;
  /** Texto de erro próprio (padrão: "Data inválida."). */
  errorMessage?: string;
  /** Mostra o botão que abre o Calendar (padrão: true). */
  withCalendar?: boolean;
  /** Dias desabilitados no Calendar (ex.: { before: new Date() }). */
  disabledDays?: Matcher | Matcher[];
  /** Rótulo do botão de calendário (acessibilidade). */
  calendarLabel?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "maxLength"
>;

export const DateInputBR = forwardRef<HTMLInputElement, DateInputBRProps>(
  function DateInputBR(
    {
      value = "",
      onChange,
      invalid,
      hideMessage,
      errorMessage = "Data inválida.",
      withCalendar = true,
      disabledDays,
      calendarLabel = "Abrir calendário",
      className,
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const autoId = useId();
    const msgId = `${id ?? autoId}-date-msg`;

    const complete = onlyDigits(value).length === 8;
    const ownInvalid = complete && !isValidDateBR(value);
    const showInvalid = invalid || ownInvalid;
    const showOwnMessage = !hideMessage && ownInvalid;
    const selected = parseDateBR(value) ?? undefined;

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      onChange?.(maskDateBR(e.target.value));
    }

    return (
      <div className="space-y-1.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div className="relative">
              <Input
                ref={ref}
                id={id}
                mono
                inputMode="numeric"
                autoComplete="off"
                invalid={showInvalid}
                value={value}
                onChange={handleChange}
                placeholder="dd/mm/aaaa"
                aria-describedby={
                  cn(describedBy, showOwnMessage && msgId) || undefined
                }
                className={cn(withCalendar && "pr-11", className)}
                {...props}
              />
              {withCalendar && (
                <PopoverTrigger
                  type="button"
                  aria-label={calendarLabel}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[8px] text-fg-muted outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]"
                >
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </PopoverTrigger>
              )}
            </div>
          </PopoverAnchor>

          {withCalendar && (
            <PopoverContent aria-label="Calendário" className="p-3">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(d) => {
                  onChange?.(formatDateBR(d));
                  setOpen(false);
                }}
                disabled={disabledDays}
                defaultMonth={selected}
                autoFocus
              />
            </PopoverContent>
          )}
        </Popover>

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
