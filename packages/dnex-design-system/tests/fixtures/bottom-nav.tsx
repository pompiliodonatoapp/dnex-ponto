import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, Building2, FileText, Settings, ShieldCheck } from "lucide-react";
import { AppLayout } from "../../src/layouts/AppLayout";
import type { SidebarNavItem } from "../../src/components/shell/Sidebar";
import "../../src/styles/theme.css";

const items: SidebarNavItem[] = [
  { id: "empresas", label: "Empresas clientes", icon: <Building2 /> },
  { id: "catalogo", label: "Catálogo e planos", icon: <BarChart3 /> },
  { id: "comunicacao", label: "Central de comunicação", icon: <FileText /> },
  { id: "governanca", label: "Governança tributária", icon: <ShieldCheck /> },
  { id: "configuracoes", label: "Configurações gerais", icon: <Settings /> },
];

function Fixture() {
  const [activeId, setActiveId] = useState("empresas");

  return (
    <div className="h-dvh bg-canvas">
      <AppLayout
        forceMobile
        navItems={items}
        activeId={activeId}
        onNavSelect={setActiveId}
        topbarLeft={<span className="text-sm font-semibold">Console</span>}
      >
        <p role="status">Atalho selecionado: {activeId}</p>
        <p>Fixture sintética: navegação local, sem APIs ou mutações reais.</p>
      </AppLayout>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
