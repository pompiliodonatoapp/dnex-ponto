import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { cn } from "../../lib/cn";

/**
 * Calendar — react-day-picker v9 tematizado 100% na marca DNEX.
 * -----------------------------------------------------------------------------
 * - Seleção em índigo (ação), "hoje" marcado em âmbar (acento, com avareza).
 * - Dias e números do header em IBM Plex Mono (assinatura fiscal da marca).
 * - Dark/light automático (tudo via tokens semânticos --surface/--fg/--action…).
 * - Locale pt-BR (semana começa no domingo, nomes em português).
 * - Acessível: o próprio DayPicker entrega navegação por teclado + ARIA (grid,
 *   gridcell, aria-selected, aria-label dos dias). Foco visível herda o outline
 *   âmbar global (.focus-visible do theme.css).
 *
 * `mode` controla seleção: "single" (padrão) | "range" | "multiple". Repassa
 * todas as props do DayPicker — `selected`, `onSelect`, `disabled`, `month`…
 *
 * Estilo: react-day-picker v9 expõe classes via a prop `classNames` (chaveada
 * pelos nomes de UI). NÃO importamos o CSS padrão da lib; todo o visual vem
 * daqui + do bloco escopado `.dnex-rdp` em theme.css (para os estados de range
 * que precisam de pseudo-elemento). Zero valor mágico de cor: tudo em token.
 */
export type CalendarProps = DayPickerProps & {
  className?: string;
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      // Setas de navegação na marca (substituem os SVG padrão da lib).
      // Só repassamos className; demais props da lib (size/disabled) não vão
      // para o SVG do lucide para evitar atributos inválidos no DOM.
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ),
      }}
      className={cn("dnex-rdp font-mono", className)}
      classNames={{
        // Container
        root: "text-fg",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "space-y-3",
        month_caption: "flex h-9 items-center justify-center px-9",
        caption_label:
          "font-display text-[0.95rem] font-semibold capitalize tracking-tight text-fg",
        // Navegação (mês anterior/seguinte)
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "grid h-8 w-8 place-items-center rounded-[8px] text-fg-muted outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] disabled:opacity-30 disabled:pointer-events-none",
        button_next:
          "grid h-8 w-8 place-items-center rounded-[8px] text-fg-muted outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] disabled:opacity-30 disabled:pointer-events-none",
        // Grade — react-day-picker v9 renderiza uma <table> (border-collapse);
        // mantemos o layout de tabela (NÃO usar flex em tr/td) e dimensionamos
        // as células por largura/altura. day_button é o alvo interativo (flex).
        month_grid: "w-full border-collapse",
        weekdays: "",
        weekday:
          "h-8 w-9 text-[0.66rem] font-medium uppercase tracking-[0.06em] text-fg-subtle",
        week: "",
        // Célula do dia (td)
        day: "dnex-rdp-cell h-9 w-9 p-0 text-center text-[0.8rem]",
        day_button:
          "mx-auto flex h-9 w-9 items-center justify-center rounded-[9px] text-fg outline-none transition-colors hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
        // Estados
        today: "dnex-rdp-today font-semibold text-accent",
        selected: "dnex-rdp-selected",
        outside: "text-fg-subtle opacity-50",
        disabled: "text-fg-subtle opacity-30 pointer-events-none",
        hidden: "invisible",
        // Range
        range_start: "dnex-rdp-range-start",
        range_end: "dnex-rdp-range-end",
        range_middle: "dnex-rdp-range-middle",
        ...classNames,
      }}
      {...props}
    />
  );
}
