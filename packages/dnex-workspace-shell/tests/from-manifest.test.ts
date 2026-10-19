import assert from "node:assert/strict";
import test from "node:test";
import { parseSolutionManifest } from "../../dnex-contracts/src/solution-manifest.ts";
import { agruparProdutosPorSuite, comporHref, sectionsFromModules, shellProductsFromManifests } from "../src/from-manifest.ts";

const fiscal = parseSolutionManifest({
  contractVersion: "1.0", productKey: "fiscal", displayName: "DNEX Fiscal",
  navigationGroup: "fiscal_tributario", launchPath: "/fiscal",
  modules: [
    { key: "apuracao", label: "Apuração", path: "/fiscal/apuracao", requiredEntitlement: "fiscal.apuracao", mobilePriority: 90 },
    { key: "curadoria", label: "Curadoria", path: "/fiscal/curadoria", requiredEntitlement: "fiscal.curadoria", mobilePriority: 0 },
  ],
});
const perdcomp = parseSolutionManifest({
  contractVersion: "1.0", productKey: "perdcomp", displayName: "DNEX PER/DCOMP",
  navigationGroup: "fiscal_tributario", launchPath: "/perdcomp",
  modules: [{ key: "creditos", label: "Créditos", path: "/perdcomp/creditos", requiredEntitlement: "perdcomp.creditos", mobilePriority: 90 }],
});
const folha = parseSolutionManifest({
  contractVersion: "1.0", productKey: "folha", displayName: "DNEX Folha",
  navigationGroup: "pessoas", launchPath: "/folha",
  modules: [{ key: "holerite", label: "Holerite", path: "/folha/holerite", requiredEntitlement: "folha.holerite", mobilePriority: 80 }],
});

test("FALHA FECHADO: sem direito, o produto não aparece", () => {
  // O padrão anterior do menu era o contrário — sem contexto, mostrava os oito produtos a
  // qualquer um. Aqui a ausência de direito é ausência de produto, sempre.
  const semNada = shellProductsFromManifests([fiscal, folha], { entitlements: [] });
  assert.deepEqual(semNada.map((p) => p.visible), [false, false]);

  const soFiscal = shellProductsFromManifests([fiscal, folha], { entitlements: ["fiscal.apuracao"] });
  assert.deepEqual(soFiscal.map((p) => [p.key, p.visible]), [["fiscal", true], ["folha", false]]);
});

test("o produto ATIVO continua visível mesmo sem direito — não se tira o chão de quem já está lá", () => {
  const r = shellProductsFromManifests([fiscal, folha], { entitlements: [], activeProductKey: "folha" });
  assert.deepEqual(r.find((p) => p.key === "folha")?.visible, true);
  assert.deepEqual(r.find((p) => p.key === "fiscal")?.visible, false);
});

test("os módulos do sidebar interno também falham fechados, um a um", () => {
  const so1 = sectionsFromModules(fiscal, { entitlements: ["fiscal.apuracao"] });
  assert.deepEqual(so1[0].items.map((i) => i.key), ["apuracao"], "curadoria não foi liberada e não pode aparecer");

  const nenhum = sectionsFromModules(fiscal, { entitlements: ["outro.produto"] });
  assert.deepEqual(nenhum, [], "sem módulo liberado, a seção inteira some — não fica cabeçalho órfão");
});

test("ordem por prioridade no celular, com desempate estável", () => {
  const s = sectionsFromModules(fiscal, { entitlements: ["fiscal.apuracao", "fiscal.curadoria"] });
  assert.deepEqual(s[0].items.map((i) => i.key), ["apuracao", "curadoria"]);
  // mobilePriority 0 = fica no menu completo, mas não ocupa a barra inferior do celular
  assert.deepEqual(s[0].items.map((i) => i.mobile), [true, false]);
});

test("o item ativo é marcado pelo caminho corrente", () => {
  const s = sectionsFromModules(fiscal, { entitlements: ["fiscal.apuracao", "fiscal.curadoria"], activePath: "/fiscal/curadoria" });
  assert.deepEqual(s[0].items.filter((i) => i.active).map((i) => i.key), ["curadoria"]);
});

test("ENDEREÇO SEGURO POR CONSTRUÇÃO: o contrato barra esquema, host, query e fragmento", () => {
  // Esta é a razão de o adaptador existir em vez de cada produto montar o seu: um control plane
  // comprometido não consegue injetar `javascript:` nem apontar para outro host.
  for (const caminho of ["javascript:alert(1)", "//evil.example", "https://evil.example", "/ok?x=1", "/ok#frag"]) {
    assert.throws(
      () => parseSolutionManifest({ ...fiscal, launchPath: caminho }),
      `o contrato deveria rejeitar ${caminho}`,
    );
  }
});

test("comporHref não deixa o caminho escapar da origem", () => {
  assert.equal(comporHref("https://fiscal.dnexsistemas.com.br", "/apuracao"), "https://fiscal.dnexsistemas.com.br/apuracao");
  // barra final na origem não pode virar `//`, que o navegador lê como OUTRO HOST
  assert.equal(comporHref("https://fiscal.dnexsistemas.com.br/", "/apuracao"), "https://fiscal.dnexsistemas.com.br/apuracao");
  assert.equal(comporHref(undefined, "/apuracao"), "/apuracao");
  assert.throws(() => comporHref("https://a.b", "//evil.example"), /inválido/);
  assert.throws(() => comporHref("https://a.b", "sem-barra"), /inválido/);
});

test("FAIL-OPEN fechado: `undefined` no direito não pode casar com `undefined` no requisito", () => {
  // O buraco real, medido em 26/08: `new Set([undefined]).has(undefined)` é `true`. Bastava um
  // manifesto vindo por conversão de tipo (sem parse) com módulo sem `requiredEntitlement`, e uma
  // lista de direitos com buraco de coluna nula — e o módulo aparecia para quem não tinha nada.
  // A fixture usa prontuário de saúde de propósito: é o pior caso da Folha (LGPD sensível).
  const folhaTorta = {
    ...folha,
    modules: [{ key: "prontuario", label: "Prontuário de saúde", path: "/folha/prontuario", mobilePriority: 50 }],
  } as unknown as typeof folha;
  const direitosComBuraco = [undefined, null, ""] as unknown as readonly string[];

  const s = sectionsFromModules(folhaTorta, { entitlements: direitosComBuraco });
  assert.deepEqual(s, [], "módulo sem requisito não pode aparecer para direito indefinido");

  const p = shellProductsFromManifests([folhaTorta], { entitlements: direitosComBuraco });
  assert.equal(p[0].visible, false, "e o produto tampouco");
});

test("comporHref valida a ORIGEM, não só o caminho", () => {
  // A versão anterior validava só o caminho e a documentação afirmava, errado, que um control
  // plane comprometido não injetaria endereço perigoso. Injetava: `//evil.example` levava o clique
  // para outro host — provado no navegador, com o conteúdo do atacante renderizado.
  for (const origem of ["//evil.example", "https://bom@evil.example", "http://evil.example", "data:text/html,x", "javascript:alert(1)", "evil.example", "https://a.b?x=1", "https://a.b#f"]) {
    assert.throws(() => comporHref(origem, "/contabil"), `origem hostil aceita: ${origem}`);
  }
  assert.equal(comporHref("https://fiscal.dnexsistemas.com.br", "/apuracao"), "https://fiscal.dnexsistemas.com.br/apuracao");
  assert.equal(comporHref("http://localhost:4319", "/apuracao"), "http://localhost:4319/apuracao", "http só em localhost, para a demonstração");
});

test("ordenação: EMPATE de prioridade desempata por rótulo (a fixture antiga não empatava)", () => {
  // O teste anterior se chamava "desempate estável" e não exercitava empate nenhum: as prioridades
  // eram 90 e 0, já na ordem final. Trocar a ordenação por `() => 0` mantinha tudo verde — mutante
  // sobrevivente. Aqui há empate de verdade, e a ordem de entrada é propositalmente a errada.
  const comEmpate = parseSolutionManifest({
    contractVersion: "1.0", productKey: "fiscal", displayName: "DNEX Fiscal",
    navigationGroup: "fiscal_tributario", launchPath: "/fiscal",
    modules: [
      { key: "zebra", label: "Zebra", path: "/f/zebra", requiredEntitlement: "ent.x", mobilePriority: 50 },
      { key: "abacate", label: "Abacate", path: "/f/abacate", requiredEntitlement: "ent.x", mobilePriority: 50 },
      { key: "topo", label: "Topo", path: "/f/topo", requiredEntitlement: "ent.x", mobilePriority: 99 },
    ],
  });
  const s = sectionsFromModules(comEmpate, { entitlements: ["ent.x"] });
  assert.deepEqual(s[0].items.map((i) => i.key), ["topo", "abacate", "zebra"], "prioridade primeiro; empate em ordem alfabética");
});

test("agrupamento: DOIS produtos na mesma suíte precisam sair juntos (a fixture antiga tinha um só)", () => {
  // Com um produto por grupo, o acumulador nunca acumulava: trocá-lo por lista nova a cada volta
  // mantinha o teste verde. E dois produtos no mesmo grupo é justamente o caso de uso declarado.
  const g = agruparProdutosPorSuite([fiscal, perdcomp, folha]);
  assert.deepEqual(g, [
    { grupo: "fiscal_tributario", produtos: ["fiscal", "perdcomp"] },
    { grupo: "pessoas", produtos: ["folha"] },
  ]);
});

test("a seção NÃO repete o rótulo do produto", () => {
  // O shell já exibe `productLabel` acima; com o rótulo aqui, "DNEX Fiscal" aparecia três vezes
  // empilhadas no menu do celular.
  const s = sectionsFromModules(fiscal, { entitlements: ["fiscal.apuracao"] });
  assert.equal(s[0].label, undefined);
});

test("o adaptador repassa ÍCONE POR MÓDULO — sem ele a barra inferior sai só com texto", () => {
  // Achado do dono em 27/08: a barra inferior do celular mostrava só rótulos. `MobileBottomNav`
  // renderiza `{item.icon}` num <span>, que ficava vazio porque o manifesto não carrega ícone.
  // Mesma família do menu recolhido em branco. Quem conhece o domínio é o produto: ele fornece.
  const s = sectionsFromModules(fiscal, {
    entitlements: ["fiscal.apuracao"],
    iconForModule: (chave, produto) => `icone:${produto}:${chave}`,
  });
  assert.equal(s[0].items[0].icon, "icone:fiscal:apuracao", "o ícone do módulo tem de chegar ao item de navegação");

  // E sem o fornecedor, `icon` fica indefinido — é o shell que degrada para iniciais, não o
  // adaptador que inventa. Separação de papéis: o adaptador não conhece biblioteca de ícone.
  const semIcone = sectionsFromModules(fiscal, { entitlements: ["fiscal.apuracao"] });
  assert.equal(semIcone[0].items[0].icon, undefined);
});
