# DNEX Design System v1

A biblioteca de UI que unifica os apps do hub DNEX — **DON Dashboard**, **DON
Documentação** e **Aurora**. Estética premium nível Linear/Vercel, derivada e
sistematizada a partir da landing aprovada da DNEX: índigo + âmbar, dark-first,
cartões _glass_ com borda iluminada, glows sutis e números fiscais em mono.

> Marca **aprovada** (2026-06-29): paleta índigo + âmbar e as três fontes
> (Space Grotesk · Plus Jakarta Sans · IBM Plex Mono). Escalas de neutros e
> tokens semânticos derivados podem ser refinados na evolução do DS.

---

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind v4** (CSS-first via `@theme`, sem `tailwind.config.js`)
- **Radix UI** — primitivos acessíveis (dialog, dropdown, select, popover, tabs…)
- **lucide-react** — ícones (biblioteca oficial do DS)
- **react-day-picker** v9 + **date-fns** v4 — calendário/datas, locale pt-BR
- **motion** (Framer Motion) — micro-interações, respeitando `prefers-reduced-motion`
- **clsx** + **tailwind-merge** — composição de classes (`cn`)

---

## Como rodar

```bash
cd dnex-design-system
npm install
npm run dev      # showcase em http://localhost:5173
npm run build    # type-check (tsc -b) + build de produção
npm run preview  # serve o build
```

A **showcase** (`src/showcase/`) é a vitrine navegável que o cliente abre para
aprovar: Foundations, Primitivos, Compostos e um App Shell vivo, com toggle de
tema (claro/escuro/sistema) e de densidade.

### Code-split (bundle)

A vitrine carrega todas as libs pesadas de uma vez (gráficos, tabela de dados,
calendário, command palette, motion…). Para não estourar o aviso de chunk
>500 kB do Rollup e melhorar o carregamento, `vite.config.ts` define
`build.rollupOptions.output.manualChunks` fatiando por dependência:
`react-vendor` (react/react-dom/scheduler), `charts` (recharts + d3),
`table` (@tanstack), `calendar` (react-day-picker + date-fns), `radix`, `cmdk`,
`motion`, `forms` (react-hook-form + zod), `icons` (lucide) e um `vendor`
genérico para o resto. Cada lib cacheia em separado; atualizar o app não
invalida o cache delas. A estratégia está comentada no próprio `vite.config.ts`.

---

## Arquitetura de tokens (3 camadas)

Tudo é token — zero valor mágico nos componentes.

1. **Primitivos** — `@theme` em `src/styles/theme.css`. Escalas cruas de marca
   (`indigo`, `amber`, `neutral`), fontes, raios, sombras, motion. Viram
   utilitários Tailwind: `bg-indigo-600`, `font-display`, `rounded-[var(--radius-card)]`.
2. **Semânticos** — variáveis em `:root` (escuro, default) e `[data-theme="light"]`
   (claro). Papéis que reagem ao tema: `--bg`, `--surface`, `--fg`, `--action`,
   `--accent`, `--line`…
3. **Ponte** — `@theme inline` expõe os semânticos como utilitários que reagem
   ao tema: `bg-surface`, `text-fg`, `text-fg-muted`, `border-line`, `text-action`.

Espelho em TS para consumo programático (gráficos, canvas): `src/tokens/tokens.ts`.

### Tema

`ThemeProvider` (`src/lib/theme.tsx`) controla `data-theme` no `<html>`. Três
preferências: **`dark`** (padrão, premium), **`light`** e **`system`** (segue
`prefers-color-scheme` em tempo real). O hook expõe a preferência crua em
`theme` e o tema **efetivo** (sempre dark|light) em **`resolvedTheme`** — use
`resolvedTheme` para qualquer decisão de cor (ex.: gráficos). Persistente em
`localStorage` por padrão (`persist`, `storageKey` configuráveis).

O controle oficial é o **`ThemeSwitcher`** (`variant="segmented"` claro/escuro/
sistema, ou `variant="icon"` que cicla — para topbars apertadas). `showSystem` e
`showLabels` ajustam a apresentação.

### Densidade

`DensityProvider` (`src/lib/density.tsx`) controla `data-density` no `<html>`:
**`comfortable`** (padrão de hoje — telas que respiram) ou **`compact`** (telas
densas de dado: operação fiscal, grandes tabelas). Persistente em `localStorage`.

A densidade é a **3ª camada e meia** de tokens: `[data-density]` em `theme.css`
redefine `--row-h`, `--cell-py`/`--cell-px`, `--control-h`/`--control-px` e
`--card-pad`. Os componentes de dado/lista (**Table**, **DataTable**, **Input**,
**Card**) leem esses tokens em vez de hard-codar padding — então a troca não
remonta nada. Controle oficial: **`DensityToggle`** (global) ou a prop
`enableDensity` do `DataTable` (local, só daquela tabela). Como `[data-density]`
casa qualquer elemento, dá para escopar a densidade a uma subárvore com
`<div data-density="compact">`.

---

## Tipografia responsiva (escala)

A escala vive em `src/styles/theme.css` (`--text-*`) e é espelhada em TS
(`src/tokens/tokens.ts` → `typeScale`, com `min/max/lineHeight/uso`).

**Decisão de design registrada (2026-06-29):** os tokens de título, `lead` e
`kpi` são **fluidos** via `clamp()` — encolhem proporcionalmente no mobile
(≈375px) e crescem até o teto no desktop (≈1440px). É intencional: no celular as
fontes ficam menores por design. Os tokens de UI (`body`, `small`, `label`) são
**fixos** — tamanho previsível e estável em qualquer tela (legibilidade de
leitura e de formulários).

| Token | Tipo | Mín. (mobile) → Máx. (desktop) | Fonte | Entrelinha | Uso |
|---|---|---|---|---|---|
| `display` | fluido | 41.6px → 72px | Space Grotesk | 1.05 | Hero / headline de impacto |
| `h1` | fluido | 32px → 48px | Space Grotesk | 1.1 | Título de página |
| `h2` | fluido | 24px → 32px | Space Grotesk | 1.2 | Título de seção |
| `h3` | fluido | 20px → 24px | Space Grotesk | 1.3 | Subtítulo / título de card |
| `lead` | fluido | 16.8px → 20px | Plus Jakarta Sans | 1.55 | Parágrafo de abertura / subtítulo |
| `kpi` | fluido | 28px → 40px | IBM Plex Mono | 1.1 | Número grande de KPI (mono) |
| `body` | fixo | 16px | Plus Jakarta Sans | 1.65 | Corpo de texto e UI |
| `small` | fixo | 14px | Plus Jakarta Sans | 1.5 | Texto de apoio / descrições |
| `label` | fixo | 12px | Plus Jakarta Sans | 1.4 | Rótulo / eyebrow (uppercase, tracking) |

> A tabela viva (com amostra renderizada por token) está na showcase em
> **Foundations → Escala tipográfica**. A seção **Responsivo / Mobile** demonstra
> a redução real dentro de uma moldura de celular (~390px), usando
> _container-query_ (`cqi`) para que a tipografia fluida encolha contra a largura
> do frame, e não do viewport do monitor.

---

## Como um app consome o DS

> Hoje o DS roda como projeto de showcase. Para consumir entre apps, o caminho
> recomendado é o monorepo (ver Roadmap). O contrato de import já está pronto.

```tsx
// 1. Importe o CSS de tokens UMA vez (entrypoint do app)
import "@dnex/ds/styles"; // → src/styles/theme.css

// 2. Envolva a árvore com os providers
import { MotionConfig } from "motion/react";
import {
  ThemeProvider,
  DensityProvider,
  TooltipProvider,
  ToastProvider,
} from "@dnex/ds";

function Root() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider defaultTheme="dark">
        <DensityProvider defaultDensity="comfortable">
          <TooltipProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </TooltipProvider>
        </DensityProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}

// 3. Use os componentes
import { Button, StatCard, Sidebar, useToast } from "@dnex/ds";
```

Garanta que as três fontes estão carregadas (Google Fonts) no `index.html` do
app — ver `index.html` deste projeto como referência.

---

## Componentes

> Índice completo (todos os componentes, com props e do/don't) em
> **[`COMPONENTES.md`](./COMPONENTES.md)**.

**Brand:** `Logo`, `DnexSymbol`

**Primitivos:** `Button` (primary/secondary/ghost/danger/link · sm/md/lg/icon ·
loading · ícone) · `Input` · `Textarea` · `Label` · `Select` · `Checkbox` ·
`RadioGroup`/`RadioItem` · `Switch` · `Badge` · `Avatar` · `Tooltip` ·
`Separator` · `Kbd`

**Compostos:** `Card` (+ Header/Title/Description/Body/Footer) · `StatCard` ·
`Tabs` · `Accordion` · `Dialog` · `DropdownMenu` · `Popover` · `Sheet` ·
`ConfirmDialog` · `HoverCard` · `CommandPalette` · `Toast` (`useToast`) ·
`Alert` · `Skeleton` · `Progress` · `Pagination` · `Breadcrumb` · `Table` ·
`DataTable` · `DescriptionList` · `Timeline` · `EmptyState` · `ErrorState` ·
`ErrorPage` (página inteira de erro — variantes 404/500/403/offline) ·
`Spinner`/`PageLoader`

**Controles de sistema:** `ThemeSwitcher` (claro/escuro/sistema, persistente) ·
`DensityToggle` (confortável/compacto, global).

**Calendário / Datas:** `Calendar` (data única e intervalo, sobre
react-day-picker v9, locale pt-BR) · `DatePicker` (campo + Popover, modos
`single`/`range`). Seleção em índigo, “hoje” em âmbar, datas em mono.

**Wizard / Stepper:** `Stepper` (indicador de etapas horizontal/vertical, estados
done/active/upcoming, numeração em mono) · `Wizard` (formulário multi-step com
Voltar/Avançar/Concluir, barra de progresso, validação por passo via
`canAdvance` e transição que respeita reduced-motion).

**Notificações:** `NotificationCenter` (sino + badge de não-lidas + painel de
histórico em Popover, ícone por tipo, tempo relativo, lida/não-lida, “marcar
todas”) · `NotificationItem` (linha reutilizável). Persistente — complementa o
`Toast`, que é transiente.

**Ícones:** `lucide-react` é a biblioteca oficial. Tamanhos canônicos
**16 / 20 / 24** (`h-4`/`h-5`/`h-6`), **stroke ~2** (padrão da lib, não
engrossar) e cor herdando **`currentColor`** (tinge via `text-*` do tema, nunca
cor fixa). A showcase traz uma galeria curada (navegação, finanças/fiscal,
ações, status) com busca.

**App Shell:** `Sidebar` · `SidebarDrawer` (off-canvas mobile) · `Topbar` ·
`AppLauncher` · `PageHeader` (a `Topbar` da `ShellDemo` já hospeda o
`NotificationCenter`).

### Comportamento mobile do App Shell

No estreito (~390px) o shell adapta sem perder acessibilidade:

- **Sidebar → `SidebarDrawer`** — off-canvas sobre Radix Dialog: foco preso,
  `Esc` fecha, overlay com blur, `aria-modal` e rótulo. Fecha ao escolher um
  item. No app, esconda a `Sidebar` fixa com `hidden md:block` e abra o
  `SidebarDrawer` por um botão de menu na `Topbar`.
- **Topbar compacta** — botão de menu (hambúrguer) aparece; a busca migra para
  dentro do menu.
- **KPIs empilham** — grade de `StatCard` em 1 coluna, subindo a 2/3 conforme a
  largura.
- **Tabela rola** — `Table` tem `overflow-x` interno; preserva colunas e valores
  em mono sem quebrar.
- **AppLauncher** — mantém grid de 2 colunas, legível no estreito.

A `ShellDemo` da showcase aceita `mode="mobile"` (força o layout estreito,
independentemente do viewport) para a demonstração dentro da moldura de device.

---

## Princípios

- **Consistência total** — tudo do mesmo sistema de tokens.
- **Âmbar com avareza** — acento, nunca massa de fundo. Índigo é a ação.
- **Profundidade por camadas** — superfícies + sombras tingidas de índigo,
  nunca preto puro.
- **Acessibilidade (WCAG AA)** — contraste, foco visível, HTML semântico,
  teclado (via Radix), `prefers-reduced-motion`.
- **Acabamento de produção** — estados vazio / carregando / erro / hover / focus
  desenhados, não improvisados.
- **Números fiscais em mono** — toda quantia, imposto ou data em IBM Plex Mono.

---

## Roadmap — empacotamento (monorepo)

O DS nasce como app de showcase; a evolução natural é virar `packages/ds` num
monorepo Turborepo + pnpm, consumido por cada app do hub.

1. **Workspace** — mover para `packages/ds`; `apps/dashboard`, `apps/docs`,
   `apps/aurora` como consumidores. `pnpm-workspace.yaml` + `turbo.json`.
2. **Exports** — declarar `exports` no `package.json` do pacote:
   - `"."` → `src/index.ts` (componentes + hooks + tokens)
   - `"./styles"` → `src/styles/theme.css`
3. **Build do pacote** — `tsup`/`vite build --lib` gerando ESM + `.d.ts`; CSS
   distribuído como arquivo único importável.
4. **Tailwind v4 nos apps** — cada app importa `@dnex/ds/styles`; os utilitários
   semânticos (`bg-surface`, `text-fg`…) ficam disponíveis automaticamente.
5. **Versionamento** — Changesets para release; SemVer.
6. **Qualidade** — Storybook (ou manter a showcase como catálogo vivo) +
   testes de a11y (axe) + visual regression no CI (GitHub Actions).
7. **Tokens DTCG** — sincronizar `tokens.ts` ↔ `assets/dnex-tokens.json` com um
   pipeline (Style Dictionary) para uma única fonte da verdade.

---

*DNEX Design System v1 · derivado da landing aprovada · dark-first, índigo + âmbar.*
