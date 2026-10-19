import type { IllustrationProps } from "./illoBase";
import { ILLO, IlloFrame, NexusMark } from "./illoBase";

/**
 * 404 — rota perdida: um chevron do nexo "desviou" do caminho. Trilha tracejada
 * índigo que se rompe; o nexo âmbar fora do trilho marca o ponto perdido.
 */
export function Illustration404({ size, className, title = "Página não encontrada" }: IllustrationProps) {
  return (
    <IlloFrame size={size} className={className} title={title}>
      {(ids) => (
        <>
          <circle cx={100} cy={100} r={66} fill={`url(#${ids.glow})`} />

          {/* anel-mapa de fundo */}
          <circle cx={100} cy={100} r={58} fill="var(--surface)" stroke="var(--line-strong)" strokeWidth={1.5} />
          <circle cx={100} cy={100} r={58} fill={`url(#${ids.gridA})`} />

          {/* trilha pretendida (tracejada) que se rompe */}
          <path
            d="M56 132 Q80 96 104 104 Q124 110 138 80"
            fill="none"
            stroke={ILLO.indigoSoft}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="2 11"
            strokeOpacity={0.85}
          />
          {/* pino de origem */}
          <circle cx={56} cy={132} r={6} fill="var(--surface-2)" stroke={ILLO.indigo} strokeWidth={3} />

          {/* "404" estilizado em barras geométricas, discreto */}
          <g opacity={0.9} transform="translate(64 62)">
            <path d="M0 22 L12 0 L12 30 M0 22 L18 22" stroke={ILLO.indigo} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x={30} y={4} width={14} height={26} rx={7} fill="none" stroke={ILLO.indigoSoft} strokeWidth={4} />
            <path d="M56 22 L68 0 L68 30 M56 22 L74 22" stroke={ILLO.indigo} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>

          {/* nexo desviado, fora do trilho */}
          <NexusMark x={120} y={118} s={0.8} amberId={ids.soft} />
        </>
      )}
    </IlloFrame>
  );
}
