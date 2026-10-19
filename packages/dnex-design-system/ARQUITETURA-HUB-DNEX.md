# Arquitetura do Hub DNEX

> Documento canônico da arquitetura **cross-produto** do ecossistema DNEX.
> Enquanto cada produto tem seu próprio `README.md`/`SETUP.md`, este arquivo
> descreve o que é COMPARTILHADO entre todos: o banco único, o control plane
> `hub`, o fluxo de identidade, o contrato de provisionamento e a fronteira de
> segurança. Leia isto antes de começar um produto novo (ver
> [`NOVO-PRODUTO-DNEX.md`](./NOVO-PRODUTO-DNEX.md)).
>
> Convenção: seções marcadas **🔧 A IMPLEMENTAR** descrevem o desenho-alvo que
> ainda NÃO existe no código — são blueprint a construir, não estado atual.
> Data: 2026-07-01.

---

## 1. Visão de 30 segundos

O ecossistema DNEX é um conjunto de produtos SaaS (Normas, Contratos, Admin,
e-Conte, Gestão 360, Adon…) que compartilham:

- **Um único projeto Supabase** — `Gestao Estrategica 360`, ref `fxhphmuymkltukkkieky`.
- **Isolamento por schema Postgres** — cada produto vive no SEU schema (`normas`,
  `contratos`, `hub`, …), não em `public`. Um produto não enxerga as tabelas do outro.
- **Uma identidade de usuário só** — Supabase Auth (`auth.users`). O mesmo login
  vale para todos os produtos (SSO nativo do hub).
- **Um control plane** — o schema `hub` (dono: **Console DNEX**) responde "quem é
  este cliente e o que ele pode usar" para todos os produtos.
- **Um `.env` mestre** — segredos centralizados (ver [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md)).

```
                    ┌─────────────────────────────────────────┐
                    │   Supabase  (fxhphmuymkltukkkieky)       │
                    │                                         │
   auth.users  ─────┤  schema hub      schema normas   ...    │
   (SSO único)      │  (control plane) (produto)              │
                    │   accounts        empresas              │
                    │   account_members usuarios              │
                    │   entitlements    documentos            │
                    └─────────────────────────────────────────┘
                          ▲                    ▲
                          │ service_role       │ anon+RLS / service_role
                   ┌──────┴──────┐      ┌───────┴────────┐
                   │ Console DNEX  │      │ DNEX Normas    │  ... (cada produto)
                   │ (console)   │      │ (produto)      │
                   └─────────────┘      └────────────────┘
```

---

## 2. Banco: um Supabase, um schema por produto

| Decisão | Por quê |
|---|---|
| **Mesmo projeto Supabase para todos** | Um SSO só, um lugar de identidade, custo único, cross-referência possível (o hub referencia contas de todos). |
| **Schema Postgres por produto** (`normas`, `contratos`, `hub`…), nunca `public` | Isolamento forte sem múltiplos bancos; o PostgREST expõe só os schemas listados em *Exposed schemas*; RLS/grants por schema. |
| **`public` fica vazio de domínio** | Evita colisão e vazamento entre produtos. |

**Exposição no PostgREST**: um schema só é acessível pela API REST/PostgREST
depois de adicionado em **Supabase Dashboard → Data API → Settings → Exposed
schemas**. Hoje expostos: `public, graphql_public, aurora, normas, hub`.
Schema novo = adicionar ali (senão as chamadas retornam `PGRST106: Invalid schema`).

**Grants**: schema criado por migração crua **não herda** os grants automáticos
que o Supabase dá aos schemas criados pela ferramenta dele. Ao criar um schema
novo, conceder explicitamente ao papel certo (ver §6 e [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md)).

Schema real de referência: `Console DNEX/src/db/schema.ts` (schema `hub`),
`DNEX - Normas/drizzle/src/schema.ts` (schema `normas`).

---

## 3. O control plane `hub` (dono: Console DNEX)

O `hub` responde a UMA pergunta para todo o ecossistema: **"quem é este cliente
e quais produtos/módulos ele pode usar?"**. Tabelas (ver `Console DNEX/src/db/schema.ts`):

| Tabela | Papel |
|---|---|
| `hub.accounts` | **Identidade canônica do cliente** (uuid). Um cliente = uma conta, independente de quantos produtos usa. |
| `hub.account_bindings` | Liga `accounts.id` ao **id local** do cliente em cada produto (`product_key` + `external_id`). Ex.: (`normas`, `<uuid de normas.empresas>`). É como o hub sabe "a conta X é a empresa Y no Normas". |
| `hub.account_members` | Liga `accounts.id` ao **usuário** (`user_id` = `auth.users.id`) + papel. É a ponte identidade↔conta. |
| `hub.products` / `hub.modules` | Catálogo do que a DNEX vende (produtos e seus módulos). |
| `hub.plans` / `hub.plan_modules` | Bundles de módulos (planos do HUB). |
| `hub.subscriptions` | Assinatura de um account a um plano (status, trial, Stripe). |
| `hub.account_modules` | Overrides finos por módulo (grant/revoke além do plano). |
| `hub.coupons`, `hub.audit_log` | Cupons e trilha de auditoria. |

**Motor de entitlements**: `Console DNEX/src/domain/entitlements.ts` — função pura
`resolveEntitlements()` (sem I/O, 14/14 testes) que resolve "quais módulos este
account tem", com precedência: **revoke > grant > plano ativo > trial válido > nada**.

> **Regra**: o motor de entitlements é regra de negócio do hub e vive no Console DNEX.
> **NÃO** o mova para um pacote compartilhado — produtos que precisarem do resultado
> consomem a resposta (via a API de entitlements, §5), não recompilam o motor.

---

## 4. Fluxo de identidade — como um produto sabe "quem é o usuário e o que ele pode"  🔧 A IMPLEMENTAR

**Estado atual**: cada produto tem sua noção LOCAL de tenant e usuário
(ex.: `normas.usuarios.empresa_id` → `normas.empresas`). Ainda **não há** ligação
populada entre o usuário logado e o `hub`. O `hub.account_members` já tem a coluna
`user_id` (= `auth.users.id`) preparada para isso, mas ninguém escreve nela ainda.

**Desenho-alvo** (a construir): no login, o backend do produto resolve a cadeia

```
auth.uid()  (Supabase Auth, o mesmo em todos os produtos)
   │
   ▼  hub.account_members  WHERE user_id = auth.uid()
account_id  (a conta canônica do cliente)
   │
   ├─▼  hub.account_bindings  WHERE account_id = ? AND product_key = 'normas'
   │  external_id  →  o id LOCAL do tenant no produto (normas.empresas.id)
   │
   └─▼  resolveEntitlements(account_id)   (ou GET /entitlements?account=)
      módulos ativos  →  o produto liga/desliga features
```

**Duas formas de consultar** (escolher por produto):

1. **Direto no banco** (mais simples, recomendado quando o produto e o hub estão
   no mesmo Supabase — que é o caso de todos hoje): o backend do produto lê
   `hub.account_members`/`account_bindings`/`account_modules` via **service_role**
   (bypassa RLS; o hub não tem RLS de qualquer forma, ver §6). Sem HTTP.
2. **Via HTTP** (quando o produto for um serviço separado, sem acesso ao mesmo
   banco): `GET /api/entitlements?account=<id>` no Console DNEX, autenticado
   server-to-server (ver §5).

> **Decisão pendente do dono** ao implementar: (a) quando o `account_members` é
> populado — no provisionamento (§5) já criar o membro owner? (b) e se o usuário
> ainda não tem account no hub — bloquear, ou cair num modo "sem hub"? Deixar
> explícito no produto. Enquanto o fluxo não é implementado, produtos continuam
> usando só a noção local de tenant (como o Normas faz hoje).

---

## 5. Provisionamento server-to-server (Admin → produto)

Quando o Console DNEX cria um cliente que vai usar um produto, ele **não** escreve
no schema do produto diretamente — chama o backend do PRÓPRIO produto, que é o
dono do seu schema. Padrão real (ver `DNEX - Normas/server/src/lib/provisionarEmpresa.ts`
+ rota `/api/interno/empresas` em `DNEX - Normas/server/src/index.ts`, e o lado
chamador em `Console DNEX/src/server/routes/accounts.ts`):

```
Console DNEX (backend)                     Produto (backend, ex.: Normas)
  POST {NORMAS_API_URL}/api/interno/empresas
  header  x-hub-service-key: HUB_SERVICE_KEY   ─────────►  valida a chave
  body    { nome, cnpj, adminEmail, adminNome }            cria a empresa local
                                                           convida o 1º admin
  ◄─────────  201 { empresaId }                            (Supabase Auth invite)
  grava hub.account_bindings
       (account_id, 'normas', empresaId)
```

**Contrato** (todo produto que aceita provisionamento do hub segue isto):

- Rota `POST /api/interno/<recurso>` (fora do `/api/trpc`, sem login de usuário).
- Autenticação: header `x-hub-service-key` comparado a `process.env.HUB_SERVICE_KEY`
  (segredo compartilhado do `.env` mestre). Sem chave → 401; sem env → 503.
- Corpo validado; erros → 4xx com `{ error }`; falha interna → 500.
- Idempotência/limpeza: se um passo tardio falha, desfazer o que já criou
  (o `provisionarEmpresa.ts` apaga a empresa órfã se o convite falha).

A checagem de chave é boilerplate — extraída para `@dnex/shared/service-auth`
(ver [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) e o pacote `dnex-shared`).

**API de entitlements** (lado Admin): `GET /api/entitlements?account=<id>` já existe
(`Console DNEX/src/server/routes/entitlements.ts`), hoje autenticada só para o console
(Bearer JWT + allowlist `HUB_ADMIN_EMAILS`). 🔧 Quando outro PRODUTO for consumir
no login, criar uma via server-to-server (mesma `HUB_SERVICE_KEY` ou uma chave
dedicada) — não usar a allowlist de admin.

---

## 6. Fronteira de segurança: service_role vs. anon, e a ausência de RLS no hub

Duas estratégias coexistem, por design:

| Schema | RLS? | Como o produto acessa | Racional |
|---|---|---|---|
| **Produto** (`normas`, `contratos`) | **Sim** — políticas por `empresa_id`/`company_id` + funções SECURITY DEFINER | Cliente browser usa a **anon key** + JWT do usuário; a RLS escopa tudo ao tenant. Backend usa **service_role** para operações administrativas (com filtro `empresa_id` manual como defesa em profundidade). | Isola tenants no próprio banco; o front pode falar com o PostgREST direto sem vazar. Ver [`RLS-DNEX.md`](./RLS-DNEX.md). |
| **`hub`** (control plane) | **Não** (deliberado) | **Só** via backend com **service_role**. `anon`/`authenticated` **não têm nenhum GRANT** no schema `hub` — mesmo exposto no PostgREST, a anon key recebe `42501 permission denied`. | O hub tem poder sobre entitlements de TODOS os tenants; não pode ser tocável pelo browser. A ausência de RLS é segura porque a única porta é o backend (service_role), que aplica a autorização (allowlist admin / service key). RLS aqui seria defesa em profundidade — recomendada antes de multiplicar consumidores, mas não bloqueante. |

**Chaves** (detalhe em [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md)):
- `anon` / `VITE_SUPABASE_ANON_KEY` — **client-safe**, vai pro bundle; sempre com RLS.
- `service_role` / `SUPABASE_SERVICE_ROLE_KEY` — **só backend**, bypassa RLS; nunca no bundle.
- `HUB_SERVICE_KEY` — segredo server-to-server (Admin ↔ produtos).
- `HUB_ADMIN_EMAILS` — allowlist de quem opera o console Admin.

---

## 7. Consumo do Design System e do `@dnex/shared`

A restrição que manda: **deploy = clone de UM repo** (Vercel). Referência a
pasta-irmã fora do repo funciona no dev local mas quebra no deploy. Decisão
oficial e detalhes em [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) §2.

| Produto | Padrão | Como |
|---|---|---|
| **Contratos, Adm** | **Vendored-packages + pnpm workspace** (✅ oficial p/ deployável) | Copiam DS + `dnex-shared` para `packages/`, consomem como `workspace:*`. Sobrevive ao deploy da Vercel. Ver `<produto>/packages/README.md`. |
| **Normas** | **Espelhamento** (legado) | Copia componentes do DS para `client/src/ds/`. |
| **Fonte canônica** | — | `DNEX - Branding/dnex-design-system/` (DS) e `DNEX - Projetos/dnex-shared/` (shared). As cópias vendorizadas derivam daqui e não se sincronizam sozinhas (rsync manual). |

---

## 8. Referências de código (fonte de verdade)

| Assunto | Arquivo |
|---|---|
| Schema `hub` | `Console DNEX/src/db/schema.ts` |
| Motor de entitlements | `Console DNEX/src/domain/entitlements.ts` (+ `tests/entitlements.test.ts`) |
| API do hub | `Console DNEX/src/server/routes/{catalog,accounts,entitlements}.ts` |
| Provisionamento (lado produto) | `DNEX - Normas/server/src/lib/provisionarEmpresa.ts` + `server/src/index.ts` (`/api/interno/*`) |
| Provisionamento (lado Admin) | `Console DNEX/src/server/routes/accounts.ts` |
| RLS de produto (referência) | `DNEX - Normas/scripts/rls.sql` |
| Segredos | `Console DNEX/.env` (mestre) — ver [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md) |

## Documentos relacionados

- [`NOVO-PRODUTO-DNEX.md`](./NOVO-PRODUTO-DNEX.md) — runbook para começar um produto novo.
- [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) — convenções de código e escolhas oficiais.
- [`RLS-DNEX.md`](./RLS-DNEX.md) — padrão de RLS + template.
- [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md) — `.env` mestre, chaves, rotação.
- [`TELAS-E-TEMPLATES.md`](./TELAS-E-TEMPLATES.md) — inventário de telas + checklist de módulos-base.
- [`PADRAO-DNEX-INTEGRACOES.md`](./PADRAO-DNEX-INTEGRACOES.md) — CPFHub/CNPJ/CEP/WhatsApp.
