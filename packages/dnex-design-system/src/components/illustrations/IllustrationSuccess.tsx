import type { IllustrationProps } from "./illoBase";
import { ILLO, IlloFrame, NexusMark } from "./illoBase";

/**
 * Success — disco de "concluído" com check índigo e o nexo âmbar selando o
 * resultado. Raios curtos ao redor (celebração contida, não confete). Camadas:
 * glow → disco translúcido → anel → check → faíscas.
 */
export function IllustrationSuccess({ size, className, title = "Tudo certo" }: IllustrationProps) {
  return (
    <IlloFrame size={size} className={className} title={title}>
      {(ids) => (
        <>
          <circle cx={100} cy={98} r={70} fill={`url(#${ids.glow})`} />

          {/* faíscas radiais (índigo + âmbar, contidas) */}
          {[
            [100, 18, ILLO.amber],
            [158, 52, ILLO.indigoSoft],
            [170, 110, ILLO.indigo],
            [42, 52, ILLO.indigo],
            [30, 110, ILLO.indigoSoft],
          ].map(([cx, cy, c], i) => (
            <circle key={i} cx={cx as number} cy={cy as number} r={i === 0 ? 3.5 : 2.5} fill={c as string} opacity={0.8} />
          ))}

          {/* disco em camadas */}
          <circle cx={100} cy={98} r={50} fill={`url(#${ids.gridA})`} stroke="var(--line-strong)" strokeWidth={1.5} />
          <circle cx={100} cy={98} r={40} fill="var(--surface)" stroke={ILLO.indigoSoft} strokeWidth={2} />

          {/* check índigo sólido */}
          <path
            d="M80 99 L94 113 L122 83"
            fill="none"
            stroke={`url(#${ids.gridB})`}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* nexo selando, canto inferior */}
          <NexusMark x={120} y={130} s={0.8} amberId={ids.soft} />
        </>
      )}
    </IlloFrame>
  );
}
