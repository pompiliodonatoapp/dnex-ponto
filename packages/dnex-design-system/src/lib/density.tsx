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
 * DensityProvider do DNEX DS — controla `data-density` no elemento raiz.
 *
 * Densidade é a "compactação" da UI: `comfortable` (padrão de hoje, telas que
 * respiram) ou `compact` (telas densas de dado — operação fiscal, grandes
 * tabelas). Os componentes de dado/lista (Table, DataTable, Input, Card) leem
 * os tokens `--row-h`, `--cell-py`, `--control-h`, `--card-pad`… definidos em
 * theme.css por `[data-density]`, então a troca não exige remontar nada.
 *
 * Persistente em localStorage (chave configurável). Aplica no <html> por
 * padrão — um app pode passar outro alvo via `target`.
 */

export type Density = "comfortable" | "compact";

type DensityContextValue = {
  density: Density;
  setDensity: (d: Density) => void;
  toggle: () => void;
};

const DensityContext = createContext<DensityContextValue | null>(null);

const isDensity = (v: unknown): v is Density =>
  v === "comfortable" || v === "compact";

export function DensityProvider({
  children,
  defaultDensity = "comfortable",
  storageKey = "dnex-density",
  /** Elemento que recebe data-density. Default: <html>. */
  target,
}: {
  children: ReactNode;
  defaultDensity?: Density;
  storageKey?: string;
  target?: HTMLElement;
}) {
  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === "undefined") return defaultDensity;
    const saved = window.localStorage.getItem(storageKey);
    return isDensity(saved) ? saved : defaultDensity;
  });

  useEffect(() => {
    const el = target ?? document.documentElement;
    el.setAttribute("data-density", density);
    try {
      window.localStorage.setItem(storageKey, density);
    } catch {
      /* localStorage indisponível (modo privado) — ignora silenciosamente. */
    }
  }, [density, storageKey, target]);

  const setDensity = useCallback((d: Density) => setDensityState(d), []);
  const toggle = useCallback(
    () =>
      setDensityState((d) => (d === "comfortable" ? "compact" : "comfortable")),
    [],
  );

  const value = useMemo(
    () => ({ density, setDensity, toggle }),
    [density, setDensity, toggle],
  );

  return (
    <DensityContext.Provider value={value}>{children}</DensityContext.Provider>
  );
}

export function useDensity(): DensityContextValue {
  const ctx = useContext(DensityContext);
  if (!ctx) {
    throw new Error("useDensity deve ser usado dentro de <DensityProvider>.");
  }
  return ctx;
}
