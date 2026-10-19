import { useState } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import {
  BarChart3,
  CircleHelp,
  Grid2X2,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Receipt,
  Search,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { NotificationCenter } from "../components/composed/NotificationCenter";
import type { DnexNotification } from "../components/composed/NotificationCenter";
import { Sidebar, SidebarDrawer } from "../components/shell/Sidebar";
import type { SidebarNavItem, SidebarNavLink } from "../components/shell/Sidebar";
import { Topbar } from "../components/shell/Topbar";
import { Logo } from "../components/brand/Logo";
import { ProductGlyph, type DnexProductKey } from "../components/brand/ProductGlyph";
import { GlobalRail } from "../components/shell/GlobalRail";
import { PageHeader } from "../components/shell/PageHeader";
import { PageContainer } from "../components/shell/PageContainer";
import { Breadcrumb } from "../components/composed/Breadcrumb";
import { StatCard } from "../components/composed/StatCard";
import { Table } from "../components/composed/Table";
import type { Column } from "../components/composed/Table";
import { Badge } from "../components/primitives/Badge";
import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";
import { Avatar } from "../components/primitives/Avatar";
import { cn } from "../lib/cn";
import { ThemeToggle } from "./parts";
import { useToast } from "../components/composed/Toast";

const navItems: SidebarNavItem[] = [
  { kind: "heading", id: "visao-geral", label: "Visão geral" },
  { id: "visao", label: "Início", icon: <LayoutDashboard /> },
  { kind: "heading", id: "operacao", label: "Operação" },
  { id: "financeiro", label: "Financeiro", icon: <Wallet /> },
  { id: "fiscal", label: "Fiscal", icon: <Receipt />, badge: 3 },
  { id: "clientes", label: "Clientes", icon: <Users /> },
  { id: "relatorios", label: "Relatórios", icon: <BarChart3 /> },
];

const mobileNavigationItems = navItems.filter(
  (item): item is SidebarNavLink => !("kind" in item && item.kind === "heading"),
);
const mobileTabItems = mobileNavigationItems.slice(0, 4);
const hasMoreMobileNavigation = mobileNavigationItems.length > mobileTabItems.length;

type PreviewProduct = { key: DnexProductKey; label: string; availability?: "ready" | "provisioning" | "unavailable"; description?: string };

// Em produção esta lista é entregue pelo control plane, já filtrada por
// tenant, plano e entitlement. A vitrine mostra o conjunto completo apenas
// para documentar os ícones e a geometria do rail global.
const products: readonly PreviewProduct[] = [
  { key: "hub", label: "Hub" },
  { key: "console", label: "Console" },
  { key: "painel", label: "Painel" },
  { key: "gestao-contador", label: "Gestão" },
  { key: "normas", label: "Normas", availability: "provisioning", description: "A ativação deste módulo está em andamento." },
  { key: "processos", label: "Processos" },
  { key: "crm", label: "CRM" },
  { key: "contratos", label: "Contratos" },
  { key: "metas", label: "Metas" },
  { key: "fiscal", label: "Fiscal", availability: "unavailable", description: "Este módulo ainda não possui rota operacional para o contexto demonstrado." },
  { key: "contabil", label: "Contábil" },
  { key: "perdcomp", label: "PER/DCOMP" },
  { key: "aurora", label: "Aurora" },
];

type Lancamento = {
  id: string;
  descricao: string;
  categoria: string;
  status: "pago" | "pendente" | "atrasado";
  valor: string;
};

const lancamentos: Lancamento[] = [
  { id: "1", descricao: "NF-e 1042 — Alpha Comércio", categoria: "Receita", status: "pago", valor: "R$ 12.480,00" },
  { id: "2", descricao: "DAS Simples Nacional", categoria: "Imposto", status: "pendente", valor: "R$ 3.215,90" },
  { id: "3", descricao: "Folha — competência 05", categoria: "Pessoal", status: "atrasado", valor: "R$ 28.700,00" },
  { id: "4", descricao: "NF-e 1043 — Beta Serviços", categoria: "Receita", status: "pago", valor: "R$ 6.900,00" },
];

const statusTone = {
  pago: "success",
  pendente: "warning",
  atrasado: "danger",
} as const;

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000);

const shellNotifications: DnexNotification[] = [
  {
    id: "s1",
    type: "warning",
    title: "DAS vence em 3 dias",
    description: "Simples Nacional — R$ 3.215,90.",
    date: minsAgo(12),
    read: false,
  },
  {
    id: "s2",
    type: "success",
    title: "Conciliação concluída",
    description: "42 lançamentos casados automaticamente.",
    date: minsAgo(95),
    read: false,
  },
  {
    id: "s3",
    type: "info",
    title: "Relatório mensal pronto",
    description: "Maio/2026 disponível para download.",
    date: minsAgo(60 * 20),
    read: true,
  },
];

const columns: Column<Lancamento>[] = [
  { key: "descricao", header: "Descrição", cell: (r) => r.descricao },
  {
    key: "categoria",
    header: "Categoria",
    cell: (r) => <span className="text-fg-muted">{r.categoria}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <Badge tone={statusTone[r.status]}>
        {r.status === "pago" ? "Pago" : r.status === "pendente" ? "Pendente" : "Atrasado"}
      </Badge>
    ),
  },
  { key: "valor", header: "Valor", cell: (r) => r.valor, align: "right", mono: true },
];

export type ShellDemoProps = {
  /**
   * "responsive" (padrão): layout reage ao viewport via breakpoints — sidebar
   * fixa em telas largas, drawer em telas estreitas. Use na seção desktop.
   * "mobile": força o layout estreito independentemente do viewport — sidebar
   * sempre vira drawer, KPIs empilham, busca no drawer. Use dentro do frame de
   * device (~390px), onde NÃO há breakpoint de viewport que ajude.
   */
  mode?: "responsive" | "mobile";
  /**
   * Nó do frame de device — usado como `container` do drawer/overlay para que o
   * off-canvas fique CONTIDO no celular simulado (e não em tela cheia). Só no
   * modo "mobile".
   */
  frameEl?: HTMLElement | null;
  /** Esconde a barra de janela (chrome do browser) no topo. */
  hideChrome?: boolean;
  /** Controle opcional do drawer na prévia mobile. */
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  className?: string;
};

/**
 * ShellDemo — demonstração viva do app shell do hub DNEX (sidebar + topbar +
 * conteúdo). É o que vende o DS para o hub. Em `mode="mobile"` reflete o
 * comportamento real em ~390px: a sidebar vira drawer off-canvas acessível, a
 * topbar ganha botão de menu, os KPIs empilham e a tabela rola na horizontal.
 */
export function ShellDemo({
  mode = "responsive",
  frameEl,
  hideChrome,
  mobileMenuOpen,
  onMobileMenuOpenChange,
  className,
}: ShellDemoProps) {
  const [active, setActive] = useState("visao");
  const [productKey, setProductKey] = useState<DnexProductKey>("hub");
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [notifs, setNotifs] = useState<DnexNotification[]>(shellNotifications);
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const forceMobile = mode === "mobile";
  const product = products.find((item) => item.key === productKey) ?? products[0];
  const drawerOpen = mobileMenuOpen ?? internalDrawerOpen;
  const setDrawerOpen = onMobileMenuOpenChange ?? setInternalDrawerOpen;

  return (
    <RDialog.Root open={mobileActionsOpen} onOpenChange={setMobileActionsOpen}>
      <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-hero)] border border-line bg-[var(--bg)] shadow-[var(--shadow-lg)]",
        // ÂNCORA do portal do drawer no modo mobile (relative + ref no frame)
        forceMobile && "relative h-full",
        className,
      )}
    >
      {/* barra de janela (chrome do browser) */}
      {!hideChrome && (
        <div className="flex items-center gap-1.5 border-b border-line bg-[var(--surface)] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#f87171]" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-[#4ade80]" />
          <span className="ml-3 truncate font-mono text-[0.72rem] text-fg-subtle">
            app.dnex.com.br/dashboard
          </span>
        </div>
      )}

      <div className={cn("flex", forceMobile ? "h-full" : "h-[560px]")}>
        {/* Rail global: somente troca de produto. Nenhum perfil, ajuda ou
            configuração aparece aqui; estes pertencem à topbar. */}
        {!forceMobile && (
          <GlobalRail
            className="hidden md:flex"
            products={products}
            activeKey={product.key}
            onSelect={(key) => { setProductKey(key); setActive("visao"); }}
          />
        )}

        {/* Sidebar contextual: contém apenas rotas do módulo selecionado. */}
        {!forceMobile && (
          <div className="hidden md:block">
            <Sidebar
              items={navItems}
              activeId={active}
              onSelect={setActive}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((c) => !c)}
              logo={<Logo height={25} product={`DNEX ${product.label}`} tone="inverse" />}
              logoCollapsed={<ProductGlyph product={product.key} size={28} />}
            />
          </div>
        )}

        {/* O mesmo sidebar contextual vira drawer lateral no estreito. Assim a
            prévia mostra a navegação móvel real, em vez de apenas reduzir o desktop. */}
        <SidebarDrawer
          items={navItems}
          activeId={active}
          onSelect={setActive}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          container={forceMobile ? frameEl : null}
          logo={<Logo height={25} product={`DNEX ${product.label}`} tone="inverse" />}
          globalItems={products.map((item) => ({
            id: item.key,
            label: item.label,
            availability: item.availability,
            description: item.description,
            icon: <ProductGlyph product={item.key} size={28} />,
          }))}
          activeGlobalId={product.key}
          onGlobalSelect={(id) => {
            const next = products.find((item) => item.key === id);
            if (next) {
              setProductKey(next.key);
              setActive("visao");
            }
          }}
        />

        {/* área de conteúdo */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            left={
              <div className="flex items-center gap-3">
                {/* botão de menu — abre o drawer; no responsivo só aparece < md */}
                <button
                  type="button"
                  aria-label="Abrir menu"
                  onClick={() => setDrawerOpen(true)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-[10px] text-fg-muted transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    forceMobile ? "grid" : "md:hidden",
                  )}
                >
                  <Menu className="h-[18px] w-[18px]" />
                </button>

                <p className="min-w-0 truncate text-sm font-semibold text-fg">
                  DNEX {product.label}
                  <span className={cn("mx-2 text-fg-subtle", forceMobile && "hidden")}>›</span>
                  <span className={cn("font-normal text-fg-muted", forceMobile && "hidden")}>
                    {navItems.find((item) => item.id === active)?.label ?? "Início"}
                  </span>
                </p>
              </div>
            }
            center={
              !forceMobile ? (
                <Input
                  leadingIcon={<Search />}
                  placeholder="Pesquisar no módulo…"
                  aria-label="Pesquisar no módulo"
                  className="h-[var(--shell-topbar-search-height)]"
                />
              ) : undefined
            }
            right={
              <div className="flex items-center gap-2">
                {forceMobile ? (
                  <RDialog.Trigger asChild>
                    <button
                      type="button"
                      aria-label="Mais ações globais"
                      className="grid h-11 w-11 place-items-center rounded-[10px] border border-line text-fg-muted transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                  </RDialog.Trigger>
                ) : (
                  <>
                    <button type="button" aria-label="Abrir Hub DNEX" className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg-muted transition-colors hover:bg-[var(--surface-hover)]"><Grid2X2 className="h-4 w-4" /></button>
                    <button type="button" aria-label="Ajuda" className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg-muted transition-colors hover:bg-[var(--surface-hover)]"><CircleHelp className="h-4 w-4" /></button>
                    <button type="button" aria-label="Configurações e pessoas" className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg-muted transition-colors hover:bg-[var(--surface-hover)]"><Settings className="h-4 w-4" /></button>
                  </>
                )}
                {!forceMobile && <ThemeToggle />}
                <NotificationCenter
                  notifications={notifs}
                  onRead={(id) =>
                    setNotifs((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
                    )
                  }
                  onReadAll={() =>
                    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
                  }
                  align="end"
                  container={forceMobile ? frameEl : null}
                  className={forceMobile ? "h-11 w-11" : undefined}
                  presentation={forceMobile ? "screen" : "popover"}
                />
                <Avatar fallback="DP" size="sm" />
              </div>
            }
          />

          <div className={cn("flex-1 overflow-y-auto", forceMobile ? "p-4 pb-24" : "p-6")}>
            <PageContainer>
            <PageHeader
              eyebrow="Operação financeira"
              breadcrumb={
                <Breadcrumb
                  items={[
                    { label: "Hub", href: "#" },
                    { label: `DNEX ${product.label}`, href: "#" },
                    { label: navItems.find((item) => item.id === active)?.label ?? "Início" },
                  ]}
                />
              }
              title={navItems.find((item) => item.id === active)?.label ?? "Início"}
              description={`A operação do DNEX ${product.label} permanece no contexto do módulo selecionado.`}
              className="!mb-0"
              actions={
                <Button size="sm" onClick={() => toast({ title: "Relatório gerado", tone: "success" })}>
                  Gerar relatório
                </Button>
              }
            />

            {/* KPIs — empilham em 1 coluna no mobile, sobem para 3 no desktop */}
            <div
              className={cn(
                "grid gap-4",
                forceMobile
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              <StatCard label="Faturamento (mês)" value="R$ 142,8k" delta={12.4} deltaLabel="vs. abr" icon={<Wallet />} />
              <StatCard label="Impostos a pagar" value="R$ 18,3k" delta={-4.1} deltaLabel="vs. abr" icon={<Receipt />} />
              <StatCard label="Margem líquida" value="23,6%" delta={2.2} deltaLabel="vs. abr" icon={<BarChart3 />} />
            </div>

            <div>
              <h3 className="mb-3 font-display text-[length:var(--text-h3)] font-semibold text-fg">
                Lançamentos recentes
              </h3>
              {/* a Table já tem overflow-x-auto interno — rola na horizontal no estreito */}
              <Table columns={columns} data={lancamentos} rowKey={(r) => r.id} />
            </div>
            </PageContainer>
          </div>

          {forceMobile && (
            <nav
              aria-label="Navegação principal do módulo"
              className={cn(
                "absolute inset-x-0 bottom-0 z-[var(--z-sticky)] flex items-stretch border-t border-line bg-[var(--surface)]/95 px-1 shadow-[0_-8px_24px_rgba(15,10,45,0.08)] backdrop-blur-md transition-transform duration-200",
                drawerOpen && "translate-y-full",
              )}
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {mobileTabItems.map((item) => {
                const isActive = active === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.65rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive ? "text-primary" : "text-muted hover:text-ink",
                    )}
                    onClick={() => setActive(item.id)}
                  >
                    <span className={cn("relative grid h-7 w-9 place-items-center rounded-lg", isActive && "bg-primary-soft")}>
                      {item.icon}
                      {item.badge ? (
                        <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-warning px-1 text-[0.55rem] font-bold leading-none text-warning-ink">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="max-w-full truncate">{item.label}</span>
                  </button>
                );
              })}

              {hasMoreMobileNavigation ? (
                <button
                  type="button"
                  className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.65rem] font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setDrawerOpen(true)}
                >
                  <span className="grid h-7 w-9 place-items-center rounded-lg">
                    <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>Mais</span>
                </button>
              ) : null}
            </nav>
          )}
        </div>
      </div>
      </div>

      {forceMobile && (
        <RDialog.Portal container={frameEl ?? undefined}>
          <RDialog.Overlay className={cn("z-[var(--z-overlay)] bg-[rgba(5,4,18,0.6)] backdrop-blur-sm", frameEl ? "absolute inset-0" : "fixed inset-0")} />
          <RDialog.Content className={cn("z-[var(--z-modal)] flex flex-col bg-[var(--surface)] text-fg outline-none", frameEl ? "absolute inset-0" : "fixed inset-0 h-[100dvh] w-screen")}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <RDialog.Title className="font-display text-lg font-semibold">Mais</RDialog.Title>
                <RDialog.Description className="mt-0.5 text-sm text-fg-muted">Ações globais do DNEX.</RDialog.Description>
              </div>
              <RDialog.Close aria-label="Fechar menu" className="grid h-10 w-10 place-items-center rounded-[10px] text-fg-muted hover:bg-[var(--surface-hover)]"><X className="h-5 w-5" /></RDialog.Close>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              {[
                { label: "Abrir Hub DNEX", description: "Trocar de aplicativo", icon: Grid2X2, action: () => toast({ title: "Hub DNEX", description: "Seletor global de aplicativos." }) },
                { label: "Ajuda", description: "Central de ajuda do DNEX", icon: CircleHelp, action: () => toast({ title: "Ajuda", description: "Central de ajuda do DNEX." }) },
                { label: "Configurações e pessoas", description: "Preferências e administração", icon: Settings, action: () => toast({ title: "Configurações", description: "Pessoas e preferências globais." }) },
              ].map(({ label, description, icon: Icon, action }) => (
                <button key={label} type="button" onClick={action} className="flex min-h-16 items-center gap-4 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] px-4 text-left transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  <span><span className="block font-semibold">{label}</span><span className="mt-0.5 block text-sm text-fg-muted">{description}</span></span>
                </button>
              ))}
            </div>
          </RDialog.Content>
        </RDialog.Portal>
      )}
    </RDialog.Root>
  );
}
