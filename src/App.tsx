import { PontoModule } from './modules/PontoModule';
const noop = () => {};
export default function App() {
  return <PontoModule standaloneShell onChromeChange={noop} onOpenGeneralSettings={noop} />;
}
