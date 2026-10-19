# RLS no Hub DNEX — padrão e template

> Como fazer isolamento multi-tenant por RLS (Row Level Security) num produto
> DNEX, mais a explicação de por que o schema `hub` **não** tem RLS. O padrão
> canônico é o do Normas (`DNEX - Normas/scripts/rls.sql`); o template genérico
> está em [`templates/rls-produto.sql`](./templates/rls-produto.sql).
>
> Data: 2026-07-01. Ver [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) §6.

---

## 1. Duas estratégias, por design

| Schema | RLS? | Acesso |
|---|---|---|
| **Produto** (`normas`, `contratos`, `juris`…) | **Sim** | Front usa **anon key** + JWT do usuário; a RLS escopa tudo ao tenant. Backend usa **service_role** com filtro `empresa_id` manual (defesa em profundidade). |
| **`hub`** (control plane) | **Não** (deliberado) | **Só** backend com **service_role**. `anon`/`authenticated` sem GRANT. A porta única é o backend, que aplica a autorização. |

**Por que o hub não tem RLS**: ele tem poder sobre os entitlements de TODOS os
tenants. Expô-lo ao browser (mesmo com RLS) seria superfície de ataque
desnecessária. Fechá-lo atrás do backend (service_role) é mais simples e seguro.
RLS no hub seria defesa em profundidade — recomendada antes de multiplicar
consumidores, não bloqueante hoje.

---

## 2. O padrão de produto (do Normas)

Três peças:

### 2.1 Funções de tenant (`SECURITY DEFINER`)

Resolvem "qual a empresa/papel do usuário logado" lendo a tabela de usuários
**sem** disparar a RLS dela (evita recursão). `search_path` fixo no schema.

```sql
create or replace function <schema>.empresa_do_usuario()
returns uuid language sql stable security definer set search_path = <schema>
as $$ select empresa_id from <schema>.usuarios where id = auth.uid() $$;

create or replace function <schema>.papel_do_usuario()
returns text language sql stable security definer set search_path = <schema>
as $$ select papel::text from <schema>.usuarios where id = auth.uid() $$;
```

### 2.2 RLS habilitada em TODAS as tabelas

```sql
alter table <schema>.<tabela> enable row level security;
```

### 2.3 Políticas escopadas ao tenant

Padrão por tipo de tabela:

| Tipo de tabela | Leitura | Escrita |
|---|---|---|
| Conteúdo do tenant (documentos, espaços…) | todo o tenant (`empresa_id = empresa_do_usuario()`) | editor/admin |
| Cadastro de usuários | colegas do tenant **+ a própria linha** (`id = auth.uid()`) | admin |
| Trilha jurídica (aceites, logs) | tenant (própria + staff) | **append-only** (só insert; sem update/delete) |
| Catálogo global (planos) | qualquer autenticado (`using (true)`) | service_role |
| Registros pessoais (notificações) | só o dono (`usuario_id = auth.uid()`) | dono / staff |

> **Detalhe crítico** (do Normas): na política de `usuarios`, incluir
> `id = auth.uid()` no `using` — senão o usuário `master` (sem empresa,
> `empresa_id` NULL) não lê a própria linha (`NULL = NULL` retorna NULL, não TRUE),
> e o build de contexto quebra.

---

## 3. Regras de ouro

1. **RLS não substitui filtro no backend.** A service_role **bypassa** a RLS. Todo
   router que usa service_role deve filtrar `empresa_id` manualmente (defesa em
   profundidade). Ver a NOTA no fim de `DNEX - Normas/scripts/rls.sql`.
2. **Tabelas de trilha (aceites/logs) são append-only** — só política de `insert`,
   nunca `update`/`delete` (valor jurídico: a trilha não pode ser adulterada).
3. **`search_path` fixo** nas funções SECURITY DEFINER (senão viram vetor de
   ataque via search_path).
4. **Idempotente**: `create or replace` / `drop policy if exists` — o script roda
   de novo sem quebrar.
5. **Rode DEPOIS das migrations** do Drizzle (as tabelas precisam existir).
6. **Teste com 2 tenants**: crie duas empresas, um usuário em cada, confirme que
   um não lê o dado do outro.

---

## 4. Template

[`templates/rls-produto.sql`](./templates/rls-produto.sql) — genérico, com
placeholders `<schema>`/`<tabela>`. Copie, troque os placeholders, adapte a
lista de tabelas. Para um exemplo completo e testado em produção, use
`DNEX - Normas/scripts/rls.sql` como referência viva.

## Documentos relacionados

- [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) · [`NOVO-PRODUTO-DNEX.md`](./NOVO-PRODUTO-DNEX.md) · [`SEGREDOS-DNEX.md`](./SEGREDOS-DNEX.md)
