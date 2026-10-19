import "./distribution.test.ts";
import "./navigation.test.ts"; // Also exercised by the existing root CI test entry.
import "./rail-scroll.test.ts";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Guarda do `WorkspaceShell`. Até 28/08/2026 **nenhum teste, em nenhum pacote, lia este arquivo** —
 * e ele é o que monta a tela inteira.
 *
 * O custo disso, medido pelo revisor: 3 dos 7 mutantes sobreviventes viviam aqui, incluindo
 * reintroduzir o defeito do slot que sumia no celular e esconder a conta em toda largura.
 *
 * A família de defeito que estas asserções fecham é sempre a mesma, e já apareceu quatro vezes em
 * três dias: **o contrato aceita e a tela não entrega**, com typecheck verde e suíte verde.
 */
const fonte = readFileSync(fileURLToPath(new URL("../src/WorkspaceShell.tsx", import.meta.url)), "utf8");
/**
 * Remove comentário em QUALQUER posição — não só no início da linha.
 *
 * A versão anterior filtrava por `^\s*(\/\/|\*|\/\*)`, então comentário no MEIO da linha
 * continuava fabricando evidência: `header={sidebarHeader}` virava `/* header={sidebarHeader} *\/`
 * e a asserção passava com o slot desligado. Medido em 27/08 — dois mutantes sobreviveram assim.
 */
function semComentario(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, " ")   // bloco, inclusive no meio da linha
    .replace(/\/\/[^\n]*/g, " ");          // linha
}

const codigo = semComentario(fonte);

test("`sidebarHeader` chega ao sidebar fixo E à gaveta do celular", () => {
  // Uma ponta só não basta: o defeito de 27/08 era o slot chegando ao desktop e não ao celular,
  // num produto cujo escopo inteiro é saber em qual empresa se está.
  assert.match(codigo, /header=\{sidebarHeader\}/, "o sidebar fixo precisa receber o slot");
  assert.match(codigo, /header=\{sidebarHeader\}[\s\S]*header=\{sidebarHeader\}|<MobileDrawer[^>]*header=\{sidebarHeader\}/, "a GAVETA do celular também precisa receber");
  assert.equal((codigo.match(/className="dnex-shell-sidebar-header">\{header\}/g) ?? []).length, 2, "desktop e drawer precisam renderizar o conteúdo do slot");
});

test("não existe prop `account` — ela some da barra e não tem para onde ir", () => {
  // Existiu por um dia e deixou a conta invisível de 0 a 1023px pela API documentada do shell:
  // escondida abaixo de `lg:` e repassada a agrupador nenhum. Quem exibe e agrupa a conta é o
  // `TopbarGlobalActions` do DS. Se voltar a existir aqui, tem de vir com destino, não com
  // `hidden`.
  // `account?: never` é o BLOQUEIO, não o defeito: sem ele, `<WorkspaceShell {...props} />` com
  // `account` dentro compila limpo e a conta some em silêncio (o TS não checa excedente em spread).
  assert.match(codigo, /account\?: never/, "sem `account?: never` o spread reintroduz o defeito calado");
  const semBloqueio = codigo.replace(/account\?: never;?/g, "");
  assert.doesNotMatch(semBloqueio, /\baccount\b/, "a conta pertence ao TopbarGlobalActions, dentro de `topbarRight`");
  // E o PADRÃO, não só a palavra: reintroduzir o mesmo defeito com outro nome (`perfilDoUsuario`,
  // escondido abaixo de `lg:` e repassado a agrupador nenhum) passava por todas as asserções.
  // Medido em 27/08. Slot escondido por ponto de corte sem destino é o defeito, tenha o nome que
  // tiver.
  const escondidos = [...codigo.matchAll(/\{(\w+) && <div className="hidden[^"]*lg:block"/g)].map((m) => m[1]);
  assert.deepEqual(escondidos, [], `slot(s) escondido(s) abaixo de lg sem destino: ${escondidos.join(", ")} — quem some da barra tem de reaparecer no agrupador`);
});

test("a barra inferior degrada para iniciais quando o módulo não tem ícone", () => {
  // Terceiro caso da mesma família: `{item.icon}` num <span> que ficava vazio.
  // ANCORADA NO CORPO da MobileBottomNav. Ancorada no arquivo, a asserção era satisfeita por
  // `GlobalTopbarNavigation`, que tem a mesma expressão e nada a ver com a barra inferior —
  // apagar a reserva da barra deixava a suíte 56/56 verde. Medido em 27/08.
  const i = codigo.indexOf("function MobileBottomNav(");
  assert.notEqual(i, -1, "assinatura da MobileBottomNav mudou — conserte a âncora");
  const corpoBarra = codigo.slice(i, codigo.indexOf("\nexport function", i));
  assert.match(corpoBarra, /item\.icon \?\? /, "sem reserva, módulo sem ícone vira espaço em branco na barra inferior");
});
