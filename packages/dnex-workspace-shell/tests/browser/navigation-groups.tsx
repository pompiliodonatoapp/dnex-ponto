/**
 * Navigation Groups Fixture — two-level hierarchy, sidebar + drawer.
 * No CRM domain or external data. For coordinator verification.
 */
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { WorkspaceShell } from "../../src/index.js";
import type { ShellNavigationItem } from "../../src/manifest.js";
import "@dnex/ds/styles";
import "../../src/workspace-shell.css";

// Two-level navigation hierarchy for testing
const sections: Parameters<typeof WorkspaceShell>[0]["sections"] = [
  {
    key: "cadastros",
    label: "Cadastros",
    items: [
      { key: "grupo-pessoas", label: "Pessoas", kind: "group", children: [
        { key: "grupo-clientes", label: "Carteira de clientes", kind: "group", children: [
          { key: "clientes", label: "Clientes", href: "/cadastros/pessoas/clientes" },
          { key: "prospects", label: "Prospects", href: "/cadastros/pessoas/prospects" },
        ]},
        { key: "fornecedores", label: "Fornecedores", href: "/cadastros/pessoas/fornecedores" },
        { key: "transportadoras", label: "Transportadoras", href: "/cadastros/pessoas/transportadoras" },
      ]},
      { key: "grupo-produtos", label: "Produtos", kind: "group", children: [
        { key: "produtos-lista", label: "Lista de Preços", href: "/cadastros/produtos/lista" },
        { key: "produtos-estoque", label: "Estoque", href: "/cadastros/produtos/estoque" },
      ]},
      { key: "categorias", label: "Categorias", href: "/cadastros/categorias" },
    ],
  },
  {
    key: "financeiro",
    label: "Financeiro",
    items: [
      { key: "contas-pagar", label: "Contas a Pagar", href: "/financeiro/pagar" },
      { key: "contas-receber", label: "Contas a Receber", href: "/financeiro/receber" },
      { key: "grupo-relatorios", label: "Relatórios", kind: "group", children: [
        { key: "relatorio-caixa", label: "Fluxo de Caixa", href: "/financeiro/relatorios/caixa" },
        { key: "relatorio-dre", label: "DRE", href: "/financeiro/relatorios/dre" },
      ]},
    ],
  },
  {
    key: "config",
    label: "Configurações",
    items: [
      { key: "empresa", label: "Dados da Empresa", href: "/config/empresa" },
      { key: "usuarios", label: "Usuários", href: "/config/usuarios" },
    ],
  },
];

const products = [
  { key: "crm", label: "DNEX CRM", href: "/crm", visible: true },
  { key: "normas", label: "DNEX Normas", href: "/normas", visible: true },
];

function App() {
  const [currentProduct, setCurrentProduct] = useState("crm");
  const [view, setView] = useState("/cadastros/pessoas/clientes");
  const [revision, setRevision] = useState(0);
  const [navigationLog, setLog] = useState<string[]>([]);

  const log = (msg: string) => setLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()} — ${msg}`]);
  const activate = (item: ShellNavigationItem): ShellNavigationItem => item.kind === "group"
    ? { ...item, children: item.children.map(activate) }
    : { ...item, active: item.kind !== "action" && item.href === view };
  const currentSections = sections.map(section => ({ ...section, items: section.items.map(activate) }));

  return (
    <>
      <WorkspaceShell
        products={products}
        currentProductKey={currentProduct}
        productLabel={currentProduct === "crm" ? "DNEX CRM" : "DNEX Normas"}
        pageLabel={view === "home" ? undefined : view.replace(/\//g, " › ")}
        sections={currentSections}
        navigationSearchLabel="Buscar no menu…"
        onNavigate={(href) => {
          log(`Navigate to: ${href}`);
          setView(href);
          return true;
        }}
        onProductNavigate={(key) => {
          setCurrentProduct(key);
          setView("home");
          log(`Product changed: ${key}`);
          return true;
        }}
      >
        <div style={{ padding: "24px" }}>
          <h1 style={{ marginBottom: "16px" }}>Fixture de Grupos de Navegação</h1>
          <button type="button" onClick={() => setRevision(value => value + 1)}>Recriar seções ({revision})</button>
          <p style={{ color: "var(--fg-muted)", marginBottom: "24px" }}>
            Hierarquia de dois níveis: grupo → folha. Teste os cenários abaixo.
          </p>

          <details style={{ marginBottom: "16px", padding: "12px", border: "1px solid var(--line)", borderRadius: "8px" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Cenários de Teste</summary>
            <ol style={{ margin: "12px 0 0 20px", lineHeight: 1.8 }}>
              <li>Expanda grupo "Pessoas" e "Produtos" — ambos devem abrir/fechar</li>
              <li>Clique em folha "Clientes" — ativa e loga navegação</li>
              <li>Folha "Contas a Receber" está ativa (active:true) — grupo "Relatórios" deve abrir automaticamente</li>
              <li>Recolha grupo "Pessoas" manualmente — permanece recolhido até rota mudar</li>
              <li>Busque "Cli" — mostra "Clientes"; grupo retido</li>
              <li>Busque "Relatório" — grupo "Relatórios" aparece com filhos</li>
              <li>Busque com acento: "Forneced" → "Fornecedores"</li>
              <li>Limpe busca — expansão anterior restaurada</li>
              <li>Mobile: botão de grupo NÃO fecha drawer; folha fecha</li>
              <li>mobile=false em ancestral exclui descendentes dos atalhos</li>
            </ol>
          </details>

          <h2 style={{ marginBottom: "12px", fontSize: "14px", color: "var(--fg-muted)" }}>Log de Navegação</h2>
          <pre style={{
            background: "var(--surface)",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "12px",
            maxHeight: "200px",
            overflow: "auto",
          }}>
            {navigationLog.length === 0 ? "(vazio)" : navigationLog.join("\n")}
          </pre>
        </div>
      </WorkspaceShell>

      <div data-testid="boot" style={{ display: "none" }}>navigation-groups</div>
    </>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(React.createElement(App));
