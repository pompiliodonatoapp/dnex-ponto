import { useCallback, useEffect, useMemo, useState } from "react";
import type { SidebarNavItem } from "../types";
import { Clock, CalendarCheck, FileText, Settings2, BarChart3 } from "lucide-react";
import { PaginaRegistro } from "./pages/PaginaRegistro";
import { PaginaEspelho } from "./pages/PaginaEspelho";
import { PaginaAjustes } from "./pages/PaginaAjustes";
import { PaginaRelatorios } from "./pages/PaginaRelatorios";
import { PaginaConfiguracoes } from "./pages/PaginaConfiguracoes";
import type { PontoPage } from "./pages/PontoFoundation";

interface PontoModuleProps {
  accountId: string;
  userId: string;
  onChromeChange: (chrome: any) => void;
  onOpenGeneralSettings: () => void;
}

export function PontoModule(props: PontoModuleProps) {
  return <EscopoPonto key={props.userId + ":" + props.accountId} {...props} />;
}

function EscopoPonto(props: PontoModuleProps) {
  const [session, setSession] = useState<{ state: "loading" | "ready" | "unavailable"; reason?: string }>({ state: "ready" });

  if (session.state === "unavailable") {
    return (
      <div className="ponto-foundation p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Não foi possível confirmar sua sessão</h3>
          <p className="text-yellow-700">{session.reason}</p>
        </div>
      </div>
    );
  }

  return <ConteudoPonto {...props} />;
}

function ConteudoPonto(props: PontoModuleProps) {
  const [pagina, setPagina] = useState<PontoPage>("registro");

  const navItems: SidebarNavItem[] = useMemo(
    () => [
      { id: "registro", label: "Registrar Ponto", icon: <Clock size={18} /> },
      { id: "espelho", label: "Espelho de Ponto", icon: <CalendarCheck size={18} /> },
      { id: "ajustes", label: "Ajustes e Abonos", icon: <FileText size={18} /> },
      { id: "relatorios", label: "Relatórios", icon: <BarChart3 size={18} /> },
      { id: "configuracoes", label: "Configurações", icon: <Settings2 size={18} /> },
    ],
    [],
  );

  const onNavSelect = useCallback(
    (id: string) => {
      if (id === "registro" || id === "espelho" || id === "ajustes" || id === "relatorios" || id === "configuracoes") {
        setPagina(id as PontoPage);
      }
    },
    [],
  );

  const { onChromeChange } = props;
  useEffect(() => {
    onChromeChange({ navItems, activeId: pagina, onNavSelect, title: "Ponto Eletrônico", section: navItems.find((item) => item.id === pagina)?.label });
    return () => onChromeChange(null);
  }, [navItems, pagina, onNavSelect, onChromeChange]);

  return (
    <div className="ponto-foundation" data-ponto-page={pagina}>
      {/* Navegação Lateral */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-subtle)] border-r border-[var(--border)] p-4 hidden md:block">
        <h1 className="text-xl font-bold mb-6 text-[var(--tone-action-fg)]">DNEX Ponto</h1>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pagina === item.id
                    ? "bg-[var(--tone-action-bg)] text-[var(--tone-action-fg)] font-semibold"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg)] hover:text-[var(--fg)]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Navegação Mobile (Bottom Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg)] border-t border-[var(--border)] p-2 md:hidden z-50">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavSelect(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
                pagina === item.id ? "text-[var(--tone-action-fg)]" : "text-[var(--fg-muted)]"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="md:ml-64 pb-20 md:pb-0">
        {pagina === "registro" && <PaginaRegistro accountId={props.accountId} userId={props.userId} />}
        {pagina === "espelho" && <PaginaEspelho accountId={props.accountId} userId={props.userId} />}
        {pagina === "ajustes" && <PaginaAjustes accountId={props.accountId} userId={props.userId} />}
        {pagina === "relatorios" && <PaginaRelatorios accountId={props.accountId} />}
        {pagina === "configuracoes" && <PaginaConfiguracoes accountId={props.accountId} />}
      </main>
    </div>
  );
}