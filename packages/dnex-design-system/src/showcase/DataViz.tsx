import { useId, useMemo, useState } from "react";
import { StatusPipelineDemo } from "./StatusPipelineDemo";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Table2,
  TrendingUp,
} from "lucide-react";

const colors = ["var(--dv-primary)", "var(--dv-secondary)", "var(--dv-amber)"];
const number = (value: number) => new Intl.NumberFormat("pt-BR").format(value);
const money = (value: number) => `R$ ${number(value)} mil`;
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
const monthly = months.map((month, index) => ({
  label: month,
  current: [82, 91, 78, 105, 118, 142][index],
  previous: [65, 72, 69, 80, 91, 108][index],
  expense: [61, 64, 59, 70, 73, 78][index],
}));
const quarterly = ["T1", "T2", "T3", "T4"].map((label, index) => ({
  label,
  current: [184, 238, 267, 365][index],
  previous: [163, 185, 225, 280][index],
  expense: [126, 153, 184, 231][index],
}));

function VizTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly {
    name?: string;
    value?: string | number;
    color?: string;
  }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ds-viz-tooltip">
      <strong>{label ?? "Distribuição"}</strong>
      {payload.map((item, index) => (
        <span key={`${item.name}-${index}`}>
          <i style={{ background: item.color || colors[index % 3] }} />
          {item.name}
          <b>
            {typeof item.value === "number" ? number(item.value) : item.value}
          </b>
        </span>
      ))}
    </div>
  );
}

/** Séries reais da demonstração, com escala e alternativa tabular acessível. */
export function TrendCard({
  activity = false,
  product = "Fiscal",
  period: outerPeriod,
  onPeriodChange,
}: {
  activity?: boolean;
  product?: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
}) {
  const gradient = `viz-${useId().replace(/:/g, "")}`;
  const [period, setPeriod] = useState("6 meses");
  const [comparison, setComparison] = useState(true);
  const [table, setTable] = useState(false);
  const selected = outerPeriod ?? period;
  const annual = selected === "12 meses" || selected === "Este trimestre";
  const data = useMemo(
    () =>
      activity
        ? (annual ? [54, 63, 81, 72, 98, 112] : [26, 42, 37, 65, 58, 86]).map(
            (current, index) => ({
              label: annual
                ? ["Jul 1", "Jul 2", "Ago 1", "Ago 2", "Set 1", "Set 2"][index]
                : ["01 set", "05 set", "09 set", "13 set", "17 set", "21 set"][
                    index
                  ],
              current,
              previous: Math.round(current * 0.76),
            }),
          )
        : annual
          ? quarterly
          : monthly,
    [activity, annual],
  );
  const total = data.reduce((sum, row) => sum + row.current, 0);
  const previousTotal = data.reduce((sum, row) => sum + row.previous, 0);
  const increase = ((total / previousTotal - 1) * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return (
    <article className="ds-viz ds-viz-trend">
      <header className="ds-viz-heading">
        <div>
          <p className="ds-viz-eyebrow">
            {activity ? `RITMO DO WORKSPACE · ${product}` : "VISÃO FINANCEIRA"}
          </p>
          <h3>
            {activity
              ? "O progresso ganha forma."
              : "Crescer, com perspectiva."}
          </h3>
        </div>
        <label className="ds-viz-period">
          <span className="sr-only">
            {activity
              ? "Período da atividade"
              : "Período do gráfico de receita"}
          </span>
          <select
            aria-label={
              activity
                ? "Período da atividade"
                : "Período do gráfico de receita"
            }
            value={selected}
            onChange={(event) =>
              onPeriodChange
                ? onPeriodChange(event.target.value)
                : setPeriod(event.target.value)
            }
          >
            {(activity
              ? ["Este mês", "Este trimestre"]
              : ["6 meses", "12 meses"]
            ).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      </header>
      <div className="ds-viz-summary">
        <div>
          <span>
            {activity ? "Atividades concluídas" : "Receita no período"}
          </span>
          <strong>
            {activity ? (
              number(total)
            ) : (
              <>
                R$ {number(total)}
                <small> mil</small>
              </>
            )}
          </strong>
        </div>
        <span className="ds-viz-trend-badge">
          <ArrowUpRight size={15} /> {increase}%<small>vs. comparação</small>
        </span>
      </div>
      <div className="ds-viz-legend">
        <span>
          <i />
          {activity ? "Atividade" : "Receita"}
        </span>
        <button
          type="button"
          aria-pressed={comparison}
          onClick={() => setComparison((value) => !value)}
        >
          <i className="ds-viz-previous-dot" />
          Comparação {comparison ? "visível" : "oculta"}
        </button>
      </div>
      <div
        className="ds-viz-canvas ds-viz-area"
        role="img"
        aria-label={`${activity ? "Atividades" : "Receita em milhares de reais"}, ${selected}. Total ${number(total)}. Dados ilustrativos; tabela disponível abaixo.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 16, right: 12, left: -17, bottom: 0 }}
            accessibilityLayer
          >
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--dv-primary)"
                  stopOpacity={0.23}
                />
                <stop
                  offset="95%"
                  stopColor="var(--dv-primary)"
                  stopOpacity={0.015}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--dv-grid)"
              strokeDasharray="3 6"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--dv-muted)", fontSize: 11 }}
              dy={9}
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--dv-muted)", fontSize: 10 }}
              tickCount={4}
              width={48}
              domain={[0, "auto"]}
            />
            <Tooltip
              content={<VizTooltip />}
              cursor={{ stroke: "var(--dv-secondary)", strokeDasharray: "4 4" }}
            />
            {comparison && (
              <Area
                type="monotone"
                dataKey="previous"
                name="Comparação"
                stroke="var(--dv-secondary)"
                strokeWidth={1.8}
                strokeDasharray="5 5"
                fill="transparent"
                isAnimationActive={false}
              />
            )}
            <Area
              type="monotone"
              dataKey="current"
              name={activity ? "Atividades" : "Receita (mil R$)"}
              stroke="var(--dv-primary)"
              strokeWidth={3}
              fill={`url(#${gradient})`}
              activeDot={{ r: 6, stroke: "var(--dv-surface)", strokeWidth: 3 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <footer className="ds-viz-footer">
        <span>
          Dados ilustrativos · {annual ? "visão ampliada" : "período atual"}
        </span>
        <button
          type="button"
          aria-expanded={table}
          onClick={() => setTable((value) => !value)}
        >
          <Table2 size={14} />
          {table ? "Ocultar dados" : "Ver dados"}
        </button>
      </footer>
      {table && (
        <div className="ds-viz-data">
          <table>
            <caption>
              {activity
                ? "Atividades por período"
                : "Receita por período, em milhares de reais"}
            </caption>
            <thead>
              <tr>
                <th>Período</th>
                <th>Atual</th>
                <th>Comparação</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{number(row.current)}</td>
                  <td>{number(row.previous)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function CompositionCard() {
  const [selected, setSelected] = useState<number | null>(null);
  const segments = [
    { name: "Serviços", value: 58 },
    { name: "Produtos", value: 27 },
    { name: "Recorrência", value: 15 },
  ];
  return (
    <article className="ds-viz ds-viz-composition">
      <header className="ds-viz-heading">
        <div>
          <p className="ds-viz-eyebrow">COMPOSIÇÃO</p>
          <h3>De onde vem o resultado.</h3>
        </div>
        <span className="ds-viz-corner-icon">
          <ArrowUpRight size={19} />
        </span>
      </header>
      <div className="ds-viz-donut-wrap">
        <div
          className="ds-viz-donut"
          role="img"
          aria-label="Composição: serviços 58%, produtos 27%, recorrência 15%."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="name"
                innerRadius="72%"
                outerRadius="92%"
                paddingAngle={5}
                cornerRadius={7}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {segments.map((segment, index) => (
                  <Cell
                    key={segment.name}
                    fill={colors[index]}
                    opacity={selected === null || selected === index ? 1 : 0.22}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="ds-viz-donut-center">
            <strong>
              {selected === null ? "100" : segments[selected].value}
              <small>%</small>
            </strong>
            <span>
              {selected === null ? "da receita" : segments[selected].name}
            </span>
          </div>
        </div>
      </div>
      <div className="ds-viz-composition-legend">
        {segments.map((segment, index) => (
          <button
            type="button"
            key={segment.name}
            aria-pressed={selected === index}
            onClick={() =>
              setSelected((value) => (value === index ? null : index))
            }
          >
            <i style={{ background: colors[index] }} />
            <span>{segment.name}</span>
            <strong>{segment.value}%</strong>
          </button>
        ))}
      </div>
      <p className="ds-viz-note">
        Toque em uma categoria para destacar sua participação.
      </p>
    </article>
  );
}

function CashflowCard() {
  const [metric, setMetric] = useState<"fluxo" | "saldo">("fluxo");
  const data = monthly.map((row) => ({
    ...row,
    balance: row.current - row.expense,
  }));
  return (
    <article className="ds-viz">
      <header className="ds-viz-heading">
        <div>
          <p className="ds-viz-eyebrow">EQUILÍBRIO</p>
          <h3>Entradas com intenção.</h3>
        </div>
        <div className="ds-viz-switch" aria-label="Visualização do fluxo">
          {["fluxo", "saldo"].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={metric === value}
              onClick={() => setMetric(value as "fluxo" | "saldo")}
            >
              {value === "fluxo" ? "Fluxo" : "Saldo"}
            </button>
          ))}
        </div>
      </header>
      <div className="ds-viz-inline-stats">
        <div>
          <span>
            <ArrowUpRight size={14} />
            Entradas
          </span>
          <strong>
            {money(monthly.reduce((sum, row) => sum + row.current, 0))}
          </strong>
        </div>
        <div>
          <span>
            <ArrowDownRight size={14} />
            Saídas
          </span>
          <strong>
            {money(monthly.reduce((sum, row) => sum + row.expense, 0))}
          </strong>
        </div>
      </div>
      <div
        className="ds-viz-canvas"
        role="img"
        aria-label={`Fluxo ilustrativo em milhares de reais, visão ${metric}. Entradas e saídas por mês.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={4}
            margin={{ top: 12, right: 6, left: -17, bottom: 0 }}
            accessibilityLayer
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--dv-grid)"
              strokeDasharray="3 6"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--dv-muted)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={48}
              tickCount={4}
              tick={{ fill: "var(--dv-muted)", fontSize: 10 }}
            />
            <Tooltip
              content={<VizTooltip />}
              cursor={{ fill: "var(--dv-soft)" }}
            />
            {/* Direct series avoid Fragment detection incompatibility with this React 19 / Recharts 2 runtime. */}
            {metric === "fluxo" && (
              <Bar
                dataKey="current"
                name="Entradas (mil R$)"
                fill="var(--dv-primary)"
                radius={[5, 5, 0, 0]}
                maxBarSize={22}
                isAnimationActive={false}
              />
            )}
            {metric === "fluxo" && (
              <Bar
                dataKey="expense"
                name="Saídas (mil R$)"
                fill="var(--dv-secondary)"
                radius={[5, 5, 0, 0]}
                maxBarSize={22}
                isAnimationActive={false}
              />
            )}
            {metric === "saldo" && (
              <Bar
                dataKey="balance"
                name="Saldo (mil R$)"
                fill="var(--dv-primary)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
                isAnimationActive={false}
              />
            )}
            <ReferenceLine y={0} stroke="var(--dv-grid)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="ds-viz-legend">
        <span>
          <i />
          {metric === "saldo" ? "Saldo líquido" : "Entradas"}
        </span>
        {metric === "fluxo" && (
          <span>
            <i className="ds-viz-previous-dot" />
            Saídas
          </span>
        )}
        <span className="ds-viz-unit">mil R$ · exemplo</span>
      </div>
      <details className="ds-viz-data">
        <summary>Consultar valores</summary>
        <table>
          <caption>Fluxo de caixa ilustrativo (mil R$)</caption>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.current}</td>
                <td>{row.expense}</td>
                <td>{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </article>
  );
}

function GoalsCard() {
  const items = [
    { name: "Conciliação", value: 92 },
    { name: "Apuração", value: 68 },
    { name: "Folha", value: 81 },
  ];
  return (
    <article className="ds-viz ds-viz-goals">
      <header className="ds-viz-heading">
        <div>
          <p className="ds-viz-eyebrow">PROGRESSO</p>
          <h3>O próximo marco, à vista.</h3>
        </div>
        <TrendingUp size={20} />
      </header>
      <div className="ds-viz-goal-total">
        <strong>
          80,3<small>%</small>
        </strong>
        <p>
          Média de conclusão
          <br />
          <span>3 frentes em acompanhamento</span>
        </p>
      </div>
      {items.map((item, index) => (
        <div className="ds-viz-goal" key={item.name}>
          <div>
            <span>{item.name}</span>
            <strong>{item.value}%</strong>
          </div>
          <div
            className="ds-viz-goal-track"
            role="progressbar"
            aria-label={item.name}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.value}
          >
            <i style={{ width: `${item.value}%`, background: colors[index] }} />
            <span />
          </div>
          <small>
            {item.value >= 80
              ? "Acima do marco de 80%"
              : "12 pontos até o próximo marco"}
          </small>
        </div>
      ))}
      <footer className="ds-viz-footer">
        <span>O marcador indica o marco de 80%.</span>
      </footer>
    </article>
  );
}

function RadarCard() {
  const data = [
    { subject: "Precisão", score: 92 },
    { subject: "Agilidade", score: 76 },
    { subject: "Cobertura", score: 88 },
    { subject: "Consistência", score: 94 },
    { subject: "Adoção", score: 68 },
  ];
  return (
    <article className="ds-viz">
      <header className="ds-viz-heading">
        <div>
          <p className="ds-viz-eyebrow">VISÃO MULTIDIMENSIONAL</p>
          <h3>Forças que se complementam.</h3>
        </div>
      </header>
      <div
        className="ds-viz-canvas ds-viz-radar"
        role="img"
        aria-label="Índice ilustrativo: precisão 92, agilidade 76, cobertura 88, consistência 94, adoção 68."
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="69%">
            <PolarGrid stroke="var(--dv-grid)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "var(--dv-muted)", fontSize: 10 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Índice"
              dataKey="score"
              stroke="var(--dv-primary)"
              strokeWidth={2.5}
              fill="var(--dv-primary)"
              fillOpacity={0.14}
              isAnimationActive={false}
            />
            <Tooltip content={<VizTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="ds-viz-radar-values">
        {data.map((item) => (
          <span key={item.subject}>
            {item.subject} <b>{item.score}</b>
          </span>
        ))}
      </div>
    </article>
  );
}

function FunnelCard() {
  const stages = [
    { label: "Visitantes", value: 4200 },
    { label: "Leads", value: 1850 },
    { label: "Propostas", value: 620 },
    { label: "Clientes", value: 198 },
  ];
  return (
    <article className="ds-viz">
      <header className="ds-viz-heading">
        <div>
          <p className="ds-viz-eyebrow">CONVERSÃO</p>
          <h3>Da intenção à relação.</h3>
        </div>
        <span className="ds-viz-small-total">
          4,7%<small>ponta a ponta</small>
        </span>
      </header>
      <ol className="ds-viz-funnel">
        {stages.map((stage, index) => (
          <li key={stage.label}>
            <div>
              <span>
                <small>0{index + 1}</small>
                {stage.label}
              </span>
              <strong>{number(stage.value)}</strong>
            </div>
            <div className="ds-viz-funnel-track">
              <i
                style={{
                  width: `${(stage.value / 4200) * 100}%`,
                  background:
                    index === 3 ? "var(--dv-amber)" : "var(--dv-primary)",
                  opacity: 1 - index * 0.15,
                }}
              />
            </div>
            <p>
              {index === 0
                ? "100% da base"
                : `${((stage.value / stages[index - 1].value) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% da etapa anterior`}
            </p>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function DataVizGallery() {
  return (
    <div className="ds-viz-gallery">
      <div className="ds-viz-editorial">
        <p>
          Menos ruído.
          <br />
          <strong>Mais leitura do que importa.</strong>
        </p>
        <span>
          Uma linguagem de dados feita para comparar,
          <br />
          entender e decidir. Exemplos ilustrativos.
        </span>
      </div>
      <div className="ds-viz-grid ds-viz-grid-feature">
        <TrendCard />
        <CompositionCard />
      </div>
      <StatusPipelineDemo />
      <div className="ds-viz-grid">
        <CashflowCard />
        <GoalsCard />
      </div>
      <div className="ds-viz-grid">
        <RadarCard />
        <FunnelCard />
      </div>
    </div>
  );
}
