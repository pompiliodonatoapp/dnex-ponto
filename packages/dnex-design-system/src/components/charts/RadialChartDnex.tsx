import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "./chartTheme";

export type RadialTrack = {
  name: string;
  /** Valor 0..max (default max=100). */
  value: number;
  color?: string;
};

export type RadialChartDnexProps = {
  data: RadialTrack[];
  max?: number;
  height?: number;
  /** Valor grande no centro (mono). */
  centerValue?: string;
  centerLabel?: string;
  className?: string;
};

/**
 * RadialChartDnex — barras radiais (anéis concêntricos) para progresso/metas.
 * Trilho de fundo sutil + barra colorida arredondada; paleta categórica. Valor
 * central opcional em mono. Sempre dentro de ResponsiveContainer. Reage ao tema.
 *
 * PolarAngleAxis com domínio [0,max] e range [90,-270] faz a barra preencher o
 * círculo proporcionalmente ao valor (anel de progresso).
 */
export function RadialChartDnex({
  data,
  max = 100,
  height = 240,
  centerValue,
  centerLabel,
  className,
}: RadialChartDnexProps) {
  const t = useChartTheme();
  const colored = data.map((d, i) => ({
    ...d,
    fill: d.color ?? t.categorical[i % t.categorical.length],
  }));

  return (
    <div className={className} style={{ position: "relative", width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={colored}
          innerRadius="35%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={12}
        >
          <PolarAngleAxis type="number" domain={[0, max]} tick={false} axisLine={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={8}
            background={{ fill: t.grid }}
            isAnimationActive
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="font-mono text-[length:var(--text-h3)] font-semibold leading-none text-[var(--fg)]">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="mt-1 text-[0.7rem] uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
