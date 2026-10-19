# Auditoria do DNEX Design System — gaps e roadmap

> Diagnóstico de especialista do estado do DS vs. um sistema de produto SaaS completo (alvo escolhido: "o mais completo possível").
> Data: 2026-06-29. Cada sub-fase futura entrega com build + teste de runtime antes da próxima.

## 1. Inventário atual (o que já existe e valida)
- **Foundations:** tokens em 3 camadas (primitivo→semântico→bridge), dark/light reais, escala tipográfica fluida documentada, motion, logo/símbolo, galeria de ícones (lucide).
- **Primitivos:** Button (Slottable), Input, Textarea, Label, Select, Checkbox, Radio, Switch, Badge, Avatar, Tooltip, Separator, Kbd.
- **Compostos:** Card, StatCard, Tabs, Accordion, Dialog, DropdownMenu, Popover, Toast, Alert, Skeleton, Progress, Pagination, Breadcrumb, Table (simples), EmptyState, Calendar, DatePicker, Stepper, Wizard, NotificationCenter, Spinner, PageLoader.
- **Gráficos:** Area, Line, Bar, Donut, Radial, Gauge (velocímetro).
- **App shell:** Sidebar (+ MobileMenu full-screen), Topbar, AppLauncher, PageHeader.

## 2. Gaps priorizados
**P0 (destrava os seus apps):**
- **Camada de formulário:** `Form`/`FormField` com react-hook-form + zod, mensagens de erro e helper padronizados.
- **Inputs do domínio BR/fiscal:** `CurrencyInput` (BRL), `CnpjInput`/`CpfInput` (máscara+validação), `DateInput` pt-BR, `PercentInput`, `CepInput`.
- **Gráfico Radar** (seu pedido) + `Sparkline` inline.
- **Ilustrações próprias DNEX** (duotom índigo+âmbar): empty, 404, 500, sucesso, sem-permissão, sem-conexão, onboarding.

**P1 (sistema redondo):**
- **DataTable avançada** (TanStack): ordenação, filtro, seleção, paginação, colunas.
- **Inputs:** Combobox/Autocomplete, MultiSelect, TagsInput, Slider/Range, NumberInput, FileUpload/Dropzone, SearchInput, SegmentedControl (promover o do showcase).
- **Overlays:** Sheet/Drawer genérico, ConfirmDialog (sobre Dialog), CommandPalette (⌘K), HoverCard.
- **Billing (Stripe):** PricingCard/PlanCard, UsageMeter, FeatureList.
- **Dados/feedback:** Timeline/ActivityFeed, DescriptionList (key-value), Funnel chart, ErrorState/404/500 (com ilustração).
- **Tokens documentados:** z-index, elevação, breakpoints, durações de motion, densidade.

**P2 (polimento/escala):**
- Densidade (compacto/confortável) + theme switcher componente; Tour/Coachmarks de onboarding; Rating; Resizable/SplitPane; docs de uso (do/don't + a11y) por componente; code-split (resolver o warning de bundle >500 kB).

## 3. Roadmap proposto (sub-fases da Fase C)
- **C1** — Radar + **ilustrações próprias DNEX** (set inicial) + tokens documentados (z-index/elevação/breakpoints/motion). *(pedidos diretos)*
- **C2** — Camada de formulário (rhf+zod) + inputs especializados (Combobox, MultiSelect, Slider, FileUpload, SearchInput, SegmentedControl).
- **C3** — Inputs do domínio BR/fiscal (BRL, CNPJ/CPF, data pt-BR, percent, CEP).
- **C4** — DataTable avançada (TanStack) + Timeline + DescriptionList + Sparkline/Funnel.
- **C5** — Overlays (Sheet, ConfirmDialog, CommandPalette ⌘K) + Billing (PricingCard/UsageMeter).
- **C6** — Polimento: densidade/theme switcher, ErrorState/404/500 com ilustração, docs por componente, code-split.

*Auditoria DS DNEX · 2026-06-29.*
