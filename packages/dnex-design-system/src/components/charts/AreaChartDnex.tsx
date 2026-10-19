import { useId } from "react";
import { useReducedMotion } from "motion/react";
import {
  Area,
  AreaChart,
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

export type AreaChartDnexProps<T extends Record<string, unknown>> = CartesianScaleProps & {
  data: T[];
  /** Chave do eixo X (categoria/data). */
  xKey: keyof T & string;
  /** Chave da série a desenhar. */
  dataKey: keyof T & string;
  /** Nome legível da série (tooltip). */
  name?: string;
  height?: number;
  /** Formata os valores no tooltip e eixo Y. */
  valueFormatter?: (v: number) => string;
  className?: string;
};

/**
 * AreaChartDnex — área preenchida com gradiente índigo (forte no topo →
 * transparente). Grid sutil, eixos discretos, números em mono. Sempre dentro de
 * ResponsiveContainer (largura 100% do pai). Reage ao tema via useChartTheme.
 * Mesmo contrato de escala do LineChartDnex (`yDomain`, `yTicks`,
 * `referenceLines`): fixe o eixo em métricas limitadas (%, notas, índices).
 * Sem animação sob `prefers-reduced-motion`.
 */
export function AreaChartDnex<T extends Record<string, unknown>>({
  data,
  xKey,
  dataKey,
  name,
  height = 240,
  valueFormatter,
  className,
  yDomain,
  yTicks,
  referenceLines,
}: AreaChartDnexProps<T>) {
  const t = useChartTheme();
  const reduceMotion = useReducedMotion();
  const gid = useId().replace(/:/g, "");
  const fillId = `dnex-area-${gid}`;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.action} stopOpacity={0.45} />
              <stop offset="100%" stopColor={t.action} stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            cursor={{ stroke: t.axis, strokeWidth: 1 }}
            content={<ChartTooltip valueFormatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />}
          />
          {referenceLineElements(referenceLines, t)}
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name ?? String(dataKey)}
            stroke={t.action}
            strokeWidth={2.5}
            fill={`url(#${fillId})`}
            activeDot={{ r: 4, fill: t.action, stroke: t.surface, strokeWidth: 2 }}
            isAnimationActive={!reduceMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
