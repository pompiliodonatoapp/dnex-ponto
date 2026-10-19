import { useState } from "react";
import {
  Bell,
  BookOpen,
  CircleHelp,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../components/composed/Card";
import { Logo } from "../components/brand/Logo";
import { PageContainer } from "../components/shell/PageContainer";
import { PageHeader } from "../components/shell/PageHeader";
import { Sidebar } from "../components/shell/Sidebar";
import type { SidebarNavItem } from "../components/shell/Sidebar";
import { Topbar } from "../components/shell/Topbar";
import { TopbarContext } from "../components/shell/TopbarContext";
import {
  TopbarGlobalActions,
  TopbarHubLink,
} from "../components/shell/TopbarGlobalActions";
import { appShell, pageHeader } from "../tokens/tokens";
import { Demo, Section } from "./parts";
import { PreviousImplementation } from "./ShellReference";

type TokenRow = {
  id: string;
  token: string;
  value: string;
  use: string;
};

const shellTokenGroups: ReadonlyArray<{
  id: string;
  title: string;
  rows: readonly TokenRow[];
}> = [
  {
    id: "sidebar",
    title: "Sidebar",
    rows: [
      {
        id: "width",
        token: "--shell-sidebar-width",
        value: `${appShell.sidebar.width}px`,
        use: "Expandida",
      },
      {
        id: "collapsed",
        token: "--shell-sidebar-collapsed-width",
        value: `${appShell.sidebar.collapsedWidth}px`,
        use: "Recolhida",
      },
      {
        id: "transition",
        token: "--shell-sidebar-transition",
        value: `${appShell.sidebar.transitionMs}ms`,
        use: "Transição",
      },
      {
        id: "logo",
        token: "--shell-sidebar-logo-wordmark",
        value: "#FFFFFF",
        use: "Logo negativo",
      },
    ],
  },
  {
    id: "topbar",
    title: "Barra superior",
    rows: [
      {
        id: "height",
        token: "--shell-topbar-height",
        value: `${appShell.topbar.height}px`,
        use: "Altura canônica",
      },
      {
        id: "search",
        token: "--shell-topbar-search-max",
        value: `${appShell.topbar.searchMaxWidth}px`,
        use: "Busca central",
      },
      {
        id: "control",
        token: "--shell-topbar-control-size",
        value: `${appShell.topbar.controlSize}px`,
        use: "Controles",
      },
      {
        id: "launcher-width",
        token: "--shell-app-launcher-width",
        value: `${appShell.appLauncher.width}px`,
        use: "Seletor de aplicativos",
      },
      {
        id: "launcher-height",
        token: "--shell-app-launcher-max-height",
        value: `${appShell.appLauncher.maxHeight}px`,
        use: "Altura máxima com rolagem",
      },
    ],
  },
  {
    id: "content",
    title: "Área de conteúdo",
    rows: [
      {
        id: "max",
        token: "--shell-content-max-width",
        value: `${appShell.content.maxWidth}px`,
        use: "Largura máxima",
      },
      {
        id: "desktop",
        token: "--shell-content-padding-inline",
        value: `${appShell.content.paddingInline}px`,
        use: "Respiro desktop",
      },
      {
        id: "mobile",
        token: "--shell-content-padding-inline-mobile",
        value: `${appShell.content.paddingInlineMobile}px`,
        use: "Respiro mobile",
      },
    ],
  },
  {
    id: "header",
    title: "Cabeçalho de página",
    rows: [
      {
        id: "title",
        token: "--page-header-title-size",
        value: pageHeader.title,
        use: "Título padrão",
      },
      {
        id: "description",
        token: "--page-header-description-size",
        value: `${pageHeader.description}px`,
        use: "Descrição",
      },
      {
        id: "accent",
        token: "--page-header-accent-width",
        value: `${pageHeader.accentWidth}px`,
        use: "Traço âmbar",
      },
    ],
  },
];

const sidebarItems: SidebarNavItem[] = [
  { kind: "heading", id: "visao-geral", label: "Visão geral" },
  { id: "inicio", label: "Início", icon: <LayoutDashboard /> },
  { kind: "heading", id: "conhecimento", label: "Conhecimento" },
  { id: "biblioteca", label: "Biblioteca", icon: <BookOpen /> },
  { id: "documentos", label: "Documentos", icon: <FileText /> },
  { id: "trilhas", label: "Trilhas", icon: <FolderKanban /> },
];

const detailHeaderBadges = [{ label: "Ativa" }, { label: "6 módulos" }];

function TokenGroup({
  title,
  rows,
}: {
  title: string;
  rows: readonly TokenRow[];
}) {
  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4">
      <h3 className="font-display text-[length:var(--text-small)] font-semibold text-fg">
        {title}
      </h3>
      <dl className="mt-3 divide-y divide-[var(--line)]">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid gap-1 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <dt className="truncate font-mono text-[0.7rem] text-[var(--tone-action-fg)]">
                {row.token}
              </dt>
              <dd className="mt-0.5 text-[0.75rem] text-fg-subtle">
                {row.use}
              </dd>
            </div>
            <dd className="font-mono text-[0.75rem] text-fg">{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function ShellTokensSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {shellTokenGroups.map((group) => (
        <TokenGroup key={group.id} title={group.title} rows={group.rows} />
      ))}
    </div>
  );
}

function SidebarPatternSection() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState("inicio");

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div className="h-[520px] overflow-hidden rounded-[var(--radius-card)] border border-line shadow-[var(--shadow-card)]">
        <Sidebar
          items={sidebarItems}
          activeId={activeId}
          onSelect={setActiveId}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          logo={<Logo height={26} product="Normas" tone="inverse" />}
          logoCollapsed={<Logo height={26} symbolOnly tone="inverse" />}
        />
      </div>

      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Contrato da implementação V1.1</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-[length:var(--text-small)] leading-relaxed text-fg-muted">
            <p>
              Esta é a sidebar contextual: mesma superfície índigo, logo
              negativo do módulo, item ativo com filete âmbar e os mesmos
              estados de foco do App Shell.
            </p>
            <p>
              Ela recebe somente rotas do módulo. Produtos, perfil, ajuda e
              configurações pertencem ao rail global e à topbar. O recolhimento
              é persistido pelo produto em{" "}
              <span className="font-mono text-fg">dnex-sidebar-collapsed</span>.
            </p>
            <Badge tone="success">
              {collapsed ? "Contextual recolhida" : "Contextual expandida"}
            </Badge>
          </CardBody>
        </Card>
        <Button
          variant="secondary"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? "Expandir demonstração" : "Recolher demonstração"}
        </Button>
      </div>
    </div>
  );
}

function TopbarPatternSection() {
  return (
    <Demo
      label="Estrutura em três zonas"
      className="!block overflow-hidden !p-0"
    >
      <Topbar
        className="relative top-auto"
        left={<TopbarContext product="DNEX CRM" page="Receita" />}
        center={
          <Input
            leadingIcon={<Search />}
            aria-label="Pesquisar no módulo"
            placeholder="Pesquisar no módulo…"
            className="h-[var(--shell-topbar-search-height)]"
          />
        }
        right={
          <TopbarGlobalActions
            hub={<TopbarHubLink href="#app-shell-v2" />}
            help={
              <button
                type="button"
                aria-label="Abrir ajuda"
                className="grid h-[var(--shell-topbar-control-size)] w-[var(--shell-topbar-control-size)] place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg"
              >
                <CircleHelp className="h-4 w-4" aria-hidden="true" />
              </button>
            }
            settings={
              <button
                type="button"
                aria-label="Abrir configurações e pessoas"
                className="grid h-[var(--shell-topbar-control-size)] w-[var(--shell-topbar-control-size)] place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
              </button>
            }
            density={
              <button
                type="button"
                aria-label="Ajustar densidade"
                className="grid h-[var(--shell-topbar-control-size)] w-[var(--shell-topbar-control-size)] place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            }
            notifications={
              <button
                type="button"
                aria-label="Abrir notificações"
                className="grid h-[var(--shell-topbar-control-size)] w-[var(--shell-topbar-control-size)] place-items-center rounded-[10px] border border-line text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
            }
            account={<Avatar fallback="DN" size="sm" />}
          />
        }
      />
      <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-3">
        <p className="text-[0.76rem] leading-relaxed text-fg-muted">
          <strong className="text-fg">Esquerda:</strong> contexto do produto e
          navegação local.
        </p>
        <p className="text-[0.76rem] leading-relaxed text-fg-muted">
          <strong className="text-fg">Centro:</strong> busca global com largura
          limitada por token.
        </p>
        <p className="text-[0.76rem] leading-relaxed text-fg-muted">
          <strong className="text-fg">Direita:</strong> “Abrir Hub DNEX” abre o
          seletor rolável dos aplicativos contratados; ajuda e configurações
          gerais ficam aqui, antes de densidade, tema, alertas e conta.
        </p>
      </div>
    </Demo>
  );
}

function PageHeadersSection() {
  return (
    <div className="grid gap-5">
      <Demo label="Standard — páginas operacionais" className="!block">
        <PageHeader
          eyebrow="Central comercial"
          title="Receita"
          description="Pipeline, conversas, leads qualificados e performance comercial em uma única visão."
          actions={<Button size="sm">Nova oportunidade</Button>}
        />
      </Demo>

      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="Detail — registros e entidades" className="!block">
          <PageHeader
            variant="detail"
            eyebrow="Empresa cliente"
            title="DON Contabilidade"
            description="Identidade canônica e acessos do cliente."
            badges={detailHeaderBadges}
            actions={
              <Button size="sm" variant="secondary">
                Editar
              </Button>
            }
          />
        </Demo>

        <Demo label="Welcome — entrada de produto" className="!block">
          <PageHeader
            variant="welcome"
            eyebrow="Seu espaço DNEX"
            title="Olá, Pompílio."
            description="Escolha um sistema para continuar o trabalho."
          />
        </Demo>
      </div>

      <Demo label="Immersive — jornadas focadas" className="!block">
        <PageHeader
          variant="immersive"
          eyebrow="DNEX Aurora"
          title="Como você está hoje?"
          description="Uma experiência focada, sem perder a identidade estrutural do ecossistema."
        />
      </Demo>
    </div>
  );
}

function PageContainerPatternSection() {
  return (
    <Demo label="Largura e ritmo vertical canônicos" className="!block">
      <PageContainer className="rounded-[var(--radius-card)] border border-dashed border-[var(--line-strong)] bg-[var(--bg-subtle)] p-4">
        <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--tone-action-fg)]" aria-hidden="true" />
            <h3 className="font-display text-[length:var(--text-small)] font-semibold text-fg">
              Primeira seção da página
            </h3>
          </div>
          <p className="mt-2 text-[0.78rem] text-fg-muted">
            O contêiner limita a largura em 1500px e mantém o mesmo alinhamento
            do cabeçalho.
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4">
          <h3 className="font-display text-[length:var(--text-small)] font-semibold text-fg">
            Seção seguinte
          </h3>
          <p className="mt-2 text-[0.78rem] text-fg-muted">
            O espaçamento vertical vem de{" "}
            <span className="font-mono text-fg">--shell-section-gap</span>, sem
            valores próprios por módulo.
          </p>
        </div>
      </PageContainer>
    </Demo>
  );
}

/** Referência atual com exemplos V1.1 preservados em consulta de compatibilidade. */
export function ShellV11Showcase() {
  return (
    <>
      <Section
        id="shell-tokens"
        eyebrow="Biblioteca compartilhada · 1.2 RC"
        title="Tokens estruturais"
        description="Tokens canônicos do DS 1.2 RC, compartilhados pela biblioteca, pela prévia Experiência e pelo DNEX Contratos. Ajustes de layout evoluem primeiro neste contrato e depois são aplicados aos produtos."
      >
        <ShellTokensSection />
      </Section>

      <Section
        id="sidebar"
        eyebrow="Navegação principal"
        title="Sidebar contextual"
        description="Na nova prévia, a superfície suave reúne empresa, busca e páginas do módulo. Ajuda e notificações ficam na base da sidebar. O perfil fica no topo. No celular, esse conteúdo abre em um painel de navegação."
      >
        <a className="ds-reference-link" href="#experiencia">
          Ver o menu na experiência interativa →
        </a>
        <PreviousImplementation>
          <SidebarPatternSection />
        </PreviousImplementation>
      </Section>

      <Section
        id="app-shell-v2"
        eyebrow="Referência visual única"
        title="Do produto à tarefa, sem duplicidade"
        description="A faixa lateral escolhe o produto; o menu ao lado reúne páginas, busca, empresa, ajuda e notificações. A barra superior mantém contexto e perfil. Experiência e CRUD compartilham essa estrutura, com painel próprio no celular."
      >
        <a className="ds-reference-link" href="#experiencia">
          Abrir a referência visual do DNEX →
        </a>
      </Section>

      <Section
        id="topbar"
        eyebrow="Contexto e ações globais"
        title="Barra superior"
        description="Na prévia, a barra superior mostra o contexto e o perfil do usuário. Busca do módulo, ajuda e notificações pertencem à sidebar. No celular, o botão de menu abre a navegação e mantém o conteúdo com largura integral."
      >
        <a className="ds-reference-link" href="#experiencia">
          Ver a barra superior na experiência interativa →
        </a>
        <PreviousImplementation>
          <TopbarPatternSection />
        </PreviousImplementation>
      </Section>

      <Section
        id="page-headers"
        eyebrow="Hierarquia de página"
        title="Cabeçalhos"
        description="O traço âmbar, o contexto em caixa alta, o título, a descrição e as ações seguem o mesmo contrato. As variantes Standard, Detail, Welcome e Immersive cobrem páginas operacionais, registros, entradas de produto e jornadas focadas."
      >
        <PageHeadersSection />
      </Section>

      <Section
        id="page-container"
        eyebrow="Área útil"
        title="PageContainer"
        description="Contêiner canônico para páginas internas: largura máxima, alinhamento com o cabeçalho e ritmo vertical uniforme entre seções."
      >
        <PageContainerPatternSection />
      </Section>
    </>
  );
}
