import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/**
 * Guarda da decisão de DS plano (2026-10-10): cards e botão secundário/danger
 * sem sombra e sem borda de contorno. Inputs mantêm borda (fora do escopo).
 *
 * Falha se qualquer componente do escopo reintroduzir `shadow-` ou `border`
 * de contorno no contêiner principal.
 */

const raiz = fileURLToPath(new URL("../src", import.meta.url));

function le(arq: string): string {
  return readFileSync(join(raiz, arq), "utf8");
}

/** Remove comentários e strings literais para evitar falso positivo em texto. */
function codigo(fonte: string): string {
  return fonte
    .split("\n")
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .join("\n");
}

const CARDS = [
  "components/composed/Card.tsx",
  "components/composed/StatCard.tsx",
  "components/composed/SectionPanel.tsx",
  "components/composed/ActionBanner.tsx",
  "components/composed/PricingCard.tsx",
] as const;

test("cards do escopo não usam shadow- nem border de contorno no contêiner", () => {
  const infratores: string[] = [];
  for (const arq of CARDS) {
    const s = codigo(le(arq));
    // shadow-[var(--shadow-*)], shadow-sm, shadow-lg etc. no contêiner
    if (/shadow-\[?var\(--shadow-/.test(s)) infratores.push(`${arq}: shadow-[var(--shadow-*)]`);
    if (/\bshadow-(?:sm|md|lg|xl|2xl)\b/.test(s)) infratores.push(`${arq}: shadow-sm/md/lg/xl/2xl`);
    // border de contorno genérico no CONTÊINER principal.
    // Ignora: border-t/b/r/l/x/y/collapse (separadores), elementos decorativos/badges
    // (pointer-events-none absolute, rounded-pill com border de badge, variant action/success/danger).
    const linhas = s.split("\n");
    for (const l of linhas) {
      if (/border-(?:t|b|r|l|collapse|x|y)/.test(l)) continue;
      if (/pointer-events-none\s+absolute/.test(l)) continue; // decorativo
      if (/rounded-\[var\(--radius-pill\)\]\s+border/.test(l)) continue; // badge/pill
      if (/^\s*(action|success|danger):\s*["']/.test(l)) continue; // objeto de variantes de estilo
      if (/\bborder(?:\s+border-|\s+\[)/.test(l) || /\bborder-2\b/.test(l)) {
        infratores.push(`${arq}: border de contorno → ${l.trim().slice(0, 80)}`);
      }
    }
  }
  assert.deepEqual(infratores, [], infratores.join(" | "));
});

test("Button secondary e danger sem borda de contorno", () => {
  const s = codigo(le("components/primitives/Button.tsx"));
  // Extrai blocos das variantes secondary e danger (strings concatenadas com +)
  const bloco = (nome: string) => {
    const re = new RegExp(`${nome}:\\s*(?:"[^"]*"|'[^']*')(?:\\s*\\+\\s*(?:"[^"]*"|'[^']*'))*`, "s");
    return s.match(re)?.[0] ?? "";
  };
  const sec = bloco("secondary");
  const dan = bloco("danger");
  assert.ok(sec, "variante secondary não encontrada");
  assert.ok(dan, "variante danger não encontrada");
  assert.ok(!/\bborder\b/.test(sec), `secondary com border: ${sec.slice(0, 120)}`);
  assert.ok(!/\bborder\b/.test(dan), `danger com border: ${dan.slice(0, 120)}`);
  // secondary deve usar surface-2 (tonal) e hover surface-hover
  assert.ok(/surface-2/.test(sec), "secondary precisa de bg tonal (surface-2)");
  assert.ok(/surface-hover/.test(sec), "secondary precisa de hover:bg-[var(--surface-hover)]");
});

test("inputs mantêm borda (fora do escopo — regressão)", () => {
  const input = codigo(le("components/primitives/Input.tsx"));
  const select = codigo(le("components/primitives/Select.tsx"));
  const textarea = codigo(le("components/primitives/Textarea.tsx"));
  assert.ok(/\bborder\b/.test(input), "Input perdeu a borda (regressão)");
  assert.ok(/\bborder\b/.test(select), "Select perdeu a borda (regressão)");
  assert.ok(/\bborder\b/.test(textarea), "Textarea perdeu a borda (regressão)");
});