import { useState, useEffect } from "react";
import { Card, CardBody, PageHeader, Button, EmptyState, SectionPanel, Badge } from "../../components/ui";
import { FileText, CheckCircle2, XCircle, Clock, Plus, Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Props {
  accountId: string;
  userId: string;
}

interface AdjustmentRequest {
  request_id: string;
  type: string;
  target_date: string;
  proposed_value: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
}

export function PaginaAjustes({ accountId, userId }: Props) {
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "missing_punch",
    target_date: new Date().toISOString().split("T")[0],
    proposed_value: "08:00",
    reason: "",
  });

  useEffect(() => {
    async function loadRequests() {
      try {
        const { data } = await supabase
          .from("adjustment_request")
          .select("*")
          .eq("account_id", accountId)
          .eq("employee_id", userId)
          .order("created_at", { ascending: false });
        setRequests((data as AdjustmentRequest[]) || []);
      } catch (e) {
        console.error("Erro ao carregar solicitações:", e);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [accountId, userId]);

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("adjustment_request").insert({
        account_id: accountId,
        employee_id: userId,
        ...formData,
      });
      if (error) throw error;
      setShowForm(false);
      setFormData({ type: "missing_punch", target_date: new Date().toISOString().split("T")[0], proposed_value: "08:00", reason: "" });
      const { data } = await supabase.from("adjustment_request").select("*").eq("account_id", accountId).eq("employee_id", userId).order("created_at", { ascending: false });
      setRequests((data as AdjustmentRequest[]) || []);
    } catch (e: any) {
      alert(`Erro ao solicitar ajuste: ${e.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge tone="warning">Pendente</Badge>;
      case "approved": return <Badge tone="success">Aprovado</Badge>;
      case "rejected": return <Badge tone="danger">Rejeitado</Badge>;
      default: return <Badge tone="neutral">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "missing_punch": return "Batida Esquecida";
      case "wrong_time": return "Hora Incorreta";
      case "absence": return "Abono de Falta";
      case "overtime": return "Hora Extra";
      default: return type;
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Ajustes e Abonos" description="Solicite correções de ponto e abonos de falta" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardBody className="flex items-center gap-4"><Clock size={32} className="text-[var(--tone-warning-fg)]" /><div><div className="text-2xl font-bold" style={{ color: "var(--fg)" }}>{pendingCount}</div><div className="text-sm text-[var(--fg-muted)]">Pendentes</div></div></CardBody></Card>
        <Card><CardBody className="flex items-center gap-4"><CheckCircle2 size={32} className="text-[var(--tone-success-fg)]" /><div><div className="text-2xl font-bold" style={{ color: "var(--fg)" }}>{approvedCount}</div><div className="text-sm text-[var(--fg-muted)]">Aprovados</div></div></CardBody></Card>
        <Card><CardBody className="flex items-center gap-4"><XCircle size={32} className="text-[var(--tone-danger-fg)]" /><div><div className="text-2xl font-bold" style={{ color: "var(--fg)" }}>{rejectedCount}</div><div className="text-sm text-[var(--fg-muted)]">Rejeitados</div></div></CardBody></Card>
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full md:w-auto"><Plus size={18} className="mr-2" />Nova Solicitação</Button>
      )}

      {showForm && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--fg)" }}>Nova Solicitação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>Tipo</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--fg)" }}>
                  <option value="missing_punch">Batida Esquecida</option>
                  <option value="wrong_time">Hora Incorreta</option>
                  <option value="absence">Abono de Falta</option>
                  <option value="overtime">Hora Extra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>Data</label>
                <input type="date" value={formData.target_date} onChange={(e) => setFormData({ ...formData, target_date: e.target.value })} className="w-full p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--fg)" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>{formData.type === "absence" ? "Período" : "Hora Proposta"}</label>
                <input type={formData.type === "absence" ? "text" : "time"} value={formData.proposed_value} onChange={(e) => setFormData({ ...formData, proposed_value: e.target.value })} placeholder={formData.type === "absence" ? "Dia todo ou 08:00-17:00" : "08:00"} className="w-full p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--fg)" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>Motivo</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={4} placeholder="Explique o motivo da solicitação..." className="w-full p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--fg)" }} />
              </div>
              {formData.type === "absence" && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>Anexar Comprovante</label>
                  <div className="flex items-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer" style={{ borderColor: "var(--border)" }}>
                    <Upload size={20} className="text-[var(--fg-muted)]" />
                    <span className="text-sm text-[var(--fg-muted)]">Clique para upload ou arraste o arquivo</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={!formData.reason}>Enviar Solicitação</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <SectionPanel title="Histórico de Solicitações" icon={<FileText size={20} />}>
        {loading ? (
          <div className="text-center py-8 text-[var(--fg-muted)]">Carregando...</div>
        ) : requests.length === 0 ? (
          <EmptyState icon={<FileText />} title="Nenhuma solicitação" description="Você ainda não fez nenhuma solicitação de ajuste ou abono." />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.request_id}>
                <CardBody>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="action">{getTypeLabel(req.type)}</Badge>
                    {getStatusBadge(req.status)}
                  </div>
                  <div className="text-sm space-y-1" style={{ color: "var(--fg-muted)" }}>
                    <div><strong>Data:</strong> {new Date(req.target_date).toLocaleDateString("pt-BR")}</div>
                    <div><strong>Proposto:</strong> {req.proposed_value}</div>
                    <div><strong>Motivo:</strong> {req.reason}</div>
                    <div><strong>Solicitado em:</strong> {new Date(req.created_at).toLocaleString("pt-BR")}</div>
                    {req.rejection_reason && <div className="text-[var(--tone-danger-fg)]"><strong>Motivo da rejeição:</strong> {req.rejection_reason}</div>}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </SectionPanel>
    </div>
  );
}