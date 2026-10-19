import type { IllustrationProps } from "./illoBase";
import { ILLO, IlloFrame, NexusMark } from "./illoBase";

/**
 * 500 — falha nossa, não sua: um bloco de servidor com um "disjuntor" desarmado.
 * Linguagem de cuidado (Manual §voz de parceiro): nada de explosão dramática —
 * um raio âmbar discreto sinaliza a interrupção; tudo geométrico e contido.
 */
export function Illustration500({ size, className, title = "Erro do servidor" }: IllustrationProps) {
  return (
    <IlloFrame size={size} className={className} title={title}>
      {(ids) => (
        <>
          <ellipse cx={100} cy={152} rx={66} ry={13} fill={`url(#${ids.glow})`} />

          {/* rack de servidor — três módulos empilhados (camadas) */}
          {[112, 80, 48].map((y, i) => (
            <g key={y}>
              <rect
                x={56}
                y={y}
                width={88}
                height={26}
                rx={7}
                fill={i === 1 ? "var(--surface-2)" : "var(--surface)"}
                stroke={i === 1 ? ILLO.amber : ILLO.indigo}
                strokeWidth={i === 1 ? 2 : 1.5}
                strokeOpacity={i === 1 ? 0.9 : 0.5}
              />
              {/* LEDs de status */}
              <circle cx={68} cy={y + 13} r={3} fill={i === 1 ? ILLO.amber : ILLO.indigoSoft} />
              <circle cx={80} cy={y + 13} r={3} fill={ILLO.indigo} opacity={0.45} />
              {/* slots ventilação */}
              <path d={`M110 ${y + 8} h22 M110 ${y + 13} h22 M110 ${y + 18} h22`} stroke={ILLO.indigo} strokeWidth={1.5} strokeOpacity={0.3} strokeLinecap="round" />
            </g>
          ))}

          {/* raio âmbar — interrupção (no módulo central de destaque) */}
          <path
            d="M100 70 L92 96 L100 96 L94 116 L114 90 L104 90 L112 70 Z"
            fill={`url(#${ids.soft})`}
            stroke={ILLO.amber}
            strokeWidth={1}
            strokeLinejoin="round"
          />

          <NexusMark x={150} y={36} s={0.7} amberId={ids.soft} />
        </>
      )}
    </IlloFrame>
  );
}
