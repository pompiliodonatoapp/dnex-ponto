import type { ReferenceLineSpec, YDomain } from "../components/charts/cartesianScale";

/**
 * Fixture ILUSTRATIVA da vitrine — progresso mensal de três OKRs, em percentual
 * (0–100). Não representa metas, empresas nem períodos reais. Em abril o OKR
 * "Produto" fica sem medição (`null`): a linha quebra e nada é interpolado nem
 * zerado — a lacuna é a informação honesta. Valores entre 20 e 95, para que a
 * série suba sem nunca encostar no teto: o teto é a meta, não o dado.
 *
 * Os números são a fonte tanto do gráfico quanto da tabela textual ao lado; o
 * teste `line-chart-scale.test.ts` valida limites, lacuna e médias.
 */
export type OkrProgressRow = {
  mes: string;
  comercial: number;
  fiscal: number;
  produto: number | null;
};

export const okrProgressFixture: OkrProgressRow[] = [
  { mes: "Jan", comercial: 20, fiscal: 32, produto: 25 },
  { mes: "Fev", comercial: 31, fiscal: 40, produto: 38 },
  { mes: "Mar", comercial: 45, fiscal: 47, produto: 52 },
  { mes: "Abr", comercial: 52, fiscal: 55, produto: null },
  { mes: "Mai", comercial: 68, fiscal: 61, produto: 74 },
  { mes: "Jun", comercial: 95, fiscal: 70, produto: 88 },
];

export type OkrSeriesKey = "comercial" | "fiscal" | "produto";

export const okrProgressSeries: { dataKey: OkrSeriesKey; name: string }[] = [
  { dataKey: "comercial", name: "OKR Comercial" },
  { dataKey: "fiscal", name: "OKR Fiscal" },
  { dataKey: "produto", name: "OKR Produto" },
];

/** Limites naturais da métrica: percentual de progresso. */
export const okrProgressBounds = { min: 20, max: 95 } as const;

/**
 * Escala fixa do demo "progresso 0–100%". É o objeto que a vitrine espalha no
 * `LineChartDnex` e que o teste renderiza — remover `yDomain` daqui derruba o
 * teste dos ticks (prova negativa registrada no CHANGELOG).
 */
export const okrFixedScaleProps: {
  yDomain: YDomain;
  yTicks: number[];
  referenceLines: ReferenceLineSpec[];
  showDots: true;
} = {
  yDomain: [0, 100],
  yTicks: [0, 25, 50, 75, 100],
  referenceLines: [{ y: 100, label: "Meta" }],
  showDots: true,
};

export const formatPercent = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

/**
 * Média simples do mês entre os OKRs COM medição. Mês sem dado em uma série
 * não entra no denominador (não vira zero). `null` se nenhuma série mediu.
 */
export function okrMediaMensal(row: OkrProgressRow): number | null {
  const valores = okrProgressSeries
    .map((s) => row[s.dataKey])
    .filter((v): v is number => typeof v === "number");
  if (valores.length === 0) return null;
  return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
}

/** Último valor medido de uma série — o "progresso atual" de um painel de OKRs. */
export function okrUltimoValor(key: OkrSeriesKey): number | null {
  for (let i = okrProgressFixture.length - 1; i >= 0; i -= 1) {
    const v = okrProgressFixture[i]?.[key];
    if (typeof v === "number") return v;
  }
  return null;
}
