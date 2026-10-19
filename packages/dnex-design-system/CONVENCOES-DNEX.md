# Convenções de código do Hub DNEX

> Decisões de padronização que valem para TODO produto do ecossistema. Quando
> houver mais de um jeito de fazer algo (e há), este documento diz qual é o
> OFICIAL para produtos novos, e o que é legado tolerado.
>
> Data: 2026-07-01. Ver também [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md)
> e [`NOVO-PRODUTO-DNEX.md`](./NOVO-PRODUTO-DNEX.md).

---

## 1. Idioma e nomenclatura

- **Código, comentários, commits, docs: PT-BR.** Nomes de domínio em português
  (`empresa`, `usuario`, `aceite`, `provisionarEmpresa`). É o padrão de todo o
  ecossistema — não misturar inglês no domínio.
- Termos técnicos consagrados ficam em inglês (`AuthGate`, `service_role`,
  `binding`, `entitlements`, `render-prop`) — não traduzir à força.
- Colunas de banco em `snake_case` PT-BR (`empresa_id`, `criado_em`,
  `conteudo_json`); no TS, `camelCase` (`empresaId`, `criadoEm`) — o Drizzle/
  mapeamento faz a ponte.

---

## 2. Consumo do Design System e do `@dnex/shared`

### A restrição que manda tudo: deploy = clone de UM repositório

A Vercel (e a maioria dos PaaS) faz deploy de **um único repositório git**.
Qualquer referência a uma pasta-**IRMÃ** fora do repo (`../../DNEX - Branding/…`)
funciona no dev local mas **QUEBRA no build de deploy** — a pasta-irmã não está no
clone. Por isso o jeito de consumir o DS/shared depende de o produto ir a deploy.

| Padrão | Status | Como |
|---|---|---|
| **Vendored-packages + pnpm workspace** | ✅ **OFICIAL para produto que vai a deploy** | **Contratos e Adm** já usam. Copiar `dnex-design-system` e `dnex-shared` para `<produto>/packages/`; consumir como `workspace:*` no `client/package.json`; `pnpm-workspace.yaml` lista `client` + `packages/*`. **Sem alias no Vite** (resolve via node_modules do pnpm). Ver `DNEX - Contratos/packages/README.md` (ou `Console DNEX/packages/README.md`). |
| **Alias ao source (pasta-irmã)** | ⚠️ **Só dev local / NÃO deployável** — migrar antes do deploy | `@dnex/ds`/`@dnex/shared` aliasados no `vite.config.ts` + `tsconfig.json` para o source da pasta-irmã. Simples, mas não sobrevive ao deploy. (Nenhum produto usa mais — Adm foi migrado para vendored em 2026-07-01.) |
| **Espelhamento** (copiar componentes p/ `client/src/ds/`) | ⚠️ Legado | Só Normas. Não adotar. |
| Pacote npm publicado / registry | 🔮 Futuro | Resolveria o vendoring e o drift de vez. |

### Fonte canônica × cópias vendorizadas

**Fonte de verdade**: `DNEX - Branding/dnex-design-system/` (DS) e
`DNEX - Projetos/dnex-shared/` (shared). As cópias em `<produto>/packages/` são
**derivadas** — nunca edite a cópia; edite a fonte e re-sincronize.

As cópias **não se atualizam sozinhas**. Quando a fonte mudar, rode
`<produto>/sync-packages.sh` (faz o `rsync`, reinjeta o `exports` e roda `pnpm
install`). **Pegadinha que o script resolve**: a cópia vendorizada precisa do campo
`exports` no `package.json` para o pnpm resolver sem alias — a fonte canônica do DS
**não** tem esse campo, e o `rsync` cru apagaria o `exports` da cópia; o script
reinjeta. O `dnex-shared` já tem `exports` na fonte.

Normas fica como está (espelhamento legado). Adm e Contratos já estão vendorizados
(prontos para deploy na Vercel).

---

## 3. Aliases de import (padrão em `client/vite.config.ts`)

| Import | Resolvido por | Uso |
|---|---|---|
| `@` | alias → `client/src` (sempre) | Código do próprio front. |
| `@shared` | alias → `../src` (sempre) | Compartilhar tipos/domínio entre back e front do MESMO produto (ex.: `@shared/domain/entitlements` no Admin). |
| `@dnex/ds` | **workspace dep** (vendored) ou **alias** (dev-local) | Componentes visuais. |
| `@dnex/shared` | **workspace dep** (vendored) ou **alias** (dev-local) | Infra transversal: `AuthGate`, cliente Supabase, `service-auth`. |

⚠️ `@` e `@shared` são **sempre** aliases do Vite (produto-local). Já `@dnex/ds`
e `@dnex/shared` dependem do padrão (§2): no **vendored+workspace** são deps
`workspace:*` resolvidas pelo node_modules do pnpm (sem alias no Vite); no
**dev-local** são aliases para o source da pasta-irmã.

⚠️ `@shared` (produto-local, backend do PRÓPRIO produto) e `@dnex/shared`
(cross-produto, pacote do ecossistema) são **coisas diferentes** — não confundir.

---

## 4. Portas de dev (não colidir)

| Produto | Front (Vite) | Back |
|---|---|---|
| Normas | 5173 | 3001 (dev local; 3000 é o don-site) |
| Contratos | 5183 | 3183 |
| Admin | 5184 | 3184 |
| **Produto novo** | próxima 51xx livre | próxima 31xx livre |

---

## 5. Proxy `/api` — padronizar em NÃO reescrever

Há duas variações hoje:
- **Admin/Normas**: proxy `/api` → backend **sem rewrite**; o Express monta as
  rotas em `/api/*`. ✅ **Preferir esta** (o path é o mesmo em dev e em produção).
- **Contratos**: proxy reescreve tirando `/api` (`/api/clientes` → `:3183/clientes`).
  Funciona, mas o path diverge entre dev e prod. Não adotar em produto novo.

---

## 6. Backend: Supabase JS + RLS vs. Drizzle direto

| Abordagem | Produtos | Precisa de senha do Postgres? | Quando escolher |
|---|---|---|---|
| **Supabase JS** (`createClient`, front anon+RLS, back service_role) | Normas, Admin | Não (usa as keys) | Default. Menos infra, RLS faz o isolamento. |
| **Drizzle** (`postgres` driver) | Contratos | Sim (`DATABASE_URL`) | Quando quer ORM tipado e queries complexas no back. Ainda valida JWT via Supabase (`supabaseAuth`). |

Ambas válidas. Não misture as duas para a MESMA operação. O cliente Supabase de
servidor (para validar JWT) vem de `@dnex/shared/lib/supabase-server`.

---

## 7. tRPC vs. Express

- **Normas**: tRPC 11 (procedures tipadas: `publicProcedure`/`protectedProcedure`/
  `editorProcedure`/`adminProcedure`). Bom quando o front é acoplado ao back e
  quer type-safety ponta a ponta.
- **Admin/Contratos**: Express + rotas REST. Mais simples para consoles/serviços
  com poucas rotas.

Ambos aceitáveis. Escolha por complexidade do produto; documente no `SETUP.md`.
Em QUALQUER dos dois, a autorização é **no servidor** (o front só esconde botão).

---

## 8. Autenticação de front — `@dnex/shared/AuthGate` (render-prop)

Padrão oficial (Adm/Contratos): `AuthGate` render-prop que checa a sessão do
Supabase e entrega a `Session` aos children. Normas usa um `AuthProvider` (React
context) por razões históricas — **legado tolerado**, não replicar.

O que cada produto adota do `@dnex/shared`:

| Módulo | Adm | Contratos | Normas |
|---|---|---|---|
| `AuthGate` (render-prop) | ✅ | ✅ | ❌ (usa AuthProvider próprio) |
| `lib/supabase` (browser) | ✅ | ✅ | ⚠️ tem o seu; migrar é opcional |
| `lib/supabase-server` | (tem o seu) | (usa Drizzle) | ⚠️ tem vários inline; migrar é opcional |
| `service-auth` (x-hub-service-key) | (chamador) | — | ⚠️ **cópia inline** em `server/src/index.ts` |

> **Por que o backend do Normas não consome `@dnex/shared/server` hoje**: o server
> roda com `tsx`, que **não** resolve `paths` do tsconfig em runtime; e o
> `dnex-shared` é um sibling FORA do workspace pnpm do Normas. Aliasar exigiria
> import relativo cruzando a fronteira do projeto ou transformar todo o
> `DNEX - Projetos` num workspace pnpm (o item "evolução para monorepo", fora de
> escopo). Enquanto isso, o Normas mantém sua cópia inline de `checarChaveDeServico`
> — o comportamento é idêntico ao de `@dnex/shared/server`. **Produtos NOVOS**,
> se aliasarem `@dnex/shared` no front (browser), já ganham `AuthGate`/cliente de
> graça; no backend, consumir `@dnex/shared/server` só é trivial se o backend for
> bundlado (esbuild/tsup) ou se entrarmos no monorepo pnpm.

---

## 9. Tratamento de erro (HTTP e tRPC)

- **Rota interna/HTTP**: `{ error: string }` com status coerente — 400 (payload),
  401 (auth), 403 (sem permissão), 404, 409 (conflito), 500 (interno), 502
  (falha ao contatar outro serviço), 503 (env faltando). Ver as rotas do Admin
  como referência.
- **tRPC**: `TRPCError` com `code` (`UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`,
  `PRECONDITION_FAILED`…). Ver `DNEX - Normas/server/src/trpc.ts`.
- Mensagens de erro em PT-BR, para o usuário final ler.

---

## 10. Verificação antes de "pronto"

Sempre `tsc --noEmit` (back) e `tsc -b` (front) verdes. Testes onde houver
(`vitest`). E a checklist de telas-base de [`TELAS-E-TEMPLATES.md`](./TELAS-E-TEMPLATES.md).

---

## 11. Gotchas de CSS / animação (aprendidos na prática)

- **NUNCA anime `transform` num elemento centralizado por `transform: translate(-50%,-50%)`**
  (classes `-translate-x-1/2 -translate-y-1/2`, usadas em todo `Dialog`/`ConfirmDialog`
  Radix do DS). Um keyframe que seta `transform` (ex.: `translateY(8px) scale(...)`)
  **sobrescreve** o transform de centralização — o modal perde o centro e aparece
  cortado no rodapé durante a animação. **Anime a propriedade INDEPENDENTE `scale`
  (+ `opacity`)**, que compõe sem conflito. (Bug real corrigido em 2026-07-03 nos
  keyframes `content-in`/`content-out` do `theme.css`.) Regra geral: `translate`,
  `rotate`, `scale` são propriedades separadas de `transform` — prefira-as para animar
  sem clobber.
- **Tailwind v4 + DS vendorizado**: o `index.css` do produto precisa de um
  `@source "../../packages/dnex-design-system/src/**/*.{ts,tsx}"` apontando pra cópia
  vendorizada, senão classes usadas SÓ no DS são purgadas do bundle (layout quebra
  silenciosamente). Ver §2.

- **Sem faixa lateral de cor diferente em cards, botões e itens de menu** (decisão do
  titular, 2026-09-23). Nada de `border-l-2/3/4` colorida, `shadow-[inset_3px_0_…]` ou
  `::before` vertical na borda esquerda. Estado ativo = fundo destacado (`bg-action-tint`,
  ou fundo claro no trilho escuro) + `aria-current`; severidade = `Badge`/`Alert` com
  `tone`, ou a borda INTEIRA no tom (`border-[var(--tone-*-border)]`). Divisórias de 1 px
  na cor da linha continuam permitidas.

## Documentos relacionados

- [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) · [`NOVO-PRODUTO-DNEX.md`](./NOVO-PRODUTO-DNEX.md) · [`RLS-DNEX.md`](./RLS-DNEX.md) · [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md)
