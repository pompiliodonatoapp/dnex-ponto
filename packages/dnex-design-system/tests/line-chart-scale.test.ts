/**
 * LineChartDnex — contrato de escala honesta (yDomain / yTicks / referenceLines
 * / showDots). Renderiza o componente REAL com react-dom/server: o Vite (já
 * devDependency) transpila o TSX via ssrLoadModule e o único dublê é o
 * ResponsiveContainer, que no servidor não tem layout para medir e por isso
 * recebe largura/altura fixas. Todo o resto — eixos, ticks, ReferenceLine — é o
 * Recharts de verdade.
 */
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { semantic } from "../src/tokens/tokens.ts";
import { createServer } from "vite";
import type { Plugin, ViteDevServer } from "vite";
import {
  okrFixedScaleProps,
  okrMediaMensal,
  okrProgressBounds,
  okrProgressFixture,
  okrProgressSeries,
  okrUltimoValor,
} from "../src/showcase/okrProgressFixture.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const WIDTH = 640;
const HEIGHT = 240;
const VIRTUAL = "virtual:dnex-recharts-fixed";
const SHIM = "\0dnex-fixed-responsive-container";
const VIRTUAL_MOTION = "virtual:dnex-motion-flag";
const SHIM_MOTION = "\0dnex-motion-flag";
const REDUCE_FLAG = "__dnexTestReduceMotion";

// O Vite externaliza "recharts" no SSR antes de consultar resolveId, então o
// desvio é feito no transform dos próprios arquivos de charts/: só ali o
// especificador vira o módulo virtual; o shim reexporta o recharts real.
const fixedContainer: Plugin = {
  name: "dnex-test-fixed-container",
  enforce: "pre",
  transform(code, id) {
    if (!id.includes("/src/components/charts/")) return null;
    return code
      .replace(/from "recharts"/g, `from "${VIRTUAL}"`)
      .replace(/from "motion\/react"/g, `from "${VIRTUAL_MOTION}"`);
  },
  resolveId(id) {
    if (id === VIRTUAL) return SHIM;
    if (id === VIRTUAL_MOTION) return SHIM_MOTION;
    return null;
  },
  load(id) {
    if (id === SHIM) {
      return `
        import { Children, cloneElement } from "react";
        export * from "recharts";
        export function ResponsiveContainer({ children }) {
          return cloneElement(Children.only(children), { width: ${WIDTH}, height: ${HEIGHT} });
        }
      `;
    }
    if (id === SHIM_MOTION) {
      // No servidor não há matchMedia: a preferência é injetada por flag global
      // para provar que o componente liga a animação ao hook do DS.
      return `
        export * from "motion/react";
        export const useReducedMotion = () => globalThis.${REDUCE_FLAG} ?? null;
      `;
    }
    return null;
  },
};

let server: ViteDevServer;
let LineChartDnex: typeof import("../src/components/charts/LineChartDnex.tsx").LineChartDnex;
let BarChartDnex: typeof import("../src/components/charts/BarChartDnex.tsx").BarChartDnex;
let AreaChartDnex: typeof import("../src/components/charts/AreaChartDnex.tsx").AreaChartDnex;
let ThemeProvider: typeof import("../src/lib/theme.tsx").ThemeProvider;

before(async () => {
  server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "error",
    plugins: [fixedContainer],
    esbuild: { jsx: "automatic" },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  ({ LineChartDnex } = await server.ssrLoadModule("/src/components/charts/LineChartDnex.tsx"));
  ({ BarChartDnex } = await server.ssrLoadModule("/src/components/charts/BarChartDnex.tsx"));
  ({ AreaChartDnex } = await server.ssrLoadModule("/src/components/charts/AreaChartDnex.tsx"));
  ({ ThemeProvider } = await server.ssrLoadModule("/src/lib/theme.tsx"));
});

after(async () => {
  await server?.close();
});

function render(props: Record<string, unknown>, chart: typeof LineChartDnex | typeof BarChartDnex | typeof AreaChartDnex = LineChartDnex) {
  return renderToStaticMarkup(
    createElement(
      ThemeProvider as never,
      { defaultTheme: "dark", persist: false } as never,
      createElement(chart as never, props as never),
    ),
  );
}

/** y1 da(s) linha(s) de referência renderizada(s). */
function referenceYs(markup: string) {
  return [...markup.matchAll(/<line\b([^>]*)class="recharts-reference-line-line"/g)].map((m) => Number(/\sy1="([-\d.]+)"/.exec(m[1] ?? "")?.[1]));
}

/** Ticks do eixo Y renderizados: rótulo e coordenada vertical. */
function yTicksOf(markup: string) {
  const ticks: { value: string; y: number }[] = [];
  for (const m of markup.matchAll(/<text\b([^>]*)>\s*<tspan[^>]*>([^<]*)<\/tspan>/g)) {
    const attrs = m[1] ?? "";
    if (!attrs.includes("recharts-cartesian-axis-tick-value")) continue;
    if (!(attrs.includes('orientation="left"') || attrs.includes('text-anchor="end"'))) continue;
    const y = /\sy="([-\d.]+)"/.exec(attrs);
    assert.ok(y, `tick sem coordenada y: ${attrs}`);
    ticks.push({ value: m[2] ?? "", y: Number(y[1]) });
  }
  return ticks;
}

const count = (markup: string, needle: string) => markup.split(needle).length - 1;
const percent = (v: number) => `${v}%`;

const okrProps = {
  data: okrProgressFixture,
  xKey: "mes",
  series: okrProgressSeries,
  valueFormatter: percent,
};

test("com yDomain [0,100] e yTicks, os ticks renderizados são exatamente os pedidos e cabem no gráfico", () => {
  const markup = render({ ...okrProps, ...okrFixedScaleProps });
  const ticks = yTicksOf(markup);
  assert.deepEqual(
    ticks.map((t) => t.value),
    okrFixedScaleProps.yTicks.map(percent),
  );
  for (const t of ticks) assert.ok(t.y >= 0 && t.y <= HEIGHT, `tick ${t.value} fora do gráfico (y=${t.y})`);
  for (let i = 1; i < ticks.length; i += 1) {
    const prev = ticks[i - 1]!;
    const cur = ticks[i]!;
    assert.ok(cur.y < prev.y, `tick ${cur.value} deveria ficar acima de ${prev.value}`);
  }
});

test("a linha de referência 'Meta' existe, é tracejada, usa o tom do tema e coincide com o tick de 100%", () => {
  const markup = render({ ...okrProps, ...okrFixedScaleProps });
  assert.equal(count(markup, 'class="recharts-layer recharts-reference-line"'), 1);
  const line = /<line\b([^>]*)class="recharts-reference-line-line"/.exec(markup)?.[1] ?? "";
  assert.match(line, /stroke-dasharray="4 4"/);
  assert.ok(line.includes(`stroke="${semantic.dark.fgSubtle}"`), "tom muted = fgSubtle do tema escuro, derivado de tokens.ts (não hex solto)");
  assert.match(markup, /Meta<\/tspan>|>Meta</);
  const y1 = Number(/\sy1="([-\d.]+)"/.exec(line)?.[1]);
  const top = yTicksOf(markup).find((t) => t.value === "100%");
  assert.ok(top, "tick de 100% presente");
  assert.ok(Math.abs(y1 - top.y) < 1, `linha de meta (y=${y1}) deve coincidir com o tick de 100% (y=${top.y})`);
});

test("showDots desenha um ponto por observação medida e respeita a lacuna (null não vira ponto)", () => {
  const markup = render({ ...okrProps, ...okrFixedScaleProps });
  const medidas = okrProgressFixture.reduce(
    (acc, row) => acc + okrProgressSeries.filter((s) => typeof row[s.dataKey] === "number").length,
    0,
  );
  assert.equal(medidas, 17, "6 meses × 3 séries − 1 lacuna");
  assert.equal(count(markup, 'class="recharts-dot recharts-line-dot"'), medidas);
});

test("sem as props novas, nada muda: eixo automático, sem referência, sem pontos, três curvas", () => {
  const markup = render(okrProps);
  assert.equal(count(markup, "recharts-reference-line"), 0);
  assert.equal(count(markup, 'class="recharts-dot recharts-line-dot"'), 0);
  assert.equal(count(markup, 'class="recharts-curve recharts-line-curve"'), 3);
  assert.equal(count(markup, 'recharts-yAxis yAxis"'), 1);
  assert.equal(count(markup, 'class="recharts-cartesian-grid"'), 1);
  assert.ok(yTicksOf(markup).length > 0, "eixo Y continua com ticks automáticos");
});

test("sob prefers-reduced-motion a curva nasce estática; sem a preferência, o Recharts anima", () => {
  const g = globalThis as Record<string, unknown>;
  try {
    g[REDUCE_FLAG] = true;
    const still = render(okrProps);
    const stillCurves = [...still.matchAll(/<path\b[^>]*recharts-line-curve[^>]*>/g)].map((m) => m[0]);
    assert.equal(stillCurves.length, 3);
    for (const path of stillCurves) assert.doesNotMatch(path, /stroke-dasharray/, "curva estática, sem traço de animação");

    g[REDUCE_FLAG] = false;
    const moving = render(okrProps);
    const movingCurves = [...moving.matchAll(/<path\b[^>]*recharts-line-curve[^>]*>/g)].map((m) => m[0]);
    assert.equal(movingCurves.length, 3);
    for (const path of movingCurves) assert.match(path, /stroke-dasharray/, "com movimento permitido o Recharts anima o traço");
  } finally {
    delete g[REDUCE_FLAG];
  }
});

test("o caso do DNEX Metas: série estreita (45–52%) só é comparável com o eixo fixo", () => {
  const data = [45, 48, 52, 47, 50, 52].map((okr, i) => ({ mes: `M${i + 1}`, okr }));
  const base = { data, xKey: "mes", series: [{ dataKey: "okr", name: "OKR" }] };

  const auto = yTicksOf(render(base)).map((t) => Number(t.value));
  assert.ok(Math.max(...auto) < 100, `eixo automático estica a série (teto ${Math.max(...auto)}): 52% pareceria meta batida`);

  // Só yDomain, SEM yTicks e SEM linha de meta: é o domínio que segura o teto
  // em 100. No Recharts tanto ticks explícitos quanto uma ReferenceLine com
  // extendDomain estendem o domínio sozinhos e mascarariam a ausência de
  // yDomain — por isso a prova negativa (remover yDomain) só cai aqui.
  const { yDomain, yTicks } = okrFixedScaleProps;
  const domainOnly = yTicksOf(render({ ...base, yDomain }));
  assert.equal(domainOnly.at(-1)?.value, "100", `yDomain sozinho leva o eixo a 100 (veio ${domainOnly.map((t) => t.value).join(",")})`);
  for (const t of domainOnly) assert.ok(t.y >= 0 && t.y <= HEIGHT, `tick ${t.value} fora do gráfico (y=${t.y}) — sem yDomain o eixo automático expulsa o topo`);

  const domainAndTicks = yTicksOf(render({ ...base, yDomain, yTicks }));
  assert.deepEqual(domainAndTicks.map((t) => t.value), ["0", "25", "50", "75", "100"]);
  for (const t of domainAndTicks) assert.ok(t.y >= 0 && t.y <= HEIGHT, `tick ${t.value} fora do gráfico (y=${t.y})`);

  const fixed = yTicksOf(render({ ...base, ...okrFixedScaleProps }));
  assert.deepEqual(fixed.map((t) => t.value), ["0", "25", "50", "75", "100"]);
  for (const t of fixed) assert.ok(t.y >= 0 && t.y <= HEIGHT, `tick ${t.value} fora do gráfico (y=${t.y})`);
});

test("a fixture ilustrativa da vitrine é consistente e testável", () => {
  assert.equal(okrProgressFixture.length, 6);
  assert.equal(okrProgressSeries.length, 3);
  const valores = okrProgressFixture.flatMap((row) => okrProgressSeries.map((s) => row[s.dataKey]));
  const nulos = valores.filter((v) => v === null);
  const numeros = valores.filter((v): v is number => typeof v === "number");
  assert.equal(nulos.length, 1, "exatamente um mês sem dado");
  assert.equal(numeros.length, 17);
  assert.equal(Math.min(...numeros), okrProgressBounds.min);
  assert.equal(Math.max(...numeros), okrProgressBounds.max);
  assert.equal(numeros.reduce((a, b) => a + b, 0), 893, "soma de controle: 311 + 305 + 277");

  const [min, max] = okrFixedScaleProps.yDomain;
  assert.equal(min, 0);
  assert.equal(max, 100);
  for (const tick of okrFixedScaleProps.yTicks) assert.ok(tick >= 0 && tick <= 100);
  assert.equal(okrFixedScaleProps.referenceLines[0]?.y, max, "a meta é o teto do domínio");
  for (const n of numeros) assert.ok(n > 0 && n < 100, "nenhum dado encosta no teto: o teto é a meta, não o dado");

  assert.equal(okrMediaMensal(okrProgressFixture[0]!), 25.7);
  assert.equal(okrMediaMensal(okrProgressFixture[3]!), 53.5, "média de abril ignora a lacuna (52+55)/2");
  assert.equal(okrUltimoValor("produto"), 88);
  assert.equal(okrUltimoValor("comercial"), 95);
});

test("a vitrine espalha a mesma escala fixa nos demos e oferece tabela e par automático × fixo", () => {
  const catalog = readFileSync(new URL("../src/showcase/Catalog.tsx", import.meta.url), "utf8");
  assert.match(catalog, /Linha — escala fixa \(progresso 0–100%\)/);
  assert.equal(count(catalog, "{...okrFixedScaleProps}"), 2, "demo principal + lado fixo do par");
  assert.match(catalog, /id="demo-okr-escala-fixa"/);
  assert.match(catalog, /id="demo-okr-auto-vs-fixo"/);
  assert.match(catalog, /data-scale="auto"/);
  assert.match(catalog, /data-scale="fixed"/);
  const secao = catalog.slice(catalog.indexOf('id="graficos"'), catalog.indexOf('id="loading"'));
  assert.match(secao, /<table>/);
  assert.match(secao, /okrMediaMensal\(row\)/);
  assert.match(secao, /Dados ilustrativos/);
});

test("os três gráficos cartesianos desligam a animação sob prefers-reduced-motion", () => {
  for (const file of ["LineChartDnex", "BarChartDnex", "AreaChartDnex"]) {
    const src = readFileSync(new URL(`../src/components/charts/${file}.tsx`, import.meta.url), "utf8");
    assert.match(src, /useReducedMotion\(\)/, `${file} usa o mecanismo do DS`);
    assert.match(src, /isAnimationActive=\{!reduceMotion\}/, `${file} liga a animação à preferência`);
    assert.doesNotMatch(src, /isAnimationActive\s*\n|isAnimationActive\s+\/>/, `${file} sem animação incondicional`);
    assert.match(src, /referenceLineElements\(referenceLines, t\)/, `${file} partilha o contrato de escala`);
    assert.match(src, /yAxisScaleProps\(\{ yDomain, yTicks \}\)/, `${file} repassa domínio e ticks ao YAxis`);
  }
});


/*
 * Achado da revisão: uma meta ACIMA do domínio sumia em silêncio. O React 19
 * (jsx-runtime) ignora `defaultProps`, e o Recharts 2.15 resolve o eixo pelo
 * `yAxisId` padrão — sem `yAxisId` explícito a ReferenceLine não encontrava o
 * eixo, não estendia o domínio e era desenhada fora do gráfico.
 */
test("meta acima do domínio estende o eixo em vez de sumir (yDomain [0,100] + meta 120)", () => {
  const data = [45, 80, 95].map((okr, i) => ({ mes: `M${i + 1}`, okr }));
  const markup = render({
    data,
    xKey: "mes",
    series: [{ dataKey: "okr", name: "OKR" }],
    yDomain: [0, 100],
    referenceLines: [{ y: 120, label: "Meta ampliada" }],
  });
  const ticks = yTicksOf(markup).map((t) => Number(t.value));
  assert.ok(Math.max(...ticks) >= 120, `o eixo deve chegar à meta (ticks ${ticks.join(",")})`);
  const [y1] = referenceYs(markup);
  assert.ok(y1 !== undefined && y1 >= 0 && y1 <= HEIGHT, `a linha de meta deve ficar DENTRO do gráfico (y1=${y1})`);
});

test("meta sem yDomain também estende o eixo automático até ela", () => {
  const data = [10, 20, 30].map((v, i) => ({ mes: `M${i + 1}`, v }));
  const markup = render({ data, xKey: "mes", series: [{ dataKey: "v" }], referenceLines: [{ y: 100 }] });
  const [y1] = referenceYs(markup);
  assert.ok(y1 !== undefined && y1 >= 0 && y1 <= HEIGHT, `meta em 100 com dados até 30 precisa aparecer (y1=${y1})`);
});

test("Bar e Area cumprem o mesmo contrato: ticks pedidos e meta dentro do gráfico", () => {
  const data = [45, 80, 95].map((okr, i) => ({ mes: `M${i + 1}`, okr }));
  for (const [nome, chart] of [["Bar", BarChartDnex], ["Area", AreaChartDnex]] as const) {
    const markup = render(
      { data, xKey: "mes", series: [{ dataKey: "okr", name: "OKR" }], yDomain: [0, 100], yTicks: [0, 50, 100], referenceLines: [{ y: 100, label: "Meta" }] },
      chart,
    );
    assert.deepEqual(yTicksOf(markup).map((t) => t.value), ["0", "50", "100"], `${nome}: ticks`);
    const ys = referenceYs(markup);
    assert.equal(ys.length, 1, `${nome}: uma linha de meta`);
    assert.ok(ys[0]! >= 0 && ys[0]! <= HEIGHT, `${nome}: meta dentro do gráfico (y1=${ys[0]})`);
  }
});
