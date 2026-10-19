import type { IllustrationProps } from "./illoBase";
import { ILLO, IlloFrame, NexusMark } from "./illoBase";

/**
 * Empty — caixa/bandeja vazia, aberta, com o nexo âmbar pairando como "o
 * primeiro item a chegar". Camadas: glow → bandeja translúcida → frente índigo.
 */
export function IllustrationEmpty({ size, className, title = "Nada por aqui ainda" }: IllustrationProps) {
  return (
    <IlloFrame size={size} className={className} title={title}>
      {(ids) => (
        <>
          <ellipse cx={100} cy={150} rx={70} ry={14} fill={`url(#${ids.glow})`} />

          {/* tampa aberta atrás (camada de fundo) */}
          <path
            d="M58 70 L100 52 L142 70 L100 88 Z"
            fill={`url(#${ids.gridA})`}
            stroke="var(--line-strong)"
            strokeWidth={1.5}
          />

          {/* corpo da caixa — face frontal e lateral (volume, não flat) */}
          <path d="M52 92 L100 110 L100 162 L52 144 Z" fill="var(--surface)" stroke={ILLO.indigo} strokeWidth={2} strokeOpacity={0.5} />
          <path d="M148 92 L100 110 L100 162 L148 144 Z" fill={`url(#${ids.gridA})`} stroke={ILLO.indigo} strokeWidth={2} strokeOpacity={0.5} />
          {/* borda superior da abertura */}
          <path d="M52 92 L100 74 L148 92 L100 110 Z" fill="var(--surface-2)" stroke={ILLO.indigoSoft} strokeWidth={2} />

          {/* linhas internas (profundidade da abertura) */}
          <path d="M68 96 L100 108 L132 96" fill="none" stroke={ILLO.indigo} strokeWidth={1.5} strokeOpacity={0.4} strokeLinecap="round" />

          {/* nexo flutuando acima — "o primeiro registro" */}
          <NexusMark x={84} y={26} s={1} amberId={ids.soft} />
          <circle cx={100} cy={44} r={2} fill={ILLO.amber} opacity={0.5} />
        </>
      )}
    </IlloFrame>
  );
}
