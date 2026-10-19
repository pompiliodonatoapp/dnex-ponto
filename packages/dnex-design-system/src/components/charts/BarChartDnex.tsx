import { useReducedMotion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { axisTick, useChartTheme } from "./chartTheme";
import { referenceLineElements, yAxisScaleProps } from "./cartesianScale";
import type { CartesianScaleProps } from "./cartesianScale";

export type BarSeries<T> = {
  dataKey: keyof T & string;
  name?: string;
  color?: string;
};

export type BarChartDnexProps<T extends Record<string, unknown>> = CartesianScaleProps & {
  data: T[];
  xKey: keyof T & string;
  series: BarSeries<T>[];
  /** Empilha as séries (default false = agrupadas). */
  stacked?: boolean;
  height?: number;
  valueFormatter?: (v: number) => string;
  className?: string;
};

/**
 * BarChartDnex — barras com cantos arredondados, grid horizontal sutil, sem
 * linhas verticais. Multi-série agrupada ou empilhada. Cores da paleta
 * categórica (índigo dominante; âmbar só na série de destaque). Responsivo.
 * Mesmo contrato de escala do LineChartDnex (`yDomain`, `yTicks`,
 * `referenceLines`): fixe o eixo em métricas limitadas (%, notas, índices).
 * Sem animação sob `prefers-reduced-motion`.
 */
export function BarChartDnex<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  stacked = false,
  height = 240,
  valueFormatter,
  className,
  yDomain,
  yTicks,
  referenceLines,
}: BarChartDnexProps<T>) {
  const t = useChartTheme();
  const reduceMotion = useReducedMotion();

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={4} barCategoryGap="22%">
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={axisTick(t)}
            tickLine={false}
            axisLine={{ stroke: t.axis }}
            dy={6}
          />
          <YAxis
            tick={axisTick(t)}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined}
            {...yAxisScaleProps({ yDomain, yTicks })}
          />
          <Tooltip
            cursor={{ fill: t.grid }}
            content={<ChartTooltip valueFormatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />}
          />
          {referenceLineElements(referenceLines, t)}
          {series.map((sr, i) => (
            <Bar
              key={sr.dataKey}
              dataKey={sr.dataKey}
              name={sr.name ?? sr.dataKey}
              fill={sr.color ?? t.categorical[i % t.categorical.length]}
              radius={[6, 6, 0, 0]}
              stackId={stacked ? "stack" : undefined}
              maxBarSize={48}
              isAnimationActive={!reduceMotion}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
