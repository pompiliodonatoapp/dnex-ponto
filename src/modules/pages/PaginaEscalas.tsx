import { useState, useEffect } from "react";
import { Card, CardBody, PageHeader, Button, Alert, Badge, EmptyState, SectionPanel, StatsGrid, StatCard } from "../../components/ui";
import { Calendar, Clock, Users, Plus, RefreshCw, ArrowRightLeft, Moon, Sun, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Props {
  accountId: string;
  userId: string;
}

interface WorkSchedule {
  schedule_id: string;
  name: string;
  type: string;
  description: string | null;
  weekly_grid: any[];
  tolerance_minutes: number;
  is_night_shift: boolean;
  pre_assigned_break: boolean;
}

interface ShiftAssignment {
  assignment_id: string;
  employee_id: string;
  schedule_id: string;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  schedule?: WorkSchedule;
}

interface SwapRequest {
  swap_id: string;
  requester_id: string;
  target_id: string;
  original_date: string;
  proposed_date: string;
  status: string;
  requester_message: string | null;
  created_at: string;
}

export function PaginaEscalas({ accountId, userId }: Props) {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [myAssignment, setMyAssignment] = useState<ShiftAssignment | null>(null);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"escalas" | "meu-turno" | "trocas">("meu-turno");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    type: "flexible_tolerance",
    tolerance_minutes: 5,
    is_night_shift: false,
    pre_assigned_break: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Carregar jornadas/turnos
        const { data: schedulesData } = await supabase
          .from("work_schedule")
          .select("*")
          .eq("account_id", accountId)
          .order("name");
        setSchedules((schedulesData as WorkSchedule[]) || []);

        // Carregar meu turno ativo
        const today = new Date().toISOString().split("T")[0];
        const { data: assignmentData } = await supabase
          .from("shift_assignment")
          .select("*, work_schedule(*)")
          .eq("account_id", accountId)
          .eq("employee_id", userId)
          .eq("is_active", true)
          .lte("valid_from", today)
          .or(`valid_until.is.null,valid_until.gte.${today}`)
          .order("valid_from", { ascending: false })
          .limit(1)
          .single();
        if (assignmentData) {
          setMyAssignment(assignmentData as ShiftAssignment);
        }

        // Carregar solicitações de troca
        const { data: swapsData } = await supabase
          .from("shift_swap_request")
          .select("*")
          .eq("account_id", accountId)
          .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
          .order("created_at", { ascending: false });
        setSwapRequests((swapsData as SwapRequest[]) || []);
      } catch (e) {
        console.error("Erro ao carregar escalas:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [accountId, userId]);

  const handleCreateSchedule = async () => {
    try {
      const { error } = await supabase.from("work_schedule").insert({
        account_id: accountId,
        ...newSchedule,
        weekly_grid: generateDefaultGrid(newSchedule.type),
      });
      if (error) throw error;
      setShowCreateForm(false);
      setNewSchedule({ name: "", type: "flexible_tolerance", tolerance_minutes: 5, is_night_shift: false, pre_assigned_break: false });
      // Recarregar
      const { data } = await supabase.from("work_schedule").select("*").eq("account_id", accountId).order("name");
      setSchedules((data as WorkSchedule[]) || []);
    } catch (e: any) {
      alert(`Erro ao criar jornada: ${e.message}`);
    }
  };

  const generateDefaultGrid = (type: string) => {
    if (type === "12x36") {
      return [
        { day: "monday", entries: [{ start: "07:00", end: "19:00" }] },
        { day: "tuesday", entries: [] },
        { day: "wednesday", entries: [{ start: "07:00", end: "19:00" }] },
        { day: "thursday", entries: [] },
        { day: "friday", entries: [{ start: "07:00", end: "19:00" }] },
        { day: "saturday", entries: [] },
        { day: "sunday", entries: [{ start: "07:00", end: "19:00" }] },
      ];
    }
    // Default: comercial 8h
    return ["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => ({
      day,
      entries: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "17:00" }],
    })).concat([
      { day: "saturday", entries: [] },
      { day: "sunday", entries: [] },
    ]);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "flexible": return "Flexível";
      case "flexible_tolerance": return "Flexível c/ Tolerância";
      case "rigid": return "Rígida";
      case "rigid_flexible_break": return "Rígida c/ Intervalo Flexível";
      case "12x36": return "12x36";
      default: return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "flexible": return <Badge tone="action">Flexível</Badge>;
      case "flexible_tolerance": return <Badge tone="success">Flexível + Tolerância</Badge>;
      case "rigid": return <Badge tone="warning">Rígida</Badge>;
      case "rigid_flexible_break": return <Badge tone="warning">Rígida + Intervalo Flex</Badge>;
      case "12x36": return <Badge tone="danger">12x36</Badge>;
      default: return <Badge tone="neutral">{type}</Badge>;
    }
  };

  const getDayLabel = (day: string) => {
    const labels: Record<string, string> = {
      monday: "Seg", tuesday: "Ter", wednesday: "Qua", thursday: "Qui",
      friday: "Sex", saturday: "Sáb", sunday: "Dom",
    };
    return labels[day] || day;
  };

  const pendingSwaps = swapRequests.filter((s) => s.status === "pending" || s.status === "accepted_by_target").length;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Escalas e Turnos" description="Gerencie jornadas, turnos e trocas" />
        <div className="text-center py-12 text-[var(--fg-muted)]">Carregando escalas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Escalas e Turnos" description="Gerencie jornadas, turnos e solicitações de troca" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {[
          { id: "meu-turno", label: "Meu Turno", icon: Clock },
          { id: "escalas", label: "Jornadas", icon: Calendar },
          { id: "trocas", label: `Trocas (${pendingSwaps})`, icon: ArrowRightLeft },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-[var(--tone-action-fg)] text-[var(--tone-action-fg)]"
                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Meu Turno */}
      {activeTab === "meu-turno" && (
        <div className="space-y-6">
          {myAssignment ? (
            <>
              <Card>
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: "var(--fg)" }}>
                        {myAssignment.schedule?.name || "Turno não encontrado"}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(myAssignment.schedule?.type || "")}
                        {myAssignment.schedule?.is_night_shift && (
                          <Badge tone="action"><Moon size={12} className="mr-1 inline" />Noturno</Badge>
                        )}
                      </div>
                    </div>
                    <Badge tone="success">Ativo</Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div className="p-3 rounded" style={{ background: "var(--bg-subtle)" }}>
                      <div className="text-[var(--fg-muted)] mb-1">Vigência</div>
                      <div className="font-semibold" style={{ color: "var(--fg)" }}>
                        {new Date(myAssignment.valid_from).toLocaleDateString("pt-BR")}
                        {myAssignment.valid_until ? ` até ${new Date(myAssignment.valid_until).toLocaleDateString("pt-BR")}` : " — Indefinido"}
                      </div>
                    </div>
                    <div className="p-3 rounded" style={{ background: "var(--bg-subtle)" }}>
                      <div className="text-[var(--fg-muted)] mb-1">Tolerância</div>
                      <div className="font-semibold" style={{ color: "var(--fg)" }}>
                        {myAssignment.schedule?.tolerance_minutes || 5} minutos
                      </div>
                    </div>
                    <div className="p-3 rounded" style={{ background: "var(--bg-subtle)" }}>
                      <div className="text-[var(--fg-muted)] mb-1">Intervalo Pré-Assinalado</div>
                      <div className="font-semibold" style={{ color: "var(--fg)" }}>
                        {myAssignment.schedule?.pre_assigned_break ? "Sim (art. 74 §2º)" : "Não"}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Grade Semanal */}
              <SectionPanel title="Grade Semanal" icon={<Calendar size={20} />}>
                <div className="grid gap-3 md:grid-cols-7">
                  {(myAssignment.schedule?.weekly_grid || []).map((dayEntry: any) => (
                    <Card key={dayEntry.day}>
                      <CardBody className="py-3">
                        <div className="text-center font-semibold mb-2" style={{ color: "var(--fg)" }}>
                          {getDayLabel(dayEntry.day)}
                        </div>
                        {dayEntry.entries.length === 0 ? (
                          <div className="text-center text-xs text-[var(--fg-muted)] py-2">Folga</div>
                        ) : (
                          <div className="space-y-1">
                            {dayEntry.entries.map((entry: any, idx: number) => (
                              <div key={idx} className="text-center text-xs font-mono p-1 rounded" style={{ background: "var(--tone-action-bg)", color: "var(--tone-action-fg)" }}>
                                {entry.start}–{entry.end}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </SectionPanel>
            </>
          ) : (
            <EmptyState
              icon={<Clock />}
              title="Nenhum turno atribuído"
              description="Você ainda não possui um turno ativo. Solicite ao seu gestor que atribua uma jornada."
            />
          )}
        </div>
      )}

      {/* TAB: Jornadas */}
      {activeTab === "escalas" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <StatsGrid label="">
              <StatCard label="Total de Jornadas" value={schedules.length.toString()} icon={<Calendar size={20} />} />
              <StatCard label="Noturnas" value={schedules.filter((s) => s.is_night_shift).length.toString()} icon={<Moon size={20} />} />
              <StatCard label="12x36" value={schedules.filter((s) => s.type === "12x36").length.toString()} icon={<AlertTriangle size={20} />} />
            </StatsGrid>
          </div>

          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="w-full md:w-auto">
            <Plus size={18} className="mr-2" />
            Nova Jornada
          </Button>

          {showCreateForm && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--fg)" }}>Criar Nova Jornada</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>Nome</label>
                    <input
                      type="text"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                      placeholder="Ex: Comercial 40h, 12x36 Enfermagem"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--fg)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>Tipo de Jornada</label>
                    <select
                      value={newSchedule.type}
                      onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--fg)" }}
                    >
                      <option value="flexible">Flexível — extras/faltantes dependem da carga horária diária</option>
                      <option value="flexible_tolerance">Flexível com Tolerância — mesmo critério + tolerância de minutos</option>
                      <option value="rigid">Rígida — calcula extras/faltantes nas marcações diferentes (art. 58 CLT)</option>
                      <option value="rigid_flexible_break">Rígida com Intervalo Flexível — diferenças na entrada/saída + flexibilidade no intervalo</option>
                      <option value="12x36">12x36 — escala de trabalho 12h trabalho / 36h descanso</option>
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>Tolerância (minutos)</label>
                      <input
                        type="number"
                        value={newSchedule.tolerance_minutes}
                        onChange={(e) => setNewSchedule({ ...newSchedule, tolerance_minutes: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--fg)" }}
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newSchedule.is_night_shift}
                          onChange={(e) => setNewSchedule({ ...newSchedule, is_night_shift: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: "var(--fg)" }}>Turno Noturno</span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newSchedule.pre_assigned_break}
                          onChange={(e) => setNewSchedule({ ...newSchedule, pre_assigned_break: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: "var(--fg)" }}>Intervalo Pré-Assinalado</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleCreateSchedule} disabled={!newSchedule.name}>Criar Jornada</Button>
                    <Button variant="secondary" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {schedules.length === 0 ? (
            <EmptyState icon={<Calendar />} title="Nenhuma jornada cadastrada" description="Crie sua primeira jornada para começar a atribuir turnos aos colaboradores." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map((schedule) => (
                <Card key={schedule.schedule_id}>
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg" style={{ color: "var(--fg)" }}>{schedule.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(schedule.type)}
                          {schedule.is_night_shift && <Badge tone="action"><Moon size={12} className="mr-1 inline" />Noturno</Badge>}
                          {schedule.pre_assigned_break && <Badge tone="neutral">Intervalo Pré-Assinalado</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-3">
                      {(schedule.weekly_grid || []).map((dayEntry: any) => (
                        <div key={dayEntry.day} className="text-center">
                          <div className="text-xs font-semibold text-[var(--fg-muted)] mb-1">{getDayLabel(dayEntry.day)}</div>
                          {dayEntry.entries.length === 0 ? (
                            <div className="text-xs text-[var(--fg-muted)] py-1 rounded" style={{ background: "var(--bg-subtle)" }}>—</div>
                          ) : (
                            dayEntry.entries.map((entry: any, idx: number) => (
                              <div key={idx} className="text-xs font-mono py-1 rounded mb-1" style={{ background: "var(--tone-action-bg)", color: "var(--tone-action-fg)" }}>
                                {entry.start.slice(0, 5)}
                              </div>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-[var(--fg-muted)]">
                      Tolerância: {schedule.tolerance_minutes} min
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Trocas */}
      {activeTab === "trocas" && (
        <div className="space-y-6">
          <Alert tone="info" title="Troca de Turnos">
            Solicite trocar de turno com um colega. O fluxo é: você solicita → colega aceita → gestor aprova.
            O sistema valida automaticamente regras CLT (dias consecutivos, intervalo interjornada).
          </Alert>

          {swapRequests.length === 0 ? (
            <EmptyState
              icon={<ArrowRightLeft />}
              title="Nenhuma solicitação de troca"
              description="Quando você ou seus colegas solicitarem trocas de turno, elas aparecerão aqui."
            />
          ) : (
            <div className="space-y-3">
              {swapRequests.map((swap) => (
                <Card key={swap.swap_id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge tone={
                            swap.status === "pending" ? "warning" :
                            swap.status === "accepted_by_target" ? "action" :
                            swap.status === "approved_by_manager" ? "success" :
                            swap.status === "rejected" ? "danger" : "neutral"
                          }>
                            {swap.status === "pending" ? "Pendente" :
                             swap.status === "accepted_by_target" ? "Aceito pelo Colega" :
                             swap.status === "approved_by_manager" ? "Aprovado" :
                             swap.status === "rejected" ? "Rejeitado" : swap.status}
                          </Badge>
                          {swap.requester_id === userId && <Badge tone="action">Enviada por mim</Badge>}
                          {swap.target_id === userId && <Badge tone="warning">Recebida</Badge>}
                        </div>
                        <div className="text-sm space-y-1" style={{ color: "var(--fg-muted)" }}>
                          <div><strong>Data original:</strong> {new Date(swap.original_date).toLocaleDateString("pt-BR")}</div>
                          <div><strong>Data proposta:</strong> {new Date(swap.proposed_date).toLocaleDateString("pt-BR")}</div>
                          {swap.requester_message && <div><strong>Mensagem:</strong> {swap.requester_message}</div>}
                          <div><strong>Solicitado em:</strong> {new Date(swap.created_at).toLocaleString("pt-BR")}</div>
                        </div>
                      </div>
                      {swap.target_id === userId && swap.status === "pending" && (
                        <div className="flex flex-col gap-2">
                          <Button size="sm" disabled>Aceitar</Button>
                          <Button size="sm" variant="secondary" disabled>Recusar</Button>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}