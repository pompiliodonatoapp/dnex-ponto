import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { useChartTheme } from "./chartTheme";

export type DonutSlice = {
  name: string;
  value: number;
  /** Cor explícita (hex). Default: paleta categórica. */
  color?: string;
  /** Informação auxiliar na legenda, ex.: "8 contratos" ou "R$ 9.684". */
  meta?: string;
};

export type DonutChartDnexProps = {
  data: DonutSlice[];
  height?: number;
  /** Texto grande no centro (ex.: total). Mostrado em mono. */
  centerValue?: string;
  /** Rótulo pequeno abaixo do valor central. */
  centerLabel?: string;
  valueFormatter?: (v: number) => string;
  /** Exibe o percentual de participação de cada fatia na legenda. */
  showPercent?: boolean;
  /** Legenda lateral no desktop ou empilhada abaixo da rosca. */
  legendPosition?: "right" | "bottom";
  /** Texto acessível para leitores de tela. */
  ariaLabel?: string;
  /** Estado vazio quando todos os valores são zero. */
  emptyLabel?: string;
  className?: string;
};

/**
 * DonutChartDnex — rosca com paleta categórica (índigo dominante, âmbar de
 * destaque), miolo vazado com valor central grande em mono + rótulo. Legenda
 * própria (chips) à direita/abaixo conforme o espaço. Responsivo; reage ao tema.
 */
export function DonutChartDnex({
  data,
  height = 240,
  centerValue,
  centerLabel,
  valueFormatter,
  showPercent = false,
  legendPosition = "right",
  ariaLabel = "Composição dos dados",
  emptyLabel = "Sem dados para compor o gráfico.",
  className,
}: DonutChartDnexProps) {
  const t = useChartTheme();
  const total = data.reduce((acc, d) => acc + Math.max(0, d.value), 0);
  const colored = data.map((d, i) => {
    const value = Math.max(0, d.value);
    return {
      ...d,
      value,
      fill: d.color ?? t.categorical[i % t.categorical.length],
      percent: total > 0 ? value / total : 0,
    };
  });
  const stacked = legendPosition === "bottom";

  return (
    <div className={className}>
      <figure
        className={stacked ? "flex flex-col items-center gap-5" : "flex flex-col items-center gap-5 sm:flex-row"}
        aria-label={ariaLabel}
      >
        <div className="relative mx-auto" style={{ width: "100%", maxWidth: 260, height, containerType: "inline-size" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {total > 0 ? (
                  <Pie
                    data={colored}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="64%"
                    outerRadius="92%"
                    paddingAngle={5}
                    cornerRadius={12}
                    stroke={t.surface}
                    strokeWidth={4}
                    isAnimationActive={false}
                  >
                    {colored.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
              ) : (
                <Pie
                  data={[{ name: emptyLabel, value: 1, fill: t.grid }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="64%"
                  outerRadius="92%"
                  stroke={t.surface}
                  strokeWidth={4}
                  isAnimationActive={false}
                >
                  <Cell fill={t.grid} />
                </Pie>
              )}
              {total > 0 && (
                <Tooltip
                  content={<ChartTooltip valueFormatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          {(centerValue || centerLabel) && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {centerValue && (
                <span
                  className="max-w-[62%] text-center font-mono font-semibold leading-tight text-[var(--fg)]"
                  style={{ fontSize: `clamp(0.875rem, ${Math.min(18, 92 / centerValue.length)}cqi, 2.85rem)`, overflowWrap: "anywhere" }}
                >
                  {centerValue}
                </span>
              )}
              {centerLabel && (
                <span className="mt-2 max-w-28 text-center text-[0.82rem] leading-snug text-[var(--fg-subtle)]">
                  {centerLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <figcaption className="sr-only">
          {colored.map((d) => `${d.name}: ${valueFormatter ? valueFormatter(d.value) : d.value.toLocaleString("pt-BR")}`).join("; ")}
        </figcaption>

        <ul className={stacked ? "grid w-full gap-3 sm:grid-cols-2" : "flex w-full flex-1 flex-col gap-3"}>
          {colored.map((d) => (
            <li key={d.name} className="flex min-h-11 items-center gap-3">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: d.fill }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.92rem] font-medium text-[var(--fg-muted)]">{d.name}</span>
                {d.meta ? <span className="block truncate text-[0.76rem] text-[var(--fg-subtle)]">{d.meta}</span> : null}
              </span>
              <span className="ml-auto flex shrink-0 flex-col items-end">
                <span className="font-mono text-[0.9rem] font-semibold text-[var(--fg)]">
                  {showPercent ? `${Math.round(d.percent * 100)}%` : valueFormatter ? valueFormatter(d.value) : d.value.toLocaleString("pt-BR")}
                </span>
                {showPercent ? (
                  <span className="font-mono text-[0.76rem] text-[var(--fg-subtle)]">
                    {valueFormatter ? valueFormatter(d.value) : d.value.toLocaleString("pt-BR")}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </figure>
    </div>
  );
}
