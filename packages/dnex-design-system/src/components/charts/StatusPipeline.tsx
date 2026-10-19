import { useId, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ArrowRight, Banknote, ChevronDown, Layers3, ListFilter } from "lucide-react";

export type StatusPipelineFiltersProps = {
  label: string;
  value: string;
  options: { value: string; label: string; icon?: ReactNode }[];
  onChange: (value: string) => void;
  select?: {
    label: string;
    caption?: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  };
};

/** Shared inventory controls. Keep business state in the consumer, visual hierarchy in the DS. */
export function StatusPipelineFilters({ label, value, options, onChange, select }: StatusPipelineFiltersProps) {
  return <div className="dnex-pipeline-filters">
    <div className="dnex-pipeline-scope" role="group" aria-label={label}>
      {options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
        {option.icon && <span aria-hidden="true">{option.icon}</span>}{option.label}
      </button>)}
    </div>
    {select && <label className="dnex-pipeline-select">
      <span>{select.caption ?? "Tipo"}</span>
      <span className="dnex-pipeline-select-field">
        <select aria-label={select.label} value={select.value} onChange={(event) => select.onChange(event.target.value)}>
          {select.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" />
      </span>
    </label>}
  </div>;
}

export type StatusPipelineStage = {
  id: string;
  label: string;
  description?: string;
  count: number;
  /** Integer minor units (centavos for BRL). Do not mix annual, monthly and nominal totals. */
  valueCents: number;
  unpricedCount?: number;
  tone?: "neutral" | "action" | "success" | "warning" | "danger";
  group?: "main" | "exit";
};
export type StatusPipelineProps = {
  stages: StatusPipelineStage[];
  title?: string;
  description: string;
  valueLabel: string;
  valueNote?: string;
  controls?: ReactNode;
  insight?: ReactNode;
  onStageSelect?: (id: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  valueFormatter?: (cents: number) => string;
};

const quantity = (n: number) => n.toLocaleString("pt-BR");
const money = (n: number) => (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Exclusive status distribution, NOT a cumulative conversion funnel. Scale = whole inventory,
 * including exits. Values and percentages remain text; the visual tracks are decorative. */
export function StatusPipeline({ stages, title = "Cada etapa, uma próxima ação.", description, valueLabel,
  valueNote, controls, insight, onStageSelect, loading, error, onRetry,
  emptyMessage = "Os status aparecem assim que houver registros nesta carteira.", valueFormatter = money,
}: StatusPipelineProps) {
  const id = useId();
  const [metric, setMetric] = useState<"count" | "value">("count");
  const [showZeros, setShowZeros] = useState(false);
  const total = stages.reduce((sum, stage) => sum + stage.count, 0);
  const value = stages.reduce((sum, stage) => sum + stage.valueCents, 0);
  const missing = stages.reduce((sum, stage) => sum + (stage.unpricedCount ?? 0), 0);
  const base = metric === "count" ? total : value;
  const zeros = stages.filter((stage) => stage.count === 0).length;
  const main = stages.filter((stage) => stage.group !== "exit" && (showZeros || stage.count > 0));
  const exits = stages.filter((stage) => stage.group === "exit" && (showZeros || stage.count > 0));
  const renderStage = (stage: StatusPipelineStage, index: number) => {
    const amount = metric === "count" ? stage.count : stage.valueCents;
    const share = base > 0 ? (amount / base) * 100 : null;
    const percentage = share === null ? "—" : `${share.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
    const contents = <>
      <span className="dnex-pipeline-step" aria-hidden="true">{stage.group === "exit" ? <ArrowDownRight /> : String(index + 1).padStart(2, "0")}</span>
      <span className="dnex-pipeline-stage-copy"><strong>{stage.label}</strong>{stage.description && <small>{stage.description}</small>}</span>
      <span className="dnex-pipeline-stage-numbers"><strong>{quantity(stage.count)} <small>{stage.count === 1 ? "registro" : "registros"}</small></strong><span>{valueFormatter(stage.valueCents)}{(stage.unpricedCount ?? 0) > 0 ? " + não informados" : ""}</span></span>
      <span className="dnex-pipeline-share">{percentage}<ArrowUpRight aria-hidden="true" /></span>
      <span className="dnex-pipeline-track" aria-hidden="true"><span style={{ width: `${share ?? 0}%` }} /></span>
    </>;
    return <li key={stage.id} data-tone={stage.tone ?? "action"} data-empty={stage.count === 0 || undefined}>
      {onStageSelect && stage.count > 0 ? <button className="dnex-pipeline-stage" type="button" onClick={() => onStageSelect(stage.id)} aria-label={`Ver ${quantity(stage.count)} registros: ${stage.label}. ${valueFormatter(stage.valueCents)}. ${percentage} ${metric === "count" ? "dos registros" : "do valor informado"}.`}>{contents}</button> : <div className="dnex-pipeline-stage">{contents}</div>}
    </li>;
  };
  return <section className="dnex-status-pipeline" aria-labelledby={id} aria-busy={loading || undefined}>
    <header className="dnex-pipeline-header"><div><span className="dnex-pipeline-eyebrow">Funil comercial · status atual</span><h2 id={id}>{title}</h2><p>{description}</p></div></header>
    <div className="dnex-pipeline-toolbar">
      {controls && <div className="dnex-pipeline-controls">{controls}</div>}
      <div className="dnex-pipeline-metric">
        <span>Exibir por</span>
        <div className="dnex-pipeline-segments" role="group" aria-label="Métrica da distribuição">
          <button type="button" aria-pressed={metric === "count"} disabled={loading || !!error || total === 0} onClick={() => setMetric("count")}><ListFilter aria-hidden="true" />Quantidade</button>
          <button type="button" aria-pressed={metric === "value"} disabled={loading || !!error || total === 0} onClick={() => setMetric("value")}><Banknote aria-hidden="true" />Valor</button>
        </div>
      </div>
    </div>
    {loading ? <div className="dnex-pipeline-state" role="status"><Layers3 aria-hidden="true" /><strong>Organizando os status…</strong><p>Preparando a distribuição da carteira.</p></div>
    : error ? <div className="dnex-pipeline-state" role="alert"><strong>Não foi possível carregar os status.</strong><p>{error}</p>{onRetry && <button type="button" onClick={onRetry}>Tentar novamente</button>}</div>
    : total === 0 ? <div className="dnex-pipeline-state" role="status"><Layers3 aria-hidden="true" /><strong>Seu próximo movimento começa aqui.</strong><p>{emptyMessage}</p></div>
    : <>
      <div className="dnex-pipeline-layout">
        <aside className="dnex-pipeline-overview" aria-label="Resumo da carteira">
          <div className="dnex-pipeline-total"><span><Layers3 aria-hidden="true" />Carteira selecionada</span><strong>{quantity(total)}</strong><p>registros distribuídos por status</p><div className="dnex-pipeline-total-value"><span>{valueLabel}</span><b>{valueFormatter(value)}</b>{missing > 0 && <small>{missing} {missing === 1 ? "registro sem valor informado" : "registros sem valor informado"}</small>}</div></div>
          {insight && <div className="dnex-pipeline-insight"><ArrowRight aria-hidden="true" />{insight}</div>}
        </aside>
        <div className="dnex-pipeline-distribution">
          <p className="dnex-pipeline-scale" aria-live="polite">{metric === "count" ? "% de todos os registros da carteira selecionada" : "% do valor informado da carteira selecionada"}{metric === "value" && value === 0 ? " · sem base monetária" : ""}</p>
          <ol className="dnex-pipeline-stages" aria-label="Status da carteira">{main.map(renderStage)}</ol>
          {exits.length > 0 && <div className="dnex-pipeline-exits"><h3>Encerrados sem continuidade</h3><ol className="dnex-pipeline-stages" aria-label="Recusas, cancelamentos e expirações">{exits.map(renderStage)}</ol></div>}
          {zeros > 0 && <button type="button" className="dnex-pipeline-zeros" aria-expanded={showZeros} onClick={() => setShowZeros(!showZeros)}>{showZeros ? "Ocultar status sem registros" : `Mostrar ${zeros} status sem registros`}</button>}
        </div>
      </div>
      <footer className="dnex-pipeline-footer"><span>Um registro, um status. As porcentagens representam participação, não conversão.</span>{valueNote && <span>{valueNote}</span>}</footer>
    </>}
  </section>;
}
