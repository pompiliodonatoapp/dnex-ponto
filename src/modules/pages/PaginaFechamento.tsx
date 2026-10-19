import { useState, useEffect, useCallback } from "react";
import { Card, CardBody, PageHeader, Button, SectionPanel, Alert, Badge } from "../../components/ui";
import { Lock, History, Users, CheckCircle2, AlertTriangle, Clock, CalendarCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Props {
  accountId: string;
  userId: string;
}

interface EmployeePeriod {
  employee_id: string;
  full_name: string;
  employee_code: string;
  period_start: string;
  period_end: string;
  status: "open" | "closing" | "closed";
  pending_adjustments: number;
  total_worked_minutes: number;
  total_scheduled_minutes: number;
}

interface ClosingHistory {
  id: string;
  employee_id: string;
  full_name: string;
  period_start: string;
  period_end: string;
  closed_at: string;
  closed_by: string;
  total_worked_minutes: number;
  total_overtime_minutes: number;
  status: string;
}

export function PaginaFechamento({ accountId, userId }: Props) {
  const [activeTab, setActiveTab] = useState<"close" | "history">("close");
  const [employees, setEmployees] = useState<EmployeePeriod[]>([]);
  const [history, setHistory] = useState<ClosingHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [closingIds, setClosingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadOpenPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: balances, error: balErr } = await supabase
        .from("daily_balance")
        .select("employee_id, work_date, worked_minutes, scheduled_minutes")
        .eq("account_id", accountId)
        .gte("work_date", new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0])
        .order("work_date", { ascending: false });
      if (balErr) throw new Error(balErr.message);

      const { data: emps, error: empErr } = await supabase
        .from("employees")
        .select("id, full_name, employee_code")
        .eq("account_id", accountId)
        .eq("status", "active");
      if (empErr) throw new Error(empErr.message);

      const empMap = new Map((emps ?? []).map((e: any) => [e.id, e]));

      const grouped = new Map<string, { dates: string[]; worked: number; scheduled: number }>();
      for (const b of (balances as any[]) ?? []) {
        const g = grouped.get(b.employee_id) ?? { dates: [], worked: 0, scheduled: 0 };
        g.dates.push(b.work_date);
        g.worked += b.worked_minutes ?? 0;
        g.scheduled += b.scheduled_minutes ?? 0;
        grouped.set(b.employee_id, g);
      }

      const { data: adjustments } = await supabase
        .from("adjustment_requests")
        .select("employee_id, status")
        .eq("account_id", accountId)
        .eq("status", "pending");

      const pendingMap = new Map<string, number>();
      for (const a of (adjustments as any[]) ?? []) {
        pendingMap.set(a.employee_id, (pendingMap.get(a.employee_id) ?? 0) + 1);
      }

      const result: EmployeePeriod[] = [];
      for (const [empId, data] of grouped) {
        const emp = empMap.get(empId);
        if (!emp) continue;
        const sortedDates = data.dates.sort();
        result.push({
          employee_id: empId,
          full_name: emp.full_name,
          employee_code: emp.employee_code ?? "000",
          period_start: sortedDates[0],
          period_end: sortedDates[sortedDates.length - 1],
          status: "open",
          pending_adjustments: pendingMap.get(empId) ?? 0,
          total_worked_minutes: data.worked,
          total_scheduled_minutes: data.scheduled,
        });
      }
      setEmployees(result.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar periodos abertos.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const loadHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("period_closings")
        .select("id, employee_id, period_start, period_end, closed_at, closed_by, total_worked_minutes, total_overtime_minutes, status")
        .eq("account_id", accountId)
        .order("closed_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);

      const empIds = [...new Set((data ?? []).map((d: any) => d.employee_id))];
      const { data: emps } = await supabase
        .from("employees")
        .select("id, full_name")
        .in("id", empIds);
      const empMap = new Map((emps ?? []).map((e: any) => [e.id, e.full_name]));

      setHistory(
        ((data as any[]) ?? []).map((d) => ({
          ...d,
          full_name: empMap.get(d.employee_id) ?? d.employee_id.slice(0, 8),
        }))
      );
    } catch (e: any) {
      console.error("Erro ao carregar historico:", e);
    }
  }, [accountId]);

  useEffect(() => {
    loadOpenPeriods();
    loadHistory();
  }, [loadOpenPeriods, loadHistory]);

  const formatMinutes = (m: number) => {
    const h = Math.floor(Math.abs(m) / 60);
    const min = Math.abs(m) % 60;
    return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  };

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const closePeriod = async (employeeId: string) => {
    setClosingIds((prev) => new Set(prev).add(employeeId));
    setError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.rpc("close_period", {
        p_account_id: accountId,
        p_employee_id: employeeId,
        p_closed_by: userId,
      });
      if (error) throw new Error(error.message);
      setSuccessMsg(`Periodo fechado com sucesso para ${employees.find((e) => e.employee_id === employeeId)?.full_name ?? "colaborador"}.`);
      await loadOpenPeriods();
      await loadHistory();
    } catch (e: any) {
      setError(`Erro ao fechar periodo: ${e.message}`);
    } finally {
      setClosingIds((prev) => {
        const next = new Set(prev);
        next.delete(employeeId);
        return next;
      });
    }
  };

  const closeBatch = async () => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    let successCount = 0;
    let failCount = 0;
    for (const empId of selectedIds) {
      try {
        const { error } = await supabase.rpc("close_period", {
          p_account_id: accountId,
          p_employee_id: empId,
          p_closed_by: userId,
        });
        if (error) {
          failCount++;
          console.error(`Falha ao fechar ${empId}:`, error.message);
        } else {
          successCount++;
        }
      } catch {
        failCount++;
      }
    }
    if (failCount > 0) {
      setError(`${failCount} periodo(s) nao puderam ser fechados. Verifique os logs.`);
    }
    if (successCount > 0) {
      setSuccessMsg(`${successCount} periodo(s) fechado(s) com sucesso.`);
    }
    setSelectedIds(new Set());
    await loadOpenPeriods();
    await loadHistory();
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === employees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(employees.map((e) => e.employee_id)));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Fechamento de Ponto" description="Feche periodos de ponto e acompanhe o historico de fechamentos" />

      {error && <Alert tone="error" title="Erro">{error}</Alert>}
      {successMsg && <Alert tone="success" title="Sucesso">{successMsg}</Alert>}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("close")}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "close"
              ? "border-b-2 border-[var(--tone-action-fg)] text-[var(--tone-action-fg)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
        >
          <span className="flex items-center gap-2"><Lock size={16} /> Fechar Periodos</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-[var(--tone-action-fg)] text-[var(--tone-action-fg)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
        >
          <span className="flex items-center gap-2"><History size={16} /> Historico</span>
        </button>
      </div>

      {activeTab === "close" && (
        <>
          {/* Batch Actions */}
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employees.length > 0 && selectedIds.size === employees.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[var(--border)]"
                  />
                  <span className="text-sm font-medium text-[var(--fg)]">
                    Selecionar todos ({selectedIds.size}/{employees.length})
                  </span>
                </label>
              </div>
              <Button
                onClick={closeBatch}
                disabled={selectedIds.size === 0 || loading}
                variant="primary"
              >
                {loading ? "Fechando..." : `Fechar ${selectedIds.size} Periodo(s)`}
              </Button>
            </CardBody>
          </Card>

          {/* Employee List */}
          <SectionPanel title={`Periodos Abertos (${employees.length})`} icon={<Users size={20} />}>
            {loading && employees.length === 0 ? (
              <div className="py-8 text-center text-[var(--fg-muted)]">Carregando...</div>
            ) : employees.length === 0 ? (
              <Card>
                <CardBody className="text-center py-8">
                  <CheckCircle2 size={40} className="mx-auto mb-3 text-[var(--tone-success-fg)] opacity-50" />
                  <h3 className="font-semibold text-[var(--fg)]">Nenhum periodo aberto</h3>
                  <p className="text-sm text-[var(--fg-muted)]">Todos os periodos estao fechados ou nao ha dados recentes.</p>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-3">
                {employees.map((emp) => {
                  const isClosing = closingIds.has(emp.employee_id);
                  const isSelected = selectedIds.has(emp.employee_id);
                  const balance = emp.total_worked_minutes - emp.total_scheduled_minutes;
                  return (
                    <Card key={emp.employee_id} className={`transition-all ${isSelected ? "ring-2 ring-[var(--tone-action-fg)]" : ""}`}>
                      <CardBody className="flex flex-wrap items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(emp.employee_id)}
                          className="rounded border-[var(--border)]"
                        />
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[var(--fg)]">{emp.full_name}</h4>
                            <Badge tone="neutral">{emp.employee_code}</Badge>
                            {emp.pending_adjustments > 0 && (
                              <Badge tone="warning">{emp.pending_adjustments} pendencia(s)</Badge>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-4 text-xs text-[var(--fg-muted)]">
                            <span className="flex items-center gap-1"><CalendarCheck size={12} /> {formatDateBR(emp.period_start)} — {formatDateBR(emp.period_end)}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> Trabalhado: {formatMinutes(emp.total_worked_minutes)}</span>
                            <span className={`flex items-center gap-1 ${balance >= 0 ? "text-[var(--tone-success-fg)]" : "text-[var(--tone-warning-fg)]"}`}>
                              Saldo: {balance >= 0 ? "+" : "-"}{formatMinutes(Math.abs(balance))}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => closePeriod(emp.employee_id)}
                          disabled={isClosing || emp.pending_adjustments > 0}
                        >
                          {isClosing ? "Fechando..." : emp.pending_adjustments > 0 ? "Pendencias" : "Fechar"}
                        </Button>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </SectionPanel>
        </>
      )}

      {activeTab === "history" && (
        <SectionPanel title="Historico de Fechamentos" icon={<History size={20} />}>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
                    <th className="px-4 py-3 text-left font-semibold">Colaborador</th>
                    <th className="px-4 py-3 text-left font-semibold">Periodo</th>
                    <th className="px-4 py-3 text-left font-semibold">Fechado em</th>
                    <th className="px-4 py-3 text-right font-semibold">Trabalhado</th>
                    <th className="px-4 py-3 text-right font-semibold">HE</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[var(--fg-muted)]">
                        Nenhum fechamento registrado
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)]">
                        <td className="px-4 py-2">{h.full_name}</td>
                        <td className="px-4 py-2">{formatDateBR(h.period_start)} — {formatDateBR(h.period_end)}</td>
                        <td className="px-4 py-2">{new Date(h.closed_at).toLocaleString("pt-BR")}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatMinutes(h.total_worked_minutes)}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatMinutes(h.total_overtime_minutes)}</td>
                        <td className="px-4 py-2">
                          <Badge tone={h.status === "closed" ? "success" : "warning"}>{h.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </SectionPanel>
      )}
    </div>
  );
}