import type { ReactNode } from "react";
import { Plug } from "lucide-react";
import { Button } from "../../components/primitives/Button";
import { Badge } from "../../components/primitives/Badge";
import { EmptyState } from "../../components/composed/EmptyState";
import { SettingsSection } from "./parts";

/**
 * IntegrationsSettings — grade de integrações externas (D7): cada card mostra
 * logo/ícone, nome, descrição, status e o CTA conectar/desconectar. Estado
 * "error" sinaliza falha de conexão com ação de reconectar.
 *
 * Conteúdo ILUSTRATIVO — integrações e provedores são exemplos.
 */

export type IntegrationStatus =
  | "connected"
  | "available"
  | "connecting"
  | "planned"
  | "error";

export type Integration = {
  id: string;
  name: string;
  description: string;
  /** Ícone/logo do serviço (slot). */
  icon?: ReactNode;
  status: IntegrationStatus;
  /** Texto auxiliar quando conectado (ex.: "conectado como ..."). */
  meta?: string;
};

export type IntegrationsSettingsProps = {
  integrations?: Integration[];
  onConnect?: (id: string) => void;
  onConfigure?: (id: string) => void;
  onDisconnect?: (id: string) => void;
  /** Reconectar após erro. */
  onReconnect?: (id: string) => void;
};

export function IntegrationsSettings({
  integrations = [],
  onConnect,
  onConfigure,
  onDisconnect,
  onReconnect,
}: IntegrationsSettingsProps) {
  return (
    <SettingsSection
      title="Integrações"
      description="Conecte serviços externos para automatizar o fluxo do hub."
    >
      {integrations.length === 0 ? (
        <EmptyState
          icon={<Plug />}
          title="Nenhuma integração disponível"
          description="As integrações do seu plano aparecerão aqui."
        />
      ) : (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {integrations.map((it) => (
            <div
              key={it.id}
              className="flex min-w-0 flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--surface-hover)] text-fg-muted [&>svg]:h-5 [&>svg]:w-5">
                  {it.icon ?? <Plug aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
                    <p className="min-w-0 w-full font-display text-[1rem] font-semibold tracking-tight text-fg [overflow-wrap:anywhere] sm:flex-1">
                      {it.name}
                    </p>
                    {it.status === "connected" && (
                      <Badge tone="success">
                        Conectado
                      </Badge>
                    )}
                    {it.status === "error" && (
                      <Badge tone="danger">
                        Erro
                      </Badge>
                    )}
                    {it.status === "connecting" && (
                      <Badge tone="action">
                        Conectando
                      </Badge>
                    )}
                    {it.status === "planned" && (
                      <Badge tone="neutral">
                        Em breve
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-fg-muted [overflow-wrap:anywhere]">
                    {it.description}
                  </p>
                  {it.status === "connected" && it.meta && (
                    <p className="mt-1.5 font-mono text-[0.76rem] text-fg-subtle [overflow-wrap:anywhere]">
                      {it.meta}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                {it.status === "connected" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => onConfigure?.(it.id)}>
                      Configurar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDisconnect?.(it.id)}>
                      Desconectar
                    </Button>
                  </div>
                ) : it.status === "error" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onReconnect?.(it.id)}
                  >
                    Reconectar
                  </Button>
                ) : it.status === "connecting" ? (
                  <Button size="sm" loading disabled>
                    Conectando
                  </Button>
                ) : it.status === "planned" ? (
                  <Button size="sm" variant="secondary" disabled>
                    Em breve
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onConnect?.(it.id)}>
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
