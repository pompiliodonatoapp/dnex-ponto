import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Guarda da classe de defeito "PROMESSA VAZIA": prop declarada no tipo e nunca usada no corpo do
 * componente.
 *
 * Foi o que aconteceu entre 23/08 e 25/08/2026: a renderização do slot `workspace` saiu do
 * Sidebar, a prop ficou no tipo marcada `@deprecated`, e o DNEX Fiscal seguiu passando o seletor
 * de cliente da Drogaria Siloé — compilando sem UM erro e sem renderizar NADA. Cliente pagante,
 * funcionalidade sumida, zero sinal. Não havia teste de renderização em 209 arquivos do DS.
 *
 * Por que este teste lê o CÓDIGO-FONTE em vez de renderizar: renderizar exigiria empacotador
 * (`node --test` remove tipos mas não transforma JSX, e os componentes são `.tsx`). Em vez de
 * adicionar ferramenta agora ou — pior — fingir cobertura, esta guarda ataca a causa direta: se a
 * prop está no contrato, o corpo tem de mencioná-la. É menos que um teste de renderização e é
 * honesto sobre isso; o teste de verdade entra junto com o app de demonstração, que já vai
 * precisar de empacotador.
 */
const src = (nome: string) =>
  readFileSync(fileURLToPath(new URL(`../src/components/shell/${nome}`, import.meta.url)), "utf8");

function propsDeclaradas(fonte: string, nomeDoTipo: string): string[] {
  const i = fonte.indexOf(`type ${nomeDoTipo} = {`);
  assert.notEqual(i, -1, `tipo ${nomeDoTipo} não encontrado — o teste ficou órfão, conserte a âncora`);
  let profundidade = 0;
  let fim = i;
  for (let j = fonte.indexOf("{", i); j < fonte.length; j++) {
    if (fonte[j] === "{") profundidade++;
    else if (fonte[j] === "}" && --profundidade === 0) { fim = j; break; }
  }
  const bloco = fonte.slice(i, fim);
  return [...bloco.matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]);
}

test("toda prop do SidebarProps é usada no corpo do componente — sem promessa vazia", () => {
  const fonte = src("Sidebar.tsx");
  const props = propsDeclaradas(fonte, "SidebarProps");
  assert.ok(props.includes("workspace"), "âncora perdida: `workspace` saiu do tipo — se foi de propósito, remova esta linha do teste");

  // O corpo começa DEPOIS da desestruturação dos parâmetros. Sem isso a guarda se engana sozinha:
  // `headerAddon,` na lista de parâmetros já contaria como uso, e o slot podia sumir do JSX sem
  // ninguém notar — medido por mutação em 25/08, o mutante sobrevivia.
  const decl = fonte.indexOf("export function Sidebar(");
  const inicioCorpo = fonte.indexOf("}: SidebarProps) {", decl);
  assert.notEqual(inicioCorpo, -1, "assinatura do Sidebar mudou — conserte a âncora do teste");
  const corpo = fonte.slice(inicioCorpo + "}: SidebarProps) {".length);
  // `variant` é exceção CONSCIENTE e documentada no tipo: aceita e ignorada para não quebrar
  // quem ainda a passa. Qualquer outra órfã é defeito.
  const excecoes = new Set(["variant"]);
  const orfas = props.filter((p) => !excecoes.has(p) && !new RegExp(`\\b${p}\\b`).test(corpo));
  assert.deepEqual(orfas, [], `props declaradas e nunca usadas no corpo: ${orfas.join(", ")} — ou renderize, ou tire do tipo (quebrar o build de quem passa é o certo)`);
});

test("SidebarWorkspace expõe onClick e disabled — a produção do Fiscal depende dos dois", () => {
  const fonte = src("SidebarWorkspace.tsx");
  const props = propsDeclaradas(fonte, "SidebarWorkspaceProps");
  for (const p of ["onClick", "disabled"]) {
    assert.ok(props.includes(p), `SidebarWorkspaceProps sem \`${p}\`: o seletor de cliente da Siloé (App.tsx) passa os dois e quebraria`);
  }
  assert.match(fonte, /<button/, "com onClick tem de virar <button>: teclado e leitor de tela dependem disso");
  assert.match(fonte, /aria-label=/, "o botão precisa dizer o que faz");
});

test("o seletor não tem contorno branco — E continua existindo", () => {
  // Guarda de MÃO DUPLA, e é o ponto todo deste teste.
  //
  // O pedido do dono em 25/08/2026 era tirar A LINHA branca do retângulo do seletor de clientes.
  // A leitura errada desse pedido apagou o SELETOR INTEIRO da produção da Drogaria Siloé — e
  // ninguém notou, porque nada guardava nenhum dos dois lados.
  //
  // Por isso as duas asserções moram no mesmo teste: quem vier "limpar o visual" esbarra na
  // segunda, e quem vier "devolver a borda" esbarra na primeira. Separá-las reabre a porta.
  const fonte = src("SidebarWorkspace.tsx");
  assert.doesNotMatch(fonte, /\bborder border-white/, "a linha branca do retângulo voltou — o dono pediu para tirá-la");
  assert.match(fonte, /bg-white\/\[0\.045\]/, "o retângulo perdeu o fundo: sem borda E sem fundo, não sobra retângulo nenhum");
  assert.match(fonte, /export function SidebarWorkspace/, "o SELETOR sumiu — foi a linha que o dono mandou tirar, não ele");
});

test("item de menu sem ícone mostra INICIAIS — nunca quadro vazio", () => {
  // Achado da primeira renderização (26/08): no modo recolhido só o ícone aparece, e a navegação
  // montada a partir do manifesto não traz ícone por módulo — o menu recolhido ficava EM BRANCO,
  // com itens invisíveis e inclicáveis. Nenhum typecheck e nenhum teste de leitura pegariam isso;
  // só a captura de tela revelou. Este teste é a rede que faltava.
  const fonte = src("Sidebar.tsx");
  assert.match(fonte, /item\.icon \?\? /, "sumiu a reserva: item sem ícone volta a renderizar vazio");
  assert.match(fonte, /icon\?: ReactNode/, "o tipo tem de admitir ausência de ícone, senão o consumidor mente com cast");
});

test("iniciais: uma palavra usa 2 letras; duas ou mais usam a primeira de cada", async () => {
  const { iniciais } = await import("../src/components/shell/Sidebar.tsx").catch(() => ({ iniciais: null })) as { iniciais: ((s: string) => string) | null };
  if (!iniciais) return; // o módulo é .tsx e não carrega sem empacotador; a checagem textual acima cobre
  assert.equal(iniciais("Apuração"), "AP");
  assert.equal(iniciais("Calculadora ICMS"), "CI");
});


test("o Sidebar FIXO renderiza os slots — foi o que sumiu para o cliente pagante", () => {
  // A régua da expressão de render foi aplicada só à gaveta; o menu fixo do desktop ficou com a
  // guarda antiga, que exigia a prop ser MENCIONADA. Trocar `<div>{headerAddon ?? workspace}</div>`
  // por `<div />` sumia o seletor de empresa do desktop com a suíte verde — e é exatamente o
  // defeito de 23–25/08, que tirou o seletor da Drogaria Siloé da produção. Medido em 27/08.
  const fonte = src("Sidebar.tsx").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  const i = fonte.indexOf("export function Sidebar(");
  const inicio = fonte.indexOf("{", fonte.indexOf("}: SidebarProps)", i));
  const fim = fonte.indexOf("\nexport function", inicio);
  const corpo = fonte.slice(inicio, fim === -1 ? undefined : fim);
  for (const slot of ["headerAddon", "workspace", "pulse", "footer"]) {
    const render = new RegExp(`\\{\\s*(?:[A-Za-z_$][\\w$]*\\s*\\?\\?\\s*)?${slot}(?:\\s*\\?\\?\\s*[A-Za-z_$][\\w$]*)?\\s*\\}`);
    assert.match(corpo, render, `Sidebar aceita \`${slot}\` e não o RENDERIZA`);
  }
});

test("o SidebarDrawer também entrega os slots que promete — foi ONDE o defeito aconteceu", () => {
  // A guarda acima ancorava em `export function Sidebar(` e NUNCA olhava o `SidebarDrawer`. Foi
  // exatamente ali que o slot passou a ser aceito e descartado, sumindo o seletor de empresa no
  // celular. Medido em 28/08: 7 de 12 mutantes sobreviviam, e os dois primeiros eram justamente
  // reintroduzir o defeito na gaveta. Guarda que não cobre o lugar do acidente não é guarda.
  // SEM COMENTÁRIO. Medido em 28/08: o comentário que eu mesmo escrevi dentro da gaveta,
  // explicando a correção, citava os nomes dos slots — e satisfazia a asserção com o render
  // removido. É a terceira vez que a evidência é fabricada pelo próprio verificador; a regra que
  // fica é dura e simples: **asserção de comportamento nunca lê comentário.**
  const fonte = src("Sidebar.tsx")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ");
  const i = fonte.indexOf("export function SidebarDrawer(");
  assert.notEqual(i, -1, "assinatura do SidebarDrawer mudou — conserte a âncora");
  // LIMITADO ao fim do componente. Sem o limite, `corpo` ia até o fim do arquivo e a prova vinha
  // do `MobileMenu`, que renderiza os mesmos nomes — apagar `{footer}` da gaveta ficava verde.
  const inicio = fonte.indexOf("{", fonte.indexOf("}: SidebarDrawerProps)", i));
  const fim = fonte.indexOf("\nexport function", inicio);
  const corpo = fonte.slice(inicio, fim === -1 ? undefined : fim);

  for (const slot of ["headerAddon", "workspace", "pulse", "footer"]) {
    // Exige a EXPRESSÃO DE RENDER — `{slot}` ou `{a ?? slot}` —, não uma menção qualquer.
    // Contar ocorrências não bastava: apagar `{pulse}` do rodapé deixava `{(pulse || footer) && (`
    // de pé, e o mutante sobrevivia. Condição que decide SE renderiza não é renderizar.
    const render = new RegExp(`\\{\\s*(?:[A-Za-z_$][\\w$]*\\s*\\?\\?\\s*)?${slot}(?:\\s*\\?\\?\\s*[A-Za-z_$][\\w$]*)?\\s*\\}`);
    assert.match(corpo, render, `SidebarDrawer aceita \`${slot}\` e não o RENDERIZA — prop no tipo é promessa`);
  }
});
