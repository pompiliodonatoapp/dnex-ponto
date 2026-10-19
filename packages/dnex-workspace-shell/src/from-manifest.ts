import type { ReactNode } from "react";
import type { SolutionManifest } from "@dnex/contracts";
import type { ShellNavigationItem, ShellNavigationSection, ShellProduct } from "./manifest.js";

/**
 * A ponte que faltava entre `@dnex/contracts` e o shell.
 *
 * O commit que criou o shell se chama "manifest-driven workspace shell", mas nenhuma função ligava
 * `SolutionManifest` a `ShellProduct` — `@dnex/contracts` não era importado por pacote nenhum. Sem
 * esta ponte, cada produto teria de escrever o seu próprio adaptador: exatamente a duplicação que
 * o kit existe para evitar.
 *
 * Duas propriedades que este módulo garante e que valem mais que a conveniência:
 *
 * 1. **Falha fechado.** Sem direito declarado, o produto e o módulo NÃO aparecem. Não existe ramo
 *    "não sei, então mostro" — foi o padrão que deixava o menu de produtos exibir os oito a
 *    qualquer visitante.
 * 2. **Endereço validado dos dois lados.** O caminho vem do `pathSchema` do contrato (sem esquema,
 *    host, query ou fragmento) E a origem passa por `comporHref`, que exige `https` sem
 *    credenciais. Ressalva honesta sobre o alcance: isso vale para o endereço que ESTE adaptador
 *    monta. O `WorkspaceShell` ainda aceita `href` arbitrário por outros caminhos — o item M-3 do
 *    TODO segue aberto, e a garantia aqui não o cobre.
 */

export type ResolucaoDeAcesso = {
  /** Direitos já resolvidos pelo control plane para o usuário e a empresa correntes. */
  entitlements: ReadonlySet<string> | readonly string[];
  /** Produto em que a pessoa está agora — sempre visível, para nunca sumir o chão sob os pés. */
  activeProductKey?: string;
  /** Ícone por produto (ex.: ProductGlyph do design system). Opcional para manter isto puro. */
  iconFor?: (productKey: string) => ReactNode;
  /**
   * Ícone por MÓDULO. O manifesto não carrega ícone — quem conhece o domínio é o produto, e
   * cravar um catálogo de ícones no contrato o acoplaria a uma biblioteca.
   *
   * Sem isto, a barra inferior do celular sai só com texto: `MobileBottomNav` renderiza
   * `{item.icon}` num `<span>` que fica vazio. Visto pelo dono em 27/08/2026 — é a mesma família
   * do menu recolhido que saiu em branco, e a lição se repete: **quem consome tem de poder
   * fornecer o ícone, e a ausência tem de degradar para algo legível, nunca para vazio.**
   */
  iconForModule?: (moduleKey: string, productKey: string) => ReactNode;
  /** Prefixo de origem por produto, quando cada um mora num endereço próprio. */
  originFor?: (productKey: string) => string;
};

/**
 * Só entram direitos que são texto não-vazio.
 *
 * Sem esta limpeza havia um ramo FAIL-OPEN que contradizia a promessa deste módulo: uma lista de
 * direitos com buraco (`null`/`undefined` vindo de coluna nula) somada a um manifesto que chegou
 * por conversão de tipo em vez de `parseSolutionManifest`, com módulo sem `requiredEntitlement`,
 * faz `new Set([undefined]).has(undefined)` devolver `true` — e o módulo APARECE. O "não sei" de
 * um lado encontrava o "não sei" do outro e os dois viravam "sim". Medido em 26/08/2026 com um
 * módulo de prontuário de saúde da Folha: visível para quem não tinha direito nenhum.
 */
function comoConjunto(e: ResolucaoDeAcesso["entitlements"]): ReadonlySet<string> {
  const bruto: Iterable<unknown> = e instanceof Set ? e : (e as readonly string[]) ?? [];
  const limpo = new Set<string>();
  for (const v of bruto) if (typeof v === "string" && v.length > 0) limpo.add(v);
  return limpo;
}

/**
 * O requisito também precisa ser texto não-vazio.
 *
 * REDUNDANTE POR DESENHO com a limpeza de `comoConjunto`: qualquer uma das duas fecha o buraco
 * sozinha, e por isso a mutação desta linha SOBREVIVE (medido em 26/08) — o teste pega a outra.
 * Fica assim de propósito: as duas pontas do mesmo encontro entre "não sei" e "não sei", para que
 * uma refatoração que descuide de uma delas não reabra a porta. A guarda que o teste prende é a
 * de `comoConjunto`; esta é cinto além do suspensório. Medido em 26/08: derrubar AS DUAS ao mesmo
 * tempo deixa o teste VERMELHO — a propriedade está presa, só não é atribuível a uma linha
 * isolada, que é o esperado em guarda redundante. Escrito aqui para ninguém remover "a que não
 * tem teste" achando que sobra.
 */
function liberado(direitos: ReadonlySet<string>, requisito: unknown): boolean {
  return typeof requisito === "string" && requisito.length > 0 && direitos.has(requisito);
}

/**
 * Junta origem e caminho, validando OS DOIS.
 *
 * A versão anterior validava só o caminho — e a documentação afirmava, errado, que um control
 * plane comprometido não conseguiria injetar endereço perigoso. Conseguia: `originFor` devolvendo
 * `//evil.example` levava o clique para outro host, com o conteúdo do atacante renderizado no
 * login único. Medido no navegador em 26/08/2026. Passavam também `https://bom@evil.example`,
 * `http://evil.example` e `data:`.
 *
 * (`javascript:` não executava, mas por mérito do React 19 e do Chrome, não deste código — e
 * defesa que depende de terceiro não é defesa declarável.)
 */
export function comporHref(origem: string | undefined, caminho: string): string {
  if (typeof caminho !== "string" || !caminho.startsWith("/") || caminho.startsWith("//")) {
    throw new Error(`Caminho de manifesto inválido: ${String(caminho)}`);
  }
  if (origem === undefined || origem === "") return caminho;
  let url: URL;
  try {
    url = new URL(origem);
  } catch {
    throw new Error("Origem de produto inválida: precisa ser URL absoluta com esquema https.");
  }
  // `https` apenas. `http` só em localhost, para a demonstração e o desenvolvimento local.
  const ehLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ehLocal)) {
    throw new Error(`Origem de produto com esquema não permitido: ${url.protocol}`);
  }
  // Credenciais na URL são o truque clássico de disfarçar o host real (`https://bom@evil`).
  if (url.username || url.password) throw new Error("Origem de produto não pode conter credenciais.");
  if (url.search || url.hash) throw new Error("Origem de produto não pode conter query nem fragmento.");
  return `${url.origin}${caminho}`;
}

/** Produtos do rail (o sidebar externo), já filtrados por direito. */
export function shellProductsFromManifests(
  manifests: readonly SolutionManifest[],
  acesso: ResolucaoDeAcesso,
): ShellProduct[] {
  const direitos = comoConjunto(acesso.entitlements);
  return manifests.map((m) => {
    // Um produto aparece quando a pessoa tem direito a PELO MENOS UM módulo dele — ou quando é o
    // produto em que ela já está (senão trocar de contexto tiraria o chão do próprio usuário).
    const algumModuloLiberado = m.modules.some((mod) => liberado(direitos, mod.requiredEntitlement));
    return {
      key: m.productKey,
      label: m.displayName,
      href: comporHref(acesso.originFor?.(m.productKey), m.launchPath),
      icon: acesso.iconFor?.(m.productKey),
      visible: algumModuloLiberado || m.productKey === acesso.activeProductKey,
    };
  });
}

/**
 * Agrupa os produtos por suíte (`navigationGroup`) preservando a ordem de entrada.
 *
 * ⚠️ AINDA NÃO TEM CONSUMIDOR. `GlobalRailProps` do design system aceita uma lista PLANA, sem
 * noção de grupo — então nada nesta função separa visualmente a suíte contábil no rail hoje. A
 * mensagem do commit `5b2cb13` afirmou que separava; era falso, e o revisor pegou. Fica aqui como
 * o bloco de construção pronto e testado; falta o suporte a grupo no `GlobalRail`.
 */
export function agruparProdutosPorSuite(
  manifests: readonly SolutionManifest[],
): Array<{ grupo: SolutionManifest["navigationGroup"]; produtos: string[] }> {
  const grupos = new Map<SolutionManifest["navigationGroup"], string[]>();
  for (const m of manifests) {
    const atual = grupos.get(m.navigationGroup) ?? [];
    atual.push(m.productKey);
    grupos.set(m.navigationGroup, atual);
  }
  return [...grupos].map(([grupo, produtos]) => ({ grupo, produtos }));
}

/** Seções do sidebar interno de UM produto, já filtradas por direito. */
export function sectionsFromModules(
  manifest: SolutionManifest,
  acesso: ResolucaoDeAcesso & { activePath?: string },
): ShellNavigationSection[] {
  const direitos = comoConjunto(acesso.entitlements);
  const origem = acesso.originFor?.(manifest.productKey);
  const items: ShellNavigationItem[] = manifest.modules
    .filter((mod) => liberado(direitos, mod.requiredEntitlement))
    // `mobilePriority` maior primeiro: no celular a barra inferior só cabe os primeiros, e a ordem
    // decide quais. Empate resolve pelo rótulo, para a saída ser estável entre execuções.
    .slice()
    .sort((a, b) => (b.mobilePriority - a.mobilePriority) || a.label.localeCompare(b.label, "pt-BR"))
    .map((mod) => ({
      key: mod.key,
      label: mod.label,
      icon: acesso.iconForModule?.(mod.key, manifest.productKey),
      href: comporHref(origem, mod.path),
      active: acesso.activePath === mod.path,
      mobile: mod.mobilePriority > 0,
    }));
  if (items.length === 0) return [];
  // SEM `label`: o `ContextSidebar` e o `SidebarDrawer` já exibem `productLabel` logo acima. Com
  // o rótulo aqui, "DNEX Fiscal" aparecia TRÊS vezes empilhadas no menu do celular — visível em
  // apps/demo/baseline/demo-celular-menu-aberto.png antes desta correção.
  return [{ key: manifest.productKey, items }];
}
