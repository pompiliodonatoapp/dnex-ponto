import { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '@dnex/workspace-shell';
import { Alert, Button } from '../components/ui';
import type { SidebarNavItem } from '../types';
import { Clock, CalendarCheck, FileText, Settings2, BarChart3, CalendarDays, Lock } from 'lucide-react';
import { PaginaRegistro } from './pages/PaginaRegistro';
import { PaginaEspelho } from './pages/PaginaEspelho';
import { PaginaAjustes } from './pages/PaginaAjustes';
import { createPontoApi, type PontoContext } from '../lib/ponto-api';
import type { PontoPage } from './pages/PontoFoundation';
export interface PontoModuleProps {
  accountId?: string;
  userId?: string;
  getAccessToken?: () => Promise<string | null>;
  onChromeChange: (chrome: any) => void;
  onOpenGeneralSettings: () => void;
  standaloneShell?: boolean;
}
export function PontoModule(props: PontoModuleProps) {
  return <EscopoPonto key={`${props.userId ?? ''}:${props.accountId ?? ''}`} {...props} />;
}
function EscopoPonto(props: PontoModuleProps) {
  const [pagina,setPagina] = useState<PontoPage>('registro');
  const [context,setContext] = useState<PontoContext|null>(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [retry,setRetry] = useState(0);
  const api = useMemo(()=>props.accountId && props.getAccessToken ? createPontoApi(props.accountId,props.getAccessToken) : null,[props.accountId,props.getAccessToken]);
  useEffect(()=>{
    let cancelled=false;
    setContext(null);setError('');
    if(!api) {setLoading(false);return;}
    setLoading(true);
    api.context().then(value=>{
      if(cancelled) return;
      if(!value.timeZone || !value.employeeId || value.accountId!==props.accountId || !value.userId || (props.userId && value.userId!==props.userId) || !Array.isArray(value.permissions) || !value.permissions.includes('ponto.read.self')) throw new Error('Não foi possível confirmar seu vínculo com esta empresa.');
      new Intl.DateTimeFormat('pt-BR',{timeZone:value.timeZone}).format();
      setContext(value);
    }).catch(e=>{if(!cancelled)setError(e instanceof Error ? e.message : 'Não foi possível confirmar seu acesso.');}).finally(()=>{if(!cancelled)setLoading(false);});
    return ()=>{cancelled=true;};
  },[api,props.accountId,props.userId,retry]);
  const navItems: SidebarNavItem[] = useMemo(()=>[
    {id:'registro',label:'Registrar Ponto',icon:<Clock size={18}/>},
    {id:'espelho',label:'Espelho de Ponto',icon:<CalendarCheck size={18}/>},
    {id:'ajustes',label:'Ajustes e Abonos',icon:<FileText size={18}/>},
    {id:'escalas',label:'Escalas e Turnos',icon:<CalendarDays size={18}/>},
    {id:'relatorios',label:'Relatórios',icon:<BarChart3 size={18}/>},
    {id:'fechamento',label:'Fechamento',icon:<Lock size={18}/>},
    {id:'configuracoes',label:'Configurações',icon:<Settings2 size={18}/>},
  ],[]);
  const onNavSelect=useCallback((id:string)=>setPagina(id as PontoPage),[]);
  const {onChromeChange}=props;
  useEffect(()=>{onChromeChange({navItems,activeId:pagina,onNavSelect,title:'Ponto Eletrônico',section:navItems.find(item=>item.id===pagina)?.label});return()=>onChromeChange(null);},[navItems,pagina,onNavSelect,onChromeChange]);
  const content=<div className="ponto-foundation" data-ponto-page={pagina}>
    {!api ? <div className="p-6"><Alert tone="info" title="Acesse pelo DNEX Hub">Abra o Ponto pelo Hub para utilizar sua sessão e selecionar a empresa. <a href="https://hub.dnexsistemas.com.br/" className="underline">Abrir DNEX Hub</a></Alert></div>
      : loading ? <p role="status" className="p-6">Confirmando seu acesso ao Ponto…</p>
      : !context ? <div className="p-6 space-y-4"><Alert tone="warning" title="Acesso não confirmado">{error}</Alert><Button onClick={()=>setRetry(value=>value+1)}>Tentar novamente</Button></div>
      : <>
        {pagina==='registro' && <PaginaRegistro api={api} timeZone={context.timeZone} attemptScope={`${context.userId}:${context.accountId}:${context.employeeId}`} canClock={context.permissions.includes('ponto.clock.self')} />}
        {pagina==='espelho' && <PaginaEspelho api={api} timeZone={context.timeZone} />}
        {pagina==='ajustes' && <PaginaAjustes api={api} context={context} />}
        {!['registro','espelho','ajustes'].includes(pagina) && <div className="p-6"><Alert tone="info" title="Integração em andamento">Esta rotina ainda não está habilitada para operações. Os dados serão disponibilizados após a integração e validação da jornada.</Alert></div>}
      </>}
  </div>;
  if(!props.standaloneShell)return content;
  return <WorkspaceShell products={[]} currentProductKey="ponto" productLabel="DNEX Ponto" pageLabel={navItems.find(item=>item.id===pagina)?.label} sections={[{key:'ponto',items:navItems.map(item=>({key:item.id,label:item.label,icon:item.icon,active:pagina===item.id,kind:'action' as const,onSelect:()=>onNavSelect(item.id)}))}]}>{content}</WorkspaceShell>;
}
