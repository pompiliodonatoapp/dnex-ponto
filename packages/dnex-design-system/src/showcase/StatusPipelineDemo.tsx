import { useState } from "react";
import { FileText, FileSignature } from "lucide-react";
import "../styles/status-pipeline.css";
import { StatusPipeline, StatusPipelineFilters, type StatusPipelineStage } from "../components/charts/StatusPipeline";

const examples: StatusPipelineStage[] = [
  { id: "draft", label: "Rascunhos", description: "Ofertas em preparação", count: 4, valueCents: 480000, tone: "neutral" },
  { id: "sent", label: "Enviadas", description: "Aguardando a primeira leitura", count: 12, valueCents: 2160000, tone: "action" },
  { id: "viewed", label: "Visualizadas", description: "Aguardando uma decisão", count: 8, valueCents: 1560000, tone: "warning" },
  { id: "accepted", label: "Aceitas", description: "Próximo passo: formalização", count: 6, valueCents: 1080000, tone: "success" },
  { id: "converted", label: "Convertidas", description: "Continuidade comercial iniciada", count: 0, valueCents: 0, tone: "success" },
  { id: "refused", label: "Recusadas", count: 3, valueCents: 420000, tone: "danger", group: "exit" },
  { id: "expired", label: "Expiradas", count: 2, valueCents: 300000, tone: "neutral", group: "exit" },
];

const contractExamples: StatusPipelineStage[] = [
  { id: "draft", label: "Rascunhos", count: 3, valueCents: 540000, tone: "neutral" },
  { id: "sent", label: "Enviados", description: "Aguardando assinatura", count: 7, valueCents: 1260000, tone: "action" },
  { id: "active", label: "Ativos", count: 18, valueCents: 3240000, tone: "success" },
  { id: "canceled", label: "Cancelados", count: 2, valueCents: 360000, tone: "danger", group: "exit" },
];
const catalogExamples: StatusPipelineStage[] = [
  { id: "draft", label: "Rascunhos", count: 2, valueCents: 320000, tone: "neutral" },
  { id: "sent", label: "Enviadas", count: 5, valueCents: 750000, tone: "action" },
  { id: "accepted", label: "Aceitas", count: 3, valueCents: 510000, tone: "success" },
];

export function StatusPipelineDemo() {
  const [state, setState] = useState("ready");
  const [selected, setSelected] = useState<StatusPipelineStage>();
  const [entity, setEntity] = useState("propostas");
  const [kind, setKind] = useState("comparativa");
  const catalog = entity === "propostas" && kind === "catalogo";
  const stages = entity === "contratos" ? contractExamples : catalog ? catalogExamples : examples;
  return <div id="status-pipeline">
    <div className="dnex-pipeline-demo-options"><label>Estado da prévia <select aria-label="Estado do exemplo de status" value={state} onChange={(event) => { setState(event.target.value); setSelected(undefined); }}>
      <option value="ready">Com dados</option><option value="empty">Sem registros</option><option value="loading">Carregando</option><option value="error">Erro recuperável</option>
    </select></label></div>
    <StatusPipeline stages={state === "empty" ? [] : stages} description="Carteira ilustrativa · status exclusivos · sem dados de clientes."
      valueLabel={catalog ? "Total dos itens propostos" : "Valor anual da carteira"} valueNote="Não misturar valor anual, mensal e total dos itens em uma única soma."
      loading={state === "loading"} error={state === "error" ? "Exemplo de indisponibilidade temporária." : undefined} onRetry={() => setState("ready")}
      controls={<StatusPipelineFilters label="Carteira do funil" value={entity} onChange={(value) => { setEntity(value); setSelected(undefined); }}
        options={[{ value: "propostas", label: "Propostas", icon: <FileText /> }, { value: "contratos", label: "Contratos", icon: <FileSignature /> }]}
        select={entity === "propostas" ? { label: "Tipo de proposta no funil", value: kind, options: [{ value: "comparativa", label: "Comparativas" }, { value: "catalogo", label: "Catálogo" }], onChange: (value) => { setKind(value); setSelected(undefined); } } : undefined} />}
      insight={<div><strong>A leitura se transforma em ação</strong><p>Selecione um status para consultar a quantidade correspondente. No produto, a ação abre a lista filtrada.</p></div>}
      onStageSelect={(id) => setSelected(stages.find((stage) => stage.id === id))} />
    <p role="status" className="text-small text-fg-muted mt-3">{selected ? `Prévia ilustrativa: ${selected.count} registros em “${selected.label}”. Nenhum dado real foi acessado.` : "StatusPipeline · componente compartilhado com o DNEX Contratos."}</p>
  </div>;
}
