import type { IllustrationProps } from "./illoBase";
import { ILLO, IlloFrame, NexusMark } from "./illoBase";

/**
 * NoPermission — escudo/cadeado: acesso restrito. Cadeado índigo fechado sobre
 * escudo translúcido; o nexo âmbar fica do lado de fora (a chave que falta).
 */
export function IllustrationNoPermission({ size, className, title = "Sem permissão de acesso" }: IllustrationProps) {
  return (
    <IlloFrame size={size} className={className} title={title}>
      {(ids) => (
        <>
          <circle cx={100} cy={96} r={64} fill={`url(#${ids.glow})`} />

          {/* escudo de fundo (camada translúcida) */}
          <path
            d="M100 36 L150 56 V104 Q150 142 100 162 Q50 142 50 104 V56 Z"
            fill={`url(#${ids.gridA})`}
            stroke="var(--line-strong)"
            strokeWidth={1.5}
          />
          {/* escudo frontal menor */}
          <path
            d="M100 50 L138 66 V102 Q138 130 100 146 Q62 130 62 102 V66 Z"
            fill="var(--surface)"
            stroke={ILLO.indigoSoft}
            strokeWidth={2}
            strokeOpacity={0.6}
          />

          {/* cadeado fechado */}
          <path d="M88 92 V84 a12 12 0 0 1 24 0 V92" fill="none" stroke={ILLO.indigoSoft} strokeWidth={4} strokeLinecap="round" />
          <rect x={82} y={92} width={36} height={28} rx={6} fill={`url(#${ids.gridB})`} stroke={ILLO.indigo} strokeWidth={1} />
          <circle cx={100} cy={104} r={4} fill="var(--surface)" />
          <rect x={98} y={104} width={4} height={9} rx={2} fill="var(--surface)" />

          {/* nexo do lado de fora — "a chave que falta" */}
          <NexusMark x={142} y={120} s={0.78} amberId={ids.soft} />
        </>
      )}
    </IlloFrame>
  );
}
