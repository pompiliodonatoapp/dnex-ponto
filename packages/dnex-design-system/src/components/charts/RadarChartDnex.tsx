import { useId } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { useChartTheme } from "./chartTheme";

export type RadarSeries<T> = {
  dataKey: keyof T & string;
  name?: string;
  /** Cor explícita (hex). Default: índigo dominante; âmbar reservado ao destaque. */
  color?: string;
};

export type RadarChartDnexProps<T extends Record<string, unknown>> = {
  data: T[];
  /** Chave do eixo angular (cada vértice do polígono — ex.: a competência). */
  angleKey: keyof T & string;
  /** Uma ou mais séries (cada uma vira um polígono preenchido). */
  series: RadarSeries<T>[];
  /** Teto do eixo radial. Default: auto (Recharts calcula pelo maior valor). */
  max?: number;
  height?: number;
  /** Esconde os números do eixo radial (default true — radar costuma ser comparativo). */
  hideRadiusAxis?: boolean;
  valueFormatter?: (v: number) => string;
  className?: string;
};

/**
 * RadarChartDnex — gráfico de radar (teia) na cara DNEX: índigo dominante, âmbar
 * só no slot de destaque (passe `color` na última série). Grid poligonal e eixos
 * sutis, rótulos angulares legíveis, tooltip custom reusado (dark/light). Sempre
 * dentro de ResponsiveContainer. Reage ao tema via useChartTheme.
 *
 * Uso típico: comparar perfis multi-dimensão (saúde fiscal por pilar, score por
 * área, antes×depois). A primeira série é a base; a de destaque vai por último.
 */
export function RadarChartDnex<T extends Record<string, unknown>>({
  data,
  angleKey,
  series,
  max,
  height = 280,
  hideRadiusAxis = true,
  valueFormatter,
  className,
}: RadarChartDnexProps<T>) {
  const t = useChartTheme();
  const gid = useId().replace(/:/g, "");

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} outerRadius="72%">
          <defs>
            {series.map((sr, i) => {
              const c = sr.color ?? t.categorical[i % t.categorical.length];
              return (
                <radialGradient key={sr.dataKey} id={`dnex-radar-${gid}-${i}`} cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor={c} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.32} />
                </radialGradient>
              );
            })}
          </defs>

          <PolarGrid stroke={t.grid} strokeWidth={1} />
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{ fill: t.fgMuted, fontSize: 11, fontFamily: t.fontSans }}
          />
          <PolarRadiusAxis
            domain={max != null ? [0, max] : undefined}
            tick={hideRadiusAxis ? false : { fill: t.fgSubtle, fontSize: 10, fontFamily: t.fontMono }}
            axisLine={false}
            tickCount={hideRadiusAxis ? undefined : 5}
            stroke={t.grid}
          />
          <Tooltip
            cursor={{ stroke: t.axis, strokeWidth: 1 }}
            content={<ChartTooltip valueFormatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />}
          />

          {series.map((sr, i) => {
            const c = sr.color ?? t.categorical[i % t.categorical.length];
            return (
              <Radar
                key={sr.dataKey}
                dataKey={sr.dataKey}
                name={sr.name ?? sr.dataKey}
                stroke={c}
                strokeWidth={2}
                fill={`url(#dnex-radar-${gid}-${i})`}
                fillOpacity={1}
                dot={{ r: 2.5, fill: c, stroke: t.surface, strokeWidth: 1 }}
                isAnimationActive
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
