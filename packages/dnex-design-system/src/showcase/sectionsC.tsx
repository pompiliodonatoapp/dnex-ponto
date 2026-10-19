import { Activity, Home, RotateCw, ShieldX, Sparkles, Wifi } from "lucide-react";

import { RadarChartDnex, Sparkline } from "../components/charts";
import { StatCard } from "../components/composed/StatCard";
import { EmptyState } from "../components/composed/EmptyState";
import { ErrorState } from "../components/composed/ErrorState";
import { Button } from "../components/primitives/Button";
import {
  Illustration404,
  Illustration500,
  IllustrationEmpty,
  IllustrationNoConnection,
  IllustrationNoPermission,
  IllustrationOnboarding,
  IllustrationSuccess,
} from "../components/illustrations";
import {
  breakpointScale,
  color,
  easingScale,
  elevationScale,
  motionScale,
  zIndexScale,
} from "../tokens/tokens";
import { Demo } from "./parts";

/* Dados ILUSTRATIVOS — não representam números reais de nenhuma empresa. */
const radarSaude = [
  { pilar: "Fiscal", atual: 88, meta: 95 },
  { pilar: "Folha", atual: 74, meta: 90 },
  { pilar: "Conciliação", atual: 92, meta: 95 },
  { pilar: "Documentos", atual: 65, meta: 85 },
  { pilar: "Apuração", atual: 81, meta: 90 },
  { pilar: "Obrigações", atual: 70, meta: 88 },
];

const spkReceita = [42, 48, 45, 51, 49, 58, 64, 62, 71];
const spkDespesa = [60, 58, 61, 57, 59, 55, 52, 54, 49];
const spkPlano = [30, 31, 30, 32, 31, 30, 31, 30, 31];

/* ════════════════════════════════════════════════════════════════════════════
   C1a — RADAR + SPARKLINE
   ════════════════════════════════════════════════════════════════════════════ */
export function RadarSparklineSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Demo label="RadarChart — saúde fiscal por pilar (atual × meta)" className="!block">
          <RadarChartDnex
            data={radarSaude}
            angleKey="pilar"
            max={100}
            series={[
              { dataKey: "atual", name: "Atual" },
              { dataKey: "meta", name: "Meta", color: color.amber[500] },
            ]}
            valueFormatter={(v) => `${v} pts`}
          />
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {[
              { n: "Atual", c: color.indigo[500] },
              { n: "Meta", c: color.amber[500] },
            ].map((m) => (
              <span key={m.n} className="inline-flex items-center gap-2 text-[0.8rem] text-fg-muted">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: m.c }} />
                {m.n}
              </span>
            ))}
          </div>
        </Demo>

        <Demo label="Sparkline — mini-tendência inline (em StatCard)" className="!block">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard
              label="Receita (7d)"
              value="R$ 71k"
              delta={12.4}
              deltaLabel="vs. semana"
              icon={<Sparkline data={spkReceita} variant="area" trend="auto" />}
            />
            <StatCard
              label="Despesa (7d)"
              value="R$ 49k"
              delta={-6.1}
              deltaLabel="vs. semana"
              icon={<Sparkline data={spkDespesa} variant="area" trend="auto" />}
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
            <table className="w-full text-left text-[length:var(--text-small)]">
              <thead>
                <tr className="border-b border-line [&>th]:px-4 [&>th]:py-2.5 [&>th]:text-[0.66rem] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-fg-subtle">
                  <th scope="col">Conta</th>
                  <th scope="col">Tendência</th>
                  <th scope="col" className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-line last:[&>tr]:border-0">
                <tr>
                  <td className="px-4 py-2.5 text-fg">Receita de serviços</td>
                  <td className="px-4 py-2.5"><Sparkline data={spkReceita} width={88} height={26} /></td>
                  <td className="px-4 py-2.5 text-right font-mono text-fg">R$ 71k</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-fg">Despesas operacionais</td>
                  <td className="px-4 py-2.5"><Sparkline data={spkDespesa} width={88} height={26} /></td>
                  <td className="px-4 py-2.5 text-right font-mono text-fg">R$ 49k</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-fg">Plano de contas fixo</td>
                  <td className="px-4 py-2.5"><Sparkline data={spkPlano} width={88} height={26} trend="neutral" /></td>
                  <td className="px-4 py-2.5 text-right font-mono text-fg">R$ 31k</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5">
            <span className="inline-flex flex-col items-start gap-1">
              <Sparkline data={spkReceita} trend="up" />
              <span className="font-mono text-[0.66rem] text-fg-subtle">trend up · area</span>
            </span>
            <span className="inline-flex flex-col items-start gap-1">
              <Sparkline data={spkDespesa} variant="area" trend="down" />
              <span className="font-mono text-[0.66rem] text-fg-subtle">trend down · area</span>
            </span>
            <span className="inline-flex flex-col items-start gap-1">
              <Sparkline data={spkPlano} trend="neutral" />
              <span className="font-mono text-[0.66rem] text-fg-subtle">neutral · line</span>
            </span>
          </div>
        </Demo>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   C1b — ILUSTRAÇÕES
   ════════════════════════════════════════════════════════════════════════════ */
const illos = [
  { C: IllustrationEmpty, name: "IllustrationEmpty", note: "Estado vazio" },
  { C: Illustration404, name: "Illustration404", note: "Rota não encontrada" },
  { C: Illustration500, name: "Illustration500", note: "Erro do servidor" },
  { C: IllustrationSuccess, name: "IllustrationSuccess", note: "Sucesso / concluído" },
  { C: IllustrationNoPermission, name: "IllustrationNoPermission", note: "Sem permissão" },
  { C: IllustrationNoConnection, name: "IllustrationNoConnection", note: "Sem conexão" },
  { C: IllustrationOnboarding, name: "IllustrationOnboarding", note: "Onboarding" },
] as const;

export function IllustrationsSection() {
  return (
    <div className="grid gap-6">
      {/* grade do set */}
      <Demo label="Set duotom (índigo + âmbar) — geométrico, em camadas, com o nexo da marca" className="!block">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {illos.map(({ C, name, note }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-5"
            >
              <C size={132} />
              <div className="text-center">
                <p className="font-display text-[0.86rem] font-semibold text-fg">{note}</p>
                <p className="mt-0.5 font-mono text-[0.66rem] text-fg-subtle">{`<${name} />`}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[0.78rem] leading-relaxed text-fg-subtle">
          Cada ilustração injeta seus próprios gradientes (IDs únicos via{" "}
          <span className="font-mono text-fg">useId</span>), reage ao tema pelas superfícies
          semânticas e aceita <span className="font-mono text-fg">size</span>,{" "}
          <span className="font-mono text-fg">className</span> e{" "}
          <span className="font-mono text-fg">title</span> (rótulo acessível; sem título =
          decorativa). Troque o tema no topo para ver dark ↔ light.
        </p>
      </Demo>

      {/* integração: EmptyState com ilustração */}
      <Demo label="EmptyState com ilustração (prop illustration)" className="!block">
        <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
          <EmptyState
            illustration={<IllustrationEmpty title="Nada por aqui ainda" />}
            title="Ainda sem lançamentos este mês"
            description="Quando você registrar o primeiro, ele aparece aqui — com o valor já no padrão fiscal."
            action={<Button leadingIcon={<Sparkles className="h-4 w-4" />}>Novo lançamento</Button>}
          />
        </div>
      </Demo>

      {/* integração: ErrorState reutilizável */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Demo label="ErrorState — 404" className="!block">
          <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
            <ErrorState
              illustration={<Illustration404 title="Página não encontrada" />}
              code="404"
              title="Essa página saiu do mapa"
              description="O endereço pode ter mudado. Vamos te levar de volta."
              action={<Button size="sm" leadingIcon={<Home className="h-4 w-4" />}>Início</Button>}
            />
          </div>
        </Demo>
        <Demo label="ErrorState — 500" className="!block">
          <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
            <ErrorState
              illustration={<Illustration500 title="Erro do servidor" />}
              code="500"
              title="Esse erro é nosso, não seu"
              description="Já estamos vendo isso. Tente de novo em instantes."
              action={<Button size="sm" leadingIcon={<RotateCw className="h-4 w-4" />}>Tentar de novo</Button>}
            />
          </div>
        </Demo>
        <Demo label="ErrorState — sem permissão" className="!block">
          <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
            <ErrorState
              illustration={<IllustrationNoPermission title="Sem permissão" />}
              title="Acesso restrito"
              description="Você não tem permissão para esta área. Fale com o administrador da conta."
              action={<Button size="sm" variant="secondary" leadingIcon={<ShieldX className="h-4 w-4" />}>Solicitar acesso</Button>}
            />
          </div>
        </Demo>
      </div>

      <Demo label="ErrorState — offline (com ação secundária)" className="!block">
        <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
          <ErrorState
            illustration={<IllustrationNoConnection title="Sem conexão" />}
            title="Você está sem conexão"
            description="Verifique sua internet — assim que voltar, sincronizamos tudo automaticamente."
            action={<Button size="sm" leadingIcon={<RotateCw className="h-4 w-4" />}>Reconectar</Button>}
            secondaryAction={<Button size="sm" variant="ghost" leadingIcon={<Wifi className="h-4 w-4" />}>Diagnóstico</Button>}
          />
        </div>
      </Demo>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   C1c — TOKENS / FOUNDATIONS (z-index, elevação, breakpoints, motion)
   ════════════════════════════════════════════════════════════════════════════ */
export function TokensFoundationsSection() {
  return (
    <div className="grid gap-6">
      {/* ELEVAÇÃO — amostras visuais empilhadas */}
      <Demo label="Elevação — níveis nomeados (reusam as sombras tingidas de índigo)" className="!block">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {elevationScale.map((e) => (
            <div key={e.level} className="flex flex-col items-center gap-2 text-center">
              <div
                className="grid h-20 w-20 place-items-center rounded-[var(--radius-card)] border border-line bg-[var(--surface)] font-mono text-[0.8rem] font-semibold text-fg"
                style={{ boxShadow: `var(${e.cssVar})` }}
              >
                {e.level}
              </div>
              <div>
                <p className="font-mono text-[0.66rem] text-fg">{e.cssVar}</p>
                <p className="mt-0.5 text-[0.66rem] leading-snug text-fg-subtle">{e.use}</p>
              </div>
            </div>
          ))}
        </div>
      </Demo>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Z-INDEX — pilha visual + tabela */}
        <Demo label="Z-index — escala de empilhamento" className="!block">
          <div className="relative mb-5 h-28">
            {zIndexScale.slice(1, 6).map((z, i) => (
              <div
                key={z.token}
                className="absolute top-0 grid h-16 w-28 place-items-center rounded-[var(--radius-control)] border border-line-strong bg-[var(--surface-2)] shadow-[var(--shadow-card)]"
                style={{ left: i * 34, top: i * 8, zIndex: i }}
              >
                <span className="font-mono text-[0.66rem] text-fg">{z.token}</span>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
            <table className="w-full text-left text-[length:var(--text-small)]">
              <thead>
                <tr className="border-b border-line [&>th]:px-3 [&>th]:py-2 [&>th]:text-[0.64rem] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-fg-subtle">
                  <th scope="col">Token</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Uso</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-line last:[&>tr]:border-0">
                {zIndexScale.map((z) => (
                  <tr key={z.token}>
                    <td className="px-3 py-2 font-mono text-fg">{z.token}</td>
                    <td className="px-3 py-2 font-mono text-fg-muted">{z.value}</td>
                    <td className="px-3 py-2 text-[0.78rem] text-fg-muted">{z.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Demo>

        {/* BREAKPOINTS — tabela */}
        <Demo label="Breakpoints — valores reais (Tailwind v4)" className="!block">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
            <table className="w-full text-left text-[length:var(--text-small)]">
              <thead>
                <tr className="border-b border-line [&>th]:px-3 [&>th]:py-2.5 [&>th]:text-[0.64rem] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-fg-subtle">
                  <th scope="col">Token</th>
                  <th scope="col">Mín.</th>
                  <th scope="col">Prefixo</th>
                  <th scope="col">Uso</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-line last:[&>tr]:border-0">
                {breakpointScale.map((b) => (
                  <tr key={b.token}>
                    <td className="px-3 py-2.5 font-mono text-fg">{b.token}</td>
                    <td className="px-3 py-2.5 font-mono text-fg-muted">{b.min}px</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-[var(--radius-pill)] bg-[rgba(79,70,229,0.16)] px-1.5 py-0.5 font-mono text-[0.7rem] text-indigo-300">
                        {b.prefix}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[0.78rem] text-fg-muted">{b.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Demo>
      </div>

      {/* MOTION — durações + easings */}
      <Demo label="Motion — durações e easings (com avareza, reduced-motion respeitado)" className="!block">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-fg-subtle">
              <Activity className="h-3.5 w-3.5" /> Durações
            </p>
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
              <table className="w-full text-left text-[length:var(--text-small)]">
                <tbody className="[&>tr]:border-b [&>tr]:border-line last:[&>tr]:border-0">
                  {motionScale.map((m) => (
                    <tr key={m.token}>
                      <td className="px-3 py-2.5 font-mono text-fg">{m.token}</td>
                      <td className="px-3 py-2.5 font-mono text-fg-muted">{m.ms}ms</td>
                      <td className="px-3 py-2.5 text-[0.76rem] text-fg-muted">{m.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-fg-subtle">
              Easings (cubic-bezier)
            </p>
            <div className="space-y-3">
              {easingScale.map((e) => (
                <div key={e.token} className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.8rem] text-fg">{e.token}</span>
                    <span className="font-mono text-[0.7rem] text-fg-subtle">
                      cubic-bezier({e.bezier.join(", ")})
                    </span>
                  </div>
                  <p className="mt-1 text-[0.76rem] text-fg-muted">{e.use}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Demo>
    </div>
  );
}
