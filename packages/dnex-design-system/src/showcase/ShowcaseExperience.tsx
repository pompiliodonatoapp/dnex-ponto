import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as PreviewDialog from "@radix-ui/react-dialog";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  ClipboardCheck,
  Copy,
  FileText,
  Files,
  LayoutDashboard,
  ListFilter,
  Menu,
  Plus,
  PenLine,
  ReceiptText,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Logo, DnexSymbol } from "../components/brand/Logo";
import { Button } from "../components/primitives/Button";
import { Badge } from "../components/primitives/Badge";
import { Input } from "../components/primitives/Input";
import { Dialog, DialogContent } from "../components/composed/Dialog";
import { DensityToggle } from "../components/composed/DensityToggle";
import { ThemeToggle } from "./parts";
import { PreviewShell } from "./PreviewShell";
const TrendCard = lazy(() =>
  import("./DataViz").then((module) => ({ default: module.TrendCard })),
);

export type ShowcaseGroup = {
  title: string;
  items: { id: string; label: string }[];
};

export function ShowcaseHeader({ groups }: { groups: ShowcaseGroup[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const items = useMemo(
    () =>
      groups.flatMap((g) =>
        g.items.map((item) => ({ ...item, group: g.title })),
      ),
    [groups],
  );
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  const results = items.filter((item) =>
    normalize(`${item.label} ${item.group}`).includes(normalize(query)),
  );
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);
  return (
    <>
      <a href="#conteudo" className="ds-skip">
        Pular para o conteúdo
      </a>
      <header className="ds-header">
        <div className="container-dnex ds-header-inner">
          <a
            href="#inicio"
            aria-label="DNEX Design System — início"
            className="ds-header-brand"
          >
            <Logo height={30} />
            <span>Design System</span>
          </a>
          <nav className="ds-top-links" aria-label="Navegação principal">
            <a href="#experiencia">Experiência</a>
            <a href="#foundations">Foundations</a>
            <a href="#primitivos">Componentes</a>
          </nav>
          <div className="ds-header-actions">
            <button
              type="button"
              className="ds-search-trigger"
              onClick={() => {
                setQuery("");
                setOpen(true);
              }}
              aria-label="Buscar no design system"
            >
              <Search size={16} />
              <span>Buscar no DS</span>
              <kbd>⌘ K</kbd>
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="ds-mobile-menu"
              aria-label="Abrir índice de seções"
              onClick={() => {
                setQuery("");
                setOpen(true);
              }}
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Encontre seu próximo componente"
          description="Navegue por foundations, padrões e telas do DNEX."
          className="ds-search-dialog"
        >
          <label className="sr-only" htmlFor="ds-search">
            Buscar seções
          </label>
          <Input
            id="ds-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Experimente: botões, dados, sidebar…"
            autoComplete="off"
          />
          <div className="ds-search-results" aria-label="Resultados da busca">
            {results.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
              >
                <span>
                  <small>{item.group}</small>
                  {item.label}
                </span>
                <ArrowUpRight size={17} />
              </a>
            ))}
            {!results.length && (
              <p className="ds-search-empty" role="status">
                Nenhuma seção encontrada. Tente outro termo.
              </p>
            )}
          </div>
          <p className="ds-search-hint">
            Tab para navegar · Enter para abrir · Esc para fechar
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ShowcaseIndex({ groups }: { groups: ShowcaseGroup[] }) {
  const [active, setActive] = useState("foundations");
  useEffect(() => {
    const ids = groups.flatMap((group) => group.items.map((item) => item.id));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    ids.forEach((id) => {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });
    return () => observer.disconnect();
  }, [groups]);
  return (
    <aside className="ds-index">
      <nav aria-label="Índice do catálogo">
        <div className="ds-index-heading">
          <span className="ds-live-dot" />
          BIBLIOTECA VIVA
        </div>
        {groups.map((group) => (
          <div className="ds-index-group" key={group.title}>
            <p>{group.title}</p>
            {group.items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active === item.id ? "location" : undefined}
              >
                <span>{item.label}</span>
                {active === item.id && <span className="ds-index-mark" />}
              </a>
            ))}
          </div>
        ))}
        <a className="ds-index-top" href="#inicio">
          Voltar ao início <ArrowUpRight size={13} />
        </a>
      </nav>
    </aside>
  );
}

function BrandSpecimen() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText("#4F46E5");
      setCopied(true);
      setCopyError(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div
      className="ds-specimen"
      aria-label="Identidade visual DNEX: tipografia e cor"
    >
      <div className="ds-specimen-top">
        <span>DNA / DNEX</span>
        <span>01 — 03</span>
      </div>
      <div className="ds-specimen-grid">
        <div className="ds-type-tile">
          <span className="ds-tile-label">01 / EXPRESSÃO</span>
          <span className="ds-type-sample">
            Aa<span>↗</span>
          </span>
          <div>
            <strong>Space Grotesk</strong>
            <small>Personalidade que orienta.</small>
          </div>
        </div>
        <button
          type="button"
          onClick={copy}
          className="ds-color-tile"
          aria-label="Copiar cor índigo #4F46E5"
        >
          <span className="ds-tile-label">
            02 / INTENÇÃO {copied ? <Check size={15} /> : <Copy size={14} />}
          </span>
          <DnexSymbol size={84} tone="inverse" />
          <span>
            <strong>{copied ? "Copiado!" : "Índigo DNEX"}</strong>
            <small>{copyError ? "Selecione: #4F46E5" : "#4F46E5 · Ação"}</small>
          </span>
        </button>
        <div className="ds-detail-tile">
          <div>
            <span className="ds-tile-label">03 / EQUILÍBRIO</span>
            <p>
              Precisão encontra
              <br />
              <strong>personalidade.</strong>
            </p>
          </div>
          <div
            className="ds-palette-bars"
            aria-label="Índigo, lavanda, branco e âmbar"
          >
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className="ds-specimen-bottom">
        <span>Uma identidade. Infinitas possibilidades.</span>
        <span className="ds-small-nexus" />
      </div>
      <span className="sr-only" role="status">
        {copied
          ? "Cor #4F46E5 copiada."
          : copyError
            ? "Não foi possível copiar. A cor é #4F46E5."
            : ""}
      </span>
    </div>
  );
}

const products = [
  {
    key: "fiscal",
    name: "Fiscal",
    tagline: "Cada obrigação, no seu tempo.",
    nav: ["Visão geral", "Documentos fiscais", "Obrigações", "Apurações"],
    icons: [LayoutDashboard, ReceiptText, CalendarClock, Calculator],
    metric: "Documentos processados",
    total: "1.284",
    secondary: "Obrigações no prazo",
    value: "98,6%",
    table: "Documentos recentes",
    rows: [
      "NF-e · Serviços de tecnologia",
      "NFS-e · Consultoria empresarial",
      "NF-e · Materiais de escritório",
    ],
    statuses: ["Validado", "Em análise", "Validado"],
  },
  {
    key: "contratos",
    name: "Contratos",
    tagline: "Boas relações começam com clareza.",
    nav: ["Visão geral", "Meus contratos", "Assinaturas", "Modelos"],
    icons: [LayoutDashboard, FileText, PenLine, Files],
    metric: "Contratos ativos",
    total: "128",
    secondary: "Assinaturas concluídas",
    value: "94,2%",
    table: "Contratos recentes",
    rows: [
      "Prestação de serviços · Tecnologia",
      "Contrato de consultoria",
      "Acordo de confidencialidade",
    ],
    statuses: ["Assinado", "Em análise", "Assinado"],
  },
  {
    key: "metas",
    name: "Metas",
    tagline: "O próximo passo, sempre à vista.",
    nav: ["Visão geral", "Objetivos", "Check-ins", "Resultados"],
    icons: [LayoutDashboard, Target, ClipboardCheck, ChartNoAxesCombined],
    metric: "Objetivos em andamento",
    total: "24",
    secondary: "Evolução do trimestre",
    value: "76,8%",
    table: "Objetivos do trimestre",
    rows: [
      "Elevar a satisfação dos clientes",
      "Reduzir o tempo de atendimento",
      "Ampliar receita recorrente",
    ],
    statuses: ["No ritmo", "Atenção", "No ritmo"],
  },
] as const;

/** Dados fictícios e estado local. Esta prévia não executa operações de negócio. */
function ProductPreview() {
  const createTrigger = useRef<HTMLButtonElement | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const [view, setView] = useState(0);
  const [period, setPeriod] = useState("Este mês");
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [records, setRecords] = useState<{ title: string; product: number }[]>(
    [],
  );
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState(false);
  const product = products[productIndex];
  const rows = [
    ...records
      .filter((row) => row.product === productIndex)
      .map((row) => ({ title: row.title, status: "Rascunho" })),
    ...product.rows.map((title, i) => ({ title, status: product.statuses[i] })),
  ].filter(
    (row) =>
      row.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()) &&
      (!filter || ["Em análise", "Atenção", "Rascunho"].includes(row.status)),
  );
  return (
    <section
      id="experiencia"
      className="ds-experience"
      aria-labelledby="experience-title"
    >
      <div className="ds-experience-heading">
        <div>
          <p className="ds-eyebrow">
            <span />
            DESIGN QUE CONECTA
          </p>
          <h2 id="experience-title">
            Vários produtos. <span>Uma só experiência.</span>
          </h2>
        </div>
        <p>
          Escolha o produto no menu. Explore os detalhes.
          <br />
          Sinta a consistência.
        </p>
      </div>
      <div className="ds-preview-toolbar">
        <p className="ds-preview-context">
          <strong>DNEX {product.name}</strong>
          <span>Troque o produto pelo menu</span>
        </p>
        <span className="ds-preview-tag">
          <span className="ds-live-dot" />
          PRÉVIA INTERATIVA
        </span>
      </div>
      <PreviewShell
        product={product}
        products={products}
        onProductChange={(index) => {
          setProductIndex(index);
          setView(0);
          setQuery("");
          setFilter(false);
          setNotice("");
        }}
        navigation={product.nav.map((label, index) => ({
          label,
          icon: product.icons[index],
        }))}
        active={view}
        onNavigate={(index) => {
          setView(index);
          setFilter(index === 2);
        }}
        label="Experiência interativa DNEX"
      >
        <div className="ds-product-content">
          <div className="ds-dashboard-heading">
            <div>
              <p>SEU DIA, COM CLAREZA</p>
              <h3>{view === 0 ? "Tudo no seu lugar." : product.nav[view]}</h3>
              <span>{product.tagline}</span>
            </div>
            <Button
              ref={createTrigger}
              size="sm"
              leadingIcon={<Plus size={15} />}
              onClick={() => {
                setTitle("");
                setNewOpen(true);
              }}
            >
              Criar exemplo
            </Button>
          </div>
          {notice && (
            <div className="ds-preview-notice" role="status">
              <Check size={16} />
              <span>{notice}</span>
              <button
                aria-label="Dispensar aviso"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {view === 0 && (
            <>
              <div className="ds-metrics">
                <div className="ds-metric-primary">
                  <span>
                    {product.metric}
                    <ArrowUpRight size={16} />
                  </span>
                  <strong>
                    {period === "Este mês"
                      ? product.total
                      : ["3.852", "384", "72"][productIndex]}
                  </strong>
                  <small>
                    <span>↗ 12,8%</span> vs. período anterior
                  </small>
                  <svg viewBox="0 0 170 60" aria-hidden="true">
                    <path d="M0 50 L18 43 L34 46 L49 31 L67 35 L85 22 L104 26 L122 12 L139 16 L168 3" />
                  </svg>
                </div>
                <div className="ds-metric">
                  <span>
                    {product.secondary}
                    <span className="ds-success-dot" />
                  </span>
                  <strong>{product.value}</strong>
                  <small>Um bom ritmo para continuar.</small>
                  <div className="ds-metric-track">
                    <i style={{ width: product.value.replace(",", ".") }} />
                  </div>
                </div>
                <div className="ds-metric ds-focus-metric">
                  <span>
                    Próxima melhor ação
                    <Sparkles size={16} />
                  </span>
                  <strong>
                    {["03", "05", "02"][productIndex]} <em>pendências</em>
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
                      setView(2);
                      setFilter(true);
                    }}
                  >
                    Revisar agora <ArrowRight size={15} />
                  </button>
                  <span className="ds-focus-decoration" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="ds-viz ds-viz-loading" role="status">
                    Preparando a visualização dos dados…
                  </div>
                }
              >
                <TrendCard
                  activity
                  product={product.name}
                  period={period}
                  onPeriodChange={setPeriod}
                />
              </Suspense>
            </>
          )}
          <div className="ds-records">
            <div className="ds-records-heading">
              <h4>
                {view === 3
                  ? productIndex === 2
                    ? "Resultados em acompanhamento"
                    : "Exemplos do workspace"
                  : product.table}
              </h4>
              <div>
                <label className="ds-record-search">
                  <Search size={14} />
                  <input
                    aria-label="Filtrar registros da demonstração"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar…"
                  />
                </label>
                <button
                  type="button"
                  aria-label="Mostrar somente pendentes"
                  aria-pressed={filter}
                  onClick={() => setFilter(!filter)}
                >
                  <ListFilter size={16} />
                </button>
              </div>
            </div>
            <div className="ds-record-list">
              {rows.map((row, i) => (
                <div className="ds-record-row" key={`${row.title}-${i}`}>
                  <span className="ds-file-icon">
                    <FileText size={16} />
                  </span>
                  <span>
                    {row.title}
                    <small>
                      Workspace demonstrativo · {period.toLowerCase()}
                    </small>
                  </span>
                  <Badge
                    tone={
                      ["Em análise", "Atenção", "Rascunho"].includes(row.status)
                        ? "warning"
                        : "success"
                    }
                    dot
                  >
                    {row.status}
                  </Badge>
                </div>
              ))}
              {!rows.length && (
                <p className="ds-no-records">
                  Nenhum registro encontrado. Ajuste a busca ou o filtro.
                </p>
              )}
            </div>
          </div>
        </div>
      </PreviewShell>
      <div className="ds-preview-caption">
        <span>
          <i /> Navegação global <b>+</b> navegação do produto <b>+</b> seu
          espaço de trabalho
        </span>
        <span>Dados fictícios · alterações apenas nesta prévia</span>
      </div>
      <PreviewDialog.Root open={newOpen} onOpenChange={setNewOpen}>
        <PreviewDialog.Portal>
          <PreviewDialog.Overlay className="ds-wb-overlay" />
          <PreviewDialog.Content
            className="ds-wb-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              createTrigger.current?.focus();
            }}
          >
            <div className="ds-wb-dialog-heading">
              <div>
                <PreviewDialog.Title>{`Novo exemplo · ${product.name}`}</PreviewDialog.Title>
                <PreviewDialog.Description>
                  Este registro existe apenas nesta prévia. Nenhum dado será
                  enviado ao servidor.
                </PreviewDialog.Description>
              </div>
              <PreviewDialog.Close aria-label="Fechar formulário">
                <X size={21} />
              </PreviewDialog.Close>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim()) return;
                setRecords((current) => [
                  { title: title.trim(), product: productIndex },
                  ...current,
                ]);
                setNewOpen(false);
                setView(1);
                setQuery("");
                setFilter(false);
                setNotice(
                  "Exemplo criado nesta sessão. Nenhum dado foi enviado ao servidor.",
                );
              }}
              className="ds-example-form"
            >
              <label htmlFor="example-title">Nome do registro</label>
              <Input
                id="example-title"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Contrato de consultoria"
              />
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setNewOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={!title.trim()}>
                  Criar exemplo
                </Button>
              </div>
            </form>
          </PreviewDialog.Content>
        </PreviewDialog.Portal>
      </PreviewDialog.Root>
    </section>
  );
}

export function ShowcaseOverview() {
  return (
    <>
      <section className="ds-hero" id="inicio" aria-labelledby="hero-title">
        <div className="ds-hero-copy">
          <p className="ds-eyebrow">
            <span /> O DESIGN QUE NOS CONECTA{" "}
            <span className="ds-edition">@dnex/ds · 1.2 RC</span>
          </p>
          <h1 id="hero-title">
            Clareza em
            <br />
            cada{" "}
            <span>
              detalhe<span className="ds-title-dot">.</span>
            </span>
          </h1>
          <p className="ds-hero-description">
            Da primeira interação à próxima grande decisão.
            <br className="ds-desktop-break" /> Uma linguagem de design para
            todo o universo DNEX.
          </p>
          <div className="ds-hero-actions">
            <Button asChild size="lg" trailingIcon={<ArrowRight size={17} />}>
              <a href="#experiencia">Conheça a experiência</a>
            </Button>
            <a className="ds-text-link" href="#foundations">
              Explore a biblioteca <ArrowDown size={16} />
            </a>
          </div>
          <div className="ds-hero-note">
            <span>FEITO DE CONEXÕES.</span>
            <span>PENSADO PARA PESSOAS.</span>
          </div>
        </div>
        <BrandSpecimen />
      </section>
      <div className="ds-principles">
        <div>
          <span>01</span>
          <p>
            <strong>Clareza que orienta.</strong> Hierarquia antes de decoração.
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            <strong>Consistência que conecta.</strong> Uma linguagem entre
            produtos.
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            <strong>Detalhes que acolhem.</strong> Interações feitas para
            pessoas.
          </p>
        </div>
      </div>
      <ProductPreview />
      <section className="ds-library-intro" id="conteudo">
        <div>
          <p className="ds-eyebrow">
            <span /> ANATOMIA DA EXPERIÊNCIA
          </p>
          <h2>
            Um sistema.
            <br />
            <span>Cada peça importa.</span>
          </h2>
        </div>
        <div>
          <p>
            Cor, tipografia, componentes e padrões.
            <br />
            Explore a biblioteca e experimente cada detalhe,
            <br className="ds-desktop-break" /> do menor botão à interface
            completa.
          </p>
          <div className="ds-library-controls">
            <a className="ds-text-link" href="#primitivos">
              Ir para componentes <ArrowDown size={16} />
            </a>
            <DensityToggle />
          </div>
        </div>
      </section>
    </>
  );
}

export function ShowcaseFooter() {
  return (
    <footer className="ds-footer">
      <div className="container-dnex">
        <div className="ds-footer-main">
          <div>
            <Logo height={34} />
            <h2>
              O próximo detalhe
              <br />
              faz toda a diferença<span>.</span>
            </h2>
          </div>
          <a
            className="ds-footer-link"
            href="#inicio"
            aria-label="Voltar ao início do design system"
          >
            <ArrowUpRight size={32} />
          </a>
        </div>
        <div className="ds-footer-bottom">
          <span>DESIGN SYSTEM · PRÉVIA VISUAL</span>
          <span>Índigo na essência. Âmbar no nexo.</span>
          <span>@dnex/ds · 1.2.0-rc.1</span>
        </div>
      </div>
    </footer>
  );
}
