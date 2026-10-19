# Seletores e auditoria de consistência — 10/10/2026

Tabs e SegmentedControl usam `src/tokens/selection.tokens.json` (DTCG) e a saída
`src/styles/selection.generated.css`. O build verifica a saída; regenere com
`node scripts/selection-tokens.mjs` dentro do pacote. Esta é uma migração parcial
com consumidores reais; o restante do DS continua com theme.css como fonte.

Contrato normal: item36px, inset4px, espaçamento4px, fonte0.88rem, raio8px,
padding horizontal14px, fundo ativo índigo16%. A seleção é plana; não indica
uma ação primária. O anel focus-visible continua para navegação por teclado.
O controle completo tem46px com borda e inset. Não sobrescrever min-height no
produto. Variante sm mantém32px. Rótulos não devem ganhar padding vertical local.

## Auditoria do Normas

| Decisão | Evidência | Tratamento |
|---|---|---|
| Altura/fonte/raio/fundo dos seletores | Tabs e SegmentedControl tinham literais diferentes; organograma forçava44px | Centralizado neste contrato; remoção da sobrescrita no consumidor |
| Cores/superfícies/bordas | organograma.css usa fg,fg-muted,surface,line,action-tint | Tokens existentes suficientes; preservar |
| Campos nativos e selects | organograma.css: org-form-row select e rcf-ref select têm padding9px12px e estilos locais | Priorizar adoção de Input/SelectField existentes em mudança separada; não criar escala concorrente |
| Painéis e cartões | radius-card/control já usados; padding16/20px varia por função | Avaliar composição Card/Field do DS antes de novos tokens de espaçamento por tela |
| Canvas de fluxograma/organograma | controles de zoom/tela cheia pertencem à composição visual | Candidato a componente compartilhado de toolbar; não converter coordenadas/tamanho do diagrama em tokens globais |
| Impressão da ficha | preto/branco/pt em @media print | Contrato de impressão intencional; não aplicar cores de tema de tela |

Prioridade seguinte: padronizar campos nativos e toolbar de canvas com os
componentes existentes. Uma auditoria local do Normas não equivale a auditoria
de todos os produtos DNEX; migrações de outros consumidores precisam de QA próprio.
