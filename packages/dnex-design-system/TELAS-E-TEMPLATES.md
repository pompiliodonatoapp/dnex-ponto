# DNEX — Telas, Templates de Mensagem & Blocos Reutilizáveis

> **Mapa do que é reutilizável num hub SaaS multi-tenant** (ecossistema DNEX:
> apps **DON Dashboard**, **DON Documentação** e **Aurora**, sob a marca-mãe) +
> **roadmap de construção** priorizado.
>
> **Natureza deste documento:** especificação / blueprint. **Não é código.** As
> telas aqui são **page templates / blocks** a serem compostos a partir dos ~50
> componentes que o DS já entrega — reutilizáveis por **todos** os apps do hub.
>
> **Embasamento:** `saas-architect-dnex` (arquitetura/ADR), `saas-multi-tenant-dnex`
> (RLS, onboarding de tenant, JWT, feature flags), `saas-gestao-empresarial`
> (módulos/CRUD/Stripe/landing), `design-frontend-prd` (acabamento visual +
> Score), `rbac-controle-acesso` (roles/permissions/audit). Todas carregadas.
>
> **Stack canônica (conferir versão no lockfile):** React 19 · Tailwind v4 ·
> Radix · Supabase Auth · tRPC v11 · Drizzle · PostgreSQL (Supabase) · Stripe.
> Tenancy = **shared-schema + RLS** (`tenant_id` no JWT via Custom Access Token
> Hook). Autorização = **permissão no servidor** (UI só esconde botão).
>
> **Regra de ouro deste doc — `[CONFIRMAR]`:** tudo que não está travado na
> marca/engenharia entra marcado. Conteúdo de marca (métrica, depoimento,
> nº de empresas, política de trial/cancelamento, CNPJ) é `[CONFIRMAR]` —
> nunca fabricado (memória de marca: pendências do titular em aberto).
>
> **Status:** v0.1 — proposta para construção sub-fase a sub-fase.
> Data: 2026-06-29.

---

## Checklist obrigatória — todo produto novo do Hub DON

> Adicionado em 2026-07-01. **Regra de ouro**: antes de considerar qualquer
> produto/console novo do ecossistema (DNEX Normas, Console DNEX, DNEX Contratos,
> e-Conte, Adon, ou qualquer app futuro) "pronto" — mesmo um MVP — rodar esta
> checklist. Não vale "só a feature de negócio principal"; os itens abaixo são
> a fundação mínima de qualquer produto, independente do quão simples ele seja.

| # | Módulo | Obrigatório quando | Telas de referência (§1) | Componentes DS prontos |
|---|---|---|---|---|
| 1 | **Login** | Sempre (todo produto tem usuário autenticado) | A1 | `LoginScreen` |
| 2 | **Perfil** | Sempre | D1 | `ProfileSettings` |
| 3 | **Segurança** (ao menos troca de senha) | Sempre | D2 | `SecuritySettings` (ou versão enxuta com `Form`+`PasswordField`, se 2FA/sessões não se aplicam) |
| 4 | **Cadastro/gestão de empresa** | Produto multi-tenant (cada cliente tem uma empresa própria) | C3 / D3 | `CompanySettings` |
| 5 | **Equipe/colaboradores** | Produto com mais de 1 usuário possível por conta | C1 / D4 | `TeamSettings` |
| 6 | Esqueci senha, Aceitar convite, Signup | Quando o produto tem autosserviço de cadastro ou convite de equipe (nem todo produto interno precisa) | A2, A3, A7 | `SignupScreen`, `ForgotPasswordScreen`, `AcceptInviteScreen` |

**Caso real que motivou esta seção**: o Console DNEX (console de controle do hub)
foi construído com Login funcionando, mas sem Perfil nem Configurações — o
próprio operador não tinha como trocar a própria senha. Corrigido em
2026-07-01 (`ConfiguracoesPage.tsx`, seções Perfil + Segurança, dados
diretamente no `user_metadata` do Supabase Auth — o Admin não tem tabela de
usuários própria). O gap não era falta de componente no DS (`ProfileSettings`
e `SecuritySettings` já existiam prontos) — era falta de checar esta lista
antes de dar o produto como pronto.

**Como aplicar**: ao planejar ou revisar um produto novo, percorrer a tabela
acima linha a linha. Se um item marcado "sempre" estiver faltando, sinalizar
isso proativamente antes de considerar o escopo fechado — não esperar o
usuário notar. Os itens 4-6 só entram se a condição da coluna "Obrigatório
quando" for verdadeira para aquele produto específico (não forçar cadastro de
empresa num produto de usuário único, por exemplo).

---

## 0. Convenções e premissas do hub

### 0.1 Vocabulário (alinhado às skills)

| Termo | Significado no DNEX |
|---|---|
| **Tenant / empresa** | Locatário isolado por `tenant_id`. Um usuário pode pertencer a vários. |
| **Workspace** | Sinônimo de tenant na camada de UI (o "espaço" da empresa ativa). |
| **Membro (`tenant_users`)** | Vínculo usuário↔tenant com papel (`owner`/`admin`/`member`/`viewer`). |
| **App** | DON Dashboard, DON Documentação, Aurora — consumidores do mesmo DS e da mesma sessão. |
| **Page template** | Composição de alto nível, reutilizável, parametrizável por app. |
| **Block** | Padrão menor que uma página, plugável em qualquer template (ex.: confirm dialog). |

### 0.2 O que **não** se reconstrói (já existe no DS)

Inventário real exportado por `@dnex/ds` (`src/index.ts`), confirmado em
2026-06-29 — **não recriar, compor a partir destes:**

- **Foundations / tokens:** `tokens`, `color`, `semantic`, `font`, `typeScale`,
  `space`, `radius`, `shadow`, `motion`, `ThemeProvider`/`useTheme`, `cn`,
  helpers de motion (`fadeUp`, `staggerContainer`, `inView`).
- **Brand:** `Logo`, `DnexSymbol`.
- **Ilustrações duotom:** `IllustrationEmpty`, `Illustration404`,
  `Illustration500`, `IllustrationSuccess`, `IllustrationNoPermission`,
  `IllustrationNoConnection`, `IllustrationOnboarding`.
- **Primitivos:** `Button`, `Input`, `Textarea`, `Label`, `Select`, `Checkbox`,
  `RadioGroup`/`RadioItem`, `Switch`, `Badge`, `Avatar`, `Tooltip`, `Separator`,
  `Kbd`.
- **Inputs especializados:** `SearchInput`, `SegmentedControl`, `Slider`/
  `RangeSlider`, `Combobox`, `MultiSelect`, `FileUpload`.
- **Camada de formulário (RHF + zod):** `Form`, `FormField`, `FormItem`,
  `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`.
- **Inputs fiscais BR:** `CurrencyInput`, `CnpjInput`, `CpfInput`, `CepInput`,
  `PercentInput`, `DateInputBR` (+ utils `maskCnpj`, `formatBRL`, etc.).
- **Compostos:** `Card`(+ subpartes), `StatCard`, `Tabs`, `Accordion`, `Dialog`,
  `DropdownMenu`, `Popover`, `Toast`/`useToast`, `Alert`, `Skeleton`/
  `SkeletonStat`, `Progress`, `Pagination`, `Breadcrumb`, `Table`, `DataTable`,
  `EmptyState`, `ErrorState`, `Spinner`/`PageLoader`, `Timeline`.
- **Calendário/datas:** `Calendar`, `DatePicker`.
- **Wizard:** `Stepper`, `Wizard`.
- **Notificações:** `NotificationCenter`, `NotificationItem`.
- **Gráficos:** `AreaChartDnex`, `LineChartDnex`, `BarChartDnex`,
  `DonutChartDnex`, `RadialChartDnex`, `RadarChartDnex`, `Sparkline`,
  `GaugeChart`, `ChartTooltip`, `useChartTheme`.
- **App Shell:** `Sidebar`/`SidebarDrawer`, `MobileMenu`, `Topbar`,
  `AppLauncher`, `PageHeader`.

> **Lacunas conhecidas no DS** que o roadmap precisa cobrir como **novos
> componentes/blocks** (não existem hoje): `CommandPalette`, `ConfirmDialog`
> (padrão sobre `Dialog`), `OtpInput` (MFA/código), `PlanBanner`/`TrialBanner`,
> `TenantSwitcher` (seletor de empresa), `PasswordField` (com medidor de força),
> e os **layouts** (`AuthLayout`, `AppLayout`, `SettingsLayout`, `CrudLayout`).

### 0.3 Princípios transversais (valem para toda tela)

1. **Acabamento de produção obrigatório** — toda tela desenha os 4+ estados:
   **loading** (skeleton, nunca spinner solo) · **empty** (`EmptyState` +
   ilustração) · **error** (`ErrorState`) · **sem-permissão**
   (`IllustrationNoPermission`). Offline quando aplicável (`NoConnection`).
2. **Servidor é a autoridade** — RBAC e feature flags checados no tRPC; a UI só
   reflete (`rbac-controle-acesso`, `saas-multi-tenant-dnex`). Tela "sem
   permissão" é UX, não segurança.
3. **Isolamento por tenant** — toda query carrega `tenant_id` via contexto; RLS
   é a última linha. Nenhuma tela cruza tenants exceto o `TenantSwitcher`.
4. **Dark-first + AA** — tema escuro default, contraste ≥ 4.5:1, foco visível,
   `prefers-reduced-motion`, semântica. Números fiscais sempre em IBM Plex Mono.
5. **Score Frontend PRD ≥ 80** por template antes de "pronto" (gate da
   `design-frontend-prd`); alvo do hub ≥ 90.
6. **Disclaimer institucional** — onde houver ponte entre marcas, registrar que
   **DNEX, Don Contabilidade e PRD Advogados são pessoas jurídicas distintas**
   (decisão de marca travada). Obrigatório no rodapé de e-mails.

---

## 1. Inventário de TELAS PADRÃO reutilizáveis

> Formato por tela: **objetivo · componentes do DS reutilizados · variações ·
> estados**. Estado "sem-permissão" só listado onde a tela pode ser gated.

### 1.A — Autenticação (Auth)

Todas vivem no **`AuthLayout`** (ver §1.G). Auth = Supabase Auth (magic link +
OAuth + senha). O "quem você é" é desta camada; o "o que pode" é RBAC pós-login.

| # | Tela | Objetivo | Componentes DS | Variações | Estados |
|---|------|----------|----------------|-----------|---------|
| A1 | **Login** | Autenticar (e-mail+senha, magic link, OAuth) | `Form`, `Input`, `PasswordField`*, `Button`, `Separator`, `Alert`, `Logo` | senha / magic-link / OAuth-only; com erro de credencial | loading (botão), error (credencial inválida / rate-limit), empty (form limpo) |
| A2 | **Cadastro (signup)** | Criar usuário + iniciar onboarding de tenant | `Form`, `Input`, `PasswordField`*, `Checkbox` (aceite), `Button`, `Logo` | autosserviço / via convite (pré-preenche e-mail) | loading, error (e-mail já existe), success→redirect onboarding |
| A3 | **Esqueci a senha** | Disparar e-mail de reset | `Form`, `Input`, `Button` | — | loading, success ("verifique seu e-mail"), error |
| A4 | **Redefinir senha** | Definir nova senha via token do link | `Form`, `PasswordField`* (×2, com força), `Button`, `Alert` | token válido / expirado | loading, error (token expirado → CTA reenviar), success→login |
| A5 | **Verificar e-mail** | Confirmar e-mail (após signup / pendente) | `IllustrationOnboarding`, `Button` (reenviar), `Alert` | aguardando / já verificado / link inválido | loading (verificando token), success, error (link inválido) |
| A6 | **MFA / 2FA** | 2º fator: TOTP ou código | `OtpInput`*, `Button`, `Alert`, `Kbd` | setup (QR + segredo) / desafio no login / recovery codes | loading, error (código inválido), success |
| A7 | **Aceitar convite** | Entrar num tenant existente via token | `Card`, `Avatar` (quem convidou), `Button` (aceitar/recusar), `Badge` (papel) | usuário novo (→ signup) / usuário logado (1-clique) | loading, error (convite expirado/revogado), success→workspace |
| A8 | **Conta bloqueada / suspensa** | Comunicar bloqueio e caminho | `ErrorState`, `IllustrationNoPermission`, `Button` (contato/suporte) | tenant suspenso (billing) / usuário bloqueado (admin) | estático; CTA de suporte |
| A9 | **Logout** | Encerrar sessão e limpar contexto | `PageLoader`, `Logo` | logout normal / logout por sessão expirada | loading (limpando) → redirect login |

\* Componentes a criar (lacuna do DS): `PasswordField`, `OtpInput`.

### 1.B — Onboarding (pós-signup, antes do app)

Vive no **`AuthLayout`** ou shell mínimo; sequência guiada por `Wizard`/`Stepper`.

| # | Tela | Objetivo | Componentes DS | Variações | Estados |
|---|------|----------|----------------|-----------|---------|
| B1 | **Criar empresa / workspace** | Provisionar o tenant (nome, slug, CNPJ) | `Wizard`, `Form`, `Input`, `CnpjInput`, `Button`, `IllustrationOnboarding` | 1ª empresa (pós-signup) / empresa adicional | loading (provisionando + criando Stripe Customer), error, success |
| B2 | **Setup inicial** | Coletar dados base (segmento, regime, logo, fuso) | `Wizard`/`Stepper`, `Form`, `Select`, `SegmentedControl`, `FileUpload` (logo) | completo / "pular por enquanto" | loading, error, parcial (retomável) |
| B3 | **Convidar equipe** | Adicionar membros + papéis no onboarding | `Form`, `MultiSelect` (e-mails), `Select` (papel), `Button`, `EmptyState` ("convide depois") | obrigatório / opcional (pular) | loading (enviando convites), success (lista de pendentes), error parcial |

> Fluxo de provisionamento (B1) segue os **5 passos** do
> `saas-multi-tenant-dnex`: signup → `tenants`+`tenant_users(owner)` →
> `stripe.customers.create` → JWT com `tenant_id` (hook) → e-mail boas-vindas.

### 1.C — Cadastros (CRUD) reutilizáveis

> **Todos** seguem o mesmo quarteto reutilizável (ver §3 — `CrudListTemplate`,
> `CrudDetailTemplate`, `CrudFormTemplate`, `ConfirmDeleteDialog`). O que muda
> entre eles é o **schema (colunas/campos)** e as **permissões**. Aqui só os
> recortes próprios de cada entidade.

| # | Entidade | Objetivo | Componentes DS | Variações | Estados |
|---|----------|----------|----------------|-----------|---------|
| C1 | **Usuários** (do tenant) | Gerir membros do workspace | `DataTable`, `Avatar`, `Badge` (papel/status), `Dialog`, `Form`, `Select` (papel), `DropdownMenu` (ações) | ativo / convidado-pendente / suspenso; bulk (reenviar/remover) | loading (skeleton table), empty, error, **sem-permissão** (não-admin) |
| C2 | **Colaboradores** | Cadastro de pessoas (RH/operacional) | `DataTable`, `Form`, `CpfInput`, `DateInputBR`, `CurrencyInput` (salário), `FileUpload` (docs) | PF; com/sem vínculo de usuário | loading, empty, error, sem-permissão |
| C3 | **Empresa (dados)** | Editar dados cadastrais do próprio tenant | `Form`, `CnpjInput`, `CepInput`, `Input`, `FileUpload` (logo), `Tabs` (dados/endereço/fiscal) | matriz / filial | loading, error, success, sem-permissão (não-owner) |
| C4 | **Departamentos** | CRUD de estrutura organizacional | `DataTable`/`Table`, `Form`, `Select` (gestor) | flat / hierárquico (árvore) | loading, empty, error, sem-permissão |
| C5 | **Cargos / funções** | CRUD de cargos | `DataTable`, `Form`, `CurrencyInput` (faixa) | simples / com faixa salarial | loading, empty, error, sem-permissão |
| C6 | **Clientes / fornecedores** (genérico) | CRUD de contraparte PF/PJ | `DataTable`, `Form`, `SegmentedControl` (PF/PJ), `CnpjInput`/`CpfInput`, `CepInput`, `SearchInput` | cliente / fornecedor / ambos; PF/PJ | loading, empty, error, sem-permissão |
| C7 | **Notificações (preferências)** | Matriz canal × evento | `Switch` (grade), `Table`, `SegmentedControl` (canal), `Button` | por canal (in-app/e-mail) × tipo de evento | loading, error, success (auto-save) |

### 1.D — Configurações (Settings)

Todas vivem no **`SettingsLayout`** (ver §1.G) com nav lateral própria.

| # | Tela | Objetivo | Componentes DS | Variações | Estados |
|---|------|----------|----------------|-----------|---------|
| D1 | **Perfil do usuário** | Nome, avatar, idioma, tema | `Form`, `Avatar`+`FileUpload`, `Input`, `SegmentedControl` (tema), `Select` (idioma) | — | loading, error, success (auto-save/salvar) |
| D2 | **Segurança** | Senha, 2FA, sessões ativas | `Form` (senha), `Switch`/`OtpInput`* (2FA), `Table` (sessões + "encerrar"), `Alert` | 2FA on/off; com/sem sessões remotas | loading, error, success, empty (sem outras sessões) |
| D3 | **Conta / empresa** | Dados do tenant + zona de perigo | `Tabs`, `Form`, `ConfirmDialog`* (excluir/transferir) | owner (zona de perigo) / admin | loading, error, success, sem-permissão |
| D4 | **Equipe & permissões (RBAC)** | Papéis, permissões, convites | `DataTable` (membros), `Select` (papel), matriz `Checkbox`/`Switch` (permissões por papel), `Dialog` (convidar) | papéis fixos / papéis custom (enterprise) | loading, empty, error, sem-permissão |
| D5 | **Faturamento / assinatura** | Plano, uso, faturas, portal Stripe | `Card`, `StatCard` (uso vs. limite), `Progress`, `Table` (faturas), `Badge` (status), `PlanBanner`*, `Button` (portal) | trial / ativo / inadimplente / cancelado | loading, error, empty (sem faturas), sem-permissão (não-owner) |
| D6 | **Notificações** | Preferências (= C7 sob settings) | reuso de **C7** | — | idem C7 |
| D7 | **Integrações** | Conectar serviços externos | `Card` (grade de integrações), `Badge` (status), `Switch`, `Dialog` (config) | conectado / disponível / erro de conexão | loading, empty, error (conexão), sem-permissão |
| D8 | **API keys** | Gerar/revogar chaves (enterprise) | `Table`, `Button` (gerar), `Dialog` (mostrar chave 1×), `ConfirmDialog`* (revogar), `Kbd`/copy | feature-flag enterprise (`api-publica`) | loading, empty, error, sem-permissão / **sem-feature** (gate de plano) |

### 1.E — App (núcleo do produto)

Vivem no **`AppLayout`** (shell completo). São o esqueleto que cada app
(Dashboard/Documentação/Aurora) preenche com seus módulos.

| # | Tela | Objetivo | Componentes DS | Variações | Estados |
|---|------|----------|----------------|-----------|---------|
| E1 | **Dashboard home** | Visão geral: KPIs + gráficos + atividade | `StatCard`+`SkeletonStat`, gráficos (`Area/Bar/Donut/Sparkline/Gauge`), `Timeline`, `Card`, `PageHeader` | por app; por papel (admin vê mais) | loading (skeleton de KPI/chart), empty (workspace novo → onboarding inline), error, sem-permissão |
| E2 | **Layout de lista** | Padrão genérico de listagem de domínio | `DataTable`, `SearchInput`, `Select`/`MultiSelect` (filtros), `Pagination`, `Button`, `PageHeader` | densa / cards / com filtros salvos | loading, empty, error, sem-permissão |
| E3 | **Layout de detalhe** | Página de 1 registro (cabeçalho + abas) | `PageHeader`+`Breadcrumb`, `Tabs`, `Card`, `Timeline`, `Badge`, `DropdownMenu` (ações) | 2 colunas / com sidebar de meta | loading (skeleton de detalhe), error (404 registro), sem-permissão |
| E4 | **404 — não encontrado** | Rota inexistente | `Illustration404`, `Button` (home/voltar) | dentro do app / fora (público) | estático |
| E5 | **500 — erro do servidor** | Falha inesperada | `Illustration500`, `Button` (recarregar/suporte) | boundary global / por seção | estático + reportar |
| E6 | **Sem-permissão (403)** | Acesso negado a rota/recurso | `IllustrationNoPermission`, `ErrorState`, `Button` (voltar) | falta de permissão / falta de plano (`sem-feature`) | estático |
| E7 | **Offline** | Sem conexão | `IllustrationNoConnection`, `Button` (tentar de novo) | banner global / tela cheia | reativo (reconecta) |

### 1.F — Estados como "telas de primeira classe"

Reuso transversal — qualquer template C/D/E pluga estes (não recriar):
`loading` → `Skeleton`/`SkeletonStat`/`PageLoader` · `empty` → `EmptyState` +
ilustração · `error` → `ErrorState` · `sem-permissão` →
`IllustrationNoPermission` · `offline` → `IllustrationNoConnection` ·
`success` → `IllustrationSuccess`/`Toast`.

### 1.G — Layouts reutilizáveis (a construir)

| Layout | Objetivo | Composto de | Onde usa |
|---|---|---|---|
| **`AuthLayout`** | Moldura centrada, dark, com brand e atmosfera, painel único | `Logo`, slot de conteúdo, atmosfera (mesh índigo), troca de tema | Auth (1.A), Onboarding (1.B) |
| **`AppLayout`** | Shell completo do produto | `Sidebar`/`SidebarDrawer`, `Topbar`+`NotificationCenter`+`AppLauncher`+`TenantSwitcher`*, `PageHeader`, `<Outlet/>`, `Toast`/`Tooltip` providers, error boundary | Todo app (1.E, 1.C, 1.D) |
| **`SettingsLayout`** | Sub-shell de configurações | nav lateral de seções (sobre `Sidebar` ou lista), `PageHeader`, breadcrumb | Settings (1.D) |
| **`CrudLayout`** | Esqueleto lista↔detalhe↔form | `PageHeader`, slot de toolbar (busca/filtros/criar), slot de conteúdo, `ConfirmDeleteDialog`* | Cadastros (1.C) e listas de módulo (1.E2/E3) |

---

## 2. Inventário de TEMPLATES DE MENSAGEM (e-mails transacionais)

> **Compliance (memória de marca + CLAUDE.md):** estes são **transacionais**,
> não marketing — disparados por ação do usuário/sistema. **Sem promessa de
> resultado, sem hard-sell, sem oferta.** E-mail de marketing/nutrição é outra
> esteira e passa por `compliance-br` (OAB 205/2021 · CFC 1.546/2024 · CDC/LGPD).

### 2.0 Padrão visual de e-mail (o "DS de e-mail")

E-mail não roda Tailwind/React no cliente — precisa de **HTML de e-mail** robusto:

- **Estrutura:** tabela HTML (`<table role="presentation">`), largura máx.
  **600px**, centrada; estilos **inline** (clientes ignoram `<style>` em parte);
  fontes **web-safe com fallback** (a stack de marca — Space Grotesk/Plus Jakarta
  — só via `@font-face` com fallback `Arial/Helvetica`, pois Outlook não carrega
  webfont). Números fiscais em `monospace` (fallback do IBM Plex Mono).
- **Dark-safe:** não depender de fundo transparente; usar **logo em PNG com
  versão clara/escura** ou logo que funcione sobre ambos; `@media
  (prefers-color-scheme: dark)` + `meta name="color-scheme"`.
- **Compatibilidade:** Outlook (VML para botão/bg), Gmail (clipping > 102KB —
  manter enxuto), Apple Mail; **CTA como botão "bulletproof"** (tabela, não
  `<a>` estilizado puro); `alt` em toda imagem; texto legível sem imagens.
- **Anatomia padrão (todos herdam):**
  1. **Header** — `Logo` DNEX (ou do app) + (opcional) nome do tenant.
  2. **Corpo** — saudação personalizada + 1 mensagem clara + contexto.
  3. **CTA** — **um** botão primário "bulletproof" (ação única e óbvia).
  4. **Footer** — endereço, link de suporte, **disclaimer institucional
     obrigatório** + (em e-mail não estritamente transacional) descadastro.
- **Disclaimer institucional (rodapé, fixo):**
  > *"DNEX, Don Contabilidade e PRD Advogados são pessoas jurídicas distintas.
  > Este é um e-mail transacional referente à sua conta no DNEX."*
- **Provedor:** Resend (já na stack). i18n pt-BR default. Toda variável em
  `{{snake_case}}`; valores de marca não confirmados = `[CONFIRMAR]`.

### 2.1 Catálogo de templates

| # | Template | Gatilho | Variáveis / placeholders | CTA | Notas |
|---|----------|---------|--------------------------|-----|-------|
| M1 | **Boas-vindas / confirmação de cadastro** | Signup concluído (pós-verificação) | `{{user_name}}`, `{{tenant_name}}`, `{{app_name}}`, `{{dashboard_url}}` | "Acessar o painel" | sem oferta; orienta 1º passo |
| M2 | **Verificação de e-mail** | Signup / troca de e-mail | `{{user_name}}`, `{{verify_url}}`, `{{expires_in}}` | "Verificar e-mail" | link expira; CTA reenviar no app |
| M3 | **Convite para equipe** | Admin convida membro (B3/C1) | `{{inviter_name}}`, `{{tenant_name}}`, `{{role}}`, `{{accept_url}}`, `{{expires_in}}` | "Aceitar convite" | mostra papel; expira |
| M4 | **Redefinição de senha** | "Esqueci a senha" (A3) | `{{user_name}}`, `{{reset_url}}`, `{{expires_in}}`, `{{request_ip}}` | "Redefinir senha" | "ignore se não foi você"; expira |
| M5 | **Senha alterada** | Senha trocada com sucesso | `{{user_name}}`, `{{changed_at}}`, `{{support_url}}` | "Não fui eu / suporte" | aviso de segurança, sem link de reset embutido |
| M6 | **Alerta de novo login** | Login de novo dispositivo/IP | `{{user_name}}`, `{{device}}`, `{{location}}`, `{{login_at}}`, `{{secure_url}}` | "Revisar atividade" | segurança; ação se não reconhece |
| M7 | **Fatura emitida** | Webhook Stripe `invoice.paid`/`finalized` | `{{tenant_name}}`, `{{amount}}` (mono), `{{period}}`, `{{invoice_url}}`, `{{plan}}` | "Ver fatura" | valor em monospace; sem upsell |
| M8 | **Pagamento falhou** | Webhook `invoice.payment_failed` | `{{tenant_name}}`, `{{amount}}`, `{{retry_date}}`, `{{billing_url}}` | "Atualizar pagamento" | factual; prazo de retry; sem alarmismo |
| M9 | **Trial acabando** | Job (D-3/D-1 do fim do trial) | `{{tenant_name}}`, `{{days_left}}`, `{{trial_end}}`, `{{billing_url}}`, `{{plan}}` | "Escolher plano" | **fronteira:** transacional informativo; **sem promessa/hard-sell** — só fato + ação |
| M10 | **Notificação genérica** | Evento de domínio assinado pelo usuário | `{{user_name}}`, `{{title}}`, `{{body}}`, `{{action_url}}`, `{{action_label}}` | dinâmico | base para qualquer evento in-app espelhado em e-mail |

> M9 é a única perto da fronteira de marketing: manter **estritamente
> informativa** (estado da conta), sem copy de venda. Qualquer campanha de
> reativação/upsell sai deste catálogo e vai para a esteira de marketing +
> `compliance-br`.

---

## 3. Outros reutilizáveis (blocks & padrões)

| # | Block | Objetivo | Base no DS | Status |
|---|-------|----------|-----------|--------|
| BK1 | **`ConfirmDialog`** | Confirmação genérica (destrutiva/neutra) | `Dialog` + `Button`(danger) + `Alert` | **criar** (padrão sobre Dialog) |
| BK2 | **`ConfirmDeleteDialog`** | Variante "digite o nome para excluir" | BK1 + `Input` | **criar** |
| BK3 | **`CommandPalette`** (⌘K) | Navegação/ações rápidas cross-app | `Dialog` + `SearchInput` + `Kbd` + lista | **criar** (lacuna do DS) |
| BK4 | **`CrudListTemplate`** | Lista genérica (toolbar + tabela + paginação + estados) | `DataTable`, `SearchInput`, filtros, `Pagination`, `EmptyState`/`ErrorState`/`Skeleton` | **criar** (template) |
| BK5 | **`CrudFormTemplate`** | Form genérico criar/editar (RHF+zod) | `Form` + primitivos + inputs BR + `Button` | **criar** (template) |
| BK6 | **`CrudDetailTemplate`** | Detalhe genérico (header + abas + ações) | `PageHeader`, `Tabs`, `Card`, `DropdownMenu` | **criar** (template) |
| BK7 | **`ErrorPage`** | Página de erro unificada (404/500/403/offline) | ilustrações + `ErrorState` + `Button` | **criar** (wrapper das 4 ilustrações) |
| BK8 | **`PlanBanner` / `TrialBanner`** | Faixa de estado de plano/trial/inadimplência | `Alert`/`Card` + `Progress` + `Button` | **criar** (lacuna) |
| BK9 | **`TenantSwitcher`** | Trocar empresa ativa (multi-tenant) | `DropdownMenu`/`Combobox` + `Avatar` + `Badge` | **criar** (lacuna; entra na `Topbar`) |
| BK10 | **`FeatureGate`** | Esconder/condicionar UI por permissão **ou** plano | hook + `Tooltip` ("disponível no plano X") | **criar** (espelha check do servidor; nunca a defesa) |
| BK11 | **`PasswordField`** | Campo de senha (toggle + medidor de força) | `Input` + `Progress` + ícone | **criar** (lacuna) |
| BK12 | **`OtpInput`** | Código numérico (MFA/verificação) | inputs segmentados | **criar** (lacuna) |
| BK13 | **`AuditTrail`** | Trilha de ações sensíveis (quem/o quê/quando) | `Timeline`/`Table` + `Badge` + `Avatar` | **criar** (UI do audit log do RBAC) |
| BK14 | **`UsageMeter`** | Uso vs. limite do plano | `StatCard` + `Progress` | **criar** (sobre StatCard) |

> **FeatureGate / RBAC (princípio inegociável):** BK10 e os gates de UI **apenas
> refletem** o que o servidor decidiu. A autorização real é a permissão checada
> no tRPC + RLS no banco (`rbac-controle-acesso` / `saas-multi-tenant-dnex`).
> Toda ação sensível (excluir, mudar papel, revogar chave, suspender tenant)
> grava **audit log imutável** — exposto na UI por BK13.

---

## 4. Roadmap de construção (priorizado, sub-fase a sub-fase)

> **Método:** cada sub-fase fecha com **build (`npm run build`) + runtime
> (Playwright/showcase) + Score Frontend PRD ≥ 80** antes da seguinte (padrão
> de validação da memória de engenharia). O que vira **template/block no DS**
> está marcado **[DS]**; o que é cola de app (rotas/providers) fica no app.
> **Não construir nada deste roadmap antes do DS terminar a Fase C em paralelo**
> (evita conflito com a esteira de código em andamento).

### P0 — Fundação de telas (desbloqueia todo o resto)

> Sem isto, nenhuma tela compõe de verdade. Foco: layouts + blocks genéricos.

| Sub-fase | Entrega | Vira | Depende de |
|---|---|---|---|
| **P0.1** | `AuthLayout`, `AppLayout`, `SettingsLayout`, `CrudLayout` | **[DS]** layouts | shell/tokens existentes |
| **P0.2** | `ConfirmDialog`, `ConfirmDeleteDialog`, `ErrorPage`, `FeatureGate` | **[DS]** blocks | Dialog, ilustrações |
| **P0.3** | `PasswordField`, `OtpInput`, `TenantSwitcher`, `PlanBanner`/`TrialBanner`, `UsageMeter` | **[DS]** blocks (fecham lacunas) | primitivos, StatCard |
| **P0.4** | `CrudListTemplate`, `CrudFormTemplate`, `CrudDetailTemplate` | **[DS]** templates CRUD | DataTable, Form, layouts |

**Gate P0:** showcase navega os 4 layouts + CRUD genérico com dados mock e os 4
estados (loading/empty/error/sem-permissão). Score ≥ 90.

### P1 — Telas de plataforma (auth → onboarding → settings core)

> A jornada mínima de um tenant entrar e operar. Ordem = ordem de uso.

| Sub-fase | Entrega | Vira | Depende de |
|---|---|---|---|
| **P1.1 — Auth** | A1 Login, A2 Signup, A3 Esqueci, A4 Redefinir, A5 Verificar, A9 Logout | **[DS]** page templates (em `AuthLayout`) | P0.1, P0.3 (PasswordField) |
| **P1.2 — Auth+** | A6 MFA/2FA, A7 Aceitar convite, A8 Conta bloqueada | **[DS]** page templates | P0.3 (OtpInput) |
| **P1.3 — Onboarding** | B1 Criar empresa, B2 Setup, B3 Convidar equipe | **[DS]** templates (Wizard) | P1.1, fluxo multi-tenant |
| **P1.4 — Settings core** | D1 Perfil, D2 Segurança, D5 Faturamento (Stripe portal) | **[DS]** templates (em `SettingsLayout`) | P0.1, P0.3 (PlanBanner/UsageMeter) |

**Gate P1:** um usuário cria conta → cria empresa → convida alguém → ajusta
perfil/segurança → vê o plano. Cada tela com 4+ estados. Score ≥ 90.

### P2 — CRUD do tenant, RBAC e configurações avançadas

| Sub-fase | Entrega | Vira | Depende de |
|---|---|---|---|
| **P2.1 — App core** | E1 Dashboard home, E2 Lista, E3 Detalhe, E4–E7 erros/offline | **[DS]** templates (em `AppLayout`) | P0.4, gráficos do DS |
| **P2.2 — CRUD pessoas** | C1 Usuários, C2 Colaboradores, C4 Departamentos, C5 Cargos | **[DS]** instâncias do CRUD genérico | P0.4 |
| **P2.3 — RBAC & equipe** | D4 Equipe & permissões, `AuditTrail` (BK13), `CommandPalette` (BK3) | **[DS]** templates + blocks | RBAC server, P0.2 |
| **P2.4 — CRUD negócio + config** | C3 Empresa, C6 Clientes/Fornecedores, C7 Notif. (=D6), D3 Conta, D7 Integrações, D8 API keys | **[DS]** templates | P2.2, FeatureGate |

**Gate P2:** CRUD completo isolado por tenant (teste de isolamento A≠B verde),
permissões barrando no servidor, audit log gravando. Score ≥ 90.

### P-mail — Templates de e-mail (paralelo a P1, antes de produção)

| Sub-fase | Entrega | Depende de |
|---|---|---|
| **PM.1** | Padrão visual de e-mail (§2.0) + base HTML (header/footer/disclaimer/CTA bulletproof) | marca aprovada |
| **PM.2** | M1, M2, M4, M5, M6 (conta/segurança) | PM.1 + Auth (P1.1/P1.2) |
| **PM.3** | M3 (convite), M10 (genérico) | PM.1 + Onboarding/RBAC |
| **PM.4** | M7, M8, M9 (billing/trial) — **revisar fronteira marketing antes de M9** | PM.1 + Stripe (P1.4) |

**Gate P-mail:** cada template renderiza correto em Outlook/Gmail/Apple Mail
(claro+escuro), com disclaimer institucional, e passa por verificação de
compliance (transacional, sem hard-sell). M9 sinalizado para revisão.

### Sequência recomendada de execução

```
P0.1 → P0.2 → P0.3 → P0.4            (fundação — desbloqueia tudo)
   → P1.1 → P1.2 → P1.3 → P1.4       (plataforma)  ⟂  PM.1 → PM.2 → PM.3 → PM.4
   → P2.1 → P2.2 → P2.3 → P2.4       (CRUD/RBAC/config)
```
Build + runtime + Score entre **cada** sub-fase.

---

## 5. Pendências `[CONFIRMAR]` (titular)

Herdadas da memória de marca/engenharia — **bloqueiam** conteúdo final, não a
construção dos templates:

- `[CONFIRMAR]` Política de **trial e cancelamento** (afeta D5, M8, M9, PlanBanner).
- `[CONFIRMAR]` **Planos e limites** por plano (básico/profissional/enterprise) →
  feature flags e `UsageMeter`/`FeatureGate`.
- `[CONFIRMAR]` **Nº de empresas/tenants** na fase inicial → escolha shared-schema
  RLS (já default) vs. revisão futura (ADR via `saas-architect-dnex`).
- `[CONFIRMAR]` **CNPJ/endereço** da PJ DNEX para o rodapé legal dos e-mails.
- `[CONFIRMAR]` Papéis exatos do RBAC (owner/admin/member/viewer? papéis custom?)
  e a matriz de permissões por papel (D4).
- `[CONFIRMAR]` Domínio e escopo do app **Aurora** (ainda a definir na engenharia).
- `[CONFIRMAR]` Texto final do **disclaimer institucional** com o jurídico (PRD).

---

## 6. Próximos passos sugeridos

1. **Aprovar este blueprint** e a ordem P0→P1/PM→P2.
2. Quando o DS fechar a Fase C, **iniciar P0.1** (layouts) — é o gargalo.
3. Para cada sub-fase: acionar `saas-gestao-empresarial` (build dos templates),
   `design-frontend-prd` (acabamento + Score), `rbac-controle-acesso` (gates) e
   `saas-multi-tenant-dnex` (isolamento), rodando o gate de validação.
4. Antes de produção: `auditoria-mobile-playwright` (overflow 375→1440px) e
   `design:accessibility-review` (a11y profunda) sobre os templates fechados.
5. Resolver as pendências `[CONFIRMAR]` da §5 com o titular.

---

*DNEX Design System · Telas, Templates & Blocks · v0.1 · blueprint (não-código) ·
dark-first, índigo + âmbar · multi-tenant RLS · 2026-06-29.*
