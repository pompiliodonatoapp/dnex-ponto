import { color, semantic, font } from "../../tokens/tokens";
import { useTheme } from "../../lib/theme";

/**
 * Tema dos gráficos DNEX — resolve cores/fontes a partir dos tokens conforme o
 * tema ativo. Recharts pinta em SVG (fill/stroke), que não lê bem CSS vars que
 * dependem de cascata, então aqui devolvemos HEX/rgba concretos vindos de
 * `tokens.ts` (a fonte espelhada da verdade visual).
 */
export type ChartTheme = ReturnType<typeof useChartTheme>;

export function useChartTheme() {
  // resolvedTheme é sempre concreto (dark|light), mesmo com a preferência "system".
  const { resolvedTheme } = useTheme();
  const s = resolvedTheme === "light" ? semantic.light : semantic.dark;
  const isLight = resolvedTheme === "light";

  return {
    isLight,
    /** Série primária (ação índigo). */
    action: color.indigo[isLight ? 600 : 500],
    actionSoft: color.indigo[isLight ? 400 : 400],
    /** Acento âmbar — usar com avareza (1 série de destaque, no máximo). */
    accent: isLight ? color.amber[600] : color.amber[500],
    /** Paleta categórica (índigo dominante, âmbar só no fim como destaque). */
    categorical: [
      color.indigo[isLight ? 600 : 500],
      color.indigo[300],
      color.indigo[isLight ? 800 : 200],
      color.indigo[400],
      isLight ? color.amber[600] : color.amber[500], // destaque
    ],
    fg: s.fg,
    fgMuted: s.fgMuted,
    fgSubtle: s.fgSubtle,
    surface: s.surface2,
    grid: isLight ? "rgba(30,27,75,0.08)" : "rgba(255,255,255,0.07)",
    axis: isLight ? "rgba(30,27,75,0.18)" : "rgba(255,255,255,0.14)",
    /**
     * Tons das linhas de referência (meta, limite, média) dos gráficos
     * cartesianos. `muted` acompanha o texto discreto do eixo; `action` é o
     * índigo da série primária; `success`/`warning` vêm de `color.status`.
     * Nenhum hex vive fora de `tokens.ts`.
     */
    reference: {
      muted: s.fgSubtle,
      action: color.indigo[isLight ? 600 : 500],
      success: color.status.success,
      warning: color.status.warning,
    },
    fontSans: font.sans,
    fontMono: font.mono,
  };
}

/** Estilo base dos eixos (compartilhado entre os charts cartesianos). */
export function axisTick(t: ChartTheme) {
  return {
    fill: t.fgSubtle,
    fontSize: 11,
    fontFamily: t.fontMono,
  } as const;
}
