import { useEffect, useRef, useState } from 'react';
import { Card, CardBody, PageHeader, Button, Alert } from '../../components/ui';
import { clockLabels, type PontoApi, type ClockType, type ClockReceipt } from '../../lib/ponto-api';
import {pendingKey,readPending,writePending,clearPending} from '../../lib/ponto-pending';
interface Props { api: PontoApi; canClock: boolean; attemptScope:string; timeZone:string }
export function PaginaRegistro({api, canClock, attemptScope, timeZone}: Props) {
  const [now,setNow] = useState(new Date());
  const [type,setType] = useState<ClockType>('clock_in');
  const [receipt,setReceipt] = useState<ClockReceipt|null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [offline,setOffline] = useState(!navigator.onLine);
  const key=pendingKey(attemptScope,'clock');
  const attempt = useRef<{idempotencyKey:string;type:ClockType}|null>(null);
  const [storageReady,setStorageReady]=useState(false);
  useEffect(()=>{try{const pending=readPending<{idempotencyKey:string;type:ClockType}>(key);if(pending && (typeof pending.idempotencyKey!=='string'||!clockLabels[pending.type]))throw new Error('Tentativa local inválida. Procure o suporte.');attempt.current=pending;if(pending)setType(pending.type);setStorageReady(true);}catch(e){setError(e instanceof Error?e.message:'Armazenamento local indisponível.');}},[key]);
  useEffect(() => { const timer = setInterval(()=>setNow(new Date()),1000); const update = ()=>setOffline(!navigator.onLine); window.addEventListener('online',update); window.addEventListener('offline',update); return ()=>{clearInterval(timer);window.removeEventListener('online',update);window.removeEventListener('offline',update);}; },[]);
  async function clock() {
    if(busy || offline || !canClock || !storageReady) return;
    setBusy(true);setError('');
    try { attempt.current ??= {idempotencyKey:crypto.randomUUID(),type};writePending(key,attempt.current); const result = await api.clock(attempt.current); if(!['created','duplicate'].includes(result.status)||!result.receipt?.clockId || !Number.isFinite(Date.parse(result.receipt.timestampUtc)) || result.receipt.idempotencyKey!==attempt.current.idempotencyKey || result.receipt.type!==attempt.current.type) throw new Error('O servidor não confirmou o registro. Tente novamente.');clearPending(key);setReceipt(result.receipt); attempt.current=null; }
    catch(e) {setError(e instanceof Error ? e.message : 'Não foi possível confirmar o registro.');}
    finally {setBusy(false);}
  }
  return <div className="space-y-6 p-6">
    <PageHeader title="Registro de Ponto" description="Registre suas marcações e confira o comprovante do servidor." />
    {offline && <Alert tone="warning" title="Sem conexão">O registro exige conexão. Nenhuma marcação será criada automaticamente.</Alert>}
    <Card><CardBody className="flex flex-col gap-6 items-center py-8">
      <div className="font-mono text-[length:var(--text-kpi)] tabular-nums">{now.toLocaleTimeString('pt-BR',{timeZone})}</div>
      <p className="text-sm text-[var(--fg-muted)]">{now.toLocaleDateString('pt-BR',{dateStyle:'full',timeZone})} · fuso da empresa: {timeZone}</p>
      <div className="w-full max-w-sm"><label htmlFor="clock-type" className="block mb-2 text-sm">Marcação</label><select id="clock-type" className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]" value={type} disabled={busy || !!attempt.current} onChange={e=>setType(e.target.value as ClockType)}>{Object.entries(clockLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
      <Button size="lg" disabled={busy || offline || !canClock || !storageReady} onClick={clock}>{busy ? 'Registrando…' : attempt.current ? 'Confirmar tentativa anterior' : 'Registrar ponto'}</Button>
      {error && <div role="alert" className="w-full"><Alert tone="error" title="Registro não confirmado">{error} Uma nova tentativa usa a mesma identificação para evitar duplicidade.</Alert></div>}
      {receipt && <div role="status" className="w-full"><Alert tone="success" title="Registro confirmado"><p>{clockLabels[receipt.type]} · {new Date(receipt.timestampUtc).toLocaleString('pt-BR',{timeZone})}</p><p className="break-all text-sm">Comprovante: {receipt.clockId}</p></Alert></div>}
    </CardBody></Card>
    <Alert tone="info" title="Registros offline anteriores">Filas antigas permanecem preservadas neste dispositivo. A sincronização automática foi suspensa; estes registros não são comprovantes de envio.</Alert>
  </div>;
}
