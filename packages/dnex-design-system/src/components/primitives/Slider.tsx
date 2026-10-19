import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as RSlider from "@radix-ui/react-slider";
import { cn } from "../../lib/cn";

type RadixSliderProps = ComponentPropsWithoutRef<typeof RSlider.Root>;

type SliderBaseProps = Omit<
  RadixSliderProps,
  "value" | "defaultValue" | "onValueChange" | "onValueCommit" | "aria-label"
> & {
  /** Formata o valor exibido no badge acima de cada thumb. */
  valueFormatter?: (value: number) => ReactNode;
  /** Mostra o valor atual num badge acima de cada thumb (no hover/foco). */
  showValue?: boolean;
};

/**
 * Thumbs renderizados a partir dos valores atuais — o badge recebe o valor por
 * prop (sem ler o DOM), então é determinístico e re-renderiza ao arrastar.
 */
function Thumbs({
  values,
  formatter,
  showValue,
  thumbLabel,
}: {
  values: number[];
  formatter: (v: number) => ReactNode;
  showValue: boolean;
  thumbLabel: (i: number) => string;
}) {
  return (
    <>
      <RSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-[var(--radius-pill)] bg-[var(--line-strong)]">
        <RSlider.Range className="absolute h-full rounded-[var(--radius-pill)] bg-action" />
      </RSlider.Track>
      {values.map((v, i) => (
        <RSlider.Thumb
          key={i}
          aria-label={thumbLabel(i)}
          className={cn(
            "group relative block h-5 w-5 rounded-full border-2 border-action bg-[var(--surface)] shadow-[var(--shadow-sm)] outline-none transition-transform",
            "hover:scale-110 focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {showValue && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap",
                "rounded-[7px] border border-line bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[0.72rem] text-fg shadow-[var(--shadow-sm)]",
                "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100",
              )}
            >
              {formatter(v)}
            </span>
          )}
        </RSlider.Thumb>
      ))}
    </>
  );
}

const rootBase =
  "relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50";

/**
 * Slider — controle de valor único sobre Radix Slider. Trilha índigo, thumb com
 * anel de foco (âmbar via :focus-visible global) e badge opcional do valor.
 * Controlado por number simples; para intervalo use <RangeSlider>.
 */
export type SliderProps = SliderBaseProps & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  /** Rótulo acessível do thumb. */
  "aria-label"?: string;
};

export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  {
    value,
    defaultValue = 0,
    onValueChange,
    onValueCommit,
    valueFormatter = (v) => String(v),
    showValue = false,
    className,
    min = 0,
    max = 100,
    ...props
  },
  ref,
) {
  const label = props["aria-label"] ?? "Valor";
  // Para os badges precisamos dos valores atuais; se controlado, usamos `value`,
  // senão refletimos o defaultValue (o badge é decorativo, aparece no hover/foco).
  const current = value ?? defaultValue;
  return (
    <RSlider.Root
      ref={ref}
      className={cn(rootBase, className)}
      min={min}
      max={max}
      value={value != null ? [value] : undefined}
      defaultValue={value == null ? [defaultValue] : undefined}
      onValueChange={(v) => onValueChange?.(v[0]!)}
      onValueCommit={(v) => onValueCommit?.(v[0]!)}
      {...props}
    >
      <Thumbs
        values={[current]}
        formatter={valueFormatter}
        showValue={showValue}
        thumbLabel={() => label}
      />
    </RSlider.Root>
  );
});

/**
 * RangeSlider — dois thumbs definindo um intervalo [mín, máx]. Mesma trilha do
 * Slider; útil para faixas de valor (preço, percentuais, nº). minStepsBetweenThumbs=1
 * impede os thumbs de se cruzarem.
 */
export type RangeSliderProps = SliderBaseProps & {
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  onValueCommit?: (value: [number, number]) => void;
  /** Rótulos acessíveis dos dois thumbs [início, fim]. */
  thumbLabels?: [string, string];
};

export const RangeSlider = forwardRef<HTMLSpanElement, RangeSliderProps>(
  function RangeSlider(
    {
      value,
      defaultValue = [0, 100],
      onValueChange,
      onValueCommit,
      valueFormatter = (v) => String(v),
      showValue = false,
      thumbLabels = ["Início do intervalo", "Fim do intervalo"],
      className,
      min = 0,
      max = 100,
      ...props
    },
    ref,
  ) {
    const current = value ?? defaultValue;
    return (
      <RSlider.Root
        ref={ref}
        className={cn(rootBase, className)}
        min={min}
        max={max}
        value={value}
        defaultValue={value == null ? defaultValue : undefined}
        minStepsBetweenThumbs={1}
        onValueChange={(v) => onValueChange?.([v[0]!, v[1]!])}
        onValueCommit={(v) => onValueCommit?.([v[0]!, v[1]!])}
        {...props}
      >
        <Thumbs
          values={[current[0], current[1]]}
          formatter={valueFormatter}
          showValue={showValue}
          thumbLabel={(i) => thumbLabels[i] ?? `Thumb ${i + 1}`}
        />
      </RSlider.Root>
    );
  },
);
