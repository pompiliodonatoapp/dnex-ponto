import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, TopbarGlobalActions } from "@dnex/ds";
import "@dnex/ds/styles";

function Fixture() {
  const [clicks, setClicks] = useState(0);
  return <main style={{ padding: 16 }}>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <TopbarGlobalActions hub={<Button aria-label="Abrir Hub">Hub</Button>}
        extras={[{ key: "cliente", label: "Módulo", node:
          <Button variant="secondary" aria-label="Trocar cliente" onClick={() => setClicks(n => n + 1)} style={{ width: 240, height: "auto", minHeight: 44 }}>
            <span style={{ display: "grid", minWidth: 0, textAlign: "left" }}>
              <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Cliente Fiscal Sintético com nome extenso</strong>
              <small>Empresa selecionada</small>
            </span>
          </Button> }]}
        account={<Button aria-label="Menu da conta">Conta</Button>} />
    </div>
    <output aria-label="Cliques">{clicks}</output>
  </main>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
