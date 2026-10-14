import { useState } from "react";
import { PontoModule } from "./modules/PontoModule";

function App() {
  // Em produção, estes valores virão do contexto de autenticação Supabase
  const [accountId] = useState("00000000-0000-0000-0000-000000000001");
  const [userId] = useState("00000000-0000-0000-0000-000000000002");

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PontoModule
        accountId={accountId}
        userId={userId}
        onChromeChange={() => {}}
        onOpenGeneralSettings={() => {}}
      />
    </div>
  );
}

export default App;