import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

/**
 * ThemeProvider do DNEX DS — controla `data-theme` no elemento alvo.
 *
 * Default escuro (premium). Três preferências: "dark" | "light" | "system".
 * `system` segue `prefers-color-scheme` em tempo real. O tema EFETIVO aplicado
 * (sempre dark|light) é exposto em `resolvedTheme`; a preferência crua em
 * `theme`. Persistente em localStorage (opcional via `persist`, ligado por
 * padrão para o ThemeSwitcher; o app pode desligar e persistir externamente).
 */

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

type ThemeContextValue = {
  /** Preferência crua escolhida pelo usuário (pode ser "system"). */
  theme: Theme;
  /** Tema efetivamente aplicado (sempre concreto). */
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
  /** Alterna apenas entre dark↔light (atalho; nunca cai em "system"). */
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (v: unknown): v is Theme =>
  v === "dark" || v === "light" || v === "system";

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "dnex-theme",
  /** Persistir a preferência em localStorage. Default: true. */
  persist = true,
}: {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  persist?: boolean;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (!persist || typeof window === "undefined") return defaultTheme;
    const saved = window.localStorage.getItem(storageKey);
    return isTheme(saved) ? saved : defaultTheme;
  });

  // Tema do SO, atualizado em tempo real quando a preferência é "system".
  const [sysTheme, setSysTheme] = useState<ResolvedTheme>(systemTheme);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setSysTheme(mq.matches ? "light" : "dark");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? sysTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    if (!persist) return;
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      /* localStorage indisponível — ignora. */
    }
  }, [theme, persist, storageKey]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () =>
      setThemeState((t) => {
        const base: ResolvedTheme = t === "system" ? systemTheme() : t;
        return base === "dark" ? "light" : "dark";
      }),
    [],
  );

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de <ThemeProvider>.");
  }
  return ctx;
}
