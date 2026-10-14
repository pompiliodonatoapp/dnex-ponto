import { useState, useEffect } from "react";
import { Card, CardBody, PageHeader, Button, EmptyState } from "../../components/ui";
import { Calendar, Clock, CheckCircle2, AlertTriangle, XCircle, Download } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Props {
  accountId: string;
  userId: string;
}

interface DailyRecord {
  date: string;
  status: "ok" | "pending" | "absence" | "holiday" | "weekend";
  workedMinutes: number;
  scheduledMinutes: number;
  clockIns: Array<{ time: string; type: string }>;
}

export function PaginaEspelho({ accountId, userId }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyRecord | null>(null);

  useEffect(() => {
    async function loadMonthData() {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split("T")[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

        const { data: balances } = await supabase
          .from("daily_balance")
          .select("*")
          .eq("account_id", accountId)
          .eq("employee_id", userId)
          .gte("work_date", startDate)
          .lte("work_date", endDate)
          .order("work_date");

        const { data: clocks } = await supabase
          .from("time_clock")
          .select("timestamp_utc, type")
          .eq("account_id", accountId)
          .eq("employee_id", userId)
          .gte("timestamp_utc", startDate)
          .lte("timestamp_utc", endDate + "T23:59:59")
          .order("timestamp_utc");

        const clocksByDate: Record<string, Array<{ time: string; type: string }>> = {};
        clocks?.forEach((c) => {
          const date = c.timestamp_utc.split("T")[0];
          if (!clocksByDate[date]) clocksByDate[date] = [];
          clocksByDate[date].push({
            time: new Date(c.timestamp_utc).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            type: c.type,
          });
        });

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthRecords: DailyRecord[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().split("T")[0];
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const balance = balances?.find((b) => b.work_date === dateStr);
          const dayClocks = clocksByDate[dateStr] || [];

          let status: DailyRecord["status"] = "ok";
          if (isWeekend) status = "weekend";
          else if (!balance && dayClocks.length === 0 && date <= new Date()) status = "absence";
          else if (balance?.status === "adjusted") status = "pending";

          monthRecords.push({
            date: dateStr,
            status,
            workedMinutes: balance?.worked_minutes ?? 0,
            scheduledMinutes: balance?.scheduled_minutes ?? 480,
            clockIns: dayClocks,
          });
        }

        setRecords(monthRecords);
      } catch (e) {
        console.error("Erro ao carregar espelho de ponto:", e);
      } finally {
        setLoading(false);
      }
    }

    loadMonthData();
  }, [accountId, userId, currentMonth]);

  const getStatusColor = (status: DailyRecord["status"]) => {
    switch (status) {
      case "ok": return "var(--tone-success-bg)";
      case "pending": return "var(--tone-warning-bg)";
      case "absence": return "var(--tone-danger-bg)";
      case "weekend": return "var(--bg-subtle)";
      default: return "var(--bg-subtle)";
    }
  };

  const getStatusIcon = (status: DailyRecord["status"]) => {
    switch (status) {
      case "ok": return <CheckCircle2 size={16} className="text-[var(--tone-success-fg)]" />;
      case "pending": return <AlertTriangle size={16} className="text-[var(--tone-warning-fg)]" />;
      case "absence": return <XCircle size={16} className="text-[var(--tone-danger-fg)]" />;
      default: return null;
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const changeMonth = (delta: number) => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Espelho de Ponto" description="Visualize suas marcações e saldo mensal" />

      <Card>
        <CardBody className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => changeMonth(-1)}>← Anterior</Button>
          <h2 className="text-xl font-semibold capitalize" style={{ color: "var(--fg)" }}>{monthName}</h2>
          <Button variant="secondary" onClick={() => changeMonth(1)}>Próximo →</Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-[var(--fg-muted)] py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {records.map((record) => {
              const day = new Date(record.date).getDate();
              return (
                <button
                  key={record.date}
                  onClick={() => setSelectedDay(record)}
                  className="aspect-square rounded-lg p-2 flex flex-col items-center justify-center transition-all hover:scale-105"
                  style={{ background: getStatusColor(record.status) }}
                >
                  <span className="text-lg font-semibold" style={{ color: "var(--fg)" }}>{day}</span>
                  {getStatusIcon(record.status)}
                  {record.workedMinutes > 0 && (
                    <span className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>{formatMinutes(record.workedMinutes)}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ background: "var(--tone-success-bg)" }} /><span className="text-[var(--fg-muted)]">Dia OK</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ background: "var(--tone-warning-bg)" }} /><span className="text-[var(--fg-muted)]">Pendência</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ background: "var(--tone-danger-bg)" }} /><span className="text-[var(--fg-muted)]">Falta</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ background: "var(--bg-subtle)" }} /><span className="text-[var(--fg-muted)]">Folga</span></div>
          </div>
        </CardBody>
      </Card>

      {selectedDay && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
                {new Date(selectedDay.date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <Button variant="secondary" onClick={() => setSelectedDay(null)}>Fechar</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: "var(--fg)" }}>Marcações</h4>
                {selectedDay.clockIns.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedDay.clockIns.map((clock, idx) => (
                      <li key={idx} className="flex items-center gap-2 p-2 rounded" style={{ background: "var(--bg-subtle)" }}>
                        <Clock size={16} className="text-[var(--tone-action-fg)]" />
                        <span className="font-mono" style={{ color: "var(--fg)" }}>{clock.time}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-subtle)]">{clock.type.replace("_", " ")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon={<Clock />} title="Sem marcações" description="Nenhuma batida registrada neste dia." />
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: "var(--fg)" }}>Resumo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded" style={{ background: "var(--bg-subtle)" }}>
                    <span className="text-[var(--fg-muted)]">Trabalhado:</span>
                    <span className="font-mono font-semibold" style={{ color: "var(--fg)" }}>{formatMinutes(selectedDay.workedMinutes)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded" style={{ background: "var(--bg-subtle)" }}>
                    <span className="text-[var(--fg-muted)]">Programado:</span>
                    <span className="font-mono font-semibold" style={{ color: "var(--fg)" }}>{formatMinutes(selectedDay.scheduledMinutes)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded" style={{ background: "var(--bg-subtle)" }}>
                    <span className="text-[var(--fg-muted)]">Saldo:</span>
                    <span className="font-mono font-semibold" style={{ color: selectedDay.workedMinutes >= selectedDay.scheduledMinutes ? "var(--tone-success-fg)" : "var(--tone-warning-fg)" }}>
                      {formatMinutes(selectedDay.workedMinutes - selectedDay.scheduledMinutes)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Button variant="secondary" className="w-full"><Download size={18} className="mr-2" />Exportar PDF</Button>
        <Button variant="secondary" className="w-full"><Download size={18} className="mr-2" />Exportar Excel</Button>
      </div>
    </div>
  );
}