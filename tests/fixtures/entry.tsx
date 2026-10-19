import React, {useCallback,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from '@dnex/ds';
import {PontoModule} from '../../src/modules/PontoModule';
import '../../src/index.css';
const getAccessToken=async()=> 'synthetic-test-token';
function Fixture(){const [chrome,setChrome]=useState<any>(null);const update=useCallback((value:any)=>setChrome(value),[]);return <ThemeProvider defaultTheme="light" persist={false}><p>Ensaio local com dados sintéticos</p><nav aria-label="Navegação de teste" className="flex flex-wrap gap-3">{chrome?.navItems.map((item:any)=><button key={item.id} onClick={()=>chrome.onNavSelect(item.id)}>{item.label}</button>)}</nav><PontoModule accountId="synthetic-account" userId="synthetic-user" getAccessToken={getAccessToken} onChromeChange={update} onOpenGeneralSettings={()=>{}}/></ThemeProvider>};
createRoot(document.getElementById('root')!).render(<Fixture/>);
