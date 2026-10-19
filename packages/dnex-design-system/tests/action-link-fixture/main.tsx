import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Bell } from 'lucide-react';
import { AuthLink } from '../../src/screens/auth/AuthCard';
import { Button } from '../../src/components/primitives/Button';
import { PageHeader } from '../../src/components/shell/PageHeader';
import { SectionPanel } from '../../src/components/composed/SectionPanel';
import { NotificationCenter } from '../../src/components/composed/NotificationCenter';
import { StatusPipeline, StatusPipelineFilters } from '../../src/components/charts/StatusPipeline';
import '../../src/styles/status-pipeline.css';
import './fixture.css';
function App() {
 const [calls,setCalls] = useState(0), [reads,setReads] = useState(0), [scope,setScope] = useState('all');
 return <main className="min-h-screen bg-surface p-4 text-fg"><div className="mx-auto flex max-w-xl flex-col gap-6">
 <PageHeader title="Ações do DNEX" eyebrow="Ações disponíveis" description="Fixture de componentes reais; nenhuma operação externa." />
 <section className="flex flex-wrap items-center gap-4" aria-label="Links de autenticação"><AuthLink onClick={()=>setCalls(n=>n+1)}>Esqueci a senha</AuthLink><AuthLink href="#destino">Ajuda de autenticação</AuthLink></section>
 <section className="flex flex-wrap items-center gap-4" aria-label="Botões"><Button variant="link" onClick={()=>setCalls(n=>n+1)}>Abrir detalhes</Button><Button variant="link" disabled onClick={()=>setCalls(n=>n+1)}>Ação bloqueada</Button><Button variant="link" loading onClick={()=>setCalls(n=>n+1)}>Carregando</Button><Button variant="link" asChild><a href="#destino">Ir ao destino</a></Button><Button data-testid="primary">Ação principal</Button></section>
 <SectionPanel title="Painel" icon={<Bell aria-hidden="true" data-testid="section-icon" />}><p>Ícone funcional sobre a tonalidade de ação existente.</p></SectionPanel>
 <NotificationCenter notifications={[{id:'synthetic',type:'info',title:'Notificação sintética',date:new Date('2026-10-08T12:00:00Z'),read:false}]} onReadAll={()=>setReads(n=>n+1)} />
 <StatusPipeline stages={[{id:"open",label:"Aberto",count:2,valueCents:1000},{id:"empty",label:"Sem registros",count:0,valueCents:0}]} description="Dados exclusivamente sintéticos" valueLabel="Valor nominal" controls={<StatusPipelineFilters label="Escopo da carteira" value={scope} options={[{value:"all",label:"Todos"},{value:"mine",label:"Meus"}]} onChange={setScope}/>} /><output data-testid="scope">{scope}</output><output data-testid="calls">{calls}</output><output data-testid="reads">{reads}</output><p id="destino">Destino local</p>
 </div></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);