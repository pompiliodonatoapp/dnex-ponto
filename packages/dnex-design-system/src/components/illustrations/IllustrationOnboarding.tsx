import type { IllustrationProps } from "./illoBase";
import { ILLO, IlloFrame, NexusMark } from "./illoBase";

/**
 * Onboarding — começo da jornada: um caminho de chevrons índigo que avança e
 * culmina no nexo âmbar (bandeira/meta). Camadas de superfície + passos.
 */
export function IllustrationOnboarding({ size, className, title = "Vamos começar" }: IllustrationProps) {
  return (
    <IlloFrame size={size} className={className} title={title}>
      {(ids) => (
        <>
          <ellipse cx={100} cy={156} rx={70} ry={14} fill={`url(#${ids.glow})`} />

          {/* painel de fundo (camada de vidro) */}
          <rect x={34} y={40} width={132} height={104} rx={14} fill={`url(#${ids.gridA})`} stroke="var(--line-strong)" strokeWidth={1.5} />

          {/* "degraus" ascendentes — progresso do onboarding */}
          {[
            [50, 116, 28],
            [86, 100, 28],
            [122, 80, 28],
          ].map(([x, y, w], i) => (
            <rect
              key={i}
              x={x as number}
              y={y as number}
              width={w as number}
              height={20}
              rx={6}
              fill={i === 2 ? "var(--surface-2)" : "var(--surface)"}
              stroke={i === 2 ? ILLO.amber : ILLO.indigo}
              strokeWidth={i === 2 ? 2 : 1.5}
              strokeOpacity={i === 2 ? 0.9 : 0.5}
            />
          ))}

          {/* chevrons que sobem ao longo dos degraus */}
          <path d="M58 108 L66 100 L58 92" stroke={ILLO.indigoSoft} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M94 92 L102 84 L94 76" stroke={ILLO.indigo} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* nexo no topo do último degrau — a meta */}
          <NexusMark x={120} y={48} s={0.9} amberId={ids.soft} />
        </>
      )}
    </IlloFrame>
  );
}
