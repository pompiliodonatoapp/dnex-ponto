import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/**
 * Guarda da FALHA SILENCIOSA DE CSS.
 *
 * O `dist/styles.css` do design system precisa conter as classes usadas pelos pacotes que o
 * consomem, não só pelo próprio DS. Sem o `@source` do `theme.css`, uma classe que exista apenas
 * no `@dnex/workspace-shell` some do CSS publicado e o componente renderiza **sem estilo, em
 * silêncio** — sem erro, sem aviso, com typecheck verde.
 *
 * Aconteceu em 27/08/2026: a classe responsiva do shell no `WorkspaceShell` não existia no CSS, e a navegação
 * espalhada ficava `display:none` em TODA largura. E o pior: **remover o `@source` mantinha a
 * suíte 43/43 verde** — a correção existia sem detector. Este teste é o detector.
 */
const cssPath = fileURLToPath(new URL("../dist/styles.css", import.meta.url));
const shellSrc = fileURLToPath(new URL("../../dnex-workspace-shell/src", import.meta.url));

function tsx(base: string): string[] {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsx(join(base, e.name)) : e.name.endsWith(".tsx") ? [join(base, e.name)] : [],
  );
}

/**
 * Classes com VARIANTE — as que somem sem deixar rastro em desenvolvimento, porque só aparecem
 * numa largura, num foco ou num estado que ninguém está olhando na hora.
 *
 * A versão anterior tinha três buracos, todos medidos: `[a-z-]+` **truncava no dígito**, reduzindo
 * uma classe com número a um prefixo que casava com qualquer outra do DS; o escopo cobria só
 * variantes de largura, deixando de fora o link de acessibilidade e a área segura do aparelho; e
 * o valor arbitrário sem prefixo ficava invisível. Resultado: conferia 6 tokens, dois deles
 * prefixos inúteis, e o defeito real passava.
 */
function classesComVariante(fonte: string): string[] {
  const emClassName = [...fonte.matchAll(/(?:className|class)=(?:"([^"]*)"|\{`([^`]*)`\})/g)]
    .flatMap((m) => (m[1] ?? m[2] ?? "").split(/\s+/));
  const doTemplate = [...fonte.matchAll(/`([^`]*)`/g)].flatMap((m) => m[1].split(/\s+/));
  return [...new Set([...emClassName, ...doTemplate])]
    // só o que tem variante (`algo:`) — classe simples do DS já é coberta pelo próprio DS
    // Limpa pontuação colada na borda: o recorte por espaço traz aspas e chaves do JSX junto, e
    // uma classe com sobra vira um nome que nunca existirá no CSS — falso positivo garantido.
    .map((c) => c.replace(/^[^a-z0-9-]+/i, "").replace(/[^a-z0-9\])]+$/i, ""))
    .filter((c) => /^[a-z0-9-]+:/.test(c) && !c.includes("${") && c.length > 3);
}

test("o CSS publicado cobre as classes responsivas do workspace-shell", () => {
  // FALHA se não houver `dist`. A versão anterior passava com `assert.ok(true)` — teste que passa
  // por ausência do que deveria examinar é teatro. O `typecheck` da raiz roda `build:library`
  // ANTES do `test`, então no gate o `dist` está fresco; se sumir, é defeito de pipeline e tem de
  // aparecer como vermelho.
  assert.ok(existsSync(cssPath), "dist/styles.css não existe — o gate roda build:library antes de test; se sumiu, o pipeline quebrou");
  const css = readFileSync(cssPath, "utf8");
  const faltando: string[] = [];
  for (const f of tsx(shellSrc)) {
    for (const c of classesComVariante(readFileSync(f, "utf8"))) {
      // no CSS as classes aparecem escapadas: `lg\:flex`, `lg\:grid-cols-\[...\]`
      const escapada = c.replace(/[:[\]().,%#/+*]/g, (m) => "\\" + m);
      if (!css.includes(escapada)) faltando.push(`${f.slice(shellSrc.length + 1)} → ${c}`);
    }
  }
  assert.deepEqual(faltando, [], `classes do shell ausentes no CSS publicado (falta @source no theme.css?): ${faltando.join(" | ")}`);
});

test("o theme.css declara o @source do workspace-shell", () => {
  const tema = readFileSync(fileURLToPath(new URL("../src/styles/theme.css", import.meta.url)), "utf8");
  assert.match(tema, /@source\s+"[^"]*dnex-workspace-shell\/src"/, "sem esta diretiva o CSS publicado não cobre o shell");
});
