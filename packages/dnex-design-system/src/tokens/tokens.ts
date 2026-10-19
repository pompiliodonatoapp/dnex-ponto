/**
 * DNEX Design System — tokens (export programático)
 * -----------------------------------------------------------------------------
 * Fonte da verdade visual = `src/styles/theme.css` (@theme + vars semânticas).
 * Este arquivo espelha os MESMOS valores para consumo em JS/TS (gráficos,
 * canvas, libs que não leem CSS, testes, geração de tema em runtime).
 * Mantê-los em sincronia. Marca APROVADA 2026-06-29 (índigo + âmbar + 3 fontes).
 */

export const color = {
  indigo: {
    50: "#eef0ff",
    100: "#e0e3ff",
    200: "#c7ccfe",
    300: "#a5adfb",
    400: "#818bf6",
    500: "#6366f1",
    600: "#4f46e5", // ação primária
    700: "#4338ca", // hover / wordmark
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b", // índigo profundo / herói
  },
  amber: {
    50: "#fff8eb",
    100: "#feefc7",
    200: "#fddf8a",
    300: "#fcc94d",
    400: "#fbb924",
    500: "#f59e0b", // acento principal / o nexo
    600: "#d97706",
    700: "#b45309",
  },
  neutral: {
    0: "#ffffff",
    50: "#f7f7fb",
    100: "#f0f1f6",
    200: "#e4e5ee",
    300: "#cfd1dd",
    400: "#9c9fb0",
    500: "#6b6e80",
    600: "#4b4e5e",
    700: "#353747",
    800: "#232533",
    900: "#14151e",
  },
  ink: {
    DEFAULT: "#0b0a20",
    2: "#100e29",
    3: "#15122e",
    surface: "#1a1738",
  },
  status: {
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#818bf6",
  },
} as const;

/** Papéis semânticos resolvidos por tema — útil p/ gráficos que precisam do hex. */
export const semantic = {
  dark: {
    bg: "#0b0a20",
    bgSubtle: "#100e29",
    surface: "#15122e",
    surface2: "#1a1738",
    fg: "#eef0ff",
    fgMuted: "#b7b9d4",
    fgSubtle: "#8a8caf",
    line: "rgba(255,255,255,0.08)",
    action: "#4f46e5",
    accent: "#f59e0b",
  },
  light: {
    bg: "#f7f7fb",
    bgSubtle: "#f0f1f6",
    surface: "#ffffff",
    surface2: "#ffffff",
    fg: "#14151e",
    fgMuted: "#4b4e5e",
    fgSubtle: "#6b6e80",
    line: "#e4e5ee",
    action: "#4f46e5",
    accent: "#d97706",
  },
} as const;

export const font = {
  display: '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif',
  sans: '"Plus Jakarta Sans", system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "SF Mono", monospace',
} as const;

export const fontSize = {
  display: "clamp(2.6rem, 1.6rem + 4.4vw, 4.5rem)",
  h1: "clamp(2rem, 1.4rem + 2.6vw, 3rem)",
  h2: "clamp(1.5rem, 1.2rem + 1.4vw, 2rem)",
  h3: "clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem)",
  lead: "clamp(1.05rem, 1rem + 0.4vw, 1.25rem)",
  kpi: "clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)",
  body: "1rem",
  small: "0.875rem",
  label: "0.75rem",
} as const;

/**
 * Escala tipográfica documentada — metadados por token para a tabela do
 * showcase, o README e o Manual de Marca. Espelha as CSS vars `--text-*`.
 *
 *  - `fluid`  : true → o clamp encolhe no mobile e cresce até o teto no desktop;
 *               false → tamanho fixo (UI estável em qualquer tela).
 *  - `min`/`max`: bordas do clamp legíveis para humanos (≈375px → ≈1440px).
 *               Em tokens fixos, min === max.
 *  - `font`   : família recomendada · `lineHeight` · `use`: uso recomendado.
 */
export type TypeScaleEntry = {
  token: string;
  cssVar: string;
  fluid: boolean;
  min: string;
  max: string;
  font: "display" | "sans" | "mono";
  lineHeight: string;
  use: string;
};

export const typeScale: readonly TypeScaleEntry[] = [
  { token: "display", cssVar: "--text-display", fluid: true, min: "41.6px (2.6rem)", max: "72px (4.5rem)", font: "display", lineHeight: "1.05", use: "Hero / headline de impacto" },
  { token: "h1", cssVar: "--text-h1", fluid: true, min: "32px (2rem)", max: "48px (3rem)", font: "display", lineHeight: "1.1", use: "Título de página" },
  { token: "h2", cssVar: "--text-h2", fluid: true, min: "24px (1.5rem)", max: "32px (2rem)", font: "display", lineHeight: "1.2", use: "Título de seção" },
  { token: "h3", cssVar: "--text-h3", fluid: true, min: "20px (1.25rem)", max: "24px (1.5rem)", font: "display", lineHeight: "1.3", use: "Subtítulo / título de card" },
  { token: "lead", cssVar: "--text-lead", fluid: true, min: "16.8px (1.05rem)", max: "20px (1.25rem)", font: "sans", lineHeight: "1.55", use: "Parágrafo de abertura / subtítulo" },
  { token: "kpi", cssVar: "--text-kpi", fluid: true, min: "28px (1.75rem)", max: "40px (2.5rem)", font: "mono", lineHeight: "1.1", use: "Número grande de KPI (mono)" },
  { token: "body", cssVar: "--text-body", fluid: false, min: "16px (1rem)", max: "16px (1rem)", font: "sans", lineHeight: "1.65", use: "Corpo de texto e UI" },
  { token: "small", cssVar: "--text-small", fluid: false, min: "14px (0.875rem)", max: "14px (0.875rem)", font: "sans", lineHeight: "1.5", use: "Texto de apoio / descrições" },
  { token: "label", cssVar: "--text-label", fluid: false, min: "12px (0.75rem)", max: "12px (0.75rem)", font: "sans", lineHeight: "1.4", use: "Rótulo / eyebrow (uppercase, tracking)" },
] as const;

/** Escala de espaçamento 4/8 (px). */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
  9: 96,
} as const;

export const radius = {
  control: "10px",
  card: "16px",
  hero: "24px",
  pill: "999px",
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(30,27,75,0.18)",
  card: "0 4px 24px rgba(8,6,30,0.5), 0 1px 2px rgba(8,6,30,0.4)",
  lg: "0 24px 70px -12px rgba(8,6,30,0.7)",
  glow: "0 0 0 1px rgba(129,139,246,0.18), 0 30px 80px -20px rgba(79,70,229,0.45)",
  action: "0 8px 30px -6px rgba(79,70,229,0.6)",
  accent: "0 8px 30px -6px rgba(245,158,11,0.5)",
} as const;

export const motion = {
  easeOutSoft: [0.22, 1, 0.36, 1] as [number, number, number, number],
  easeInOutSoft: [0.65, 0, 0.35, 1] as [number, number, number, number],
  durationFast: 0.15,
  durationBase: 0.24,
  durationSlow: 0.36,
} as const;

/**
 * Geometria canônica do App Shell DNEX. Espelha os tokens `--shell-*` e
 * `--page-header-*` de theme.css e deve ser usada por integrações que precisam
 * desses valores fora do CSS (testes visuais, frames e telemetria de layout).
 */
export const appShell = {
  sidebar: {
    width: 226,
    collapsedWidth: 72,
    paddingInline: 14,
    navRadius: 10,
    transitionMs: 200,
  },
  topbar: {
    height: 60,
    mobileHeight: 56,
    paddingInline: 24,
    paddingInlineMobile: 14,
    columnGap: 22,
    searchMinWidth: 280,
    searchMaxWidth: 520,
    controlSize: 44,
    searchHeight: 44,
    avatarSize: 32,
  },
  appLauncher: {
    width: 288,
    maxHeight: 672,
    columns: 2,
  },
  content: {
    maxWidth: 1500,
    paddingInline: 30,
    paddingInlineMobile: 15,
    paddingTop: 28,
    paddingBottom: 44,
    sectionGap: 24,
  },
} as const;

export const pageHeader = {
  title: "clamp(1.5625rem, 2.4vw, 2.1875rem)",
  titleDetail: "clamp(1.5rem, 2vw, 2rem)",
  titleWelcome: "clamp(2rem, 4vw, 3.5rem)",
  description: 13,
  descriptionMaxWidth: 760,
  eyebrow: 10,
  accentWidth: 22,
  accentHeight: 4,
  blockGap: 12,
  marginBottom: 24,
} as const;

/**
 * Escalas de FOUNDATIONS programáticas — z-index, elevação, breakpoints e motion
 * documentado. Espelham as CSS vars em `theme.css`; expostas como objetos para
 * uso em JS/TS (style inline, lógica de breakpoint, configuração de animação) e
 * para alimentar a documentação visual do showcase. Mantê-las em sincronia.
 */

/** Escala de empilhamento — papéis nomeados (ver `--z-*` no theme.css). */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

/** Metadados de z-index para a documentação do showcase. */
export type ZIndexEntry = { token: string; cssVar: string; value: number; use: string };
export const zIndexScale: readonly ZIndexEntry[] = [
  { token: "base", cssVar: "--z-base", value: 0, use: "Fluxo normal / superfícies de fundo" },
  { token: "dropdown", cssVar: "--z-dropdown", value: 1000, use: "Menus suspensos (DropdownMenu, Select)" },
  { token: "sticky", cssVar: "--z-sticky", value: 1100, use: "Cabeçalhos/barras fixas (sticky)" },
  { token: "overlay", cssVar: "--z-overlay", value: 1200, use: "Backdrop de modal/drawer" },
  { token: "modal", cssVar: "--z-modal", value: 1300, use: "Dialog, Drawer, PageLoader" },
  { token: "popover", cssVar: "--z-popover", value: 1400, use: "Popover, Calendar flutuante" },
  { token: "toast", cssVar: "--z-toast", value: 1500, use: "Toasts (notificações transientes)" },
  { token: "tooltip", cssVar: "--z-tooltip", value: 1600, use: "Tooltips (sempre no topo)" },
] as const;

/**
 * Elevação — níveis semânticos que reusam as sombras tingidas de índigo. Cada
 * nível aponta para uma `--shadow-*`/`--elevation-*` (ver theme.css).
 */
export const elevation = {
  0: "none",
  1: shadow.sm,
  2: shadow.card,
  3: shadow.glow,
  4: shadow.lg,
} as const;

export type ElevationEntry = { level: number; cssVar: string; shadowToken: string; use: string };
export const elevationScale: readonly ElevationEntry[] = [
  { level: 0, cssVar: "--elevation-0", shadowToken: "none", use: "Rente à página — faixas, superfícies de fundo" },
  { level: 1, cssVar: "--elevation-1", shadowToken: "--shadow-sm", use: "Card em repouso, painel" },
  { level: 2, cssVar: "--elevation-2", shadowToken: "--shadow-card", use: "Card no hover, popover baixo" },
  { level: 3, cssVar: "--elevation-3", shadowToken: "--shadow-glow", use: "Overlay flutuante (dropdown, popover)" },
  { level: 4, cssVar: "--elevation-4", shadowToken: "--shadow-lg", use: "Modal, drawer, camada máxima" },
] as const;

/** Breakpoints (valores reais, espelham Tailwind v4 e as `--breakpoint-*`). */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type BreakpointEntry = { token: string; cssVar: string; min: number; prefix: string; use: string };
export const breakpointScale: readonly BreakpointEntry[] = [
  { token: "sm", cssVar: "--breakpoint-sm", min: 640, prefix: "sm:", use: "Celular grande / retrato de tablet" },
  { token: "md", cssVar: "--breakpoint-md", min: 768, prefix: "md:", use: "Tablet / quebra para 2 colunas" },
  { token: "lg", cssVar: "--breakpoint-lg", min: 1024, prefix: "lg:", use: "Notebook / sidebar fixa, 3 colunas" },
  { token: "xl", cssVar: "--breakpoint-xl", min: 1280, prefix: "xl:", use: "Desktop largo / contêiner máximo" },
] as const;

/**
 * Motion documentado — durações (ms) e easings nomeados, em forma consumível por
 * `motion`/CSS. `easing` em tupla cubic-bezier [number×4] (NUNCA tipar como
 * Transition["ease"], quebra o build TS). Duração em ms (number) e em segundos
 * (para Framer Motion, que usa segundos).
 */
export const duration = { fast: 150, base: 240, slow: 360 } as const;
export const easing = {
  outSoft: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOutSoft: [0.65, 0, 0.35, 1] as [number, number, number, number],
} as const;

export type MotionDurationEntry = { token: string; cssVar: string; ms: number; use: string };
export const motionScale: readonly MotionDurationEntry[] = [
  { token: "fast", cssVar: "--duration-fast", ms: 150, use: "Micro-interação — hover, foco, troca de cor" },
  { token: "base", cssVar: "--duration-base", ms: 240, use: "Padrão — entrada de overlay, fade/slide" },
  { token: "slow", cssVar: "--duration-slow", ms: 360, use: "Transição maior — stagger, reveal de seção" },
] as const;

export type MotionEasingEntry = { token: string; cssVar: string; bezier: readonly [number, number, number, number]; use: string };
export const easingScale: readonly MotionEasingEntry[] = [
  { token: "outSoft", cssVar: "--ease-out-soft", bezier: easing.outSoft, use: "Entrada / aparecer (desaceleração natural)" },
  { token: "inOutSoft", cssVar: "--ease-in-out-soft", bezier: easing.inOutSoft, use: "Movimento simétrico (ida e volta)" },
] as const;

export const tokens = {
  color,
  semantic,
  font,
  fontSize,
  typeScale,
  space,
  radius,
  shadow,
  motion,
  appShell,
  pageHeader,
  zIndex,
  elevation,
  breakpoints,
  duration,
  easing,
} as const;

export type Tokens = typeof tokens;
export default tokens;
