import { motion, useReducedMotion } from "motion/react";
import { color } from "../../tokens/tokens";
import { easeSoft } from "../../lib/motion";

export type FunnelStage = {
  label: string;
  value: number;
  /** Cor opcional do segmento (sobrescreve o gradiente índigo→âmbar). */
  color?: string;
};

export type FunnelChartProps = {
  stages: FunnelStage[];
  /** Formata o valor de cada etapa. Default: inteiro pt-BR. */
  valueFormatter?: (v: number) => string;
  /** Altura de cada faixa em px. Default: 56. */
  bandHeight?: number;
  /** Mostra a % de conversão entre etapas consecutivas. Default: true. */
  showConversion?: boolean;
  /** % relativa: cada etapa vs. a anterior. Senão: vs. a primeira (topo). */
  conversionMode?: "previous" | "first";
  /** Rótulo acessível do gráfico inteiro. */
  ariaLabel?: string;
  className?: string;
};

const VIEW_W = 100; // sistema de coordenadas horizontal (%)

/** Interpola a paleta índigo→âmbar ao longo das etapas (âmbar só no fim). */
function stageColor(index: number, total: number): string {
  const ramp = [
    color.indigo[600],
    color.indigo[500],
    color.indigo[400],
    color.indigo[300],
    color.amber[500],
  ];
  if (total <= 1) return ramp[0]!;
  const pos = (index / (total - 1)) * (ramp.length - 1);
  return ramp[Math.round(pos)]!;
}

/** Rótulo sempre em navy escuro com halo claro (text-shadow), em vez de
 *  escolher branco/escuro pela cor da faixa: em etapas com valor baixo (ou
 *  zero) a faixa é forçada a uma largura mínima menor que o rótulo, então o
 *  texto sempre vaza para o fundo branco do card — uma única cor com halo é
 *  a única abordagem que funciona tanto sobre a faixa quanto fora dela. */
const LABEL_TEXT_STYLE = {
  color: "#1e1b4b",
  textShadow:
    "0 0 3px rgba(255,255,255,0.9), 0 0 6px rgba(255,255,255,0.7), 0 1px 1px rgba(255,255,255,0.9)",
} as const;

/**
 * FunnelChart — funil de conversão CUSTOM em SVG (sem libs de chart). Etapas em
 * faixas trapezoidais de largura decrescente, proporcionais ao valor, tingidas
 * índigo→âmbar (âmbar reservado à última etapa). Cada faixa anima a entrada
 * (escala vertical) respeitando prefers-reduced-motion. Entre etapas, exibe a %
 * de conversão.
 *
 * Acessibilidade: role="img" + aria-label resumido; uma tabela visualmente
 * oculta (sr-only) expõe rótulo/valor/conversão a leitores de tela.
 * Conteúdo deve ser ilustrativo.
 */
export function FunnelChart({
  stages,
  valueFormatter,
  bandHeight = 56,
  showConversion = true,
  conversionMode = "previous",
  ariaLabel,
  className,
}: FunnelChartProps) {
  const reduce = useReducedMotion();
  const fmt =
    valueFormatter ?? ((v: number) => Math.round(v).toLocaleString("pt-BR"));

  const max = Math.max(...stages.map((s) => s.value), 1);

  // Largura (em %) de cada faixa, no topo e na base (afunila até a próxima).
  const widthAt = (value: number) =>
    Math.max(8, (value / max) * VIEW_W); // mínimo 8% p/ legibilidade

  const conversionPct = (i: number): number | null => {
    if (i === 0) return null;
    const base =
      conversionMode === "first" ? stages[0]!.value : stages[i - 1]!.value;
    if (!base) return null;
    return (stages[i]!.value / base) * 100;
  };

  return (
    <div
      className={className}
      role="img"
      aria-label={
        ariaLabel ??
        `Funil de conversão com ${stages.length} etapas, de ${fmt(
          stages[0]?.value ?? 0,
        )} a ${fmt(stages[stages.length - 1]?.value ?? 0)}.`
      }
    >
      <div className="flex flex-col gap-2.5">
        {stages.map((stage, i) => {
          const topW = widthAt(stage.value);
          const next = stages[i + 1];
          const botW = next ? widthAt(next.value) : topW;
          const fill = stage.color ?? stageColor(i, stages.length);
          const pct = conversionPct(i);
          const stepPct = next && stage.value ? (next.value / stage.value) * 100 : null;

          // Trapézio centrado: pontos no espaço [0..VIEW_W] × [0..bandHeight].
          const topL = (VIEW_W - topW) / 2;
          const topR = (VIEW_W + topW) / 2;
          const botL = (VIEW_W - botW) / 2;
          const botR = (VIEW_W + botW) / 2;
          const points = `${topL},0 ${topR},0 ${botR},${bandHeight} ${botL},${bandHeight}`;

          return (
            <div key={stage.label} className="relative">
              {/* faixa do funil. A animação de entrada fica NESTA div (HTML):
                  whileInView depende de IntersectionObserver, que não dispara de
                  forma confiável em elementos geométricos DENTRO de <svg> (o
                  polygon ficava preso em opacity 0 para sempre). Animar o wrapper
                  também faz rótulo e faixa entrarem juntos. */}
              <motion.div
                className="relative"
                style={{ height: bandHeight }}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.45, delay: i * 0.08, ease: easeSoft }
                }
              >
                <svg
                  width="100%"
                  height={bandHeight}
                  viewBox={`0 0 ${VIEW_W} ${bandHeight}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  style={{ display: "block" }}
                >
                  <polygon points={points} fill={fill} opacity={0.95} />
                </svg>

                {/* rótulo + valor sobrepostos (HTML, usa tokens de fonte) */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                  <span
                    className="text-[0.78rem] font-medium leading-none"
                    style={LABEL_TEXT_STYLE}
                  >
                    {stage.label}
                  </span>
                  <span
                    className="mt-1 font-mono text-[0.95rem] font-semibold leading-none"
                    style={LABEL_TEXT_STYLE}
                  >
                    {fmt(stage.value)}
                  </span>
                </div>
              </motion.div>

              {/* conversão entre esta etapa e a próxima */}
              {showConversion && next && (
                <div className="flex items-center justify-center py-0.5">
                  <span
                    aria-hidden="true"
                    className="font-mono text-[0.72rem] text-fg-subtle"
                  >
                    ↓{" "}
                    {stepPct !== null
                      ? stepPct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })
                      : "—"}
                    %
                  </span>
                </div>
              )}

              {/* conversão acumulada vs. base (sr-only complementa a img) */}
              {pct !== null && (
                <span className="sr-only">
                  {stage.label}: {fmt(stage.value)} (
                  {pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% em
                  relação à etapa{" "}
                  {conversionMode === "first" ? "inicial" : "anterior"})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* sumário textual acessível */}
      <p className="sr-only">
        Etapa inicial {stages[0]?.label} com {fmt(stages[0]?.value ?? 0)}; etapa
        final {stages[stages.length - 1]?.label} com{" "}
        {fmt(stages[stages.length - 1]?.value ?? 0)}.
      </p>
    </div>
  );
}
