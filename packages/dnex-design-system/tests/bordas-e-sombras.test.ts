import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Guarda da BORDA EM CAMADA e do visual PLANO (decisão do dono, 10/10/2026).
 *
 * DEFEITO REAL (medido no Hub de produção por getComputedStyle, não deduzido): a regra global
 * `* { border-color: var(--line) }` ficava FORA de @layer. No Tailwind v4, CSS sem camada vence
 * qualquer utilidade em @layer utilities, então `border-line-strong`, `border-action` e
 * `border-[var(--tone-*)]` saíam todos como `--line`: aviso sem o tom, campo inválido sem vermelho
 * e o Switch desligado com borda de 1,25:1 contra o branco — praticamente invisível.
 *
 * Junto com a correção, o dono aprovou o visual plano: sem sombra decorativa no botão primário, no
 * de destaque, no passo ativo do Stepper e no botão do Switch. Sem sombra, o Switch desligado só é
 * legível com preenchimento próprio; por isso o contraste é conferido a partir dos tokens.
 */
const raiz = fileURLToPath(new URL("../src", import.meta.url));
const ler = (rel: string) => readFileSync(`${raiz}/${rel}`, "utf8");
const semComentarios = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Blocos de nível superior: [prelúdio, corpo]. */
function blocosDoTopo(css: string): Array<[string, string]> {
  const blocos: Array<[string, string]> = [];
  let profundidade = 0, inicioPrelude = 0, inicioCorpo = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === "{") {
      if (profundidade === 0) inicioCorpo = i + 1;
      profundidade++;
    } else if (c === "}") {
      profundidade--;
      if (profundidade === 0) {
        blocos.push([css.slice(inicioPrelude, inicioCorpo - 1).trim(), css.slice(inicioCorpo, i)]);
        inicioPrelude = i + 1;
      }
    } else if (c === ";" && profundidade === 0) inicioPrelude = i + 1;
  }
  return blocos;
}

/** Todas as regras de estilo, em qualquer profundidade, com a cadeia de at-rules que as envolve. */
function regras(css: string, contexto: string[] = []): Array<{ seletor: string; corpo: string; contexto: string[] }> {
  const saida: Array<{ seletor: string; corpo: string; contexto: string[] }> = [];
  for (const [prelude, corpo] of blocosDoTopo(css)) {
    if (prelude.startsWith("@")) saida.push(...regras(corpo, [...contexto, prelude]));
    else saida.push({ seletor: prelude, corpo, contexto });
  }
  return saida;
}

/** Sombra ou halo em classes Tailwind: shadow, shadow-*, drop-shadow-*, ring-N/ring-[…] (com variantes). */
const SOMBRA_OU_HALO = /(?:^|[\s:"])(?:drop-)?shadow(?:-|(?=[\s"]|$))|(?:^|[\s:"])ring-(?:\d|\[)/;

test("a cor padrão de borda fica em @layer base, nunca sem camada (em nenhuma profundidade)", () => {
  const todas = regras(semComentarios(ler("styles/theme.css")));
  // Qualquer seletor com o universal (`*`, `html *`, `:where(*)`) que declare borda e não esteja em @layer.
  const universal = /(?:^|[\s>+~(,])\*(?=$|[\s:)\[.,>+~])/;
  const infratores = todas.filter((r) => !r.contexto.some((c) => /^@layer\b/.test(c)) && universal.test(r.seletor) && /(?:^|;|\s)border(?:-color)?\s*:/.test(r.corpo));
  assert.deepEqual(infratores.map((r) => [...r.contexto, r.seletor].join(" › ")), [], "regra universal de borda fora de @layer anula as utilidades de cor de borda");
  const base = todas.filter((r) => r.contexto.length === 1 && /^@layer\s+base$/.test(r.contexto[0]) && r.seletor === "*");
  assert.ok(base.some((r) => /^\s*border-color:\s*var\(--line\);?\s*$/.test(r.corpo)), "a borda padrão --line precisa continuar existindo, em @layer base e sem !important");
});

test("botões primário e de destaque não têm sombra decorativa (nem pela base)", () => {
  const fonte = ler("components/primitives/Button.tsx");
  const base = fonte.match(/const base =\s*((?:\s*"[^"]*"\s*\+?)+);/);
  assert.ok(base, "classe base não encontrada");
  assert.doesNotMatch(base[1], SOMBRA_OU_HALO, "a base do Button voltou a ter sombra");
  for (const variante of ["primary", "accent"]) {
    const m = fonte.match(new RegExp(`\\n\\s*${variante}:\\s*\\n?((?:\\s*"[^"]*"\\s*\\+?)+),`));
    assert.ok(m, `variante ${variante} não encontrada`);
    assert.doesNotMatch(m[1], SOMBRA_OU_HALO, `variante ${variante} voltou a ter sombra`);
  }
});

test("passo ativo do Stepper não tem halo (nem por sombra, nem por ring)", () => {
  const fonte = ler("components/composed/Stepper.tsx");
  const ativo = fonte.match(/state === "active" &&\s*("[^"]*")/);
  assert.ok(ativo, "classe do passo ativo não encontrada");
  assert.doesNotMatch(ativo[1], SOMBRA_OU_HALO);
});

test("Switch é plano e anima: sem sombra, trilha --line-strong, botão --fg-subtle, transição do translate", () => {
  const fonte = ler("components/primitives/Switch.tsx");
  const codigo = fonte.split("\n").filter((l) => !/^\s*(\*|\/\*|\/\/)/.test(l)).join("\n");
  // O anel de foco da raiz (focus-visible:ring-*) é acessibilidade e fica; sombra não.
  assert.doesNotMatch(codigo, /(?:^|[\s:"])(?:drop-)?shadow(?:-|(?=[\s"]|$))/, "Switch não pode depender de sombra");
  assert.match(codigo, /"[^"]*\bbg-\[var\(--line-strong\)\][^"]*data-\[state=checked\]:bg-action/, "trilha desligada preenchida e ligada em ação");
  const thumb = codigo.match(/RSwitch\.Thumb className="([^"]+)"/);
  assert.ok(thumb, "Thumb não encontrado");
  assert.doesNotMatch(thumb[1], SOMBRA_OU_HALO, "botão do Switch sem sombra nem halo");
  assert.match(thumb[1], /\bbg-\[var\(--fg-subtle\)\]/, "botão desligado em --fg-subtle");
  assert.match(thumb[1], /data-\[state=checked\]:bg-white/, "botão ligado branco sobre a ação");
  // No Tailwind v4, translate-x-* usa a propriedade `translate`: sem ela na transição o botão salta.
  assert.match(thumb[1], /\btranslate-x-/, "o botão desliza por translate-x");
  assert.match(thumb[1], /\btransition-(?:transform|all)\b|\btransition-\[[^\]]*\btranslate\b[^\]]*\]/, "a transição precisa incluir translate");
});

// ── contraste a partir dos tokens publicados ────────────────────────────────────────────────────
type Rgba = [number, number, number, number];
function cor(valor: string): Rgba {
  const v = valor.trim();
  const hex = v.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const rgba = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  assert.ok(rgba, `cor não suportada no teste: ${v}`);
  return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] === undefined ? 1 : Number(rgba[4])];
}
const sobre = (frente: Rgba, fundo: Rgba): Rgba => {
  const a = frente[3];
  return [0, 1, 2].map((i) => frente[i] * a + fundo[i] * (1 - a)).concat(1) as Rgba;
};
const luminancia = ([r, g, b]: Rgba) =>
  [r, g, b].map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
const contraste = (a: Rgba, b: Rgba) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test("Switch desligado tem contraste ≥ 3:1 (WCAG 1.4.11) nos temas claro e escuro", () => {
  const blocos = blocosDoTopo(semComentarios(ler("styles/theme.css")));
  const temas: Record<string, string> = {
    claro: blocos.find(([p]) => p.includes('[data-theme="light"]'))?.[1] ?? "",
    escuro: blocos.find(([p]) => p === '[data-theme="dark"]')?.[1] ?? "",
  };
  for (const [nome, corpo] of Object.entries(temas)) {
    const token = (t: string) => {
      const m = corpo.match(new RegExp(`${t}\\s*:\\s*([^;]+);`));
      assert.ok(m, `${t} ausente no tema ${nome}`);
      return cor(m[1]);
    };
    const superficie = token("--surface");
    const trilha = sobre(token("--line-strong"), superficie);
    const botao = sobre(token("--fg-subtle"), superficie);
    assert.ok(contraste(botao, trilha) >= 3, `${nome}: botão × trilha ${contraste(botao, trilha).toFixed(2)}:1`);
    assert.ok(contraste(botao, superficie) >= 3, `${nome}: botão × superfície ${contraste(botao, superficie).toFixed(2)}:1`);
  }
});
