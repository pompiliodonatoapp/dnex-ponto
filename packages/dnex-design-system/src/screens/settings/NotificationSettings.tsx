import { useState } from "react";
import { Switch } from "../../components/primitives/Switch";
import { Button } from "../../components/primitives/Button";
import { Alert } from "../../components/composed/Alert";
import { SettingsSection } from "./parts";

/**
 * NotificationSettings — matriz de preferências (C7/D6): tipos de evento (linhas)
 * × canais (colunas), cada célula um Switch. No estreito, vira cartões empilhados
 * por evento. Estado controlado via `value` (mapa evento→canal→bool) ou interno.
 *
 * Conteúdo ILUSTRATIVO — eventos e canais são exemplos do hub.
 */

export type NotificationChannel = { id: string; label: string };
export type NotificationKind = {
  id: string;
  label: string;
  description?: string;
};

/** Mapa de preferências: { [kindId]: { [channelId]: boolean } }. */
export type NotificationPrefs = Record<string, Record<string, boolean>>;

const DEFAULT_CHANNELS: NotificationChannel[] = [
  { id: "email", label: "E-mail" },
  { id: "inapp", label: "No app" },
];

const DEFAULT_KINDS: NotificationKind[] = [
  {
    id: "billing",
    label: "Faturamento",
    description: "Faturas, pagamentos e avisos do plano.",
  },
  {
    id: "security",
    label: "Segurança",
    description: "Novos logins e alterações sensíveis.",
  },
  {
    id: "team",
    label: "Equipe",
    description: "Convites aceitos e mudanças de papel.",
  },
  {
    id: "product",
    label: "Novidades do produto",
    description: "Lançamentos e melhorias do hub.",
  },
];

function buildDefault(
  kinds: NotificationKind[],
  channels: NotificationChannel[],
): NotificationPrefs {
  const prefs: NotificationPrefs = {};
  for (const k of kinds) {
    prefs[k.id] = {};
    for (const c of channels) {
      // segurança liga tudo por padrão; produto, nada; resto, só in-app.
      prefs[k.id]![c.id] =
        k.id === "security" ? true : k.id === "product" ? false : c.id === "inapp";
    }
  }
  return prefs;
}

export type NotificationSettingsProps = {
  kinds?: NotificationKind[];
  channels?: NotificationChannel[];
  value?: NotificationPrefs;
  onChange?: (prefs: NotificationPrefs) => void;
  onSubmit?: (prefs: NotificationPrefs) => void | Promise<void>;
  loading?: boolean;
  success?: boolean;
};

export function NotificationSettings({
  kinds = DEFAULT_KINDS,
  channels = DEFAULT_CHANNELS,
  value,
  onChange,
  onSubmit,
  loading,
  success,
}: NotificationSettingsProps) {
  const [internal, setInternal] = useState<NotificationPrefs>(() =>
    buildDefault(kinds, channels),
  );
  const prefs = value ?? internal;

  function toggle(kindId: string, channelId: string, next: boolean) {
    const updated: NotificationPrefs = {
      ...prefs,
      [kindId]: { ...prefs[kindId], [channelId]: next },
    };
    if (value === undefined) setInternal(updated);
    onChange?.(updated);
  }

  return (
    <SettingsSection
      title="Notificações"
      description="Escolha como quer ser avisado de cada tipo de evento."
      footer={
        onSubmit && (
          <Button onClick={() => onSubmit(prefs)} loading={loading}>
            Salvar preferências
          </Button>
        )
      }
    >
      {success && (
        <Alert tone="success" title="Preferências salvas" className="mb-4">
          Você receberá os avisos pelos canais escolhidos.
        </Alert>
      )}

      {/* Desktop: grade evento × canal */}
      <div className="hidden sm:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th
                scope="col"
                className="pb-3 pr-4 text-left text-[0.72rem] font-medium uppercase tracking-[0.08em] text-fg-subtle"
              >
                Evento
              </th>
              {channels.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="w-28 pb-3 text-center text-[0.72rem] font-medium uppercase tracking-[0.08em] text-fg-subtle"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kinds.map((k) => (
              <tr key={k.id} className="border-b border-line last:border-0">
                <th scope="row" className="py-4 pr-4 text-left align-middle">
                  <span className="block text-[0.92rem] font-medium text-fg">
                    {k.label}
                  </span>
                  {k.description && (
                    <span className="mt-0.5 block text-[0.8rem] leading-relaxed text-fg-subtle">
                      {k.description}
                    </span>
                  )}
                </th>
                {channels.map((c) => (
                  <td key={c.id} className="py-4 text-center align-middle">
                    <div className="flex justify-center">
                      <Switch
                        checked={prefs[k.id]?.[c.id] ?? false}
                        onCheckedChange={(v) => toggle(k.id, c.id, v)}
                        aria-label={`${k.label} por ${c.label}`}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cartões por evento */}
      <div className="space-y-3 sm:hidden">
        {kinds.map((k) => (
          <div
            key={k.id}
            className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4"
          >
            <p className="text-[0.92rem] font-medium text-fg">{k.label}</p>
            {k.description && (
              <p className="mt-0.5 text-[0.8rem] leading-relaxed text-fg-subtle">
                {k.description}
              </p>
            )}
            <div className="mt-3 space-y-3 border-t border-line pt-3">
              {channels.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-[0.85rem] text-fg-muted">{c.label}</span>
                  <Switch
                    checked={prefs[k.id]?.[c.id] ?? false}
                    onCheckedChange={(v) => toggle(k.id, c.id, v)}
                    aria-label={`${k.label} por ${c.label}`}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
