import type { IllustrationProps } from "./illoBase";
import { ILLO, IlloFrame, NexusMark } from "./illoBase";

/**
 * NoConnection — o "nexo" rompido: dois nós que deveriam se ligar, com o elo do
 * meio partido. Arcos de sinal índigo desligados; o ponto âmbar pisca isolado.
 */
export function IllustrationNoConnection({ size, className, title = "Sem conexão" }: IllustrationProps) {
  return (
    <IlloFrame size={size} className={className} title={title}>
      {(ids) => (
        <>
          <ellipse cx={100} cy={150} rx={64} ry={13} fill={`url(#${ids.glow})`} />

          {/* nó esquerdo */}
          <circle cx={56} cy={104} r={20} fill="var(--surface)" stroke={ILLO.indigoSoft} strokeWidth={2} />
          <circle cx={56} cy={104} r={9} fill={`url(#${ids.gridB})`} />
          {/* nó direito */}
          <circle cx={144} cy={104} r={20} fill="var(--surface)" stroke={ILLO.indigoSoft} strokeWidth={2} />
          <circle cx={144} cy={104} r={9} fill={`url(#${ids.gridB})`} />

          {/* elo rompido — duas pontas tracejadas que não se encontram */}
          <path d="M78 104 H94" stroke={ILLO.indigo} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 8" opacity={0.7} />
          <path d="M106 104 H122" stroke={ILLO.indigo} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 8" opacity={0.7} />
          {/* corte no meio (raio/fenda) */}
          <path d="M100 90 L94 104 L106 104 L100 118" fill="none" stroke={`url(#${ids.soft})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* arcos de sinal desligados (acima do nó direito) */}
          <path d="M134 78 a14 14 0 0 1 20 0" fill="none" stroke={ILLO.indigoSoft} strokeWidth={2.5} strokeLinecap="round" opacity={0.35} />
          <path d="M128 70 a22 22 0 0 1 32 0" fill="none" stroke={ILLO.indigoSoft} strokeWidth={2.5} strokeLinecap="round" opacity={0.2} />

          {/* ponto âmbar isolado */}
          <circle cx={100} cy={104} r={3.5} fill={ILLO.amber} />

          <NexusMark x={150} y={140} s={0.62} amberId={ids.soft} />
        </>
      )}
    </IlloFrame>
  );
}
