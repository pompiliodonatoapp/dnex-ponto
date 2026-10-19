-- ============================================================================
-- TEMPLATE de RLS para um produto DNEX multi-tenant.
--
-- USO: copie para <seu-produto>/scripts/rls.sql, substitua <schema> pelo schema
-- do produto (ex.: juris) e ajuste a lista de tabelas em §2. Rode no SQL Editor
-- do Supabase DEPOIS de aplicar as migrations do Drizzle. Idempotente.
--
-- Referência viva (exemplo completo, testado em produção): DNEX - Normas/scripts/rls.sql
-- Documentação: dnex-design-system/RLS-DNEX.md
--
-- Premissa do modelo: cada linha carrega `empresa_id`; existe uma tabela
-- `<schema>.usuarios (id = auth.users.id, empresa_id, papel)`. Ajuste os nomes
-- se o seu produto usa `company_id`/outra convenção.
-- ============================================================================

-- ── §1. Funções de tenant (SECURITY DEFINER, search_path fixo). ─────────────
create or replace function <schema>.empresa_do_usuario()
returns uuid language sql stable security definer set search_path = <schema>
as $$ select empresa_id from <schema>.usuarios where id = auth.uid() $$;

create or replace function <schema>.papel_do_usuario()
returns text language sql stable security definer set search_path = <schema>
as $$ select papel::text from <schema>.usuarios where id = auth.uid() $$;

-- ── §2. Habilita RLS em todas as tabelas do tenant. ─────────────────────────
-- AJUSTE a lista abaixo para as tabelas do seu schema.
do $$
declare t text;
begin
  foreach t in array array[
    'usuarios','empresas' /* , 'sua_tabela_1', 'sua_tabela_2', ... */
  ]
  loop
    execute format('alter table <schema>.%I enable row level security;', t);
  end loop;
end $$;

-- ── §3. empresas: o usuário vê a própria empresa. ───────────────────────────
drop policy if exists empresa_self on <schema>.empresas;
create policy empresa_self on <schema>.empresas
  for select using (id = <schema>.empresa_do_usuario());

-- ── §4. usuarios: vê colegas do tenant; admin gerencia. ─────────────────────
-- `id = auth.uid()` garante que um usuário sem empresa (empresa_id NULL) leia a
-- própria linha (NULL = NULL retorna NULL, não TRUE, e bloquearia o contexto).
drop policy if exists usuarios_tenant on <schema>.usuarios;
create policy usuarios_tenant on <schema>.usuarios
  for select using (
    id = auth.uid()
    or empresa_id = <schema>.empresa_do_usuario()
  );
drop policy if exists usuarios_admin_write on <schema>.usuarios;
create policy usuarios_admin_write on <schema>.usuarios
  for all using (empresa_id = <schema>.empresa_do_usuario() and <schema>.papel_do_usuario() = 'admin')
  with check (empresa_id = <schema>.empresa_do_usuario());

-- ── §5. Tabelas de conteúdo: leitura por todo o tenant; escrita editor/admin. ─
-- AJUSTE a lista para as suas tabelas de conteúdo.
do $$
declare t text;
begin
  foreach t in array array[ /* 'sua_tabela_conteudo_1', 'sua_tabela_conteudo_2' */ ] loop
    execute format('drop policy if exists %I_select on <schema>.%I;', t, t);
    execute format(
      'create policy %I_select on <schema>.%I for select using (empresa_id = <schema>.empresa_do_usuario());',
      t, t
    );
    execute format('drop policy if exists %I_write on <schema>.%I;', t, t);
    execute format(
      'create policy %I_write on <schema>.%I for all
         using (empresa_id = <schema>.empresa_do_usuario() and <schema>.papel_do_usuario() in (''editor'',''admin''))
         with check (empresa_id = <schema>.empresa_do_usuario());',
      t, t
    );
  end loop;
end $$;

-- ── §6. Trilha APPEND-ONLY (aceites/logs de valor jurídico): só insert. ─────
-- Exemplo para uma tabela `aceites`. Repita para logs_auditoria etc.
-- drop policy if exists aceites_select on <schema>.aceites;
-- create policy aceites_select on <schema>.aceites
--   for select using (
--     empresa_id = <schema>.empresa_do_usuario()
--     and (usuario_id = auth.uid() or <schema>.papel_do_usuario() in ('editor','admin'))
--   );
-- drop policy if exists aceites_insert_self on <schema>.aceites;
-- create policy aceites_insert_self on <schema>.aceites
--   for insert with check (empresa_id = <schema>.empresa_do_usuario() and usuario_id = auth.uid());
-- (SEM políticas de update/delete — a trilha é imutável.)

-- ── §7. Catálogo global (ex.: planos): legível por qualquer autenticado. ────
-- drop policy if exists planos_read on <schema>.planos;
-- create policy planos_read on <schema>.planos for select using (true);

-- NOTA: a service_role (jobs/seed/upload/admin) IGNORA a RLS. Todo backend que a
-- usa deve filtrar `empresa_id` manualmente (defesa em profundidade), além da RLS.
