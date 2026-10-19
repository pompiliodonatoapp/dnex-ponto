import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Fundação das ilustrações DNEX — duotom índigo + âmbar, geométrico e em camadas
 * (não flat chapado). Pensadas para dark e light: as superfícies usam tokens
 * semânticos via CSS vars (--surface, --line…), o índigo/âmbar vêm da escala de
 * marca, e o nexo (âmbar) entra com avareza. Cada ilustração injeta seus próprios
 * <defs> com IDs únicos (useId) para que várias possam coexistir na mesma página.
 */

export type IllustrationProps = {
  /** Lado do quadrado (px). Default 160. */
  size?: number;
  className?: string;
  /** Rótulo acessível. Se omitido, a ilustração é decorativa (aria-hidden). */
  title?: string;
};

/** Cores de marca fixas (espelham tokens.ts). Mantidas em sincronia com a marca. */
export const ILLO = {
  indigoDeep: "#312e81", // indigo-900
  indigo: "#4f46e5", // ação
  indigoSoft: "#818bf6", // indigo-400 (chevron claro)
  indigoPale: "#a5adfb", // indigo-300
  amber: "#f59e0b", // o nexo
  amberSoft: "#fbb924",
} as const;

type FrameProps = IllustrationProps & {
  children: (ids: IlloIds) => ReactNode;
};

/** IDs únicos por instância — gradientes e clips não colidem entre ilustrações. */
export type IlloIds = {
  gridA: string;
  gridB: string;
  glow: string;
  soft: string;
  clip: string;
};

/**
 * Moldura comum: viewBox 200×200, geração de IDs, gradientes reutilizáveis
 * (vidro de superfície, glow índigo) e o atributo de acessibilidade correto.
 */
export function IlloFrame({ size = 160, className, title, children }: FrameProps) {
  const raw = useId().replace(/:/g, "");
  const ids: IlloIds = {
    gridA: `ig-a-${raw}`,
    gridB: `ig-b-${raw}`,
    glow: `ig-glow-${raw}`,
    soft: `ig-soft-${raw}`,
    clip: `ig-clip-${raw}`,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("select-none", className)}
    >
      <defs>
        {/* Gradiente de superfície translúcida (camada de vidro do DS) */}
        <linearGradient id={ids.gridA} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ILLO.indigoSoft} stopOpacity={0.22} />
          <stop offset="100%" stopColor={ILLO.indigo} stopOpacity={0.06} />
        </linearGradient>
        {/* Gradiente índigo sólido (peça em primeiro plano) */}
        <linearGradient id={ids.gridB} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ILLO.indigoSoft} />
          <stop offset="100%" stopColor={ILLO.indigo} />
        </linearGradient>
        {/* Glow radial índigo (profundidade atrás do foco) */}
        <radialGradient id={ids.glow} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={ILLO.indigo} stopOpacity={0.35} />
          <stop offset="100%" stopColor={ILLO.indigo} stopOpacity={0} />
        </radialGradient>
        {/* Âmbar suave para o nexo / acentos */}
        <linearGradient id={ids.soft} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ILLO.amberSoft} />
          <stop offset="100%" stopColor={ILLO.amber} />
        </linearGradient>
      </defs>
      {children(ids)}
    </svg>
  );
}

/**
 * Motivo do NEXO — dois chevrons índigo avançando até o ponto âmbar. Reusa a
 * assinatura da marca (Logo) em escala de ilustração. `x`/`y` posicionam o
 * grupo; `s` escala. Usado discretamente nas ilustrações como selo da marca.
 */
export function NexusMark({
  x = 0,
  y = 0,
  s = 1,
  amberId,
}: {
  x?: number;
  y?: number;
  s?: number;
  /** id do gradiente âmbar (do IlloFrame) para o nexo. */
  amberId?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 0 L16 16 L0 32"
        stroke={ILLO.indigoSoft}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M15 0 L31 16 L15 32"
        stroke={ILLO.indigo}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx={31} cy={16} r={6.5} fill={amberId ? `url(#${amberId})` : ILLO.amber} />
    </g>
  );
}
