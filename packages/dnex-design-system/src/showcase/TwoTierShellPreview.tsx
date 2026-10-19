import { useState } from "react";
import {
  Bell,
  BookOpen,
  CircleHelp,
  FileText,
  FolderKanban,
  Grid2X2,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "../components/brand/Logo";
import { ProductGlyph, type DnexProductKey } from "../components/brand/ProductGlyph";
import { GlobalRail } from "../components/shell/GlobalRail";
import { Sidebar } from "../components/shell/Sidebar";
import type { SidebarNavItem } from "../components/shell/Sidebar";
import { Avatar } from "../components/primitives/Avatar";
import { Badge } from "../components/primitives/Badge";
import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";

type PreviewProduct = {
  key: DnexProductKey;
  label: string;
  description: string;
  availability?: "ready" | "provisioning" | "unavailable";
};

const products: readonly PreviewProduct[] = [
  { key: "hub", label: "Hub", description: "Visão integrada da empresa" },
  { key: "console", label: "Console", description: "Controle da plataforma DNEX" },
  { key: "painel", label: "Painel", description: "Administração da empresa" },
  { key: "gestao-contador", label: "Gestão", description: "Cadastros e operação" },
  { key: "normas", label: "Normas", description: "Conhecimento e compliance" },
  { key: "processos", label: "Processos", description: "Fluxos, tarefas e obrigações" },
  { key: "crm", label: "CRM", description: "Relacionamento e oportunidades", availability: "provisioning" },
  { key: "contratos", label: "Contratos", description: "Propostas, contratos e receita" },
  { key: "metas", label: "Metas", description: "Indicadores e desempenho" },
  { key: "fiscal", label: "Fiscal", description: "Apuração e inteligência fiscal", availability: "unavailable" },
  { key: "contabil", label: "Contábil", description: "Fechamento e conciliação" },
  { key: "perdcomp", label: "PER/DCOMP", description: "Créditos e compensações" },
  { key: "aurora", label: "Aurora", description: "Clima organizacional e apoio ao RH" },
];

type PreviewNavigationItem = { id: string; label: string; icon: LucideIcon };
type PreviewNavigationSection = { label: string; items: readonly PreviewNavigationItem[] };

const navigation: readonly PreviewNavigationSection[] = [
  {
    label: "Visão geral",
    items: [
      { id: "inicio", label: "Início", icon: LayoutDashboard },
    ],
  },
  {
    label: "Conhecimento",
    items: [
      { id: "biblioteca", label: "Biblioteca", icon: BookOpen },
      { id: "documentos", label: "Documentos", icon: FileText },
      { id: "trilhas", label: "Trilhas", icon: FolderKanban },
    ],
  },
];

const contextualSidebarItems: SidebarNavItem[] = navigation.flatMap((section) => [
  { kind: "heading" as const, id: `heading-${section.label}`, label: section.label },
  ...section.items.map((item) => {
    const Icon = item.icon;
    return { id: item.id, label: item.label, icon: <Icon /> };
  }),
]);

/**
 * Prévia interativa do App Shell V2. Ela não conhece rota, SSO, tenant ou
 * entitlement: esses dados chegam do control plane no componente de produção.
 * Aqui existem apenas dados ilustrativos para validar a linguagem visual.
 */
export function TwoTierShellPreview() {
  const [productKey, setProductKey] = useState<DnexProductKey>("normas");
  const [activeNav, setActiveNav] = useState("inicio");
  const [contextualCollapsed, setContextualCollapsed] = useState(false);
  const product = products.find((item) => item.key === productKey) ?? products[0];

  return (
    <div data-theme="light" className="overflow-hidden rounded-[var(--radius-hero)] border border-line bg-[var(--bg)] shadow-[var(--shadow-lg)]">
      <div className="flex h-[650px] min-w-[900px]">
        <GlobalRail
          products={products.map((item) => ({ ...item, badge: item.key === "processos" ? 3 : undefined }))}
          activeKey={product.key}
          onSelect={(key) => { setProductKey(key); setActiveNav("inicio"); }}
        />

        {/* Fonte única de implementação para a sidebar contextual do App Shell
            e para a documentação do Design System. */}
        <Sidebar
          items={contextualSidebarItems}
          activeId={activeNav}
          onSelect={setActiveNav}
          collapsed={contextualCollapsed}
          onToggleCollapse={() => setContextualCollapsed((value) => !value)}
          logo={<Logo height={25} product={product.label} tone="inverse" />}
          logoCollapsed={<ProductGlyph product={product.key} size={28} />}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-[var(--bg)] text-fg">
          <header className="flex h-[var(--shell-topbar-height)] shrink-0 items-center gap-4 border-b border-line bg-[var(--surface)] px-6">
            <div className="min-w-0 shrink-0 text-sm font-semibold">DNEX {product.label}<span className="mx-2 text-fg-subtle">›</span><span className="font-normal text-fg-muted">{activeNav === "inicio" ? "Início" : navigation.flatMap((section) => section.items).find((item) => item.id === activeNav)?.label}</span></div>
            <div className="mx-auto w-full max-w-[420px]"><Input leadingIcon={<Search className="h-4 w-4" />} placeholder={`Pesquisar em ${product.label}…`} aria-label={`Pesquisar em ${product.label}`} className="h-[var(--shell-topbar-search-height)]" /></div>
            <div className="flex shrink-0 items-center gap-2"><button type="button" aria-label="Aplicativos" className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)]"><Grid2X2 className="h-4 w-4" /></button><button type="button" aria-label="Ajuda" className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)]"><CircleHelp className="h-4 w-4" /></button><button type="button" aria-label="Configurações e pessoas" className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)]"><Settings className="h-4 w-4" /></button><button type="button" aria-label="Notificações" className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)]"><Bell className="h-4 w-4" /></button><Avatar fallback="PD" size="sm" /></div>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-[1180px]">
              <div className="flex items-start justify-between gap-6"><div><p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--tone-action-fg)]"><span className="h-1 w-5 rounded-full bg-accent" />Central de {product.label}</p><h1 className="mt-3 font-display text-[32px] font-bold tracking-tight">Bom dia, Pompílio.</h1><p className="mt-2 text-sm text-fg-muted">A navegação global mudou; o contexto e os dados continuam no módulo certo.</p></div><Button size="sm" leadingIcon={<Sparkles className="h-4 w-4" />}>Nova ação</Button></div>
              <section className="mt-7 rounded-[var(--radius-hero)] bg-[linear-gradient(135deg,#302c78,#17143f)] p-6 text-white shadow-[var(--shadow-card)]"><Badge tone="accent">Próxima melhor ação</Badge><h2 className="mt-4 font-display text-xl font-semibold">{product.description}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-[#d8d9ee]">Uma superfície única para encontrar produtos; uma navegação contextual para trabalhar sem perder o lugar.</p><div className="mt-5 flex items-center gap-5 text-[0.75rem] text-[#bfc1e5]"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Tudo sob controle</span><span>Atualizado agora</span></div></section>
              <div className="mt-6 grid grid-cols-3 gap-4"><Metric label="Pendências" value={product.key === "fiscal" ? "12" : "4"} /><Metric label="Concluídas" value="86%" /><Metric label="Em revisão" value="7" /></div>
              <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-[var(--surface)]"><div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-display text-sm font-semibold">Atividades prioritárias</h2><p className="mt-1 text-xs text-fg-muted">Itens ilustrativos do módulo atual.</p></div><button type="button" className="text-xs font-semibold text-[var(--tone-action-fg)] hover:underline">Ver todas</button></div>{["Revisar informação pendente", "Conferir aprovação da equipe", "Publicar próxima atualização"].map((label, index) => <div key={label} className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0"><span className="grid h-6 w-6 place-items-center rounded-full border border-line text-[11px] text-fg-muted">{index + 1}</span><span className="flex-1 text-sm font-medium">{label}</span><span className="text-xs text-fg-muted">Hoje</span></div>)}</section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4"><p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-fg-subtle">{label}</p><p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-fg">{value}</p></article>;
}
