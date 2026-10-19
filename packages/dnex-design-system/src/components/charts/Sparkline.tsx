import { useId } from "react";
import { color, semantic } from "../../tokens/tokens";
import { useTheme } from "../../lib/theme";

export type SparklineTrend = "up" | "down" | "neutral" | "auto";

export type SparklineProps = {
  /** Série de números (>= 2 pontos). Ex.: receita dos últimos 7 dias. */
  data: number[];
  width?: number;
  height?: number;
  /** linha (default) ou área preenchida (gradiente). */
  variant?: "line" | "area";
  /**
   * Cor por tendência:
   *  - "auto" (default): verde se o último >= primeiro, vermelho se cai;
   *  - "up"/"down": força sucesso/perigo;
   *  - "neutral": índigo de ação (sem juízo de valor).
   */
  trend?: SparklineTrend;
  /** Cor explícita (sobrepõe `trend`). */
  stroke?: string;
  strokeWidth?: number;
  /** Marca o último ponto com um dot. */
  showDot?: boolean;
  className?: string;
  /** Rótulo acessível (sr-only). Default: descreve a tendência. */
  ariaLabel?: string;
};

/**
 * Sparkline — mini-gráfico inline (~120×32), sem eixos, grid ou tooltip. SVG puro
 * (zero deps de chart), nítido em qualquer DPR, cor por tendência vinda dos
 * tokens. Pensado para caber em StatCard, célula de tabela ou ao lado de um KPI.
 * Reage ao tema (verde/vermelho/índigo resolvidos por tema). role="img" + label.
 */
export function Sparkline({
  data,
  width = 120,
  height = 32,
  variant = "line",
  trend = "auto",
  stroke,
  strokeWidth = 2,
  showDot = true,
  className,
  ariaLabel,
}: SparklineProps) {
  const { resolvedTheme } = useTheme();
  const s = resolvedTheme === "light" ? semantic.light : semantic.dark;
  const gid = useId().replace(/:/g, "");

  // Resolve a direção real (para "auto" e para o rótulo acessível).
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const realTrend: Exclude<SparklineTrend, "auto"> =
    trend !== "auto" ? trend : last > first ? "up" : last < first ? "down" : "neutral";

  const trendColor =
    stroke ??
    (realTrend === "up"
      ? color.status.success
      : realTrend === "down"
        ? color.status.danger
        : s.action);

  // Geometria: padding interno p/ o stroke e o dot não vazarem da viewBox.
  const pad = strokeWidth + 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  // Domínio Y robusto: se a série for plana, evita divisão por zero (linha central).
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const n = data.length;

  const pts = data.map((v, i) => {
    const x = pad + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = pad + innerH - ((v - min) / span) * innerH;
    return { x, y };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const areaPath =
    `${linePath} L${pts[pts.length - 1]!.x.toFixed(2)} ${(height - pad).toFixed(2)}` +
    ` L${pts[0]!.x.toFixed(2)} ${(height - pad).toFixed(2)} Z`;

  const lastPt = pts[pts.length - 1]!;
  const fillId = `dnex-spark-${gid}`;

  const trendWord = realTrend === "up" ? "em alta" : realTrend === "down" ? "em queda" : "estável";
  const label = ariaLabel ?? `Tendência ${trendWord}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      role="img"
      aria-label={label}
      className={className}
      style={{ display: "block", overflow: "visible" }}
    >
      {variant === "area" && (
        <>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity={0.28} />
              <stop offset="100%" stopColor={trendColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${fillId})`} />
        </>
      )}
      <path
        d={linePath}
        stroke={trendColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDot && (
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={strokeWidth + 0.5}
          fill={trendColor}
          stroke={s.surface}
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}
