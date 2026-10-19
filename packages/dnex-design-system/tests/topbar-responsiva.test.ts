import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Guarda do comportamento da barra do topo APROVADO PELO DONO em 27/08/2026.
 *
 * A regra que ele pediu: *"em telas menores os botões do topbar se agrupam num botão sanduíche"* —
 * e, depois de ver medido, *"mesmo em telas estreitas cabe o botão agrupador e o campo de buscar"*.
 *
 * Três propriedades, e cada uma custou uma medição:
 *
 * 1. **UM ponto de corte só.** O agrupamento e a troca de colunas mudam no MESMO `lg:`. Antes o
 *    agrupamento era `xl:` (1280) e as colunas `lg:` (1024): entre os dois havia uma faixa em que
 *    nem o agrupado nem o espalhado ficavam bons — a busca sumia sem substituto, achado medido
 *    pelo revisor em 26/08.
 * 2. **A busca não desaparece em tela estreita.** O centro era `hidden lg:block`, o que a tirava
 *    inteiramente abaixo de 1024. Medido em 27/08: com o slot da conta ocupado por um avatar (e
 *    não pelo seletor de empresa, que come 308 dos 390px de um celular), o campo cabe com 127px em
 *    390px e 96px em 320px.
 * 3. **Nada de duas buscas.** `mobileSearch` existe para quando o centro está OCULTO; com o centro
 *    visível, ele vira uma segunda busca lado a lado — apareceu assim na medição de 27/08.
 */
const ler = (p: string) => readFileSync(fileURLToPath(new URL(`../src/components/shell/${p}`, import.meta.url)), "utf8");

test("o agrupamento e a troca de colunas usam O MESMO ponto de corte (lg)", () => {
  const acoes = ler("TopbarGlobalActions.tsx");
  assert.match(acoes, /lg:contents/, "as ações espalhadas precisam aparecer a partir de lg");
  assert.match(acoes, /lg:hidden/, "o botão agrupador precisa sumir a partir de lg");
  assert.doesNotMatch(acoes, /\bxl:(contents|hidden)\b/, "ponto de corte xl: cria uma faixa órfã entre 1024 e 1280 — foi o defeito medido em 26/08");

  const topbar = ler("Topbar.tsx");
  assert.match(topbar, /lg:grid-cols-/, "a troca para três colunas é em lg, para casar com o agrupamento");
  assert.doesNotMatch(topbar, /md:grid-cols-\[minmax\(0,1fr\)_minmax/, "em md: as três colunas espremiam as laterais entre 768 e 1024");
});

test("a busca do slot central NÃO some em tela estreita", () => {
  const topbar = ler("Topbar.tsx");
  assert.doesNotMatch(topbar, /hidden min-w-0 (lg|md|xl):block/, "esconder o centro tira a busca sem oferecer substituto — o dono aprovou com ela visível");
  assert.match(topbar, /grid-cols-\[minmax\(0,1fr\)_minmax\(96px,1fr\)_auto\]/, "em tela estreita o centro tem piso de 96px: medido, é o que cabe em 320px sem espremer o resto");
});

test("o botão agrupador continua existindo e é anunciado", () => {
  const acoes = ler("TopbarGlobalActions.tsx");
  assert.match(acoes, /aria-label="Mais ações globais"/, "quem usa leitor de tela precisa saber o que o botão faz");
  assert.match(acoes, /role="group"/, "o conjunto de ações é um grupo anunciável");
});

test("as ações dinâmicas entram no MESMO agrupador", () => {
  // Dois botões sanduíche na mesma barra seria o próximo erro; o slot `extras` existe para evitá-lo.
  const acoes = ler("TopbarGlobalActions.tsx");
  assert.match(acoes, /extras\?:/, "falta o slot para itens vindos do control plane");
  assert.match(acoes, /\.\.\.\(extras \?\? \[\]\)/, "os extras precisam entrar na lista do agrupamento, não ficar só espalhados");
});


/** A LINHA de JSX do slot, sem comentário — comentário não pode satisfazer asserção de render. */
function linhaDoSlot(fonte: string, marcador: string): string {
  const l = fonte.split("\n").filter((x) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(x)).find((x) => x.includes(marcador));
  assert.ok(l, `não achei a linha que renderiza ${marcador}`);
  return l;
}

test("o slot central não pode ser escondido por NENHUM caminho", () => {
  // 8 de 9 mutantes sobreviviam à 1ª versão: bastava reordenar as classes (`min-w-0 hidden
  // lg:block`), usar `max-lg:hidden`, `sm:hidden`, `style={{display:"none"}}` inline, ou trocar o
  // conteúdo por `{null}`. Asserção sobre a LINHA fecha os cinco.
  const linha = linhaDoSlot(ler("Topbar.tsx"), "{center}");
  assert.doesNotMatch(linha, /\bhidden\b/, "esconder o centro tira a busca — o dono aprovou com ela visível em toda largura");
  assert.doesNotMatch(linha, /(max-)?(sm|md|lg|xl|2xl):hidden/, "esconder por ponto de corte é o mesmo defeito com outra sintaxe");
  assert.doesNotMatch(linha, /display:\s*["']?none/, "display:none inline burla a checagem de classe");
  assert.match(linha, /\{center\}/, "o slot precisa renderizar o conteúdo, não `{null}`");
});

test("o agrupador aparece abaixo de lg e some a partir dele — sem `hidden` solto", () => {
  const fonte = ler("TopbarGlobalActions.tsx");
  const gatilho = linhaDoSlot(fonte, 'aria-label="Mais ações globais"');
  const classe = fonte.split("\n").slice(fonte.split("\n").indexOf(gatilho)).find((l) => l.includes("className="));
  assert.ok(classe, "não achei a classe do gatilho");
  // `["\s]` e não `(^|\s)`: a classe começa logo depois da aspa (`className="hidden inline-flex`),
  // e a versão anterior não casava — o mutante que fazia o agrupador sumir SOBREVIVIA.
  assert.doesNotMatch(classe, /["\s]hidden[\s"]/, "`hidden` solto no gatilho o esconde em TODA largura — o agrupador some");
  assert.match(classe, /\blg:hidden\b/, "o agrupador tem de sumir a partir de lg");

  const espalhado = linhaDoSlot(fonte, "lg:contents");
  assert.match(espalhado, /"hidden /, "sem `hidden` no início da classe do invólucro, os ícones aparecem soltos TAMBÉM em tela estreita");
});

test("o ponto de corte é literalmente `lg`, não outro qualquer", () => {
  // O mutante que sobrevivia: trocar o corte real para `2xl:` e deixar um comentário citando `lg:`.
  const fonte = ler("TopbarGlobalActions.tsx");
  assert.match(linhaDoSlot(fonte, "contents"), /\blg:contents\b/, "o corte do espalhado tem de ser lg — 1024, o mesmo da troca de colunas");
  const topbar = ler("Topbar.tsx");
  assert.match(linhaDoSlot(topbar, "grid-cols-"), /\blg:grid-cols-/, "o corte das colunas tem de ser lg");
});

test("a 3ª coluna cabe o conteúdo — senão as ações transbordam por cima da busca", () => {
  // Com `minmax(0,1fr)` ela valia 174px em 1024 contra ~250px de ações; o excesso transbordava
  // para a esquerda e o botão "Ajuda" ficava invisível e INCLICÁVEL entre 1024 e 1136px. Medido
  // com `click()` estourando timeout, 27/08/2026.
  const linha = linhaDoSlot(ler("Topbar.tsx"), "lg:grid-cols-");
  const grade = linha.match(/lg:grid-cols-\[([^\]]+)\]/)?.[1] ?? "";
  assert.ok(grade.endsWith("_auto"), `a 3ª coluna precisa ser \`auto\` (tamanho do conteúdo), não fração: ${grade}`);
});

test("os `extras` aparecem TAMBÉM espalhados, não só no agrupamento", () => {
  const fonte = ler("TopbarGlobalActions.tsx");
  assert.match(fonte, /\{extras\?\.map\(/, "sem isto, o item dinâmico some em tela larga — aparece agrupado e desaparece espalhado");
});


test("a conta some da barra em tela estreita e reaparece dentro do agrupador", () => {
  // Diretriz do dono (27/08): "o botão do usuário na versão mobile também pode ir para o ícone
  // sanduíche". Ganho medido de quebra: sem o avatar na barra, o nome do produto deixou de
  // truncar em 390px.
  const fonte = ler("TopbarGlobalActions.tsx");
  assert.match(fonte, /\["Conta", account\]/, "a conta precisa entrar na lista do agrupamento");
  const solta = linhaDoSlot(fonte, "{account}");
  assert.match(solta, /\bhidden\b/, "fora do agrupador a conta só pode aparecer a partir de lg");
  assert.match(solta, /\blg:block\b/, "e precisa VOLTAR a aparecer em tela larga, na última posição");
});
