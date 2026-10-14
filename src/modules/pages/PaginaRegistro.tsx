import { useState, useEffect, useCallback } from "react";
import { Card, CardBody, PageHeader, Button, Alert, Badge, StatsGrid, StatCard } from "../../components/ui";
import { Clock, MapPin, Wifi, WifiOff, Camera, Fingerprint, QrCode, CheckCircle2, AlertTriangle, RefreshCw, CloudUpload } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { saveOfflineEvent, getPendingCount, getPendingEvents, removeEvent } from "../../lib/offline-storage";
import type { OfflineClockEvent } from "../../lib/offline-storage";

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
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Load pending count on mount and after each clock event
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (e) {
      console.error("Erro ao contar eventos pendentes:", e);
    }
  }, []);

  // Sync pending offline events to Supabase
  const syncOfflineEvents = useCallback(async () => {
    if (!navigator.onLine || syncing) return;
    setSyncing(true);
    try {
      const events = await getPendingEvents();
      if (events.length === 0) {
        setSyncing(false);
        return;
      }
      let synced = 0;
      for (const event of events) {
        try {
          const { error } = await supabase.from("time_clock").insert({
            account_id: event.account_id,
            employee_id: event.employee_id,
            timestamp_utc: event.timestamp_utc,
            type: event.type,
            source: event.source,
            latitude: event.latitude,
            longitude: event.longitude,
            is_offline_sync: true,
            original_timestamp_utc: event.original_timestamp_utc,
            device_info: event.device_info,
          });
          if (!error) {
            await removeEvent(event.id);
            synced++;
          } else {
            console.warn(`Falha ao sincronizar evento ${event.id}:`, error.message);
          }
        } catch (err) {
          console.error(`Erro de rede ao sincronizar evento ${event.id}:`, err);
          break; // Stop on network error
        }
      }
      if (synced > 0) {
        setMessage({ type: "success", text: `${synced} registro(s) offline sincronizado(s) com sucesso.` });
        await refreshPendingCount();
      }
    } catch (e) {
      console.error("Erro na sincronização:", e);
    } finally {
      setSyncing(false);
    }
  }, [syncing, refreshPendingCount]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-sync when coming back online
      setTimeout(() => syncOfflineEvents(), 1000);
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for SW sync completion messages
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "sync-complete") {
        refreshPendingCount();
      }
    };
    navigator.serviceWorker?.ready.then((reg) => {
      reg.active?.addEventListener("message", handleSWMessage as any);
    });

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
    refreshPendingCount();

    // Store anon key in SW IndexedDB for background sync
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (anonKey && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({ type: "store-anon-key", key: anonKey });
      });
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [accountId, userId, refreshPendingCount, syncOfflineEvents]);

  // Trigger sync when online and there are pending events
  useEffect(() => {
    if (!isOffline && pendingCount > 0 && !syncing) {
      syncOfflineEvents();
    }
  }, [isOffline, pendingCount, syncing, syncOfflineEvents]);

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

      const eventData = {
        account_id: accountId,
        employee_id: userId,
        timestamp_utc: now.toISOString(),
        type: clockType as "clock_in" | "break_start" | "break_end" | "clock_out",
        source: isOffline ? "mobile_app_offline" : "web_browser",
        latitude,
        longitude,
        is_offline_sync: isOffline,
        original_timestamp_utc: now.toISOString(),
        device_info: { userAgent: navigator.userAgent, platform: navigator.platform, online: !isOffline },
      };

      if (isOffline || !navigator.onLine) {
        // Save to IndexedDB for later sync
        const offlineEvent: OfflineClockEvent = {
          id: crypto.randomUUID(),
          ...eventData,
          created_at_local: new Date().toISOString(),
        };
        await saveOfflineEvent(offlineEvent);
        await refreshPendingCount();
        setMessage({ type: "info", text: `Ponto registrado offline (${formatTime(now)}). Será sincronizado automaticamente.` });
      } else {
        // Direct Supabase insert
        const { error } = await supabase.from("time_clock").insert(eventData);
        if (error) throw error;
        setMessage({ type: "success", text: `${getClockLabel(clockType)} registrado com sucesso! ${formatTime(now)}` });
      }

      setLastClock({ timestamp: now.toISOString(), type: clockType });
      setCurrentTime(new Date());
    } catch (e: any) {
      // If direct insert failed, try saving offline as fallback
      try {
        const clockType = getNextClockType();
        const now = new Date();
        const offlineEvent: OfflineClockEvent = {
          id: crypto.randomUUID(),
          account_id: accountId,
          employee_id: userId,
          timestamp_utc: now.toISOString(),
          type: clockType as "clock_in" | "break_start" | "break_end" | "clock_out",
          source: "web_browser_fallback",
          latitude: null,
          longitude: null,
          is_offline_sync: false,
          original_timestamp_utc: now.toISOString(),
          device_info: { userAgent: navigator.userAgent, platform: navigator.platform, online: true, error: e.message },
          created_at_local: new Date().toISOString(),
        };
        await saveOfflineEvent(offlineEvent);
        await refreshPendingCount();
        setMessage({ type: "info", text: `Erro na conexão. Ponto salvo offline para sincronização posterior.` });
        setLastClock({ timestamp: now.toISOString(), type: clockType });
      } catch (saveErr) {
        setMessage({ type: "error", text: `Erro ao registrar ponto: ${e.message ?? "desconhecido"}` });
      }
    } finally {
      setClocking(false);
    }
  };

  const formatMinutes = (m: number) => {
    const h = Math.floor(Math.abs(m) / 60);
    const min = Math.abs(m) % 60;
    return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  };

  const clockType = getNextClockType();

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Registro de Ponto" description={formatDate(currentTime)} />

      {/* Sync Status Indicator */}
      {(pendingCount > 0 || syncing) && (
        <Alert tone={syncing ? "info" : "warning"} title={syncing ? "Sincronizando..." : `${pendingCount} registro(s) pendente(s)`}>
          {syncing ? (
            <span className="flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> Sincronizando registros offline...</span>
          ) : (
            <span className="flex items-center gap-2">
              <CloudUpload size={14} /> Registros aguardando conexão. Clique para sincronizar agora.
              <button onClick={syncOfflineEvents} className="ml-2 underline font-semibold hover:text-blue-700">Sincronizar</button>
            </span>
          )}
        </Alert>
      )}

      {isOffline && pendingCount === 0 && (
        <Alert tone="warning" title="Modo Offline">
          Você está sem conexão. Os pontos registrados serão salvos localmente e sincronizados automaticamente quando a conexão retornar.
        </Alert>
      )}

      <Card>
        <CardBody className="flex flex-col items-center gap-6 py-8">
          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums tracking-tight" style={{ color: "var(--fg)" }}>
              {formatTime(currentTime)}
            </div>
            <div className="mt-2 text-sm text-[var(--fg-muted)]">{formatDate(currentTime)}</div>
          </div>

          <Button
            size="lg"
            onClick={handleClock}
            disabled={clocking}
            className="min-w-[240px]"
          >
            {clocking ? "Registrando..." : getClockLabel(clockType)}
          </Button>

          {lastClock && (
            <div className="text-center text-sm text-[var(--fg-muted)]">
              Último registro: <span className="font-semibold text-[var(--fg)]">{getClockLabel(lastClock.type)}</span> às{" "}
              <span className="font-mono text-[var(--fg)]">{formatTime(new Date(lastClock.timestamp))}</span>
            </div>
          )}

          {message && (
            <div className="w-full max-w-md">
              <Alert tone={message.type} title={message.type === "success" ? "Sucesso" : message.type === "error" ? "Erro" : "Info"}>
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
              { icon: WifiOff, title: "Offline", desc: `Funciona sem internet${pendingCount > 0 ? ` (${pendingCount} pendente)` : ""}` },
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