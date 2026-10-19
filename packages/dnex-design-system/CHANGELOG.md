# Changelog — @dnex/ds

Todas as mudanças notáveis do Design System DNEX.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/); versionamento semântico.

## [Não lançado]

### Adicionado
- **Glifos de produto — Marketing e Portal do Cliente.** Duas identidades vetoriais
  originais para o catálogo e a vitrine do Design System: megafone de campanha
  e porta de acesso com pessoa. As chaves canônicas `marketing` e
  `portal-cliente` ampliam o catálogo de 19 para 21 produtos sem alterar os
  ícones ou aliases anteriores.
- **Gráficos cartesianos — contrato de escala honesta.** `LineChartDnex`,
  `BarChartDnex` e `AreaChartDnex` aceitam `yDomain` (repassado ao `YAxis` com
  `allowDataOverflow={false}`), `yTicks` (ticks explícitos) e `referenceLines`
  (linhas tracejadas com `label` e `tone` resolvido pelos tokens de
  `useChartTheme().reference`; fora do domínio o eixo se estende em vez de
  esconder a meta — garantido por `xAxisId`/`yAxisId` explícitos, porque o
  React 19 ignora `defaultProps` e o Recharts 2.15 dependia deles). `LineChartDnex` ganha `showDots` para poucas observações e
  lacunas. Todas opcionais; sem elas o comportamento é o anterior. Motivo: o
  DNEX Metas migrou o gráfico de progresso dos OKRs (0–100 %) para o kit e
  perdeu o eixo fixo — com eixo automático uma série entre 45 % e 52 % ocupa a
  tela toda e os OKRs deixam de ser comparáveis. Tipos exportados pela raiz:
  `CartesianScaleProps`, `YDomain`, `YDomainEdge`, `ReferenceLineSpec`,
  `ReferenceLineTone`.
- **Vitrine — "Linha — escala fixa (progresso 0–100%)"** na seção de gráficos,
  com fixture ilustrativa (`okrProgressFixture`, três OKRs, um mês sem dado),
  tabela textual com os mesmos valores e médias, e par "automático × fixo" com
  a mesma série para mostrar o efeito da escala. O teste
  `tests/line-chart-scale.test.ts` renderiza o componente com `react-dom/server`
  e valida ticks, geometria do domínio, linha de referência, pontos e a
  fixture. Prova negativa executada: sem `yDomain` em `okrFixedScaleProps`, a
  série estreita (45–52 %) renderizada só com o domínio perde o teto de 100 e
  o teste falha. Atenção: no Recharts, `yTicks` explícitos e uma
  `referenceLine` com `extendDomain` também estendem o domínio — garantem
  que ticks e meta apareçam, mas `yDomain` é o contrato que segura a escala
  quando não há ticks explícitos nem meta.

### Alterado
- **Gráficos cartesianos e `prefers-reduced-motion`.** O Recharts não reage à
  preferência do sistema; `LineChartDnex`, `BarChartDnex` e `AreaChartDnex`
  agora desligam a animação de entrada via `useReducedMotion` (mesmo mecanismo
  do `GaugeChart`).

### Corrigido
- **AppLayout — barra inferior móvel.** Rótulos longos agora encolhem dentro de
  cada atalho, sem transferir a largura intrínseca para o botão e empurrar o
  último item para fora do viewport. O nome acessível continua completo;
  somente a apresentação visual pode ser truncada. O contrato é coberto por
  fixture interativa com cinco rótulos longos em 320, 390 e 768 px. O gate de
  navegador é explícito (`pnpm test:bottom-nav:browser`) para não acoplar
  Chromium ao build de produção.

## [1.1.0] — 2026-07-17

Release do App Shell canônico para todo o SaaS DNEX.

### Adicionado
- Tokens públicos `appShell` e `pageHeader`, espelhados em CSS por `--shell-*`
  e `--page-header-*`.
- Variantes semânticas de `PageHeader`: `standard`, `detail`, `welcome` e
  `immersive`, além da compatibilidade com `plain` e `bar`.
- Traço âmbar oficial no contexto/eyebrow das páginas.
- Contrato transitório compatível com `sidebarWorkspace`, `sidebarPulse` e
  `sidebarVariant`, permitindo migrar produtos sem interromper funcionalidades.

### Alterado
- Sidebar oficial: 248 px expandida, 72 px recolhida e recolhimento habilitado
  por padrão no desktop.
- Topbar oficial: 64 px, três áreas responsivas e busca central de 280–520 px.
- Conteúdo oficial: largura máxima de 1500 px e ritmo de 24 px entre seções.
- `AppLayout` agora contém todo o conteúdo no mesmo eixo e largura canônicos.

### Governança
- Produtos podem variar navegação, ações, permissões e conteúdo, mas não podem
  redefinir localmente a geometria ou a hierarquia do App Shell.
- A vitrine administrativa em `/design-system` documenta os tokens estruturais,
  Sidebar, Topbar, variantes de `PageHeader`, `PageContainer` e o shell completo.

## [1.0.1] — 2026-07-08

Release de reconciliação: o canônico absorveu refinamentos que viviam soltos
nas cópias vendorizadas (Metas/Contratos) e virou fonte de verdade única. Todos
os consumidores (Metas, Contratos, Normas, Adm) foram re-vendorizados e passam a
ser byte-idênticos a este release.

### Corrigido
- **AppLayout — app-shell de altura fixa.** O root usava `min-h-[100dvh]` e o
  `<main>` (`overflow-y-auto`) virava um scroll-container **sem altura definida**:
  engolia wheel/touch sem rolar, e só a barra do navegador funcionava (touch e
  trackpad não rolavam a página). Agora:
  - root: `min-h-[100dvh]` → `h-[100dvh] overflow-hidden` (o caminho
    `forceMobile ? "h-full"` é mantido);
  - coluna de conteúdo (`flex … flex-1 flex-col`): `+ min-h-0`;
  - `<main>` (`flex-1 overflow-y-auto`): `+ min-h-0`.

  Com isso o `<main>` passa a ser a **única** região de scroll (bounded) e
  touch + trackpad + barra do navegador rolam. Espelha o fix originado no
  DNEX-Metas ("fix(ds): app-shell de altura fixa").
- **theme.css — `body { overflow-x: clip }`** (era `hidden`). `hidden` faz o
  `body` virar scroll container e o `position: sticky` do shell (Sidebar/Topbar)
  gruda nele — que nunca rola — em vez da viewport, quebrando o sticky. O `html`
  permanece `overflow-x: hidden` de propósito (no `html`, `clip` travaria o
  scroll vertical da página no Chrome). Refinamento originado no DNEX-Contratos.
- **LoginScreen — guarda de `onSignup`.** O bloco "Ainda não tem conta? / Criar
  conta" só renderiza quando há handler `onSignup`; antes chamaria `undefined`.
  Originado no DNEX-Metas.

### Adicionado
- **Sidebar/AppLayout — cabeçalhos de seção.** Novo `SidebarNavHeading`
  (`kind: "heading"`); `SidebarNavItem` passa a ser união
  `SidebarNavLink | SidebarNavHeading`. Headings agrupam itens na sidebar, viram
  um separador fino no modo recolhido e são filtrados da bottom-nav mobile
  (só links). Retrocompatível: arrays de itens de link continuam válidos.
  Originado no DNEX-Metas.

## [1.0.0]

- Versão inicial do `@dnex/ds`.
