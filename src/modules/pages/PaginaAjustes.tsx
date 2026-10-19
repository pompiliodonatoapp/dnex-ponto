import { useState, useEffect, useRef } from 'react';
import { Card, CardBody, PageHeader, Button, EmptyState, Badge, Alert } from '../../components/ui';
import { FileText } from 'lucide-react';
import { clockLabels, localDateValue, formatCivilDate, type PontoApi, type PontoContext, type Adjustment, type ClockType, type AdjustmentInput } from '../../lib/ponto-api';
import {pendingKey,readPending,writePending,clearPending,commandFingerprint} from '../../lib/ponto-pending';
import {zonedTimeToUtc,civilDateInZone} from '../../lib/ponto-timezone';
export function PaginaAjustes({api,context}: {api:PontoApi;context:PontoContext}) {
  const [requests,setRequests]=useState<Adjustment[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const [revision,setRevision]=useState(0);
  const [date,setDate]=useState(civilDateInZone(new Date(),context.timeZone));
  const [reason,setReason]=useState('');
  const [confirmed,setConfirmed]=useState(false);
  const [punches,setPunches]=useState<Array<{time:string;type:ClockType}>>([{time:'',type:'clock_in'}]);
  const key=pendingKey([context.userId,context.accountId,context.employeeId].join(':'),'adjustment');
  const pending=useRef<{idempotencyKey:string;fingerprint:string}|null>(null);
  const [pendingExists,setPendingExists]=useState(false);
  const [storageReady,setStorageReady]=useState(false);
  useEffect(()=>{try{pending.current=readPending<{idempotencyKey:string;fingerprint:string}>(key);if(pending.current && (typeof pending.current.idempotencyKey!=='string'||typeof pending.current.fingerprint!=='string'))throw new Error('Tentativa local inválida. Procure o suporte.');setPendingExists(!!pending.current);setStorageReady(true);}catch(e){setError(e instanceof Error?e.message:'Armazenamento local indisponível.');}},[key]);
  const [decisionReason,setDecisionReason]=useState<Record<string,string>>({});
  const canAdjust=context.permissions.includes('ponto.adjust.self');
  const canReview=context.permissions.includes('ponto.review');
  const fieldClass='w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]';
  useEffect(()=>{let cancelled=false;setLoading(true);setError('');setRequests([]);api.adjustments().then(data=>{if(!Array.isArray(data.adjustments))throw new Error('Histórico indisponível.');if(!cancelled)setRequests(data.adjustments);}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:'Não foi possível consultar as solicitações.');}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[api,revision]);
  async function submit(event:React.FormEvent) {
    event.preventDefault(); if(busy||!canAdjust||!storageReady||!confirmed)return;setError('');setNotice('');
    if(reason.trim().length<3 || punches.some(punch=>!punch.time || !Number.isFinite(new Date(punch.time+'Z').getTime()))) {setError('Informe motivo com ao menos três caracteres e preencha todos os horários.');return;}
    let proposed:Array<{timestampUtc:string;type:ClockType}>;try{proposed=punches.map(punch=>({timestampUtc:zonedTimeToUtc(punch.time,context.timeZone),type:punch.type}));}catch(e){setError(e instanceof Error?e.message:'Horário inválido.');return;}
    if(proposed.some((punch,index)=>index>0 && punch.timestampUtc<=proposed[index-1].timestampUtc)){setError('Informe as marcações em ordem cronológica, sem horários repetidos.');return;}
    setBusy(true);try{const command={mode:'replace_day' as const,targetDate:date,reason:reason.trim(),punches:proposed};const fingerprint=await commandFingerprint(command);if(pending.current && pending.current.fingerprint!==fingerprint)throw new Error('Informe os mesmos dados da tentativa anterior para confirmar o envio. Se não lembrar, procure o suporte.');pending.current ??= {idempotencyKey:crypto.randomUUID(),fingerprint};writePending(key,pending.current);setPendingExists(true);const result=await api.requestAdjustment({...command,idempotencyKey:pending.current.idempotencyKey});if(!result.requestId||!['pending','approved','rejected'].includes(result.status))throw new Error('Resposta de solicitação inválida.');clearPending(key);pending.current=null;setPendingExists(false);setNotice(`Solicitação ${result.requestId} confirmada (${result.status === 'pending' ? 'pendente' : result.status === 'approved' ? 'aprovada' : 'rejeitada'}).`);setReason('');setConfirmed(false);setPunches([{time:'',type:'clock_in'}]);setRevision(x=>x+1);}catch(e){setError(e instanceof Error?e.message:'Não foi possível confirmar o envio.');}finally{setBusy(false);}
  }
  async function decide(request:Adjustment,decision:'approved'|'rejected') {
    if(busy || !canReview || request.employeeId===context.employeeId)return;
    const reason=decisionReason[request.requestId]?.trim() ?? '';
    if(reason.length<3){setError('Informe a justificativa da decisão com ao menos três caracteres.');return;}
    setBusy(true);setError('');setNotice('');try{await api.decide(request.requestId,{decision,reason});setNotice('Decisão registrada.');setRevision(x=>x+1);}catch(e){setError(e instanceof Error?e.message:'Não foi possível confirmar a decisão.');}finally{setBusy(false);}
  }
  return <div className="space-y-6 p-6"><PageHeader title="Ajustes de Ponto" description="Solicite correções e acompanhe a análise. As marcações originais são preservadas. Exibimos até 200 solicitações mais recentes."/>
    {notice && <div role="status"><Alert tone="success" title="Confirmado">{notice}</Alert></div>}
    {error && <div role="alert"><Alert tone="error" title="Atenção">{error}</Alert></div>}
    {pendingExists && <Alert tone="warning" title="Envio não confirmado">A identificação da tentativa anterior está preservada. Preencha os mesmos dados e confirme o envio antes de iniciar outra solicitação. O motivo não fica gravado neste dispositivo.</Alert>}
    {canAdjust && <Card><CardBody><form onSubmit={submit} className="space-y-4"><h2 className="text-base font-semibold">Solicitar correção</h2>
      <label className="block text-sm">Data de referência<input className={fieldClass} type="date" value={date} onChange={e=>setDate(e.target.value)} required disabled={busy}/></label>
      <p className="text-sm text-[var(--fg-muted)]">Informe data e horário de cada marcação no fuso da empresa ({context.timeZone}). Inclua TODAS as marcações do dia: a aprovação substitui a projeção inteira desta data. Jornadas que atravessam meia-noite exigem solicitações separadas por data.</p>
      {punches.map((punch,index)=><fieldset key={index} className="grid gap-3 md:grid-cols-2"><legend className="text-sm font-semibold">Marcação {index+1}</legend><label className="block text-sm">Tipo<select className={fieldClass} disabled={busy} value={punch.type} onChange={e=>setPunches(items=>items.map((item,i)=>i===index?{...item,type:e.target.value as ClockType}:item))}>{Object.entries(clockLabels).map(([type,label])=><option key={type} value={type}>{label}</option>)}</select></label><label className="block text-sm">Data e hora<input className={fieldClass} type="datetime-local" required disabled={busy} value={punch.time} onChange={e=>setPunches(items=>items.map((item,i)=>i===index?{...item,time:e.target.value}:item))}/></label></fieldset>)}
      <div className="flex flex-wrap gap-3"><Button type="button" variant="secondary" disabled={busy||punches.length>=8} onClick={()=>setPunches(items=>[...items,{time:'',type:'clock_out'}])}>Adicionar marcação</Button><Button type="button" variant="secondary" disabled={busy||punches.length<=1} onClick={()=>setPunches(items=>items.slice(0,-1))}>Remover última</Button></div>
      <label className="block text-sm">Motivo<textarea className={fieldClass} required minLength={3} maxLength={2000} rows={3} value={reason} disabled={busy} onChange={e=>setReason(e.target.value)}/></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/>Confirmo que informei todas as marcações da data de referência.</label><Button type="submit" disabled={busy||!storageReady||!confirmed}>{busy?'Enviando…':pendingExists?'Confirmar envio anterior':'Enviar solicitação'}</Button>
    </form></CardBody></Card>}
    <div className="flex flex-wrap justify-between items-center gap-3"><h2 className="text-base font-semibold">{canReview?'Solicitações da empresa':'Minhas solicitações'}</h2><Button variant="secondary" disabled={busy||loading} onClick={()=>setRevision(x=>x+1)}>Atualizar</Button></div>
    {loading?<p role="status">Carregando solicitações…</p>:requests.length===0?!error&&<EmptyState icon={<FileText/>} title="Nenhuma solicitação" description="As solicitações enviadas aparecerão aqui."/>:requests.map(request=><Card key={request.requestId}><CardBody className="space-y-3"><div className="flex flex-wrap gap-3"><span>{formatCivilDate(request.targetDate)}</span><Badge tone={request.status==='approved'?'success':request.status==='rejected'?'danger':'warning'}>{request.status==='approved'?'Aprovada':request.status==='rejected'?'Rejeitada':'Pendente'}</Badge></div><p className="break-words">{request.reason}</p>{canReview && <p className="text-sm break-all">Empregado: {request.employeeId}</p>}{!request.punches && <Alert tone="warning" title="Solicitação legada">Os horários estruturados desta solicitação não estão disponíveis. A decisão está indisponível nesta tela.</Alert>}<ul className="text-sm space-y-2">{(request.punches ?? []).map((punch,index)=><li key={index}>{clockLabels[punch.type]} · {new Date(punch.timestampUtc).toLocaleString('pt-BR',{timeZone:context.timeZone})}</li>)}</ul>{canReview&&!!request.punches&&request.status==='pending'&&request.employeeId!==context.employeeId&&<div className="space-y-3"><label className="block text-sm">Justificativa da decisão<textarea maxLength={2000} className={fieldClass} disabled={busy} value={decisionReason[request.requestId]??''} onChange={e=>setDecisionReason(values=>({...values,[request.requestId]:e.target.value}))}/></label><div className="flex gap-3 flex-wrap"><Button disabled={busy} onClick={()=>decide(request,'approved')}>Aprovar</Button><Button variant="secondary" disabled={busy} onClick={()=>decide(request,'rejected')}>Rejeitar</Button></div></div>}</CardBody></Card>)}
    <Alert tone="info" title="Abonos e anexos">Abonos por período e comprovantes serão disponibilizados após sua integração. A aprovação atualiza a projeção do espelho, preserva as batidas originais e não calcula saldos automaticamente.</Alert>
  </div>;
}
