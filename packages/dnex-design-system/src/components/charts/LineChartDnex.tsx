import { useReducedMotion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { axisTick, useChartTheme } from "./chartTheme";
import { referenceLineElements, yAxisScaleProps } from "./cartesianScale";
import type { CartesianScaleProps } from "./cartesianScale";

export type LineSeries<T> = {
  dataKey: keyof T & string;
  name?: string;
  /** Cor explícita (hex). Default: percorre a paleta categórica. */
  color?: string;
};

export type LineChartDnexProps<T extends Record<string, unknown>> = CartesianScaleProps & {
  data: T[];
  xKey: keyof T & string;
  /** Uma ou mais séries. Âmbar entra só na última (destaque), com avareza. */
  series: LineSeries<T>[];
  height?: number;
  valueFormatter?: (v: number) => string;
  className?: string;
  /**
   * Desenha um ponto em cada observação. Útil quando há poucas observações
   * (ex.: 6 meses) ou lacunas: a linha quebra no dado ausente (`null`) em vez
   * de interpolar, e o ponto mostra onde existe medição de fato. Default:
   * `false` (somente a curva, como antes).
   */
  showDots?: boolean;
};

/**
 * LineChartDnex — linha(s) suaves (monotone), grid sutil, pontos opcionais.
 * Multi-série: cores da paleta categórica (índigo dominante; âmbar reservado ao
 * destaque). ResponsiveContainer sempre. Reage ao tema e a
 * `prefers-reduced-motion` (sem animação de entrada quando o usuário pede
 * menos movimento — o Recharts não faz isso sozinho).
 *
 * Escala: para métricas limitadas (percentual 0–100, notas, índices) fixe
 * `yDomain` + `yTicks` e, se houver meta, `referenceLines`. É a regra de escala
 * honesta do DS: onde a comparação importa, o eixo não pode mudar com os dados.
 * Sem essas props o comportamento é o atual (eixo automático `[0, 'auto']`).
 *
 * @example
 * <LineChartDnex
 *   data={progresso} xKey="mes" series={[{ dataKey: "okr" }]}
 *   yDomain={[0, 100]} yTicks={[0, 25, 50, 75, 100]}
 *   valueFormatter={(v) => `${v}%`}
 *   referenceLines={[{ y: 100, label: "Meta" }]} showDots
 * />
 */
export function LineChartDnex<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 240,
  valueFormatter,
  className,
  yDomain,
  yTicks,
  referenceLines,
  showDots = false,
}: LineChartDnexProps<T>) {
  const t = useChartTheme();
  const reduceMotion = useReducedMotion();

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
          {series.map((sr, i) => {
            const c = sr.color ?? t.categorical[i % t.categorical.length];
            return (
              <Line
                key={sr.dataKey}
                type="monotone"
                dataKey={sr.dataKey}
                name={sr.name ?? sr.dataKey}
                stroke={c}
                strokeWidth={2.5}
                dot={showDots ? { r: 3.5, fill: c, stroke: t.surface, strokeWidth: 1.5 } : false}
                activeDot={{ r: 4, fill: c, stroke: t.surface, strokeWidth: 2 }}
                isAnimationActive={!reduceMotion}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
