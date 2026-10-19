# Como iniciar um produto novo no Hub DNEX

> Runbook passo a passo para criar um produto novo do ecossistema (ex.: DNEX
> Juris, uma expansão do e-Conte, um módulo Automação). Segue os padrões reais
> de Contratos/Admin — o produto mais recente (Contratos) é a referência viva.
>
> Pré-leitura: [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) (o modelo
> compartilhado) e [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) (as escolhas oficiais).
> Data: 2026-07-01.

---

## 0. Antes de escrever qualquer código

Responda 3 perguntas — elas definem metade das decisões abaixo:

1. **É multi-tenant?** (cada cliente tem uma "empresa" isolada) → precisa de
   schema com `empresa_id`/`company_id` + RLS + provisionamento pelo hub.
   Quase todo produto DNEX é. Um console interno (como o Admin) pode não ser.
2. **O backend persiste via PostgREST (Supabase JS) ou Drizzle (`postgres` driver)?**
   - Supabase JS + RLS: Normas, Admin. Sem senha de Postgres; usa anon+RLS no
     front e service_role no back.
   - Drizzle direto: Contratos. Precisa de `DATABASE_URL`/`SUPABASE_DATABASE_URL`
     (senha do Postgres). Escolha por afinidade da equipe; ver [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md).
3. **Precisa de editor de texto rico, gráficos, IA?** Isso define os grupos de
   dependência opcionais (o DS não traz editor rico — ver §5).

---

## 1. Estrutura de pastas

Padrão de Contratos/Admin (backend na raiz, front em `client/`):

```
DNEX - <Produto>/
  .env               → symlink para ../Console DNEX/.env   (NUNCA um arquivo próprio)
  .env.example       → template com as chaves que este produto usa (SEM valores)
  package.json       → backend (Express/Drizzle ou scripts de domínio)
  tsconfig.json
  drizzle.config.ts  → se usar Drizzle
  src/               → backend: db/ domain/ http|server/ services/ integrations/ ...
  drizzle/           → migrations
  seed/
  client/            → front (Vite + React)
    vite.config.ts
    package.json     → deps do front
    src/
      main.tsx  App.tsx  AuthGate.tsx  pages/  components/  lib/
  README.md          → o QUÊ/POR QUÊ do produto
  SETUP.md           → o estado verificado (o que roda, o que falta)
```

Ver `DNEX - Contratos/` como esqueleto real.

---

## 2. Banco: schema próprio + migração + exposição

1. **Crie um schema Postgres novo** (nunca use `public`): ex.: `juris`.
   Via Drizzle (`pgSchema("juris")` em `src/db/schema.ts`) + migração, ou via
   Supabase MCP `apply_migration` com `CREATE SCHEMA ... CREATE TABLE IF NOT EXISTS`.
2. **Exponha no PostgREST** (só se o front vai falar direto com o PostgREST):
   Supabase Dashboard → Data API → Settings → Exposed schemas → adicione `juris`.
3. **Grants**: schema criado por migração crua não herda grants. Se o front usa
   anon+RLS, conceda a `anon`/`authenticated` o necessário; se só o backend
   acessa, conceda a `service_role`. Ver [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md) e
   o exemplo de GRANT em [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) §6.

---

## 3. RLS (se multi-tenant)

Copie o padrão do Normas (`DNEX - Normas/scripts/rls.sql`), adaptando ao seu
schema. O template genérico está em [`RLS-DNEX.md`](./RLS-DNEX.md) +
`templates/rls-produto.sql`. Em resumo:

- Funções `SECURITY DEFINER` `<schema>.empresa_do_usuario()` e `.papel_do_usuario()`
  (leem a tabela de usuários sem recursão de RLS, `search_path` fixo no schema).
- RLS habilitada em TODAS as tabelas; políticas escopadas a `empresa_id`.
- Tabelas de trilha jurídica (aceites/logs) **append-only** (só insert).
- **Nunca** confie só na RLS no backend com service_role: filtre `empresa_id`
  manualmente também (defesa em profundidade).

---

## 4. Integração com o hub

Se o produto é vendido/provisionado pela DNEX (quase sempre):

1. **Rota de provisionamento** `POST /api/interno/<recurso>` no backend do produto,
   autenticada por `x-hub-service-key` = `HUB_SERVICE_KEY`. Copie
   `DNEX - Normas/server/src/lib/provisionarEmpresa.ts` + a rota em `server/src/index.ts`.
   A checagem de chave está em `@dnex/shared/server` (`checarChaveDeServico`) —
   consuma diretamente **se o seu backend for bundlado (esbuild/tsup) ou estiver no
   mesmo workspace pnpm**; se rodar com `tsx` fora do workspace (como o Normas), a
   função é pequena — copie o padrão do Normas. Ver a nota em [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) §8.
2. **Binding**: o Console DNEX, após chamar sua rota, grava
   `hub.account_bindings (account_id, '<product_key>', <id local>)`. Adicione seu
   `product_key` no catálogo do hub (`hub.products`) e um botão de provisionamento
   no `AccountDetail` do Admin (ver `Console DNEX/client/src/pages/AccountDetail.tsx`).
3. **Entitlements no login** 🔧: se o produto precisa ligar/desligar features por
   plano, resolva a cadeia de identidade (ver [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md)
   §4). Esse fluxo ainda é blueprint — implemente conforme o desenho de lá.

---

## 5. Front: Vite + DS + telas-base

1. **`client/vite.config.ts`** + consumo do DS/shared: a escolha depende de o
   produto ir a **deploy** (Vercel clona UM repo — ver [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) §2):
   - **Vai a deploy** → **vendored-packages + pnpm workspace** (padrão do Contratos):
     copie `dnex-design-system` e `dnex-shared` para `<produto>/packages/`, consuma
     como `workspace:*`, crie `pnpm-workspace.yaml` (`client` + `packages/*`). Sem
     alias de `@dnex/*` no Vite. Ver `DNEX - Contratos/packages/README.md`.
   - **Só dev-local/protótipo** → aliasar o source (padrão do Adm): `@dnex/ds`/
     `@dnex/shared` para a pasta-irmã no `vite.config.ts` + `tsconfig.json`.
   Em ambos: `@` → `src`, `@shared` → `../src`, `envDir` → raiz do produto. Portas
   livres (front 51xx, back 31xx) — veja as usadas em [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md).
2. **Auth**: use `AuthGate` de `@dnex/shared` (render-prop; recebe seu `Login`).
   Não reescreva o de Adm/Contratos.
3. **Cliente Supabase**: use `createBrowserClient` de `@dnex/shared/lib/supabase`.
4. **Telas-base obrigatórias**: rode a **checklist de módulos-base** em
   [`TELAS-E-TEMPLATES.md`](./TELAS-E-TEMPLATES.md) (seção "Checklist obrigatória").
   No mínimo: **Login, Perfil, Configurações (Segurança)**; se multi-tenant,
   **Cadastro de Empresa** e **Colaboradores**. Os componentes já existem no DS
   (`LoginScreen`, `ProfileSettings`, `SecuritySettings`, `CompanySettings`,
   `TeamSettings`). **Não dê o produto como pronto sem essas telas.**
5. **Integrações de formulário**: CPF→nome (CPFHub), CNPJ→razão social, CEP→endereço,
   campo WhatsApp próprio — **obrigatório** por [`PADRAO-DNEX-INTEGRACOES.md`](./PADRAO-DNEX-INTEGRACOES.md).

---

## 6. Segredos

`.env` do produto é **symlink** para `../Console DNEX/.env` (o mestre). Não crie
arquivo próprio. Adicione as chaves específicas do produto na seção dele dentro
do mestre. Mantenha um `.env.example` no produto (template sem valores). Ver
[`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md).

---

## 7. Git

Cada produto é um repositório git próprio (privado), conta `pompiliodonatoapp`.
`.gitignore` deve excluir `.env`/`.env.*` (só `.env.example` versionado),
`node_modules/`, `dist/`. Confira que nenhum segredo real foi para o commit antes
do push (`git diff --cached`, `git check-ignore .env`).

---

## 8. Definition of Done de um produto novo

- [ ] Schema próprio criado, migração aplicada, exposto no PostgREST (se front direto).
- [ ] RLS aplicada em todas as tabelas (se multi-tenant), testada com 2 tenants.
- [ ] Rota `/api/interno/*` de provisionamento + binding no Admin (se vendido pela DNEX).
- [ ] **Telas-base da checklist** (`TELAS-E-TEMPLATES.md`) — Login, Perfil, Configurações no mínimo.
- [ ] Integrações de formulário (CPF/CNPJ/CEP/WhatsApp) conforme `PADRAO-DNEX-INTEGRACOES.md`.
- [ ] `.env` symlinkado ao mestre; `.env.example` presente; nenhum segredo no git.
- [ ] Se vai a deploy: DS/shared **vendorizados** em `packages/` + pnpm workspace (não alias de pasta-irmã, que quebra o build da Vercel).
- [ ] `pnpm typecheck`/`tsc` verde no back e no front; build de produção passa.
- [ ] `README.md` (o quê/por quê) + `SETUP.md` (estado verificado) escritos.

## Documentos relacionados

- [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) · [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) · [`RLS-DNEX.md`](./RLS-DNEX.md) · [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md) · [`TELAS-E-TEMPLATES.md`](./TELAS-E-TEMPLATES.md) · [`PADRAO-DNEX-INTEGRACOES.md`](./PADRAO-DNEX-INTEGRACOES.md)
