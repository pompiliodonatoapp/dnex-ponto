import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {IntegrationsSettings} from '../../src/screens/settings/IntegrationsSettings';
import './fixture.css';
const statuses=['connected','available','connecting','planned','error'] as const;
function App(){const [calls,setCalls]=useState<string[]>([]);const action=(name:string)=>(id:string)=>setCalls(current=>[...current,name+':'+id]);return <main className="min-h-screen bg-surface p-4 text-fg"><IntegrationsSettings integrations={statuses.map((status,index)=>({id:String(index),status,name:'Provedor com nome longo e IDENTIFICADORSEMESPACOS'.repeat(3),description:'Descrição realista com referência https://example.invalid/'+ 'CAMINHOSEMESPACO'.repeat(8),meta:'Conta conectada como '+ 'REFERENCIAEXTENSA'.repeat(10)}))} onConnect={action('connect')} onConfigure={action('configure')} onDisconnect={action('disconnect')} onReconnect={action('reconnect')}/><output data-testid="calls">{JSON.stringify(calls)}</output></main>};createRoot(document.getElementById('root')!).render(<App/>);
