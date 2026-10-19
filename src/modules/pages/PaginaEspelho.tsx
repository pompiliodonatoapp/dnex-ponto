import { useState, useEffect } from 'react';
import { Card, CardBody, PageHeader, Button, EmptyState, Alert } from '../../components/ui';
import { Clock } from 'lucide-react';
import { clockLabels, localDateValue, type PontoApi, type ClockReceipt } from '../../lib/ponto-api';
import {civilDateInZone} from '../../lib/ponto-timezone';
export function PaginaEspelho({api,timeZone}: {api:PontoApi;timeZone:string}) {
  const [month,setMonth]=useState(()=>{const [year,month]=civilDateInZone(new Date(),timeZone).split('-').map(Number);return new Date(year,month-1,1);});
  const [clocks,setClocks]=useState<ClockReceipt[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  useEffect(()=>{let cancelled=false;setLoading(true);setClocks([]);setError('');
    api.mirror(localDateValue(month),localDateValue(new Date(month.getFullYear(),month.getMonth()+1,0))).then(data=>{if(data.timeZone!==timeZone || !Array.isArray(data.clocks) || (data.effectiveClocks!==undefined && !Array.isArray(data.effectiveClocks)))throw new Error('Resposta de marcações indisponível.');if(!cancelled)setClocks(data.effectiveClocks ?? data.clocks);}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:'Não foi possível carregar o espelho.');}).finally(()=>{if(!cancelled)setLoading(false);});
    return()=>{cancelled=true;};
  },[api,month,retry,timeZone]);
  const changeMonth=(delta:number)=>setMonth(new Date(month.getFullYear(),month.getMonth()+delta,1));
  return <div className="space-y-6 p-6"><PageHeader title="Espelho de Ponto" description="Marcações confirmadas pelo servidor. Período e horários apresentados no fuso da empresa." />
    <Card><CardBody className="flex flex-wrap items-center justify-between gap-3"><Button variant="secondary" onClick={()=>changeMonth(-1)}>Anterior</Button><h2 className="text-base font-semibold capitalize">{month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</h2><Button variant="secondary" onClick={()=>changeMonth(1)}>Próximo</Button></CardBody></Card>
    {loading?<p role="status">Carregando marcações…</p>:error?<div role="alert" className="space-y-3"><Alert tone="error" title="Não foi possível carregar o espelho">{error}</Alert><Button onClick={()=>setRetry(x=>x+1)}>Tentar novamente</Button></div>:clocks.length===0?<EmptyState icon={<Clock/>} title="Nenhuma marcação neste período" description="A ausência de marcações não determina falta ou jornada programada."/>:<Card><CardBody><ul className="divide-y divide-[var(--border)]">{clocks.map(clock=><li key={clock.clockId ?? `${clock.requestId}:${clock.timestampUtc}:${clock.type}`} className="py-3 flex flex-wrap gap-3 justify-between"><time dateTime={clock.timestampUtc} className="font-mono">{new Date(clock.timestampUtc).toLocaleString('pt-BR',{timeZone})}</time><span>{clockLabels[clock.type]}{clock.requestId && <span className="block text-sm">Correção aprovada</span>}</span></li>)}</ul></CardBody></Card>}
    <Alert tone="info" title="Apuração de jornada">Saldos, faltas e horas programadas dependem da escala e da apuração validada. Este espelho apresenta as marcações confirmadas.</Alert>
  </div>;
}
