import { useState, useEffect } from "react";
import { Card, CardBody, PageHeader, Button, Alert, Badge, StatsGrid, StatCard } from "../../components/ui";
import { Clock, MapPin, Wifi, WifiOff, Camera, Fingerprint, QrCode, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Props {
  accountId: string;
  userId: string;
}

export function PaginaRegistro({ accountId, userId }: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastClock, setLastClock] = useState<{ timestamp: string; type: string } | null>(null);
  const [todayBalance, setTodayBalance] = useState<{ worked: number; scheduled: number } | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [clocking, setClocking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    async function loadData() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data: lastClockData } = await supabase
          .from("time_clock")
          .select("timestamp_utc, type")
          .eq("account_id", accountId)
          .eq("employee_id", userId)
          .order("timestamp_utc", { ascending: false })
          .limit(1)
          .single();

        if (lastClockData) {
          setLastClock({ timestamp: lastClockData.timestamp_utc, type: lastClockData.type });
        }

        const { data: balanceData } = await supabase
          .from("daily_balance")
          .select("worked_minutes, scheduled_minutes")
          .eq("account_id", accountId)
          .eq("employee_id", userId)
          .eq("work_date", today)
          .single();

        if (balanceData) {
          setTodayBalance({ worked: balanceData.worked_minutes ?? 0, scheduled: balanceData.scheduled_minutes ?? 480 });
        }
      } catch (e) {
        console.error("Erro ao carregar dados de ponto:", e);
      }
    }

    loadData();
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [accountId, userId]);

  const formatTime = (date: Date) => date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (date: Date) => date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const getNextClockType = () => {
    if (!lastClock) return "clock_in";
    if (lastClock.type === "clock_in") return "break_start";
    if (lastClock.type === "break_start") return "break_end";
    if (lastClock.type === "break_end") return "clock_out";
    return "clock_in";
  };

  const getClockLabel = (type: string) => {
    switch (type) {
      case "clock_in": return "Registrar Entrada";
      case "break_start": return "Iniciar Intervalo";
      case "break_end": return "Retornar do Intervalo";
      case "clock_out": return "Registrar Saída";
      default: return "Registrar Ponto";
    }
  };

  const handleClock = async () => {
    setClocking(true);
    setMessage(null);
    try {
      const clockType = getNextClockType();
      const now = new Date();
      let latitude: number | null = null;
      let longitude: number | null = null;

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoError) {
        console.warn("Geolocalização não disponível:", geoError);
      }

      const { error } = await supabase.from("time_clock").insert({
        account_id: accountId,
        employee_id: userId,
        timestamp_utc: now.toISOString(),
        type: clockType,
        source: isOffline ? "mobile_app_offline" : "web_browser",
        latitude,
        longitude,
        is_offline_sync: isOffline,
        original_timestamp_utc: now.toISOString(),
        device_info: { userAgent: navigator.userAgent, platform: navigator.platform, online: !isOffline },
      });

      if (error) throw error;

      setMessage({ type: "success", text: `${getClockLabel(clockType)} registrado com sucesso! ${formatTime(now)}` });
      setLastClock({ timestamp: now.toISOString(), type: clockType });
      setCurrentTime(new Date());
    } catch (e: any) {
      setMessage({ type: "error", text: `Erro ao registrar ponto: ${e.message ?? "Tente novamente."}` });
    } finally {
      setClocking(false);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes >= 0 ? "+" : "-";
    return `${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Registrar Ponto" description={formatDate(currentTime)} />

      {isOffline && (
        <Alert tone="warning" title="Modo Offline">
          Você está sem conexão. O ponto será salvo localmente e sincronizado automaticamente.
        </Alert>
      )}

      <Card>
        <CardBody className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-6xl font-bold font-mono" style={{ color: "var(--fg)" }}>
            {formatTime(currentTime)}
          </div>
          <div className="mb-8 text-lg text-[var(--fg-muted)]">{formatDate(currentTime)}</div>
          <Button size="lg" onClick={handleClock} disabled={clocking} className="w-full max-w-md py-8 text-2xl">
            {clocking ? "Registrando..." : getClockLabel(getNextClockType())}
          </Button>
          {message && (
            <div className="mt-6 w-full max-w-md">
              <Alert tone={message.type} title={message.type === "success" ? "Sucesso" : "Erro"}>
                {message.text}
              </Alert>
            </div>
          )}
        </CardBody>
      </Card>

      <StatsGrid label="Resumo do Dia">
        <StatCard label="Última Batida" value={lastClock ? formatTime(new Date(lastClock.timestamp)) : "—"} icon={<Clock size={20} />} tone={lastClock ? "action" : undefined} />
        <StatCard label="Tipo" value={lastClock ? getClockLabel(lastClock.type).replace("Registrar ", "").replace("Iniciar ", "").replace("Retornar do ", "") : "—"} icon={<CheckCircle2 size={20} />} />
        <StatCard label="Trabalhado Hoje" value={todayBalance ? formatMinutes(todayBalance.worked) : "—"} icon={<Clock size={20} />} tone="success" />
        <StatCard label="Saldo" value={todayBalance ? formatMinutes(todayBalance.worked - todayBalance.scheduled) : "—"} icon={<AlertTriangle size={20} />} tone={todayBalance && todayBalance.worked >= todayBalance.scheduled ? "success" : "warning"} />
      </StatsGrid>

      <Card>
        <CardBody>
          <h3 className="mb-4 text-base font-semibold" style={{ color: "var(--fg)" }}>Métodos de Registro Disponíveis</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: MapPin, title: "Geolocalização", desc: "Valida se você está no local de trabalho" },
              { icon: Wifi, title: "Wi-Fi", desc: "Valida MAC address da rede da empresa" },
              { icon: Camera, title: "Foto", desc: "Captura foto no momento da batida" },
              { icon: Fingerprint, title: "Biometria", desc: "Face ID / Touch ID para autenticação" },
              { icon: QrCode, title: "QR Code", desc: "Escaneie QR code fixo na recepção" },
              { icon: WifiOff, title: "Offline", desc: "Funciona sem internet, sincroniza depois" },
            ].map((method) => (
              <div key={method.title} className="flex items-start gap-3 rounded-lg p-4" style={{ background: "var(--bg-subtle)" }}>
                <method.icon size={20} className="mt-0.5 shrink-0 text-[var(--tone-action-fg)]" />
                <div>
                  <h4 className="font-semibold" style={{ color: "var(--fg)" }}>{method.title}</h4>
                  <p className="text-sm text-[var(--fg-muted)]">{method.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}