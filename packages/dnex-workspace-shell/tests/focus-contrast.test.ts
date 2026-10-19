import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * O indicador de foco do shell precisa ter contraste >= 3:1 (WCAG 2.2, 1.4.11) contra o fundo em que aparece.
 * O teste lê o CSS e os tokens reais; não repete cores à mão.
 */
const shellCss = readFileSync(new URL("../src/workspace-shell.css", import.meta.url), "utf8");
const themeCss = readFileSync(new URL("../../dnex-design-system/src/styles/theme.css", import.meta.url), "utf8");
const allCss = themeCss;

function lin(c: number) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}
function lum(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
}
function ratio(a: string, b: string) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Valor literal de um token dentro do bloco do tema (`dark` = primeiro bloco com o token, `light` = o segundo). */
function token(name: string, theme: "dark" | "light"): string {
  const matches = [...allCss.matchAll(new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{6})`, "g"))].map((m) => m[1]!);
  assert.ok(matches.length > 0, `token --${name} não encontrado`);
  if (matches.length === 1) return matches[0]!;
  return theme === "dark" ? matches[0]! : matches[1]!;
}

test("nenhuma regra de foco do shell usa o halo translúcido --action-ring como contorno", () => {
  const focusRules = shellCss.split("\n").filter((l) => /focus-visible|focus-within/.test(l) && /outline/.test(l));
  assert.ok(focusRules.length >= 2);
  for (const rule of focusRules) assert.ok(!/action-ring/.test(rule), `regra de foco usa --action-ring: ${rule.trim()}`);
});

test("o anel do conteúdo usa --focus-ring e tem >= 3:1 sobre página e card nos dois temas", () => {
  assert.match(shellCss, /\.dnex-shell-root a:focus-visible[^{]*\{[^}]*outline:\s*2px solid var\(--focus-ring\)/s);
  for (const theme of ["light", "dark"] as const) {
    const ring = token("focus-ring", theme);
    for (const bg of ["bg", "surface"]) {
      const r = ratio(ring, token(bg, theme));
      assert.ok(r >= 3, `anel ${ring} sobre ${bg} (${theme}) = ${r.toFixed(2)}:1`);
    }
  }
});

test("o trilho de produtos (índigo-950 nos dois temas) usa um anel claro com >= 3:1", () => {
  const m = shellCss.match(/\.dnex-shell-product-rail a:focus-visible[^{]*\{[^}]*outline-color:\s*var\(--color-(indigo-\d+)\)/s);
  assert.ok(m, "regra do anel do trilho ausente");
  const ring = token(`color-${m![1]}`, "dark");
  const rail = token("color-indigo-950", "dark");
  assert.ok(ratio(ring, rail) >= 3, `anel do trilho ${ring} sobre ${rail} = ${ratio(ring, rail).toFixed(2)}:1`);
  assert.match(shellCss, /\.dnex-shell-product-rail\s*\{[^}]*background:\s*var\(--color-indigo-950\)/s);
});
