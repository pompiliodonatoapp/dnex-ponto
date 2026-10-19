# StatusPipeline — DS 1.2 RC

Distribuição exclusiva do status atual, não funil cumulativo de conversão. Usado no dashboard do DNEX Contratos e demonstrado em Gráficos / Data Viz (`#status-pipeline`).

## Contrato

Importação por rota: `import { StatusPipeline } from "@dnex/ds"` e `import "@dnex/ds/status-pipeline.css"`. Além do tema global do DS, o gráfico carrega seu CSS sob demanda, sem acrescentar custo à tela de login. A mesma folha é usada na vitrine e nos produtos.

`stages`: id estável, rótulo, quantidade, valor em centavos inteiros, quantidade sem valor informado, tom semântico, grupo `main` ou `exit`. Cada registro pertence a uma única categoria. Preserve categorias desconhecidas. Status zerados ficam disponíveis em “Mostrar status sem registros”.

O denominador é a carteira inteira selecionada, incluindo recusas, cancelamentos e expirações. O seletor Quantidade/Valor altera somente a escala das barras. Valores e quantidades permanecem visíveis. Não mostrar 0% quando não há base; usar “—”.

Separe as bases monetárias: contratos/comparativas anuais e propostas de catálogo pelo total nominal. Não misture as duas. Valor ausente não é zero: registre `unpricedCount`. O resumo não representa caixa recebido.

`onStageSelect(id)` deve abrir uma lista com exatamente a mesma empresa, status e tipo usados na agregação. Não execute ações comerciais automaticamente. O período escolhido deve estar explícito: estoque atual de todos os períodos ou coorte, nunca intercambiáveis.

## Experiência

### Barra de filtros

`StatusPipelineFilters` é a fonte compartilhada dos controles de carteira. Use-o no slot `controls` de `StatusPipeline`: `label` nomeia o grupo acessível, `value/options/onChange` controlam a carteira e `select` fornece o tipo opcional. Os ícones são decorativos; rótulos e estados pressionados continuam explícitos.

A barra fica abaixo do título: abas leves com indicador índigo para a carteira, seletor discreto para o tipo e segmento Quantidade/Valor à direita. Não empilhar controles flutuantes ao lado do título nem recriar os botões com CSS do produto. O seletor de tipo usa textos curtos; a base monetária segue explícita no resumo e na nota do gráfico.

Em contêineres menores que 760 px, a métrica passa à linha seguinte. Abaixo de 460 px, as abas ocupam toda a largura e o tipo ganha uma linha própria. Os alvos de toque continuam com pelo menos 44 px. Em carregamento, erro ou vazio, somente a métrica é desabilitada; os filtros ficam disponíveis para mudar a carteira. O estado selecionado não depende apenas da cor. A vitrine usa o mesmo componente do produto e mantém os controles de estados de teste fora do gráfico.

Desktop: resumo índigo + distribuição lateral. Mobile: uma coluna, números abaixo do rótulo, sem truncar valores. Todas as interações são botões nativos de pelo menos 44 px com foco visível. Barras decorativas são ocultas da árvore acessível; os dados estão em texto numa lista semântica. Estados: carregando, erro com retry e carteira vazia. Respeita tema e movimento reduzido.

Não usar segmentos afunilados artificiais: o estoque pode crescer entre categorias. Não sugerir conversão, projeção nem probabilidades a partir de status exclusivos.

## Verificação

Testar 320/390/768/1440 px em claro/escuro, troca de métricas, status zerados, erro/retry, carteira vazia, clique e teclado. Tentar scroll horizontal no documento e nos contêineres. A implementação no consumidor deve ser idêntica à fonte canônica deste pacote.
