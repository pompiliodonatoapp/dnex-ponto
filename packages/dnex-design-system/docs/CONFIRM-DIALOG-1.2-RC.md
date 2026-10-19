# Modais operacionais · @dnex/ds 1.2 RC

Atualizado em 12/09/2026. Origem: `dnex-platform-kit/packages/dnex-design-system`.
Consumidor validado: DNEX Contratos. Não modificar o modal apenas no CSS do produto.

## Padrão visual

- `DialogContent` e `ConfirmDialog` compartilham `dnex-dialog-panel` e `dnex-dialog-backdrop`.
- Painel sólido nos temas claro e escuro. Sem glass, transparência do painel ou backdrop blur.
- Véu índigo discreto, raio de card (16 px), borda e sombra semânticas.
- Título curto em Space Grotesk; descrição em Plus Jakarta Sans; rótulo do registro em IBM Plex Mono.
- Confirmação: largura máxima de 480 px e margens mínimas de 16 px. Usa a altura dinâmica da viewport.
- Cabeçalho com ícone de alerta discreto; registro identificado em área própria; explicação em toda a largura.
- Rodapé separado por linha, sem gradientes. Cancelar secundário; ação destrutiva vermelha sólida com texto branco.
- Abaixo de 480 px, ações empilhadas em ordem de leitura: Cancelar, Confirmar. Alvos mínimos de 44 px.
- Nomes longos quebram linha; se necessário, só o corpo rola, mantendo as ações acessíveis.

Tokens: `--dialog-backdrop`, `--dialog-surface`, `--dialog-shadow`,
`--danger-action`, `--danger-action-hover`, `--danger-action-fg`.
Os demais componentes continuam usando seus próprios tons: não tornar todo botão `danger` sólido.

## Uso no produto

```tsx
const accepted = await confirm({
  title: "Excluir cliente?",
  subject: customerDisplayName,
  subjectLabel: "Cliente selecionado",
  description: "O cliente será removido da carteira ativa. A exclusão será bloqueada se houver contratos ou propostas vinculados.",
  confirmLabel: "Excluir cliente",
  tone: "danger",
});
if (!accepted) return;
// A autorização e a operação continuam sob responsabilidade do backend.
```

`subject` e `subjectLabel` são opcionais. Chamadas anteriores e a API imperativa
continuam válidas. Não colocar HTML no nome do registro. Não afirmar que uma ação
é reversível ou definitiva sem conferir a regra real do produto.

## Comportamento e acessibilidade

- `role="alertdialog"`, título e descrição associados; o modal padrão mantém `role="dialog"`.
- Foco inicial em Cancelar; Tab/Shift+Tab contidos; retorno ao elemento de origem.
- Escape e clique fora cancelam quando não há operação em andamento.
- `loading` desabilita as ações, informa `aria-busy` e bloqueia Escape/clique fora.
- Animação existente preservada, respeitando `prefers-reduced-motion`.
- Contraste do título, descrição e ação destrutiva validado em pelo menos 4,5:1.

## Verificação reproduzível

Primeiro execute `pnpm --filter @dnex/ds build` e depois `pnpm --filter @dnex/ds test`.
O teste de distribuição de CSS exige a biblioteca já compilada.

No diretório do pacote, rode Vite em `127.0.0.1:5188` e então:

```sh
DS_PREVIEW_URL=http://127.0.0.1:5188 node tests/confirm-dialog-browser.cjs
```

O runner aceita `PLAYWRIGHT_MODULE` para uma instalação existente de Playwright.
Valida 320, 390, 768 e 1440 px, dois temas, movimento normal/reduzido e um caso
320 × 480 com nome longo sem espaços: 17 cenários. Usa somente dados fictícios.

A vitrine em Overlays demonstra o componente real. Confirmar nela apenas simula
a ação em memória; não chama APIs nem apaga registros.
