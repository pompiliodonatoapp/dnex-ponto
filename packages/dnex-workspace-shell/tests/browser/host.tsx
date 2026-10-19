import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "@dnex/ds/styles";
import { WorkspaceShell, type ShellNavigationSection } from "@dnex/workspace-shell";

function Fixture() {
  const [local, setLocal] = useState(0);
  const [spa, setSpa] = useState(0);
  const [page, setPage] = useState("Inicial");
  const [pending, setPending] = useState<{ key: string; href: string } | null>(null);
  const [boot] = useState(() => crypto.randomUUID());
  const mode = new URLSearchParams(location.search).get("mode");
  const sections: ShellNavigationSection[] = [{ key: "views", label: "Visões", items: [
    { key: "url", label: "Página real", href: "/real", active: page === "Inicial" },
    { key: "local", kind: "action", label: "Visão local", onSelect: () => { setLocal(n => n + 1); setPage("Local"); }, active: page === "Local" },
    { key: "desktop-local", kind: "action", label: "Ação sem atalho", onSelect: () => setLocal(n => n + 1), mobile: false },
  ] }];
  const products = [
    { key: "normas", label: "DNEX Normas", href: "/normas", visible: true },
    { key: "contratos", label: "DNEX Contratos", href: "/other-product", visible: true },
    { key: "fiscal", label: "DNEX Fiscal", href: "https://external.invalid/fiscal", visible: true },
    { key: "hidden", label: "Produto oculto", href: "/hidden", visible: false },
  ];
  const productKey = mode === "persistent" && page !== "Inicial" ? page : "normas";
  return <WorkspaceShell products={products} currentProductKey={productKey} productLabel={products.find(product => product.key === productKey)!.label} sections={sections}
    hubHref="/" sidebarHeader={<button>Trocar empresa</button>}
    topbarCenter={<input aria-label="Buscar" />} topbarRight={<button>Conta</button>}
    onNavigate={href => { setSpa(n => n + 1); history.pushState({}, "", href); return true; }}
    onProductNavigate={mode ? (key, href) => {
      if (mode === "decline") return false;
      setPending({ key, href });
      return true;
    } : undefined}>
    <h1>Contrato do host</h1><p data-testid="boot">{boot}</p>
    <p data-testid="local">{local}</p><p data-testid="spa">{spa}</p><p data-testid="view">{page}</p>
    {pending && <div role="dialog" aria-label="Confirmar saída">
      <p data-testid="pending-key">{pending.key}</p>
      <button onClick={() => setPending(null)}>Cancelar saída</button>
      <button onClick={() => { setPage(pending.key); setPending(null); }}>Continuar saída</button>
    </div>}
  </WorkspaceShell>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
