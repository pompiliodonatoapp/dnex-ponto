import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Calendar as CalendarComp,
  DatePicker,
  Stepper,
  Wizard,
  NotificationCenter,
} from "../index";
import type {
  WizardStep,
  DnexNotification,
} from "../index";
import { Input } from "../components/primitives/Input";
import { Label } from "../components/primitives/Label";
import { Select } from "../components/primitives/Select";
import { RadioGroup, RadioItem } from "../components/primitives/Radio";
import { Checkbox } from "../components/primitives/Checkbox";
import { Button } from "../components/primitives/Button";
import { useToast } from "../components/composed/Toast";
import { Demo } from "./parts";

/* ════════════════════════════════════════════════════════════════════════════
   B1 — CALENDÁRIO / DATAS
   ════════════════════════════════════════════════════════════════════════════ */
export function CalendarSection() {
  const [single, setSingle] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<DateRange | undefined>();
  const [fieldDate, setFieldDate] = useState<Date | undefined>();
  const [fieldRange, setFieldRange] = useState<DateRange | undefined>();

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Demo label="Calendar — data única (índigo seleção · âmbar hoje)" className="!block">
          <div className="flex justify-center">
            <CalendarComp mode="single" selected={single} onSelect={setSingle} />
          </div>
        </Demo>
        <Demo label="Calendar — intervalo (range)" className="!block">
          <div className="flex justify-center">
            <CalendarComp mode="range" selected={range} onSelect={setRange} />
          </div>
        </Demo>
      </div>

      <Demo label="DatePicker — campo + popover (single e range)" className="!block">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dp-vencimento">Vencimento</Label>
            <DatePicker
              aria-label="Vencimento"
              value={fieldDate}
              onChange={setFieldDate}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dp-periodo">Período de apuração</Label>
            <DatePicker
              mode="range"
              aria-label="Período de apuração"
              value={fieldRange}
              onChange={setFieldRange}
            />
          </div>
        </div>
        <p className="mt-4 text-[0.8rem] leading-relaxed text-fg-subtle">
          react-day-picker v9 tematizado 100% na marca (locale pt-BR, teclado e
          ARIA da própria lib). Datas exibidas em IBM Plex Mono.
        </p>
      </Demo>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   B2 — WIZARD / STEPPER (qualificação de lead, 4 passos)
   ════════════════════════════════════════════════════════════════════════════ */
type QualForm = {
  empresa: string;
  cnpj: string;
  regime: string;
  porte: string;
  dor: string;
  contato: string;
  email: string;
  aceite: boolean;
};

const emptyForm: QualForm = {
  empresa: "",
  cnpj: "",
  regime: "",
  porte: "",
  dor: "",
  contato: "",
  email: "",
  aceite: false,
};

export function WizardSection() {
  const { toast } = useToast();
  const [form, setForm] = useState<QualForm>(emptyForm);
  const set = <K extends keyof QualForm>(k: K, v: QualForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "empresa",
        label: "Empresa",
        description: "Quem é o cliente",
        content: (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="w-empresa" required>
                Razão social
              </Label>
              <Input
                id="w-empresa"
                placeholder="Alpha Comércio LTDA"
                value={form.empresa}
                onChange={(e) => set("empresa", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-cnpj" required>
                CNPJ
              </Label>
              <Input
                id="w-cnpj"
                mono
                placeholder="00.000.000/0000-00"
                value={form.cnpj}
                onChange={(e) => set("cnpj", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-regime" required>
                Regime tributário
              </Label>
              <Select
                aria-label="Regime tributário"
                value={form.regime || undefined}
                onValueChange={(v) => set("regime", v)}
                placeholder="Selecione…"
                items={[
                  { value: "simples", label: "Simples Nacional" },
                  { value: "presumido", label: "Lucro Presumido" },
                  { value: "real", label: "Lucro Real" },
                ]}
              />
            </div>
          </div>
        ),
      },
      {
        id: "perfil",
        label: "Perfil",
        description: "Porte e dor",
        content: (
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label>Porte</Label>
              <RadioGroup
                value={form.porte}
                onValueChange={(v) => set("porte", v)}
              >
                {[
                  { v: "mei", l: "MEI" },
                  { v: "pequeno", l: "Pequeno (até R$ 4,8M/ano)" },
                  { v: "medio", l: "Médio (acima de R$ 4,8M/ano)" },
                ].map((o) => (
                  <label key={o.v} className="flex items-center gap-2.5">
                    <RadioItem value={o.v} />
                    <span className="text-[0.9rem] text-fg">{o.l}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-dor" required>
                Principal desafio hoje
              </Label>
              <Select
                aria-label="Principal desafio"
                value={form.dor || undefined}
                onValueChange={(v) => set("dor", v)}
                placeholder="Selecione…"
                items={[
                  { value: "fiscal", label: "Apuração fiscal complexa" },
                  { value: "folha", label: "Folha e eSocial" },
                  { value: "caixa", label: "Visão de caixa / gerencial" },
                  { value: "malha", label: "Risco de malha / autuação" },
                ]}
              />
            </div>
          </div>
        ),
      },
      {
        id: "contato",
        label: "Contato",
        description: "Como falar com você",
        content: (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="w-contato" required>
                Nome do responsável
              </Label>
              <Input
                id="w-contato"
                placeholder="Donato Pompilio"
                value={form.contato}
                onChange={(e) => set("contato", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-email" required>
                E-mail
              </Label>
              <Input
                id="w-email"
                type="email"
                placeholder="voce@empresa.com.br"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
          </div>
        ),
      },
      {
        id: "revisao",
        label: "Revisão",
        description: "Confirme e envie",
        content: (
          <div className="grid gap-4">
            <dl className="grid gap-2 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4 text-[0.88rem]">
              {[
                ["Empresa", form.empresa || "—"],
                ["CNPJ", form.cnpj || "—"],
                ["Regime", form.regime || "—"],
                ["Porte", form.porte || "—"],
                ["Desafio", form.dor || "—"],
                ["Contato", form.contato || "—"],
                ["E-mail", form.email || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-fg-subtle">{k}</dt>
                  <dd className="truncate font-medium text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="flex items-start gap-2.5">
              <Checkbox
                checked={form.aceite}
                onCheckedChange={(v) => set("aceite", v === true)}
              />
              <span className="text-[0.85rem] leading-snug text-fg-muted">
                Autorizo o contato da equipe DNEX sobre esta qualificação.
              </span>
            </label>
          </div>
        ),
      },
    ],
    [form],
  );

  // Validação por passo — trava o "Avançar" até os campos obrigatórios.
  const canAdvance = (i: number) => {
    switch (i) {
      case 0:
        return form.empresa.trim() !== "" && form.cnpj.trim() !== "" && form.regime !== "";
      case 1:
        return form.porte !== "" && form.dor !== "";
      case 2:
        return form.contato.trim() !== "" && form.email.trim() !== "";
      case 3:
        return form.aceite;
      default:
        return true;
    }
  };

  return (
    <div className="grid gap-6">
      <Demo label="Wizard — qualificação de lead (4 passos, validação por passo)" className="!block">
        <Wizard
          steps={steps}
          canAdvance={canAdvance}
          onComplete={() => {
            toast({
              title: "Qualificação enviada",
              description: `Obrigado, ${form.contato || "time"} — entraremos em contato.`,
              tone: "success",
            });
            setForm(emptyForm);
          }}
        />
      </Demo>

      <Demo label="Stepper — vertical (indicador isolado)" className="!block">
        <div className="max-w-sm">
          <Stepper
            orientation="vertical"
            current={2}
            steps={[
              { id: "1", label: "Cadastro", description: "Dados da empresa" },
              { id: "2", label: "Documentos", description: "Contrato social e fiscais" },
              { id: "3", label: "Configuração", description: "Regime e acessos" },
              { id: "4", label: "Pronto", description: "Conta ativa" },
            ]}
          />
        </div>
      </Demo>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   B3 — CENTRAL DE NOTIFICAÇÕES
   ════════════════════════════════════════════════════════════════════════════ */
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000);

const seedNotifications: DnexNotification[] = [
  {
    id: "n1",
    type: "warning",
    title: "DAS vence em 3 dias",
    description: "Simples Nacional — R$ 3.215,90. Gere a guia para não pagar juros.",
    date: minsAgo(8),
    read: false,
  },
  {
    id: "n2",
    type: "success",
    title: "Apuração de maio fechada",
    description: "Sem pendências. Relatório disponível no DON Dashboard.",
    date: minsAgo(120),
    read: false,
  },
  {
    id: "n3",
    type: "error",
    title: "Falha ao sincronizar banco",
    description: "Não conseguimos importar os extratos do Banco Alpha.",
    date: minsAgo(360),
    read: false,
  },
  {
    id: "n4",
    type: "info",
    title: "Novo recurso: conciliação automática",
    description: "Conecte sua conta e concilie lançamentos em um clique.",
    date: minsAgo(60 * 26),
    read: true,
  },
];

export function NotificationsSection() {
  const [items, setItems] = useState<DnexNotification[]>(seedNotifications);
  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const reset = () => setItems(seedNotifications);

  return (
    <Demo label="NotificationCenter — sino + badge + histórico" className="!block">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-[0.88rem] leading-relaxed text-fg-muted">
          Diferente do <strong className="font-semibold text-fg">Toast</strong>{" "}
          (transiente), o NotificationCenter guarda o histórico: estado lida/não-lida,
          “marcar como lida” e “marcar todas”. Clique no sino — atualmente{" "}
          <span className="font-mono text-fg">{unread}</span> não lida
          {unread === 1 ? "" : "s"}.
        </p>
        <div className="flex items-center gap-3 rounded-[var(--radius-control)] border border-line bg-[var(--surface)] px-4 py-2">
          <span className="text-[0.8rem] text-fg-subtle">Demonstração:</span>
          <NotificationCenter
            notifications={items}
            onRead={markRead}
            onReadAll={markAll}
            align="end"
          />
        </div>
      </div>
      <div className="mt-4">
        <Button variant="ghost" size="sm" onClick={reset}>
          Restaurar notificações
        </Button>
      </div>
    </Demo>
  );
}
