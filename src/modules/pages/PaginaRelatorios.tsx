import { useState, useEffect, useCallback } from "react";
import { Card, CardBody, PageHeader, Button, SectionPanel, Alert, Badge } from "../../components/ui";
import { BarChart3, FileText, Download, Calendar, Users, TrendingUp, FileSpreadsheet, Printer } from "lucide-react";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface Props {
  accountId: string;
}

interface Employee {
  id: string;
  full_name: string;
  employee_code: string;
}

interface DailyBalance {
  employee_id: string;
  work_date: string;
  worked_minutes: number;
  scheduled_minutes: number;
  overtime_minutes: number;
  night_shift_minutes: number;
}

interface TimeClockEntry {
  employee_id: string;
  timestamp_utc: string;
  type: string;
}

export function PaginaRelatorios({ accountId }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
  const [clockEntries, setClockEntries] = useState<TimeClockEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadEmployees() {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, full_name, employee_code")
          .eq("account_id", accountId)
          .eq("status", "active")
          .order("full_name");
        if (!cancelled && !error && data) {
          setEmployees(data as Employee[]);
        }
      } catch (e) {
        console.error("Erro ao carregar colaboradores:", e);
      }
    }
    loadEmployees();
    return () => { cancelled = true; };
  }, [accountId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let balanceQuery = supabase
        .from("daily_balance")
        .select("employee_id, work_date, worked_minutes, scheduled_minutes, overtime_minutes, night_shift_minutes")
        .eq("account_id", accountId)
        .gte("work_date", dateFrom)
        .lte("work_date", dateTo)
        .order("work_date");
      if (selectedEmployee !== "all") {
        balanceQuery = balanceQuery.eq("employee_id", selectedEmployee);
      }
      const { data: balances, error: balErr } = await balanceQuery;
      if (balErr) throw new Error(balErr.message);

      let clockQuery = supabase
        .from("time_clock")
        .select("employee_id, timestamp_utc, type")
        .eq("account_id", accountId)
        .gte("timestamp_utc", `${dateFrom}T00:00:00`)
        .lte("timestamp_utc", `${dateTo}T23:59:59`)
        .order("timestamp_utc");
      if (selectedEmployee !== "all") {
        clockQuery = clockQuery.eq("employee_id", selectedEmployee);
      }
      const { data: clocks, error: clkErr } = await clockQuery;
      if (clkErr) throw new Error(clkErr.message);

      setDailyBalances((balances as DailyBalance[]) ?? []);
      setClockEntries((clocks as TimeClockEntry[]) ?? []);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [accountId, dateFrom, dateTo, selectedEmployee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? id.slice(0, 8);
  const getEmployeeCode = (id: string) => employees.find((e) => e.id === id)?.employee_code ?? "000";

  const formatMinutes = (m: number) => {
    const h = Math.floor(Math.abs(m) / 60);
    const min = Math.abs(m) % 60;
    return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  };

  const formatDateBR = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  // --- PDF Export (Espelho de Ponto) ---
  const generatePDF = async () => {
    setGenerating("pdf");
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let y = 15;

      doc.setFontSize(14);
      doc.text("DNEX Ponto - Espelho de Ponto", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Periodo: ${formatDateBR(dateFrom)} a ${formatDateBR(dateTo)}`, margin, y);
      y += 6;
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margin, y);
      y += 10;

      const grouped = new Map<string, DailyBalance[]>();
      for (const b of dailyBalances) {
        const list = grouped.get(b.employee_id) ?? [];
        list.push(b);
        grouped.set(b.employee_id, list);
      }

      for (const [empId, records] of grouped) {
        if (y > 170) { doc.addPage(); y = 15; }
        doc.setFontSize(11);
        doc.text(`${getEmployeeName(empId)} (${getEmployeeCode(empId)})`, margin, y);
        y += 6;

        doc.setFontSize(8);
        doc.setFillColor(41, 65, 122);
        doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("Data", margin + 2, y);
        doc.text("Trabalhado", margin + 40, y);
        doc.text("Previsto", margin + 70, y);
        doc.text("HE", margin + 100, y);
        doc.text("Noturno", margin + 130, y);
        doc.text("Saldo", margin + 160, y);
        doc.setTextColor(0, 0, 0);
        y += 6;

        let totalWorked = 0, totalScheduled = 0, totalOT = 0, totalNight = 0;
        for (const r of records.sort((a, b) => a.work_date.localeCompare(b.work_date))) {
          if (y > 190) { doc.addPage(); y = 15; }
          const balance = r.worked_minutes - r.scheduled_minutes;
          doc.text(formatDateBR(r.work_date), margin + 2, y);
          doc.text(formatMinutes(r.worked_minutes), margin + 40, y);
          doc.text(formatMinutes(r.scheduled_minutes), margin + 70, y);
          doc.text(formatMinutes(r.overtime_minutes), margin + 100, y);
          doc.text(formatMinutes(r.night_shift_minutes), margin + 130, y);
          doc.text(`${balance >= 0 ? "+" : "-"}${formatMinutes(balance)}`, margin + 160, y);
          totalWorked += r.worked_minutes;
          totalScheduled += r.scheduled_minutes;
          totalOT += r.overtime_minutes;
          totalNight += r.night_shift_minutes;
          y += 5;
        }

        doc.setFont("helvetica", "bold");
        doc.text("TOTAL", margin + 2, y);
        doc.text(formatMinutes(totalWorked), margin + 40, y);
        doc.text(formatMinutes(totalScheduled), margin + 70, y);
        doc.text(formatMinutes(totalOT), margin + 100, y);
        doc.text(formatMinutes(totalNight), margin + 130, y);
        const totalBalance = totalWorked - totalScheduled;
        doc.text(`${totalBalance >= 0 ? "+" : "-"}${formatMinutes(totalBalance)}`, margin + 160, y);
        doc.setFont("helvetica", "normal");
        y += 12;
      }

      doc.save(`espelho-ponto-${dateFrom}-${dateTo}.pdf`);
    } catch (e: any) {
      setError(`Erro ao gerar PDF: ${e.message}`);
    } finally {
      setGenerating(null);
    }
  };

  // --- Excel Export ---
  const generateExcel = async () => {
    setGenerating("excel");
    try {
      const rows = dailyBalances.map((b) => ({
        Colaborador: getEmployeeName(b.employee_id),
        Codigo: getEmployeeCode(b.employee_id),
        Data: formatDateBR(b.work_date),
        "Trabalhado (min)": b.worked_minutes,
        "Previsto (min)": b.scheduled_minutes,
        "HE (min)": b.overtime_minutes,
        "Noturno (min)": b.night_shift_minutes,
        "Saldo (min)": b.worked_minutes - b.scheduled_minutes,
        Trabalhado: formatMinutes(b.worked_minutes),
        Previsto: formatMinutes(b.scheduled_minutes),
        HE: formatMinutes(b.overtime_minutes),
        Saldo: `${b.worked_minutes - b.scheduled_minutes >= 0 ? "+" : "-"}${formatMinutes(b.worked_minutes - b.scheduled_minutes)}`,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Espelho de Ponto");

      const summaryMap = new Map<string, { name: string; worked: number; scheduled: number; ot: number }>();
      for (const b of dailyBalances) {
        const s = summaryMap.get(b.employee_id) ?? { name: getEmployeeName(b.employee_id), worked: 0, scheduled: 0, ot: 0 };
        s.worked += b.worked_minutes;
        s.scheduled += b.scheduled_minutes;
        s.ot += b.overtime_minutes;
        summaryMap.set(b.employee_id, s);
      }
      const summaryRows = Array.from(summaryMap.values()).map((s) => ({
        Colaborador: s.name,
        "Total Trabalhado": formatMinutes(s.worked),
        "Total Previsto": formatMinutes(s.scheduled),
        "Total HE": formatMinutes(s.ot),
        Saldo: `${s.worked - s.scheduled >= 0 ? "+" : "-"}${formatMinutes(s.worked - s.scheduled)}`,
      }));
      const ws2 = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, ws2, "Resumo");

      XLSX.writeFile(wb, `relatorio-ponto-${dateFrom}-${dateTo}.xlsx`);
    } catch (e: any) {
      setError(`Erro ao gerar Excel: ${e.message}`);
    } finally {
      setGenerating(null);
    }
  };

  // --- AFD Export (Portaria 671/2021 MTP) ---
  const generateAFD = async () => {
    setGenerating("afd");
    try {
      const lines: string[] = [];
      const companyName = "DNEX PONTO";
      const cnpj = "00000000000000";
      const header = `1${companyName.padEnd(150, " ")}${cnpj}${dateFrom.replace(/-/g, "")}${dateTo.replace(/-/g, "")}${new Date().toISOString().slice(0, 10).replace(/-/g, "")}DNEX-PONTO-V1`;
      lines.push(header);

      for (const entry of clockEntries.sort((a, b) => a.timestamp_utc.localeCompare(b.timestamp_utc))) {
        const dt = new Date(entry.timestamp_utc);
        const dateStr = dt.toISOString().slice(0, 10).replace(/-/g, "");
        const timeStr = dt.toISOString().slice(11, 16).replace(":", "");
        const empCode = getEmployeeCode(entry.employee_id).padStart(12, "0");
        const typeMap: Record<string, string> = { clock_in: "1", break_start: "2", break_end: "3", clock_out: "4" };
        const typeCode = typeMap[entry.type] ?? "1";
        const line = `2${empCode}${dateStr}${timeStr}${typeCode}`;
        lines.push(line);
      }

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ponto-${dateFrom}-${dateTo}.afd`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(`Erro ao gerar AFD: ${e.message}`);
    } finally {
      setGenerating(null);
    }
  };

  // --- AEJ Export (Espelho de Jornada Eletronico) ---
  const generateAEJ = async () => {
    setGenerating("aej");
    try {
      const lines: string[] = [];
      lines.push(`EMPRESA=DNEX PONTO`);
      lines.push(`CNPJ=00000000000000`);
      lines.push(`PERIODO_INICIO=${dateFrom}`);
      lines.push(`PERIODO_FIM=${dateTo}`);
      lines.push(`GERACAO=${new Date().toISOString()}`);
      lines.push("---");

      const grouped = new Map<string, TimeClockEntry[]>();
      for (const entry of clockEntries) {
        const list = grouped.get(entry.employee_id) ?? [];
        list.push(entry);
        grouped.set(entry.employee_id, list);
      }

      for (const [empId, entries] of grouped) {
        lines.push(`COLABORADOR=${getEmployeeName(empId)}`);
        lines.push(`CODIGO=${getEmployeeCode(empId)}`);
        const sorted = entries.sort((a, b) => a.timestamp_utc.localeCompare(b.timestamp_utc));
        for (const e of sorted) {
          const dt = new Date(e.timestamp_utc);
          const dateStr = dt.toISOString().slice(0, 10);
          const timeStr = dt.toISOString().slice(11, 16);
          const typeLabel: Record<string, string> = {
            clock_in: "ENTRADA",
            break_start: "INICIO_INTERVALO",
            break_end: "FIM_INTERVALO",
            clock_out: "SAIDA",
          };
          lines.push(`${dateStr}|${timeStr}|${typeLabel[e.type] ?? e.type.toUpperCase()}`);
        }
        lines.push("---");
      }

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `espelho-jornada-${dateFrom}-${dateTo}.aej`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(`Erro ao gerar AEJ: ${e.message}`);
    } finally {
      setGenerating(null);
    }
  };

  // --- Summary stats ---
  const totalWorked = dailyBalances.reduce((s, b) => s + b.worked_minutes, 0);
  const totalScheduled = dailyBalances.reduce((s, b) => s + b.scheduled_minutes, 0);
  const totalOT = dailyBalances.reduce((s, b) => s + b.overtime_minutes, 0);
  const uniqueEmployees = new Set(dailyBalances.map((b) => b.employee_id)).size;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Relatorios" description="Exporte espelhos de ponto, relatorios gerenciais e arquivos fiscais" />

      {error && (
        <Alert tone="error" title="Erro">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[160px]">
              <label className="mb-1 block text-sm font-medium text-[var(--fg-muted)]">De</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="min-w-[160px]">
              <label className="mb-1 block text-sm font-medium text-[var(--fg-muted)]">Ate</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-[var(--fg-muted)]">Colaborador</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={fetchData} disabled={loading}>
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <SectionPanel title="Resumo do Periodo" icon={<TrendingUp size={20} />}>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardBody className="text-center">
              <div className="font-mono text-[length:var(--text-kpi)] font-semibold text-[var(--tone-action-fg)]">{uniqueEmployees}</div>
              <div className="text-sm text-[var(--fg-muted)]">Colaboradores</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="font-mono text-[length:var(--text-kpi)] font-semibold text-[var(--tone-action-fg)]">{formatMinutes(totalWorked)}</div>
              <div className="text-sm text-[var(--fg-muted)]">Total Trabalhado</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="font-mono text-[length:var(--text-kpi)] font-semibold text-[var(--tone-action-fg)]">{formatMinutes(totalOT)}</div>
              <div className="text-sm text-[var(--fg-muted)]">Horas Extras</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className={`font-mono text-[length:var(--text-kpi)] font-semibold ${totalWorked >= totalScheduled ? "text-[var(--tone-success-fg)]" : "text-[var(--tone-warning-fg)]"}`}>
                {totalWorked - totalScheduled >= 0 ? "+" : "-"}{formatMinutes(Math.abs(totalWorked - totalScheduled))}
              </div>
              <div className="text-sm text-[var(--fg-muted)]">Saldo Geral</div>
            </CardBody>
          </Card>
        </div>
      </SectionPanel>

      {/* Export Buttons */}
      <SectionPanel title="Exportar Relatorios" icon={<Download size={20} />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardBody className="flex flex-col items-center gap-3 text-center">
              <FileText size={32} className="text-[var(--tone-action-fg)]" />
              <h4 className="font-semibold">PDF Espelho</h4>
              <p className="text-xs text-[var(--fg-muted)]">Espelho de ponto formatado para impressao e assinatura</p>
              <Button size="sm" onClick={generatePDF} disabled={generating !== null || dailyBalances.length === 0}>
                {generating === "pdf" ? "Gerando..." : "Baixar PDF"}
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-col items-center gap-3 text-center">
              <FileSpreadsheet size={32} className="text-[var(--tone-success-fg)]" />
              <h4 className="font-semibold">Excel Completo</h4>
              <p className="text-xs text-[var(--fg-muted)]">Planilha com dados detalhados e resumo por colaborador</p>
              <Button size="sm" onClick={generateExcel} disabled={generating !== null || dailyBalances.length === 0}>
                {generating === "excel" ? "Gerando..." : "Baixar XLSX"}
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-col items-center gap-3 text-center">
              <Printer size={32} className="text-[var(--tone-action-fg)]" />
              <h4 className="font-semibold">AFD Fiscal</h4>
              <p className="text-xs text-[var(--fg-muted)]">Arquivo fonte de dados conforme Portaria 671/2021 MTP</p>
              <Button size="sm" onClick={generateAFD} disabled={generating !== null || clockEntries.length === 0}>
                {generating === "afd" ? "Gerando..." : "Baixar AFD"}
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-col items-center gap-3 text-center">
              <Calendar size={32} className="text-[var(--tone-warning-fg)]" />
              <h4 className="font-semibold">AEJ Jornada</h4>
              <p className="text-xs text-[var(--fg-muted)]">Espelho de jornada eletronico estruturado</p>
              <Button size="sm" onClick={generateAEJ} disabled={generating !== null || clockEntries.length === 0}>
                {generating === "aej" ? "Gerando..." : "Baixar AEJ"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </SectionPanel>

      {/* Data Preview Table */}
      <SectionPanel title={`Dados (${dailyBalances.length} registros)`} icon={<BarChart3 size={20} />}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
                  <th className="px-4 py-3 text-left font-semibold">Colaborador</th>
                  <th className="px-4 py-3 text-left font-semibold">Data</th>
                  <th className="px-4 py-3 text-right font-semibold">Trabalhado</th>
                  <th className="px-4 py-3 text-right font-semibold">Previsto</th>
                  <th className="px-4 py-3 text-right font-semibold">HE</th>
                  <th className="px-4 py-3 text-right font-semibold">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {dailyBalances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--fg-muted)]">
                      Nenhum dado no periodo selecionado
                    </td>
                  </tr>
                ) : (
                  dailyBalances.slice(0, 50).map((b, i) => {
                    const balance = b.worked_minutes - b.scheduled_minutes;
                    return (
                      <tr key={`${b.employee_id}-${b.work_date}-${i}`} className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)]">
                        <td className="px-4 py-2">{getEmployeeName(b.employee_id)}</td>
                        <td className="px-4 py-2">{formatDateBR(b.work_date)}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatMinutes(b.worked_minutes)}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatMinutes(b.scheduled_minutes)}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatMinutes(b.overtime_minutes)}</td>
                        <td className={`px-4 py-2 text-right font-mono ${balance >= 0 ? "text-[var(--tone-success-fg)]" : "text-[var(--tone-warning-fg)]"}`}>
                          {balance >= 0 ? "+" : "-"}{formatMinutes(Math.abs(balance))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {dailyBalances.length > 50 && (
              <div className="px-4 py-3 text-center text-sm text-[var(--fg-muted)]">
                Mostrando 50 de {dailyBalances.length} registros. Exporte para ver todos.
              </div>
            )}
          </div>
        </Card>
      </SectionPanel>
    </div>
  );
}