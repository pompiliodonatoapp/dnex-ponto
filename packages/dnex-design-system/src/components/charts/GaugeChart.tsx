import { motion, useReducedMotion } from "motion/react";
import { color } from "../../tokens/tokens";
import { easeSoft } from "../../lib/motion";
import { useChartTheme } from "./chartTheme";

export type GaugeThreshold = {
  /** Início do segmento, no espaço de valor (>= min). */
  from: number;
  /** Cor do segmento (hex). */
  color: string;
  /** Rótulo opcional (não desenhado no arco; uso futuro/legenda). */
  label?: string;
};

export type GaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  /**
   * Faixas de cor do arco (do menor para o maior `from`). Se omitido, usa um
   * gradiente padrão índigo→âmbar em 3 faixas. O ponteiro herda a cor da faixa
   * onde o valor cai.
   */
  segments?: GaugeThreshold[];
  /** Rótulo abaixo do número (ex.: "Saúde fiscal"). */
  label?: string;
  /** Unidade ao lado do número (ex.: "%", "pts"). */
  unit?: string;
  /** Ângulo total do arco em graus (default 270 — quase círculo). */
  sweep?: number;
  /** Lado do quadrado de desenho em px. */
  size?: number;
  /** Formata o número central. Default: inteiro pt-BR. */
  valueFormatter?: (v: number) => string;
  className?: string;
};

const DEFAULT_SEGMENTS = (min: number, max: number): GaugeThreshold[] => {
  const span = max - min;
  return [
    { from: min, color: color.indigo[600] },
    { from: min + span * 0.5, color: color.indigo[400] },
    { from: min + span * 0.8, color: color.amber[500] },
  ];
};

/** Converte um valor no espaço [min,max] para ângulo (graus) no arco. */
function valueToAngle(v: number, min: number, max: number, start: number, sweep: number) {
  const ratio = Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  return start + ratio * sweep;
}

/** Ponto na circunferência (graus, 0° = leste, sentido horário em SVG y-down). */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Path de arco entre dois ângulos (graus). */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

/**
 * GaugeChart — velocímetro/gauge CUSTOM em SVG (sem libs de chart). Arco de
 * `sweep` graus (default 270°), faixas de cor índigo→âmbar, trilho de fundo
 * sutil, ponteiro animado e valor central grande em mono + min/max + label.
 *
 * Geometria: o arco é centrado e desenhado a partir do ângulo inicial
 * `start = 90 + (360 - sweep)/2` (graus SVG, y-down), varrendo `sweep` no
 * sentido horário — abertura embaixo, simétrica. Cada segmento vira um sub-arco
 * colorido; o ponteiro aponta para o ângulo do valor.
 *
 * Acessibilidade: `role="meter"` + aria-valuenow/min/max + aria-label.
 * Movimento: o ponteiro anima a rotação (easeSoft); em prefers-reduced-motion
 * (useReducedMotion) ele aparece já na posição final, sem transição.
 */
export function GaugeChart({
  value,
  min = 0,
  max = 100,
  segments,
  label,
  unit,
  sweep = 270,
  size = 220,
  valueFormatter,
  className,
}: GaugeChartProps) {
  const t = useChartTheme();
  const reduce = useReducedMotion();

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18; // margem p/ a espessura do traço
  const stroke = Math.max(10, size * 0.07);

  const start = 90 + (360 - sweep) / 2; // abertura simétrica embaixo
  const end = start + sweep;

  const segs = (segments && segments.length > 0 ? segments : DEFAULT_SEGMENTS(min, max))
    .filter((s) => s.from < max)
    .sort((a, b) => a.from - b.from);

  // Cor do ponteiro = cor da faixa onde o valor cai.
  const clamped = Math.min(max, Math.max(min, value));
  let needleColor = segs[0]?.color ?? t.action;
  for (const s of segs) if (clamped >= s.from) needleColor = s.color;

  const angle = valueToAngle(clamped, min, max, start, sweep);
  const needleLen = r - stroke * 0.4;

  const fmt = valueFormatter ?? ((v: number) => Math.round(v).toLocaleString("pt-BR"));

  return (
    <div
      className={className}
      role="meter"
      aria-label={label ? `${label}: ${fmt(clamped)}${unit ?? ""}` : "Indicador"}
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      style={{ position: "relative", maxWidth: size, marginInline: "auto" }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
        aria-hidden="true"
      >
        {/* trilho de fundo */}
        <path
          d={arcPath(cx, cy, r, start, end)}
          fill="none"
          stroke={t.grid}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* segmentos coloridos */}
        {segs.map((s, i) => {
          const a0 = valueToAngle(s.from, min, max, start, sweep);
          const next = segs[i + 1]?.from ?? max;
          const a1 = valueToAngle(next, min, max, start, sweep);
          if (a1 <= a0) return null;
          return (
            <path
              key={`${s.from}-${i}`}
              d={arcPath(cx, cy, r, a0, a1)}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              opacity={0.92}
            />
          );
        })}

        {/* ponteiro (rotaciona em torno do centro). Posição base aponta para
            `start` (0 de rotação); animamos até (angle - start) graus. */}
        <motion.g
          initial={reduce ? false : { rotate: 0 }}
          animate={{ rotate: angle - start }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, ease: easeSoft }}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transformBox: "view-box",
          }}
        >
          {/* o ponteiro desenhado apontando para `start` */}
          {(() => {
            const tip = polar(cx, cy, needleLen, start);
            const baseL = polar(cx, cy, stroke * 0.55, start + 90);
            const baseR = polar(cx, cy, stroke * 0.55, start - 90);
            return (
              <polygon
                points={`${tip.x},${tip.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}`}
                fill={needleColor}
              />
            );
          })()}
        </motion.g>

        {/* cubo central do ponteiro */}
        <circle cx={cx} cy={cy} r={stroke * 0.5} fill={needleColor} />
        <circle cx={cx} cy={cy} r={stroke * 0.5} fill="none" stroke={t.surface} strokeWidth={2} />

        {/* min / max nas extremidades do arco */}
        {(() => {
          const pMin = polar(cx, cy, r, start);
          const pMax = polar(cx, cy, r, end);
          return (
            <>
              <text
                x={pMin.x}
                y={pMin.y + stroke + 4}
                textAnchor="middle"
                fontFamily={t.fontMono}
                fontSize={size * 0.05}
                fill={t.fgSubtle}
              >
                {fmt(min)}
              </text>
              <text
                x={pMax.x}
                y={pMax.y + stroke + 4}
                textAnchor="middle"
                fontFamily={t.fontMono}
                fontSize={size * 0.05}
                fill={t.fgSubtle}
              >
                {fmt(max)}
              </text>
            </>
          );
        })()}
      </svg>

      {/* valor central + label — HTML sobreposto (usa tokens de fonte do DS),
          centrado sobre o miolo do arco (50% h, leve recuo p/ caber a label). */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-[35%] flex-col items-center">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[length:var(--text-kpi)] font-semibold leading-none text-[var(--fg)]">
            {fmt(clamped)}
          </span>
          {unit && (
            <span className="font-mono text-[length:var(--text-h3)] font-medium text-[var(--fg-muted)]">
              {unit}
            </span>
          )}
        </div>
        {label && (
          <span className="mt-2 text-center text-[0.72rem] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
