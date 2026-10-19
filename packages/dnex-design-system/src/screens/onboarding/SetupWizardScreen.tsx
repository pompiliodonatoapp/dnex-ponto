import { useMemo, useState } from "react";
import { Building2, Check, SlidersHorizontal, Users } from "lucide-react";
import { Wizard } from "../../components/composed/Wizard";
import type { WizardStep } from "../../components/composed/Wizard";
import { Input } from "../../components/primitives/Input";
import { Label } from "../../components/primitives/Label";
import { Select } from "../../components/primitives/Select";
import { Badge } from "../../components/primitives/Badge";
import { SegmentedControl } from "../../components/primitives/SegmentedControl";
import { CnpjInput } from "../../components/inputs-br/CnpjInput";
import { IllustrationSuccess } from "../../components/illustrations";
import { ROLE_LABELS } from "../settings/TeamSettings";
import type { TeamRole } from "../settings/TeamSettings";
import { isValidCnpj, normalizeCnpj } from "../../lib/br";

/**
 * SetupWizardScreen — setup inicial guiado (B2) usando o Wizard do DS: 4 passos
 * (empresa → preferências → convidar → pronto). Estado mantido localmente e
 * entregue em `onComplete`. Cada passo valida via `canAdvance`. O passo de
 * convite reusa o padrão da tela de convite, simplificado.
 *
 * Conteúdo ILUSTRATIVO — segmentos/regimes são exemplos. Pode-se pular convites.
 */

export type SetupData = {
  companyName: string;
  cnpj: string;
  segment: string;
  taxRegime: string;
  invites: { email: string; role: TeamRole }[];
};

const SEGMENTS = [
  { value: "comercio", label: "Comércio" },
  { value: "servicos", label: "Serviços" },
  { value: "industria", label: "Indústria" },
  { value: "outro", label: "Outro" },
];

const REGIMES = [
  { value: "simples", label: "Simples Nacional" },
  { value: "presumido", label: "Lucro Presumido" },
  { value: "real", label: "Lucro Real" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SetupWizardScreenProps = {
  /** Concluído com os dados coletados. */
  onComplete: (data: SetupData) => void | Promise<void>;
  defaultCompanyName?: string;
};

export function SetupWizardScreen({
  onComplete,
  defaultCompanyName = "",
}: SetupWizardScreenProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SetupData>({
    companyName: defaultCompanyName,
    cnpj: "",
    segment: "",
    taxRegime: "",
    invites: [],
  });

  // estado do mini-formulário de convite (passo 3)
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");

  function addInvite() {
    const email = inviteEmail.trim();
    if (!EMAIL_RE.test(email)) return;
    if (data.invites.some((i) => i.email.toLowerCase() === email.toLowerCase()))
      return;
    setData((d) => ({ ...d, invites: [...d.invites, { email, role: inviteRole }] }));
    setInviteEmail("");
  }

  const steps = useMemo<WizardStep[]>(
    () => [
      {
        id: "empresa",
        label: "Empresa",
        description: "Identifique o workspace.",
        icon: <Building2 className="h-4 w-4" />,
        content: (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="setup-name" required>
                Nome da empresa
              </Label>
              <Input
                id="setup-name"
                value={data.companyName}
                onChange={(e) =>
                  setData((d) => ({ ...d, companyName: e.target.value }))
                }
                placeholder="Ex.: Alpha Comércio"
                leadingIcon={<Building2 />}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setup-cnpj">CNPJ (opcional)</Label>
              <CnpjInput
                id="setup-cnpj"
                hideMessage
                value={data.cnpj}
                onChange={(v) => setData((d) => ({ ...d, cnpj: v }))}
              />
            </div>
          </div>
        ),
      },
      {
        id: "preferencias",
        label: "Preferências",
        description: "Como sua empresa trabalha.",
        icon: <SlidersHorizontal className="h-4 w-4" />,
        content: (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <SegmentedControl
                aria-label="Segmento"
                value={data.segment}
                onValueChange={(v) => setData((d) => ({ ...d, segment: v }))}
                items={SEGMENTS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setup-regime">Regime tributário</Label>
              <Select
                aria-label="Regime tributário"
                value={data.taxRegime || undefined}
                onValueChange={(v) => setData((d) => ({ ...d, taxRegime: v }))}
                items={REGIMES}
              />
            </div>
            <p className="text-[0.8rem] text-fg-subtle">
              Pode pular e ajustar depois nas configurações.
            </p>
          </div>
        ),
      },
      {
        id: "convidar",
        label: "Convidar",
        description: "Traga sua equipe (opcional).",
        icon: <Users className="h-4 w-4" />,
        content: (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInvite();
                  }
                }}
                placeholder="colega@empresa.com.br"
                aria-label="E-mail do convidado"
                className="flex-1"
              />
              <div className="sm:w-40">
                <Select
                  aria-label="Papel"
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as TeamRole)}
                  items={(Object.keys(ROLE_LABELS) as TeamRole[])
                    .filter((r) => r !== "owner")
                    .map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                />
              </div>
            </div>
            {data.invites.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {data.invites.map((inv) => (
                  <li key={inv.email}>
                    <Badge tone="action">
                      {inv.email} · {ROLE_LABELS[inv.role]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[0.8rem] text-fg-subtle">
              Pressione Enter para adicionar. Sem pressa — dá para convidar
              depois.
            </p>
          </div>
        ),
      },
      {
        id: "pronto",
        label: "Pronto",
        description: "Tudo certo para começar.",
        icon: <Check className="h-4 w-4" />,
        content: (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <IllustrationSuccess className="w-40" />
            <div className="space-y-1">
              <p className="font-display text-[1.1rem] font-semibold text-fg">
                {data.companyName || "Sua empresa"} está pronta
              </p>
              <p className="mx-auto max-w-sm text-[0.9rem] leading-relaxed text-fg-muted">
                Configuramos o essencial. Você pode refinar tudo nas
                configurações quando quiser.
              </p>
            </div>
          </div>
        ),
      },
    ],
    [data, inviteEmail, inviteRole],
  );

  // Só o 1º passo é obrigatório (nome da empresa). Os demais podem avançar.
  function canAdvance(index: number) {
    if (index === 0)
      return data.companyName.trim().length >= 2 &&
        (normalizeCnpj(data.cnpj).length === 0 || isValidCnpj(data.cnpj));
    return true;
  }

  return (
    <Wizard
      steps={steps}
      step={step}
      onStepChange={setStep}
      canAdvance={canAdvance}
      onComplete={() => onComplete(data)}
      labels={{ complete: "Ir para o painel" }}
    />
  );
}
