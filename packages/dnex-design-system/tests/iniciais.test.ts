import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { iniciais } from "../src/lib/iniciais.ts";

test("rótulo vazio ou só com espaços degrada para o marcador, nunca para vazio", () => {
  assert.equal(iniciais(""), "•");
  assert.equal(iniciais("  "), "•");
  assert.equal(iniciais(" \t\n "), "•");
});

test("uma palavra usa as duas primeiras letras em maiúsculas", () => {
  assert.equal(iniciais("Aurora"), "AU");
  assert.equal(iniciais("a"), "A");
  assert.equal(iniciais("  Fiscal  "), "FI");
});

test("duas ou mais palavras usam a inicial das duas primeiras", () => {
  assert.equal(iniciais("DNEX Normas"), "DN");
  assert.equal(iniciais("ab cd ef"), "AC");
  assert.equal(iniciais("ab   cd    ef"), "AC");
  assert.equal(iniciais("  dnex \t normas  "), "DN");
});

test("a implementação não usa acesso indexado inseguro (noUncheckedIndexedAccess)", () => {
  const source = readFileSync(new URL("../src/lib/iniciais.ts", import.meta.url), "utf8");
  // Só o código conta: o cabeçalho documenta o padrão antigo justamente para não voltar.
  const codigo = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(codigo, /palavras\[\d\]/);
  assert.match(codigo, /const \[a, b\] = palavras/);
});

test("Sidebar e o índice público continuam exportando iniciais", () => {
  const sidebar = readFileSync(new URL("../src/components/shell/Sidebar.tsx", import.meta.url), "utf8");
  const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
  assert.match(sidebar, /import \{ iniciais \} from "\.\.\/\.\.\/lib\/iniciais"/);
  assert.match(sidebar, /export \{ iniciais \};/);
  // Tolerante à origem: reexportar direto de ./lib/iniciais é refatoração legítima com a mesma API pública.
  assert.match(index, /export \{ iniciais \} from "\.\/(components\/shell\/Sidebar|lib\/iniciais)";/);
});
