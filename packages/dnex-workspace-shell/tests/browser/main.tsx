import React from "react";
import { createRoot } from "react-dom/client";
import { TopbarGlobalActions } from "@dnex/ds";
import "@dnex/ds/styles";
import { WorkspaceShell } from "@dnex/workspace-shell";

const params = new URLSearchParams(location.search);
const old = params.has("legacy");
const products = [
  { key: "normas", label: "DNEX Normas", href: "/normas", visible: true },
  { key: "contratos", label: "DNEX Contratos", href: "/outro-produto", visible: true },
  { key: "privado", label: "Produto oculto", href: "/privado", visible: false },
];
const sections = [{ key: "main", label: "Documentos", items: [
  { key: "docs", label: "Biblioteca", href: "/documentos?tab=todos", active: true },
  { key: "accept", label: "Aceites", href: "/aceites" },
  { key: "drafts", label: "Rascunhos", href: "/rascunhos", mobile: false },
] }];
(window as any).spaCalls = [];
(window as any).searchCalls = 0;
createRoot(document.getElementById("root")!).render(<WorkspaceShell
  products={products} currentProductKey="normas" productLabel="DNEX Normas" pageLabel="Biblioteca"
  sections={sections} sidebarHeader={<button data-testid="context-selector">Empresa sintética</button>}
  hubHref="/hub" globalNavigation={[{ key: "settings", label: "Configurações", href: "/configuracoes", visible: true }, { key: "support", label: "Suporte", href: "/suporte", visible: true }, { key: "activity", label: "Atividade", href: "/atividade", visible: true }]}
  topbarCenter={<input aria-label="Pesquisar" placeholder="Pesquisar" style={{ width: "100%", minWidth: 0 }} />}
  topbarRight={<TopbarGlobalActions hub={<button aria-label="Hub" style={{ width: 44 }}>H</button>} settings={<button aria-label="Preferências" style={{ width: 44 }}>P</button>} density={<button aria-label="Densidade" style={{ width: 44 }}>D</button>} theme={<button aria-label="Tema" style={{ width: 44 }}>T</button>} notifications={<button aria-label="Notificações" style={{ width: 44 }}>N</button>} help={<button aria-label="Ajuda">?</button>} account={<button aria-label="Minha conta" style={{ minWidth: 44, minHeight: 44 }}>PD</button>} />}
  {...(!old ? {
    workspaceLabel: "Empresa de demonstração", workspaceHref: "/empresa", catalogHref: "/produtos",
    productsNotice: <p>Catálogo sincronizado</p>,
    topbarCenterCompact: <button aria-label="Abrir busca" style={{ width: 44, height: 44 }}>Buscar</button>,
    onNavigate: (href: string) => { (window as any).spaCalls.push(href); return true; },
    onSearchOpen: () => { (window as any).searchCalls++; },
  } : {})}
><h1>Biblioteca de teste</h1><p>Fixture sintética do pacote canônico.</p><div style={{ height: 1400 }} /><button>Fim do conteúdo</button></WorkspaceShell>);
