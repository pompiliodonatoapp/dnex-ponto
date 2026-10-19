import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "../../lib/cn";
import { ProductGlyph } from "../brand/ProductGlyph";
import { AppLauncher, type DnexApp } from "./AppLauncher";
import { Popover, PopoverContent, PopoverTrigger } from "../composed/Popover";

export type TopbarGlobalActionsProps = {
  /**
   * @deprecated NÃO use junto com `center` na `Topbar`.
   *
   * Existia para quando a coluna central era `hidden lg:block`. Desde 27/08/2026 a `Topbar` mostra
   * o centro em toda largura, então passar os dois produz DUAS buscas lado a lado no celular —
   * medido no padrão que `dnex-fiscal` e `dnex-processos` usam hoje. Quem passa `center` deve
   * deixar este slot vazio.
   */
  mobileSearch?: ReactNode;
  /** Retorno ao Hub ou seletor rápido de produtos. */
  hub?: ReactNode;
  /** Ajuda global do produto. */
  help?: ReactNode;
  /** Preferências da conta e gestão de pessoas, sempre fora da sidebar contextual. */
  settings?: ReactNode;
  /** Controle de densidade visual. */
  density?: ReactNode;
  /** Controle de tema. */
  theme?: ReactNode;
  /** Central de notificações. */
  notifications?: ReactNode;
  /**
   * Itens dinâmicos vindos do control plane (já filtrados por direito), quando existirem.
   * Entram DEPOIS das ações fixas e no MESMO agrupamento — dois botões agrupadores na mesma barra
   * é o que se quer evitar.
   */
  extras?: readonly { key: string; label: string; node: ReactNode }[];
  /** Conta e perfil do usuário, sempre na última posição. */
  account?: ReactNode;
  className?: string;
};

/**
 * Ordem canônica das ações globais do ecossistema DNEX.
 * Ações específicas da página pertencem ao PageHeader, nunca a este grupo.
 */
export function TopbarGlobalActions({
  mobileSearch,
  hub,
  help,
  settings,
  density,
  theme,
  notifications,
  extras,
  account,
  className,
}: TopbarGlobalActionsProps) {
  const overflowActions: readonly (readonly [string, ReactNode])[] = [
    ["Hub DNEX", hub],
    ["Ajuda", help],
    ["Configurações", settings],
    ["Densidade", density],
    ["Tema", theme],
    ["Notificações", notifications],
    ...(extras ?? []).map((e) => [e.label, e.node] as const),
    // A conta entra por ÚLTIMO no agrupamento, respeitando a ordem canônica do DS. Diretriz do
    // dono (27/08/2026): *"o botão do usuário na versão mobile também pode ir para o ícone
    // sanduíche"*. Em tela estreita ela some da barra e reaparece aqui; de `lg:` para cima volta a
    // ficar solta, na última posição.
    ["Conta", account],
  ];

  return (
    <div
      className={cn("flex shrink-0 items-center justify-end gap-2", className)}
      role="group"
      aria-label="Ações globais"
    >
      {mobileSearch}
      <div className="hidden items-center gap-2 lg:contents">
        {hub}
        {help}
        {settings}
        {density}
        {theme}
        {notifications}
        {extras?.map((e) => <span key={e.key}>{e.node}</span>)}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Mais ações globais"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-line bg-surface text-fg-muted outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="z-[var(--z-overlay)] w-64 max-w-[calc(100vw-2rem)] p-2 lg:hidden">
          <p className="px-2 py-1 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-fg-subtle">
            Ações globais
          </p>
          <div className="mt-1 space-y-1">
            {overflowActions.map(([label, action]) => action && (
              <div
                key={label}
                className="flex min-h-10 flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] px-2 text-sm text-fg-muted hover:bg-[var(--surface-hover)]"
              >
                <span>{label}</span>
                <span className="min-w-0 max-w-full [&>*]:max-w-full">{action}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {account && <div className="hidden lg:block">{account}</div>}
    </div>
  );
}

/** Sessão do produto usada para emitir o código SSO de troca de módulo. */
export type DnexSsoSessao = { accessToken: string; refreshToken: string };

export type TopbarHubLinkProps = {
  href?: string;
  label?: string;
  className?: string;
  /**
   * Sessão do produto atual. Quando presente, a troca de módulo emite um
   * código SSO de uso único no PRÓPRIO produto (/api/platform/sso/issue →
   * Console) e navega direto ao destino — sem passar pela tela do Hub, e sem
   * pedir login de novo. Em erro ou ausência, cai no fluxo clássico
   * (hub.dnexsistemas.com.br/?launch=produto).
   */
  obterSessaoSso?: () => Promise<DnexSsoSessao | null>;
};

const HUB_URL = "https://hub.dnexsistemas.com.br";
const APPS_COOKIE = "dnex_apps";
const SSO_CODE_RE = /^[A-Za-z0-9_-]{43}$/;

type ContextoLancador = { contaId: string; produtos: Set<string> };

function origemDnexPermitida(url: URL) {
  if (url.protocol === "https:") {
    return url.hostname === "dnexsistemas.com.br" || url.hostname.endsWith(".dnexsistemas.com.br");
  }
  return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
}

function launchUrlValida(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor) return null;
  let url: URL;
  try {
    url = new URL(valor);
  } catch {
    return null;
  }
  if (!origemDnexPermitida(url) || url.username || url.password || url.search) return null;
  const fragmento = new URLSearchParams(url.hash.replace(/^#/, ""));
  const chaves = Array.from(fragmento.keys());
  const codigo = fragmento.get("dnex_sso_code") ?? "";
  const contratoOk = chaves.length === 2
    && fragmento.get("dnex_sso") === "1"
    && SSO_CODE_RE.test(codigo);
  return contratoOk ? url.toString() : null;
}

type ContextoPortal = {
  currentAccount?: { id?: unknown } | null;
  apps?: Array<{ key?: unknown }>;
  accounts?: Array<{ id?: unknown; panelAccess?: { canEnter?: unknown } }>;
  isAdmin?: unknown;
};

async function carregarContextoLancador(sessao: DnexSsoSessao): Promise<ContextoLancador | null> {
  const resposta = await fetch("/api/platform/context", {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Authorization: `Bearer ${sessao.accessToken}` },
  });
  if (!resposta.ok) return null;
  const payload = await resposta.json().catch(() => null) as ContextoPortal | null;
  const contaId = typeof payload?.currentAccount?.id === "string" ? payload.currentAccount.id : null;
  if (!contaId) return null;

  const produtos = new Set<string>();
  for (const app of payload?.apps ?? []) {
    if (typeof app?.key === "string") produtos.add(app.key);
  }
  const contaAtual = payload?.accounts?.find((conta) => conta?.id === contaId);
  if (contaAtual?.panelAccess?.canEnter === true || payload?.isAdmin === true) produtos.add("painel");
  return { contaId, produtos };
}

async function emitirLaunchUrlSso(
  sessao: DnexSsoSessao,
  contaId: string,
  productKey: string,
): Promise<string | null> {
  const resposta = await fetch("/api/platform/sso/issue", {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Authorization: `Bearer ${sessao.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accountId: contaId, productKey, refreshToken: sessao.refreshToken }),
  });
  if (!resposta.ok) return null;
  const payload = await resposta.json().catch(() => null) as { launchUrl?: unknown } | null;
  return launchUrlValida(payload?.launchUrl);
}

function gravarCookieApps(produtos: Set<string>) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (!window.location.hostname.endsWith("dnexsistemas.com.br")) return;
  document.cookie = `${APPS_COOKIE}=${encodeURIComponent(Array.from(produtos).join(","))}; Path=/; Domain=.dnexsistemas.com.br; Max-Age=3600; Secure; SameSite=Lax`;
}

const DNEX_APPS: DnexApp[] = [
  { id: "aurora", name: "DNEX Aurora", description: "Clima organizacional, rituais e apoio ao RH", icon: <ProductGlyph product="aurora" /> },
  { id: "contratos", name: "DNEX Contratos", description: "Geração e assinatura de contratos", icon: <ProductGlyph product="contratos" /> },
  { id: "normas", name: "DNEX Normas", description: "Gestão de normas e compliance", icon: <ProductGlyph product="normas" /> },
  { id: "crm", name: "DNEX CRM", description: "Relacionamento, funil comercial, atividades e comunicação", icon: <ProductGlyph product="crm" /> },
  { id: "processos", name: "DNEX Processos", description: "Fluxos, tarefas e obrigações", icon: <ProductGlyph product="processos" /> },
  { id: "metas", name: "DNEX Metas", description: "Indicadores, metas e desempenho", icon: <ProductGlyph product="metas" /> },
  { id: "fiscal", name: "DNEX Fiscal", description: "Apuração e inteligência fiscal", icon: <ProductGlyph product="fiscal" /> },
  { id: "painel", name: "DNEX Painel", description: "Administração da empresa, usuários, planos, departamentos e módulos", icon: <ProductGlyph product="painel" /> },
];

function currentProduct() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.split(".")[0] ?? "";
}

function contractedProducts() {
  if (typeof document === "undefined") return null;
  const rawValue = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${APPS_COOKIE}=`))
    ?.slice(APPS_COOKIE.length + 1);
  if (!rawValue) return null;

  const values = decodeURIComponent(rawValue).split(",").filter(Boolean);
  return values.length > 0 ? new Set(values) : null;
}

/**
 * Seletor canônico de produtos. Com `obterSessaoSso`, a troca de módulo é
 * direta (o produto emite o código SSO no Console); sem ela — ou em qualquer
 * falha — o Hub resolve entitlement e emite o SSO (fluxo clássico ?launch=).
 */
export function TopbarHubLink({
  href = HUB_URL,
  label = "Abrir Hub DNEX",
  className,
  obterSessaoSso,
}: TopbarHubLinkProps) {
  const activeProduct = currentProduct();
  const [contexto, setContexto] = useState<ContextoLancador | null>(null);
  const lancandoRef = useRef(false);

  useEffect(() => {
    if (!obterSessaoSso) return;
    let ativo = true;
    void (async () => {
      try {
        const sessao = await obterSessaoSso();
        if (!sessao) return;
        const carregado = await carregarContextoLancador(sessao);
        if (!ativo || !carregado) return;
        setContexto(carregado);
        gravarCookieApps(carregado.produtos);
      } catch {
        // Sem contexto autoritativo: o cookie/fallback continua valendo.
      }
    })();
    return () => {
      ativo = false;
    };
  }, [obterSessaoSso]);

  // FALHA FECHADA. Antes, `!allowedProducts` liberava a lista INTEIRA — e o ramo nulo é o caso
  // comum, não a exceção: primeira visita, cookie expirado (1h), host fora do domínio de produção,
  // cookies bloqueados, ou a busca do contexto falhando (o catch a engole). Ou seja, o default era
  // mostrar ao usuário produtos que ele não contratou. Sem contexto, agora não se mostra nada além
  // do produto em que a pessoa já está.
  const allowedProducts = contexto?.produtos ?? contractedProducts() ?? new Set<string>();
  const apps = DNEX_APPS
    .filter((app) => allowedProducts.has(app.id) || app.id === activeProduct)
    .map((app) => ({ ...app, current: app.id === activeProduct }));

  const abrirViaHub = (productId: string) => {
    const target = new URL(href, HUB_URL);
    target.pathname = "/";
    target.hash = "";
    target.search = new URLSearchParams({ launch: productId }).toString();
    window.location.assign(target.toString());
  };

  const lancar = async (productId: string) => {
    if (productId === activeProduct || lancandoRef.current) return;
    lancandoRef.current = true;
    try {
      if (obterSessaoSso) {
        const sessao = await obterSessaoSso();
        if (sessao) {
          const contaId = contexto?.contaId
            ?? (await carregarContextoLancador(sessao).catch(() => null))?.contaId;
          if (contaId) {
            const launchUrl = await emitirLaunchUrlSso(sessao, contaId, productId).catch(() => null);
            if (launchUrl) {
              window.location.assign(launchUrl);
              return;
            }
          }
        }
      }
      abrirViaHub(productId);
    } finally {
      lancandoRef.current = false;
    }
  };

  return (
    <span aria-label={label} title={label}>
      <AppLauncher
        apps={apps}
        align="end"
        className={cn(
          "border border-line bg-surface hover:bg-surface-raised",
          className,
        )}
        onLaunch={(productId) => void lancar(productId)}
      />
    </span>
  );
}
