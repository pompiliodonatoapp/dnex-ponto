# Workspace Shell

`@dnex/workspace-shell` compõe a navegação comum do DNEX. A referência visual desta fatia é o Normas de 03/10/2026: rail de 72 px, sidebar contextual em altura total (token DS de 226 px; recolhido 72 px), topbar na coluna principal e conteúdo com rolagem própria. Até 1100 px, a navegação migra para o drawer e os quatro primeiros atalhos elegíveis aparecem na barra inferior.

## Integração

```tsx
import "@dnex/ds/styles";
import { TopbarGlobalActions } from "@dnex/ds";
import { WorkspaceShell } from "@dnex/workspace-shell";

<WorkspaceShell
  products={produtosJaAutorizados}
  currentProductKey="normas"
  productLabel="DNEX Normas"
  pageLabel="Biblioteca"
  sections={secoesDoProduto}
  sidebarHeader={<SeletorDeEmpresa />}
  topbarCenter={<Busca />}
  topbarCenterCompact={<AbrirBusca />}
  topbarRight={<TopbarGlobalActions account={<MenuDaConta />} />}
  onNavigate={(href) => {
    if (!rotaDoMeuProduto(href)) return false;
    navegarComGuardasDoProduto(href);
    return true;
  }}
>
  {pagina}
</WorkspaceShell>
```

A entrada de navegador importa o CSS automaticamente; o build copia o arquivo para `dist` e o pacote declara seus efeitos colaterais. Os tokens e as primitivas continuam vindo de `@dnex/ds/styles`. A condição `node` exporta a mesma API sem importar CSS, preservando SSR/importação nativa Node. Para consumo direto de fontes ou integração SSR, há também `@dnex/workspace-shell/styles`; o cliente precisa carregar os estilos.

Dependências de runtime e versão da RC permanecem iguais. Playwright 1.61.1 é dependência de desenvolvimento da raiz para a regressão de navegador na CI; uma nova RC e a atualização dos consumidores pertencem à próxima fatia.

## API e compatibilidade

| Prop | Contrato |
| --- | --- |
| `products`, `sections`, `globalNavigation` | Manifestos preparados pelo host. O shell apresenta itens visíveis; rotas e permissões continuam no host. |
| `productLabel`, `pageLabel` | API anterior preservada. Nome do produto na sidebar; contexto da página na topbar. |
| `sidebarBrand` | Lockup opcional no desktop; nomes da topbar/drawer continuam vindo de `productLabel`. Sem ele, preserva a marca padrão do produto. |
| `sidebarHeader` | Contexto/seletor no desktop expandido e no drawer. Recolher a sidebar oculta o slot até expandir, como antes. |
| `hubHref` | Destino de retorno ao Hub, preservado no rail e no drawer. |
| `topbar` | Fallback legado de ações, mantido. Prefira `topbarRight`. |
| `topbarLeft` | Substitui o rótulo padrão da página; preserva o botão de menu móvel. |
| `topbarCenter`, `topbarCenterCompact` | Centro presente em toda largura. A versão compacta opcional substitui a ampla até 700 px; ambas devem oferecer a mesma função. |
| `topbarRight`, `topbarActions` | Prioridade: `topbarRight`, alias Normas `topbarActions`, legado `topbar`. Sem fusão implícita. |
| `account` | Continua `never`: passe a conta via `TopbarGlobalActions` em `topbarRight`, que mantém a conta no agrupador estreito. |
| `workspaceLabel`, `workspaceHref` | Contexto descritivo resolvido pelo host. Sem URL é texto; com URL é link. Não altera tenant. |
| `productsNotice`, `catalogHref` | Aviso e catálogo opcionais no rail e no drawer. Não liberam acesso. |
| `onNavigate` | Adaptador opcional e síncrono para URLs do contexto, descrito abaixo. |
| `onProductNavigate` | Interceptação opcional e síncrona `(productKey, href) => boolean` de links de produtos no rail/drawer. |
| `onSearchOpen` | Ctrl/Cmd+K; não dispara dentro do drawer ou em chromeless. O host implementa a busca. |
| `chromeless` | Renderiza somente conteúdo, para rotas especiais definidas pelo host. |

`ShellProduct.statusLabel` e `attention` são descritivos. O shell não infere contratação ou permissão a partir deles. O host fornece ícones para produtos fora do catálogo de marcas DS.

## Navegação e acessibilidade

Destinos com URL usam anchors reais, inclusive no drawer (`Sheet` do DS). O adaptador só recebe cliques primários sem modificadores, na mesma origem e no mesmo contexto. Retorne `true` quando o roteador assumiu a navegação, inclusive suas guardas de saída; `false` mantém navegação nativa. Não retorne Promise.

Ctrl/Cmd/Shift/Alt+clique, botão auxiliar, download, target diferente de `_self`, âncoras locais e URLs de outra origem preservam a ação nativa. Sem `onProductNavigate`, mudança para outro produto ignora `onNavigate` mesmo em URL da mesma origem. Erros do roteador não são ocultados.

`onProductNavigate` é um opt-in separado: recebe links HTTP(S) de produtos, inclusive em outra origem, somente em clique simples. Retorne `true` imediatamente para assumir o clique e iniciar a guarda assíncrona no host. Se a pessoa cancelar a guarda, o host mantém o contexto atual. Retornar `false` preserva o comportamento anterior: `onNavigate` apenas para o produto corrente; navegação nativa para outro produto. Gestos modificados e protocolos especiais continuam nativos. O callback não altera visibilidade ou permissões.

```tsx
onProductNavigate={(productKey, href) => {
  if (!destinoConhecido(productKey, href)) return false;
  void guardedAction(() => abrirProduto(productKey, href));
  return true;
}}
```

Para uma visão local controlada pelo módulo, declare `{ key, label, kind: "action", onSelect }`. O callback e a URL são mutuamente exclusivos no tipo; o shell renderiza `button type="button"` no desktop, no drawer e nos atalhos móveis, com Enter/Espaço nativos. `active`, `badge`, `icon` e `mobile` têm a mesma apresentação dos links. As guardas seguem no callback do host.

O host deve escolher um único responsável pelo atalho Ctrl/Cmd+K: se sua busca já registra o listener, omita `onSearchOpen`. `sidebarHeader` aceita o seletor de empresa protegido pelo host; omita `workspaceLabel` para não duplicar essa informação. `topbarCenter`/`topbarRight` aceitam nós legados e boundaries existentes; passe notificações, extras e conta ao `TopbarGlobalActions`, sem desmontar providers por mudança de página.

O drawer fecha ao ativar destino normal, em Escape ou ao voltar ao desktop. Cliques modificados mantêm o drawer. O foco volta a Menu/Mais conforme o acionador; se ele desaparecer no resize, vai ao conteúdo. O localStorage guarda somente preferência visual por produto, com fallback quando bloqueado.

As setas do rail aparecem somente quando há aplicativos fora da área visível naquela direção. Controles sem destino ficam invisíveis, desabilitados e fora do foco, com espaço reservado para manter a altura da lista estável. Rolagem, redimensionamento, exibição do rail e mudanças nos produtos recalculam os controles; a preferência de movimento reduzido evita rolagem animada.

## Fronteiras e migração

Tenant ativo, autorização de rota/API, SSO, entitlements, sessão, busca, URLs e guardas de saída pertencem ao host. O shell não consulta serviços de domínio nem registra URLs em telemetria. Menus filtrados são apresentação, não controle de acesso.

O CSS usa prefixo `dnex-shell-`. Atualizar snapshots em Normas/Hub/Contratos exige PR por consumidor, revisando os slots e sobreposições CSS antigas. O `account` separado da referência Normas deve migrar para `TopbarGlobalActions` no host. DS e consumidores não foram alterados nesta fatia.

## Validação reproduzível

```sh
pnpm --dir packages/dnex-design-system build:library
pnpm --dir packages/dnex-contracts build
pnpm --dir packages/dnex-workspace-shell typecheck
pnpm --dir packages/dnex-workspace-shell build
pnpm --dir packages/dnex-workspace-shell test
pnpm --dir packages/dnex-workspace-shell test:browser
pnpm --dir packages/dnex-workspace-shell test:rail-browser
pnpm --dir packages/dnex-workspace-shell test:host-browser
pnpm --dir packages/dnex-workspace-shell test:consumer-build
```

O teste de navegador usa Playwright 1.61.1 fixado no lockfile da raiz e o Chromium compatível (`pnpm exec playwright install chromium`). Se Playwright estiver fora da resolução normal Node, defina `DNEX_PLAYWRIGHT_MODULE` com o caminho absoluto de `playwright/index.mjs`. O teste não baixa dependências. Vite vem do workspace da demo. A fixture contém dados sintéticos.

São verificadas 320, 375, 700, 768, 1023, 1024, 1100, 1101 e 1440 px, em dois temas e com API antiga/nova. Há asserções para conta, contexto no drawer, navegação SPA/nativa, Ctrl+clique, mudança de produto, Escape, foco, resize, recolhimento e storage bloqueado. Os contratos de navegação estão incluídos no ponto de entrada já executado pela CI da raiz.

O teste focado `test:rail-browser` cobre um/poucos/muitos aplicativos, controles inacessíveis quando ocultos, extremos da rolagem, altura estável, resize, ocultação móvel, atualização dos produtos e tamanho dos itens. `PLAYWRIGHT_CHANNEL=chrome` seleciona Chrome instalado; sem essa variável usa o Chromium padrão. As capturas sintéticas ficam em `.artifacts/rail-single.png` e `.artifacts/rail-overflow.png`.

`test:consumer-build` executa um consumidor Vite minificado pelo export público, sem import explícito de `@dnex/workspace-shell/styles`, e exige CSS do shell vinculado no HTML produzido. O gate faz parte de `pnpm verify` e da CI. `sideEffects` preserva `dist/index.js` e os arquivos CSS; `index.node.js` continua sem import de CSS para SSR/Node.

`test:host-browser` compila a fixture pelo entry público com Vite minificado e serve somente o resultado. Cobre quinze jornadas de guardas de troca de produto, fallback nativo, Ctrl+clique, Enter/Espaço, callbacks locais e menu móvel, sem requests externos. A CI o executa após `pnpm verify`, com Chromium instalado pelo Playwright do lockfile. Aceita as mesmas variáveis `DNEX_PLAYWRIGHT_MODULE` e `PLAYWRIGHT_CHANNEL` para diagnóstico local; grava `host-browser-results.json` em `.artifacts`. A suíte inteira de testes Node do pacote também integra `pnpm verify`.

## Grupos e busca contextual — 09/10/2026

`ShellNavigationItem` aceita `kind: "group"` com `children` recursivos, sem URL ou callback. Links e ações existentes permanecem compatíveis. `navigationSearchLabel` habilita busca local por rótulo de seção, grupo ou folha; a busca mantém ancestrais e não consulta dados de clientes. Grupos são disclosures nativos com Enter/Espaço, IDs únicos e estado independente no desktop/drawer. Alterar a folha ativa abre seus ancestrais; recriar o manifesto não desfaz um recolhimento manual. Trocar produto reinicia esse estado.

`navigationLeaves`, `activeNavigationKey`, `ancestorKeysOf`, `mobileNavigationLeaves` e `filterNavigationSections` são helpers públicos puros. Mobile considera apenas folhas, com `mobile: false` herdado dos grupos. A fixture sintética `tests/browser/navigation-groups.html` inclui dois níveis de grupos, atualização de manifesto e troca de produto. Testes de lógica/SSR e typecheck foram executados localmente; navegação real ainda depende do QA do consumidor.
