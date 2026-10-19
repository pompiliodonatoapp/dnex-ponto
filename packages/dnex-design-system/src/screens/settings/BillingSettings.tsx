import { useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "../../components/primitives/Button";
import { Badge } from "../../components/primitives/Badge";
import type { BadgeTone } from "../../components/primitives/Badge";
import { Table } from "../../components/composed/Table";
import type { Column } from "../../components/composed/Table";
import { UsageMeter } from "../../components/composed/UsageMeter";
import { PricingCard } from "../../components/composed/PricingCard";
import type { PricingCardProps } from "../../components/composed/PricingCard";
import { EmptyState } from "../../components/composed/EmptyState";
import { Sheet, SheetContent, SheetHeader, SheetBody } from "../../components/composed/Sheet";
import { SettingsSection } from "./parts";

/**
 * BillingSettings — plano atual, uso vs. limite, histórico de faturas e troca de
 * plano (D5). Reusa PricingCard, UsageMeter e Table. Pronto para Stripe: o portal
 * de cobrança e a troca de plano disparam callbacks (sem backend aqui).
 *
 * Valores de plano/preço/limite são ILUSTRATIVOS e rotulados [CONFIRMAR] —
 * política de trial/cancelamento e limites por plano pendem do titular.
 */

export type InvoiceStatus = "paid" | "open" | "failed";

export type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: string; // já formatado em BRL pelo app
  status: InvoiceStatus;
  url?: string;
};

export type UsageItem = {
  label: string;
  value: number;
  limit?: number | null;
  unit?: string;
};

const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Pago", tone: "success" },
  open: { label: "Em aberto", tone: "warning" },
  failed: { label: "Falhou", tone: "danger" },
};

export type BillingSettingsProps = {
  /** Nome do plano atual (ex.: "Essencial"). */
  planName: string;
  /** Preço formatado (ex.: "R$ 149"). */
  planPrice: string;
  planPeriod?: string;
  /** Status do plano para o selo do topo. */
  planStatus?: { label: string; tone: BadgeTone };
  usage?: UsageItem[];
  invoices?: Invoice[];
  /** Planos disponíveis para troca (abrem no Sheet). */
  plans?: PricingCardProps[];
  /** Abrir o portal de cobrança (Stripe Customer Portal). */
  onOpenPortal?: () => void;
  /** Selecionar um novo plano. */
  onSelectPlan?: (planName: string) => void;
};

export function BillingSettings({
  planName,
  planPrice,
  planPeriod = "/mês",
  planStatus,
  usage = [],
  invoices = [],
  plans,
  onOpenPortal,
  onSelectPlan,
}: BillingSettingsProps) {
  const [plansOpen, setPlansOpen] = useState(false);

  const invoiceColumns: Column<Invoice>[] = [
    { key: "date", header: "Data", cell: (r) => r.date, mono: true },
    { key: "description", header: "Descrição", cell: (r) => r.description },
    {
      key: "amount",
      header: "Valor",
      align: "right",
      mono: true,
      cell: (r) => r.amount,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const meta = INVOICE_STATUS[r.status];
        return (
          <Badge tone={meta.tone}>
            {meta.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Baixar</span>,
      align: "right",
      cell: (r) =>
        r.url ? (
          <a
            href={r.url}
            className="inline-flex items-center gap-1.5 rounded-[6px] text-[0.85rem] font-medium text-[var(--tone-action-fg)] underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> PDF
          </a>
        ) : (
          <span className="text-[0.8rem] text-fg-subtle">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---------- Plano atual + uso ---------- */}
      <SettingsSection
        title="Plano e uso"
        description="Seu plano atual e o consumo dos recursos no ciclo vigente."
        headerAside={
          planStatus && (
            <Badge tone={planStatus.tone}>
              {planStatus.label}
            </Badge>
          )
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* card do plano */}
          <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-5">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-fg-subtle">
              Plano atual
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-[1.4rem] font-semibold tracking-tight text-fg">
                {planName}
              </span>
            </div>
            <div className="mt-1 flex items-end gap-1.5">
              <span className="font-mono text-[length:var(--text-kpi)] font-semibold leading-none tracking-tight text-fg">
                {planPrice}
              </span>
              <span className="pb-1 text-[0.85rem] text-fg-subtle">
                {planPeriod}
              </span>
            </div>
            <p className="mt-2 text-[0.78rem] text-fg-subtle">
              Valores de exemplo{" "}
              <span className="font-mono">[CONFIRMAR]</span>.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setPlansOpen(true)}>
                Trocar de plano
              </Button>
              <Button
                size="sm"
                variant="secondary"
                trailingIcon={<ExternalLink className="h-3.5 w-3.5" />}
                onClick={onOpenPortal}
              >
                Portal de cobrança
              </Button>
            </div>
          </div>

          {/* medidores de uso */}
          <div className="space-y-5">
            {usage.length === 0 ? (
              <p className="text-[0.88rem] text-fg-muted">
                Sem métricas de uso para este ciclo.
              </p>
            ) : (
              usage.map((u) => (
                <UsageMeter
                  key={u.label}
                  label={u.label}
                  value={u.value}
                  limit={u.limit}
                  unit={u.unit}
                />
              ))
            )}
          </div>
        </div>
      </SettingsSection>

      {/* ---------- Faturas ---------- */}
      <SettingsSection
        title="Histórico de faturas"
        description="Recibos e cobranças anteriores deste workspace."
      >
        {invoices.length === 0 ? (
          <EmptyState
            title="Nenhuma fatura ainda"
            description="Quando a primeira cobrança for emitida, ela aparece aqui."
          />
        ) : (
          <Table
            columns={invoiceColumns}
            data={invoices}
            rowKey={(r) => r.id}
          />
        )}
      </SettingsSection>

      {/* ---------- Sheet de troca de plano ---------- */}
      {plans && plans.length > 0 && (
        <Sheet open={plansOpen} onOpenChange={setPlansOpen}>
          <SheetContent side="right" size="lg">
            <SheetHeader
              title="Escolha seu plano"
              description="Faça upgrade ou downgrade a qualquer momento. Valores de exemplo [CONFIRMAR]."
            />
            <SheetBody className="space-y-5">
              {plans.map((p) => (
                <PricingCard
                  key={p.name}
                  {...p}
                  current={p.name === planName}
                  onCtaClick={() => {
                    onSelectPlan?.(p.name);
                    setPlansOpen(false);
                  }}
                />
              ))}
            </SheetBody>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
