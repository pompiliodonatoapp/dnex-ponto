# DNEX Design System — Índice de Componentes

Referência rápida para os apps consumirem (`import { … } from "@dnex/ds"`).
Para cada componente: 1 linha de uso, principais props e 1 do/don't essencial.

> **Princípios transversais** (valem para todos): tudo em **tokens** (zero valor
> mágico) · **WCAG AA** (contraste, foco visível, teclado, ARIA) · **dark/light**
> via `data-theme` · **densidade** via `data-density` · **âmbar com parcimônia**
> (1 destaque por tela, no máximo) · **mono** (IBM Plex Mono) em todo número de
> dinheiro/imposto/data · motion sutil que respeita `prefers-reduced-motion` ·
> conteúdo **ilustrativo** (o DS não embute dado real) · pt-BR.

**Setup mínimo:**

```tsx
import "@dnex/ds/styles"; // tokens (uma vez no app)
import { ThemeProvider, DensityProvider, TooltipProvider, ToastProvider } from "@dnex/ds";

<ThemeProvider defaultTheme="dark">
  <DensityProvider defaultDensity="comfortable">
    <TooltipProvider>
      <ToastProvider>{/* app */}</ToastProvider>
    </TooltipProvider>
  </DensityProvider>
</ThemeProvider>
```

---

## Foundations & Providers

| Componente / API | Uso (1 linha) | Principais props | Do / Don't |
|---|---|---|---|
| `ThemeProvider` | Controla `data-theme` no `<html>` (claro/escuro/sistema), persistente. | `defaultTheme` `"dark"\|"light"\|"system"`, `storageKey`, `persist` | **Do** envolver a raiz do app. **Don't** ler `theme` para cor de gráfico — use `resolvedTheme`. |
| `useTheme()` | Hook do tema. | retorna `theme`, `resolvedTheme`, `setTheme`, `toggle` | **Do** usar `resolvedTheme` (sempre concreto). **Don't** assumir que `theme` é dark/light (pode ser `"system"`). |
| `DensityProvider` | Controla `data-density` no `<html>` (confortável/compacto), persistente. | `defaultDensity`, `storageKey`, `target` | **Do** montar uma vez na raiz. **Don't** hard-codar padding em telas de dado — deixe o token responder. |
| `useDensity()` | Hook da densidade. | retorna `density`, `setDensity`, `toggle` | **Do** expor o toggle nas preferências do app. **Don't** ler para condicionar layout — o CSS já reage. |
| `cn(...)` | Junta classes + resolve conflitos Tailwind (clsx + tailwind-merge). | `...ClassValue[]` | **Do** usar em todo `className` composto. **Don't** concatenar classes com template string crua. |
| `tokens`, `color`, `semantic`, `font`… | Tokens em JS/TS (gráficos, canvas, libs que não leem CSS). | objetos congelados | **Do** usar p/ pintar SVG/Recharts. **Don't** duplicar HEX — importe daqui. |
| motion: `fadeUp`, `fadeScale`, `staggerContainer`, `inView`, `easeSoft` | Variants prontos do `motion/react`. | — | **Do** usar `{...inView} variants={fadeUp}` em seções. **Don't** animar sem `MotionConfig reducedMotion="user"`. |

---

## Brand

| Componente | Uso | Props | Do / Don't |
|---|---|---|---|
| `Logo` | Wordmark + símbolo DNEX. | `height`, `variant`, `className` | **Do** definir `height` (escala proporcional). **Don't** recolorir fora dos tokens da marca. |
| `DnexSymbol` | Só o símbolo (nexo). | `size`, `className` | **Do** usar em favicon/avatar/loader. **Don't** distorcer proporção. |

---

## Primitivos

| Componente | Uso | Principais props | Do / Don't |
|---|---|---|---|
| `Button` | Ação primária do DS. | `variant` (primary/secondary/ghost/danger/link), `size` (sm/md/lg/icon), `loading`, `leadingIcon`, `trailingIcon`, `asChild` | **Do** `asChild` p/ virar `<a>` mantendo estilo. **Don't** usar âmbar como cor de botão — ação é índigo. |
| `Input` | Campo de texto; responde à densidade (h-11→h-9). | `leadingIcon`, `invalid`, `mono` | **Do** `mono` em CNPJ/valores/datas. **Don't** usar sem `<Label>`/`aria-label`. |
| `Textarea` | Texto multi-linha. | `invalid`, …`textarea` nativas | **Do** associar `<Label>`. **Don't** fixar altura que corte o conteúdo. |
| `Label` | Rótulo de campo. | `required`, `htmlFor` | **Do** ligar com `htmlFor`. **Don't** usar `*` manual — `required` já desenha. |
| `Select` | Seleção única (Radix Select). | `items`, `value`, `onValueChange`, `aria-label` | **Do** rotular sempre. **Don't** usar p/ muitas opções com busca — use `Combobox`. |
| `Checkbox` | Booleano / tri-state. | `checked` (`true\|false\|"indeterminate"`), `onCheckedChange` | **Do** tratar `"indeterminate"` em "selecionar todas". **Don't** esquecer rótulo. |
| `RadioGroup` / `RadioItem` | Escolha única visível. | `value`, `onValueChange` | **Do** usar até ~5 opções. **Don't** usar p/ on/off — use `Switch`. |
| `Switch` | Liga/desliga imediato. | `checked`, `onCheckedChange` | **Do** usar p/ preferências instantâneas. **Don't** usar quando precisa de "Salvar". |
| `Badge` | Status/tag compacto. | `tone` (neutral/action/success/warning/danger/accent), `dot` | **Do** `dot` p/ status de linha. **Don't** abusar de `accent` (parcimônia). |
| `Avatar` | Foto/inicial do usuário. | `src`, `fallback`, `size` | **Do** dar `fallback` (iniciais). **Don't** depender só da imagem. |
| `Tooltip` / `TooltipProvider` | Dica ao passar/focar. | `content`, `side` | **Do** envolver app com 1 `TooltipProvider`. **Don't** colocar ação clicável dentro. |
| `Separator` | Divisória semântica. | `orientation` | **Do** `vertical` com altura definida. **Don't** usar p/ espaçamento — use margin. |
| `Kbd` | Tecla/atalho. | children | **Do** `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. **Don't** usar p/ texto comum. |
| `SearchInput` | Busca com lupa + limpar + atalho. | `value`, `onValueChange`, `shortcut`, `invalid` | **Do** controlado (`value`/`onValueChange`). **Don't** usar `onChange` cru. |
| `SegmentedControl` | Alterna visão/modo (não ação). | `value`, `onValueChange`, `items`, `size`, `fullWidth`, `aria-label` | **Do** p/ trocar vistas. **Don't** disparar efeito colateral (não é menu de ações). |
| `Slider` / `RangeSlider` | Valor/intervalo numérico. | `value`, `onValueChange`, `min`, `max`, `step` | **Do** mostrar o valor atual. **Don't** usar p/ precisão fina — ofereça input. |
| `Combobox` | Select com busca. | `options`, `value`, `onValueChange`, `placeholder` | **Do** p/ listas longas. **Don't** usar p/ 2-3 opções. |
| `MultiSelect` | Múltipla seleção com chips. | `options`, `value`, `onValueChange` | **Do** mostrar chips removíveis. **Don't** ocultar a contagem do que foi escolhido. |
| `FileUpload` | UI de upload (drag/drop), **sem** upload real. | `accept`, `maxSize`, `onFiles`, `multiple` | **Do** validar tipo/tamanho na UI. **Don't** assumir que envia — o app faz o POST. |

---

## Formulário (react-hook-form + zod)

| Componente | Uso | Props | Do / Don't |
|---|---|---|---|
| `Form` | Wrapper RHF + submit. | `form`, `onSubmit` | **Do** validar com schema zod. **Don't** gerenciar estado de campo na mão. |
| `FormField` | Liga um campo ao RHF. | `name`, `control`, `render` | **Do** usar `render` p/ qualquer input do DS. **Don't** duplicar estado fora do RHF. |
| `FormItem` / `FormLabel` / `FormControl` / `FormDescription` / `FormMessage` | Estrutura acessível do campo. | — | **Do** usar `FormMessage` p/ erro (ARIA pronto). **Don't** mostrar erro manual desconectado do ARIA. |

---

## Inputs Fiscais (BR)

| Componente | Uso | Props | Do / Don't |
|---|---|---|---|
| `CurrencyInput` | Moeda BRL (em **centavos**). | `value` (centavos), `onChange`, `withSymbol` | **Do** guardar centavos (inteiro). **Don't** trabalhar com float de reais. |
| `CnpjInput` | CNPJ com máscara + dígito verificador. | `value`, `onChange`, `invalid` | **Do** confiar na validação de DV. **Don't** validar CNPJ por regex de formato só. |
| `CpfInput` | CPF com máscara + DV. | `value`, `onChange`, `invalid` | **Do** idem CNPJ. **Don't** logar CPF (LGPD). |
| `CepInput` | CEP com `onComplete`. | `value`, `onChange`, `onComplete` | **Do** disparar busca de endereço no `onComplete`. **Don't** bloquear digitação. |
| `PercentInput` | Percentual. | `value`, `onChange` | **Do** alinhar à direita, mono. **Don't** confundir 0–1 com 0–100 (defina e documente). |
| `DateInputBR` | Data `dd/mm/aaaa` + Calendar. | `value`, `onChange`, `withCalendar` | **Do** locale pt-BR. **Don't** parsear data com `new Date(string)` — use `lib/br`. |
| utils `lib/br` | Máscara/validação puras. | `maskCpf`, `isValidCnpj`, `formatBRL`, `parseBRLToCents`, `formatDateBR`… | **Do** reusar nas regras de negócio. **Don't** reescrever máscara no app. |

---

## Compostos

| Componente | Uso | Principais props | Do / Don't |
|---|---|---|---|
| `Card` (+ `CardHeader/Title/Description/Body/Footer`) | Superfície base; padding responde à densidade. | `variant` (glass/solid), `interactive` | **Do** compor com os subcomponentes. **Don't** aninhar glass dentro de glass (perde contraste). |
| `StatCard` | KPI: número grande + label apagada + delta. | `label`, `value`, `delta`, `deltaLabel`, `icon` | **Do** `value` em mono. **Don't** poluir com mais de 1 número grande. |
| `Tabs` (+ `TabsList/Trigger/Content`) | Navegação por abas. | `defaultValue`, `value`, `onValueChange` | **Do** poucas abas. **Don't** esconder ação crítica atrás de aba. |
| `Accordion` / `AccordionItem` | Conteúdo expansível (FAQ). | `question`, `value` | **Do** p/ FAQ/detalhes. **Don't** usar p/ navegação primária. |
| `Dialog` (+ `Trigger/Content/Close`) | Modal acessível (foco preso, Esc). | `title`, `description` | **Do** título + descrição. **Don't** empilhar dialogs. |
| `DropdownMenu` (+ itens) | Menu de ações. | `align`, `DropdownMenuItem` (`destructive`), `CheckboxItem` | **Do** `destructive` p/ excluir/sair. **Don't** usar p/ seleção de formulário. |
| `Toast` (`ToastProvider`, `useToast`) | Feedback **transiente**. | `toast({ title, description, tone })` | **Do** confirmações rápidas. **Don't** usar p/ histórico — use `NotificationCenter`. |
| `Alert` | Banner **persistente** in-page. | `tone` (info/success/warning/danger), `title`, `action` | **Do** voz de parceiro. **Don't** usar p/ feedback efêmero. |
| `Skeleton` / `SkeletonStat` | Placeholder de carregamento. | `className` | **Do** espelhar o layout final. **Don't** usar spinner genérico no lugar. |
| `Progress` | Progresso determinado/indeterminado. | `value` (`number\|null`), `aria-label` | **Do** `null` p/ indeterminado. **Don't** esquecer `aria-label`. |
| `Pagination` | Navegação de páginas. | `page`, `pageCount`, `onPageChange` | **Do** mostrar total. **Don't** paginar 1 página só. |
| `Breadcrumb` | Trilha de navegação. | `items` (`Crumb[]`) | **Do** marcar a atual. **Don't** passar de ~4 níveis. |
| `Table` | Tabela simples; padding responde à densidade. | `columns` (`Column[]`), `data`, `rowKey`, `empty` | **Do** `mono`/`align:"right"` em valores. **Don't** usar p/ ordenação/filtro — use `DataTable`. |
| `DataTable` | Tabela avançada (TanStack): ordenação, busca, seleção, paginação, colunas, densidade. | `columns` (`ColumnDef[]`), `data`, `enableSelection`, `enableDensity`, `enablePagination`, `pageSize`, `empty` | **Do** `meta:{ mono, align }` na coluna. **Don't** despejar 10k linhas sem paginação server-side. |
| `DescriptionList` / `DescriptionItem` | Detalhes/cadastro (chave→valor). | `term`, `children` | **Do** mono em valores fiscais. **Don't** usar como tabela de muitos registros. |
| `Timeline` / `TimelineItem` | Histórico/activity feed. | `tone`, `time`, `title` | **Do** ordem cronológica clara. **Don't** misturar com lista de ações. |
| `EmptyState` | Estado vazio com voz de parceiro. | `icon` **ou** `illustration`, `title`, `description`, `action` | **Do** oferecer 1 próximo passo. **Don't** deixar vazio "branco" sem orientação. |
| `ErrorState` | Bloco de erro reutilizável (404/500/403/offline). | `illustration`, `code`, `title`, `description`, `action`, `secondaryAction` | **Do** ilustração DNEX + voz de parceiro. **Don't** culpar o usuário. |
| `ErrorPage` | **Página inteira** de erro (reusa ErrorState + ilustrações). | `variant` (`404\|500\|403\|offline`), `title`, `description`, `code`, `action`, `secondaryAction`, `inline`, `hideLogo` | **Do** usar `variant` (presets prontos). **Don't** inventar arte nova — reusar o set duotom. |
| `Spinner` / `PageLoader` | Loading inline / overlay de página. | `size`; `position`, `message` | **Do** `PageLoader` em troca de rota. **Don't** usar spinner onde skeleton encaixa melhor. |
| `Popover` (+ `Trigger/Content/Anchor/Close`) | Painel flutuante ancorado. | `align`, `side` | **Do** p/ filtros/menus ricos. **Don't** usar p/ conteúdo crítico que precisa de modal. |
| `Sheet` (+ `Header/Body/Footer`) | Drawer genérico (desliza de qualquer borda). | `side` (left/right/top/bottom), `size` | **Do** p/ filtros/detalhes laterais. **Don't** confundir com o drawer de navegação do shell. |
| `ConfirmDialog` (`ConfirmProvider`, `useConfirm`) | Confirmação (com `danger` + loading). | `tone`, `title`, `description`; `useConfirm()` imperativo | **Do** `useConfirm()` p/ ações destrutivas. **Don't** excluir sem confirmar. |
| `HoverCard` (+ `Trigger/Content`) | Preview ao passar o mouse. | `side`, `align` | **Do** info complementar. **Don't** colocar ação essencial só no hover (mobile não tem). |
| `CommandPalette` (+ `Group/Item/Separator`, `useCommandPalette`) | ⌘K estilo Linear. | `open`, `onOpenChange`; `CommandItem` (`icon`, `shortcut`) | **Do** atalho global ⌘K/Ctrl+K. **Don't** esconder navegação só aqui. |
| `Calendar` | Calendário (react-day-picker) tematizado. | `mode`, `selected`, `onSelect`, locale pt-BR | **Do** "hoje" em âmbar, seleção índigo. **Don't** trocar locale. |
| `DatePicker` | Campo + popover de data (single/range). | `mode` (single/range), `value`, `onChange` | **Do** mono na data. **Don't** usar p/ digitar — combine com `DateInputBR`. |
| `Stepper` | Indicador de passos (h/v). | `steps`, `current`, `orientation` | **Do** estados done/active/upcoming. **Don't** usar p/ navegação livre. |
| `Wizard` | Fluxo multi-step (Voltar/Avançar/Concluir). | `steps`, `canAdvance`, `onFinish` | **Do** validar por passo (`canAdvance`). **Don't** permitir avançar com passo inválido. |
| `NotificationCenter` / `NotificationItem` | Sino + painel de avisos **persistente**. | `notifications`, `onMarkRead`, `onMarkAllRead` | **Do** tempo relativo + lida/não-lida. **Don't** confundir com Toast (transiente). |

---

## Visual & Dados

| Componente | Uso | Principais props | Do / Don't |
|---|---|---|---|
| Ilustrações: `IllustrationEmpty/404/500/Success/NoPermission/NoConnection/Onboarding` | Set duotom próprio (índigo+âmbar). | `size`, `className`, `title` | **Do** `title` p/ rótulo (sem título = decorativa). **Don't** usar PNG genérico — o set é a marca. |
| `AreaChartDnex` | Tendência de uma série. | `data`, `xKey`, `dataKey`, `valueFormatter` | **Do** `valueFormatter` em BRL/%. **Don't** mais de 1 série de destaque âmbar. |
| `LineChartDnex` | Multi-série temporal. | `data`, `xKey`, `series[]`, `valueFormatter` | **Do** índigo dominante. **Don't** mais de ~4 séries (vira ruído). |
| `BarChartDnex` | Comparação por categoria (agrupado). | `data`, `xKey`, `series[]`, `valueFormatter` | **Do** rótulos legíveis. **Don't** começar eixo Y fora do zero p/ enganar. |
| `DonutChartDnex` | Composição (poucas fatias). | `data`, `centerValue`, `centerLabel`, `valueFormatter` | **Do** ≤5 fatias. **Don't** usar p/ comparar valores próximos. |
| `RadialChartDnex` | Progresso de metas (anéis). | `data`, `max`, `centerValue` | **Do** legenda ao lado. **Don't** sobrecarregar com muitos anéis. |
| `RadarChartDnex` | Perfil multi-dimensão (atual×meta). | `data`, `angleKey`, `series[]`, `max` | **Do** comparar 2 séries. **Don't** usar com >8 eixos. |
| `Sparkline` | Mini-tendência inline (em StatCard/tabela). | `data`, `variant` (line/area), `trend` (up/down/neutral/auto) | **Do** dentro de KPI/linha. **Don't** adicionar eixos — é resumo. |
| `GaugeChart` | Velocímetro (SVG custom). | `value`, `min`, `max`, `segments`, `label`, `unit` | **Do** valor central mono. **Don't** usar p/ séries — é 1 medida. |
| `FunnelChart` | Funil de conversão (SVG custom). | `stages` (`FunnelStage[]`) | **Do** mostrar % entre etapas. **Don't** inverter a ordem (topo = maior). |
| `ChartTooltip` / `useChartTheme` | Tooltip on-brand / paleta de gráfico. | — | **Do** `useChartTheme()` p/ cores concretas. **Don't** hard-codar HEX no gráfico. |

---

## App Shell

| Componente | Uso | Principais props | Do / Don't |
|---|---|---|---|
| `Sidebar` (+ `SidebarDrawer`, `SidebarDrawerTrigger`, `MobileMenu`, `MobileMenuTrigger`) | Navegação lateral; vira drawer off-canvas no mobile. | `items` (`SidebarNavItem[]`), `active` | **Do** pill ativo tinted. **Don't** confundir o drawer de nav com o `Sheet` genérico. |
| `Topbar` | Barra superior do app. | `…children/slots` | **Do** plugar busca + NotificationCenter + ThemeSwitcher. **Don't** lotar de ações. |
| `AppLauncher` | Grade de apps do hub. | `apps` (`DnexApp[]`) | **Do** grid 2-col legível no estreito. **Don't** misturar com menu de conta. |
| `PageHeader` | Cabeçalho de página (título + ações). | `title`, `description`, `actions`, `breadcrumb` | **Do** 1 ação primária. **Don't** repetir o título da aba do navegador. |

---

## Controles de Sistema (oficiais)

| Componente | Uso | Principais props | Do / Don't |
|---|---|---|---|
| `ThemeSwitcher` | Troca tema (claro/escuro/sistema), persistente. | `variant` (segmented/icon), `showSystem`, `showLabels` | **Do** na Topbar (variant `icon` em telas apertadas). **Don't** reimplementar o toggle na mão. |
| `DensityToggle` | Troca densidade global (confortável/compacto). | `showLabels` | **Do** nas preferências do app. **Don't** confundir com a densidade local do `DataTable`. |

---

*DNEX Design System v1 · índigo + âmbar · Space Grotesk · Plus Jakarta Sans · IBM Plex Mono · números em mono.*
