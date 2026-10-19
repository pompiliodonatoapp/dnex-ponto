import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import * as Dialog from '@radix-ui/react-dialog';
import {GlobalRail} from '../../src/components/shell/GlobalRail';
import {SidebarDrawer} from '../../src/components/shell/Sidebar';
import {ProductGlyph} from '../../src/components/brand/ProductGlyph';
import type {GlobalRailProduct} from '../../src/components/shell/GlobalRail';
import '../../src/styles/theme.css';

const products: GlobalRailProduct[] = [
  {key:'contratos', label:'Contratos', availability:'ready'},
  {key:'normas', label:'Normas', availability:'provisioning'},
  {key:'fiscal', label:'Fiscal', availability:'unavailable'},
  {key:'crm', label:'CRM', availability:'ready'},
];
function Fixture() {
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState('nenhum');
  const [count,setCount]=useState(0);
  const select=(key:string)=>{setSelected(key);setCount(value=>value+1);};
  return <div className="flex h-dvh min-w-0 overflow-hidden bg-[var(--surface)] text-[var(--text-primary)]">
    <GlobalRail products={products} activeKey="contratos" onSelect={select} className="hidden md:flex" />
    <main className="min-w-0 flex-1 p-4">
      <SidebarDrawer items={[]} activeId="" onSelect={()=>{}} open={open} onOpenChange={setOpen}
        trigger={<Dialog.Trigger className="h-11 rounded-lg border px-3">Abrir navegação</Dialog.Trigger>}
        globalItems={products.map(item=>({...item,id:item.key,icon:<ProductGlyph product={item.key} size={28}/>}))}
        activeGlobalId="contratos" onGlobalSelect={select}/>
      <p role="status">Seleções: {count}. Destino: {selected}.</p>
      <p>Fixture ilustrativa. Nenhuma chamada de rede ou alteração real.</p>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
