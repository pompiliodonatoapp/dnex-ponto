# GlobalRail — disponibilidade de lançamento

O `GlobalRail` representa aplicativos já autorizados para o contexto da pessoa,
organização e empresa selecionada. Ele não decide autorização, tenant, SSO ou
rotas: essas decisões pertencem ao control plane e ao produto que recebe o
handoff.

## Contrato

```tsx
<GlobalRail
  activeKey="contratos"
  onSelect={openProduct}
  products={[
    { key: "contratos", label: "Contratos", availability: "ready" },
    {
      key: "normas",
      label: "Normas",
      availability: "provisioning",
      description: "A ativação da sua organização está em andamento.",
    },
  ]}
/>
```

| Estado | Uso | Interação |
| --- | --- | --- |
| `ready` (padrão) | O produto pode receber o handoff autorizado. | Botão acionável; chama `onSelect`. |
| `provisioning` | Há autorização comercial, mas o acesso ainda está sendo preparado. | `aria-disabled`, permanece focalizável para anunciar nome e explicação; não chama `onSelect`. |
| `unavailable` | Não há rota operacional para o contexto atual. | `aria-disabled`, permanece focalizável para anunciar nome e explicação; não chama `onSelect`. |

`label` é o nome acessível do produto. Para estados não prontos, `description`
deve explicar o próximo estado; se não for fornecida, o DS usa uma mensagem
segura e genérica. O mesmo contrato existe em `SidebarDrawer.globalItems`, que
é a representação mobile do rail.

## Acessibilidade e mobile

- Estados não prontos não recebem `disabled` nativo: permanecem no fluxo de
  teclado, com `aria-disabled` e `aria-describedby`, para a pessoa saber por
  que não pode abrir o produto.
- Nenhum estado não pronto instala `onClick` ou dispara `onSelect` via Enter ou
  Espaço.
- O item usa pelo menos a mesma área de toque do rail (40 px desktop) e o
  drawer mantém cartões de 64 px no mobile.
- `title` é apenas reforço visual; a explicação não depende de hover.

## Não fazer

- Não use `provisioning` para esconder uma negativa de autorização. Produtos
  não autorizados não entram na lista.
- Não trate `availability` como prova de entitlement ou como URL confiável.
- Não faça a vitrine chamar APIs, emitir SSO ou alterar um tenant.

Impacto de versão: aditivo em `@dnex/ds`; consumidores existentes continuam em
`ready` quando não fornecem `availability`.
