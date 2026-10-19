import { useId } from "react";
import { cn } from "../../lib/cn";

/**
 * Logo DNEX — conceito "Avanço / Nexo" (Manual de Marca §2).
 * Dois chevrons (») que avançam até o nexo âmbar (= controle/clareza).
 * NÃO é um "X". O nexo é SEMPRE âmbar (regra inegociável de marca §2.4).
 * Nunca recolorir o nexo, separar chevrons, distorcer ou aplicar efeito.
 */

type SymbolProps = {
  size?: number;
  className?: string;
  /** Versão negativa para superfícies escuras, como o sidebar. */
  tone?: "default" | "inverse";
  /** Anima o nexo com um pulso suave (uso opcional, ex.: splash/loader). */
  animated?: boolean;
};

/** Símbolo isolado (chevrons + nexo). App, favicon, avatar, marca d'água. */
export function DnexSymbol({ size = 32, className, tone = "default", animated = false }: SymbolProps) {
  const titleId = useId();
  const inverse = tone === "inverse";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      className={className}
    >
      <title id={titleId}>DNEX</title>
      <path
        d="M22 24 L46 48 L22 72"
        stroke={inverse ? "var(--shell-sidebar-logo-flow-primary)" : "#818BF6"}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 24 L68 48 L44 72"
        stroke={inverse ? "var(--shell-sidebar-logo-flow-secondary)" : "#4F46E5"}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="68"
        cy="48"
        r="10"
        fill={inverse ? "var(--shell-sidebar-logo-nexus)" : "#F59E0B"}
      >
        {animated && (
          <animate
            attributeName="r"
            values="10;11.5;10"
            dur="2.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.22 1 0.36 1; 0.22 1 0.36 1"
            keyTimes="0;0.5;1"
          />
        )}
      </circle>
    </svg>
  );
}

export type LogoProps = {
  /** Altura em px do conjunto símbolo + wordmark. */
  height?: number;
  className?: string;
  /** Mostra apenas o símbolo (sem wordmark). */
  symbolOnly?: boolean;
  /** Nome do produto exibido após a marca (ex.: Admin, Normas). */
  product?: string;
  /** Versão negativa: wordmark branco e acentos claros para fundo escuro. */
  tone?: "default" | "inverse";
  /** Pulsa o nexo âmbar; reservado para splash e carregamento. */
  animated?: boolean;
};

/**
 * Logo horizontal: símbolo + wordmark "DNEX".
 * A cor do wordmark segue o tema via `text-fg` (branco no escuro, navy no claro)
 * — o "X" sempre em índigo claro, o nexo sempre âmbar (regras de marca).
 */
export function Logo({ height = 28, className, symbolOnly = false, product, tone = "default", animated = false }: LogoProps) {
  if (symbolOnly) {
    return <DnexSymbol size={height} className={className} tone={tone} animated={animated} />;
  }
  const inverse = tone === "inverse";
  return (
    <span
      data-dnex-logo={tone}
      className={cn(
        "inline-flex items-center",
        inverse ? "text-[var(--shell-sidebar-logo-wordmark)]" : "text-fg",
        className,
      )}
      style={{ gap: height * 0.32 }}
    >
      <DnexSymbol size={height} tone={tone} animated={animated} />
      <span
        className="font-display"
        style={{
          fontSize: height * 0.92,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        DNE
        <span style={{ color: inverse ? "var(--shell-sidebar-logo-highlight)" : "#818BF6" }}>
          X
        </span>
        {product && (
          <span
            style={{
              fontWeight: 500,
              opacity: 0.7,
              marginLeft: height * 0.2,
            }}
          >
            {product}
          </span>
        )}
      </span>
    </span>
  );
}
