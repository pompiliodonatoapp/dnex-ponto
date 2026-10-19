import { useState } from "react";
import { Mail, Rows3, Rows4 } from "lucide-react";

import type { Density } from "../lib/density";
import { ErrorPage } from "../components/composed/ErrorPage";
import type { ErrorPageVariant } from "../components/composed/ErrorPage";
import { Table } from "../components/composed/Table";
import type { Column } from "../components/composed/Table";
import { Card, CardBody, CardHeader, CardTitle } from "../components/composed/Card";
import { Input } from "../components/primitives/Input";
import { Label } from "../components/primitives/Label";
import { Badge } from "../components/primitives/Badge";
import { Button } from "../components/primitives/Button";
import { SegmentedControl } from "../components/primitives/SegmentedControl";
import { Demo } from "./parts";

/* ════════════════════════════════════════════════════════════════════════════
   C6a — DENSIDADE (demonstração LOCAL)
   A densidade global vive no <html> (DensityProvider + toggle na topbar). Aqui
   demonstramos o efeito num escopo isolado: um <div data-density> sobrescreve os
   tokens só para a subárvore, sem mexer no resto da vitrine. Os mesmos
   componentes de dado/lista (Table, Input, Card) relaxam/compactam pelos tokens.
   ════════════════════════════════════════════════════════════════════════════ */

/* Dados ILUSTRATIVOS — não representam cadastro real. */
type Lancamento = { id: string; doc: string; cliente: string; valor: string; status: string };
const linhas: Lancamento[] = [
  { id: "1", doc: "NF-e 4471", cliente: "Aurora Tecnologia", valor: "R$ 12.480,00", status: "Pago" },
  { id: "2", doc: "NF-e 4472", cliente: "Donato Holding", valor: "R$ 3.215,90", status: "Pendente" },
  { id: "3", doc: "NF-e 4473", cliente: "PRD Serviços", valor: "R$ 8.900,00", status: "Pago" },
  { id: "4", doc: "NF-e 4474", cliente: "Nexo Consultoria", valor: "R$ 1.045,30", status: "Atrasado" },
];

const colunas: Column<Lancamento>[] = [
  { key: "doc", header: "Documento", cell: (r) => <span className="font-mono">{r.doc}</span> },
  { key: "cliente", header: "Cliente", cell: (r) => r.cliente },
  { key: "valor", header: "Valor", cell: (r) => r.valor, align: "right", mono: true },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <Badge
        tone={r.status === "Pago" ? "success" : r.status === "Pendente" ? "warning" : "danger"}
        dot
      >
        {r.status}
      </Badge>
    ),
  },
];

export function DensitySection() {
  const [density, setDensity] = useState<Density>("comfortable");
  return (
    <div className="grid gap-6">
      <Demo
        label="Densidade — os mesmos componentes, dois espaçamentos (escopo local)"
        className="!block"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-[length:var(--text-small)] leading-relaxed text-fg-muted">
            Troque a densidade abaixo: a tabela, os campos e o card relaxam ou
            compactam lendo os tokens <span className="font-mono text-fg">--cell-py</span>,{" "}
            <span className="font-mono text-fg">--control-h</span> e{" "}
            <span className="font-mono text-fg">--card-pad</span>. No app real, o{" "}
            <span className="font-mono text-fg">DensityToggle</span> da topbar faz isso
            globalmente; aqui é local, só nesta subárvore.
          </p>
          <SegmentedControl
            aria-label="Densidade da demonstração"
            value={density}
            onValueChange={(v) => setDensity(v as Density)}
            items={[
              {
                value: "comfortable",
                label: "Confortável",
                icon: <Rows3 className="h-4 w-4" aria-hidden="true" />,
              },
              {
                value: "compact",
                label: "Compacto",
                icon: <Rows4 className="h-4 w-4" aria-hidden="true" />,
              },
            ]}
          />
        </div>

        {/* O escopo local: redefine data-density só aqui dentro. */}
        <div data-density={density} className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Table columns={colunas} data={linhas} rowKey={(r) => r.id} />

          <Card variant="solid">
            <CardHeader>
              <CardTitle>Novo lançamento</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="dens-cliente">Cliente</Label>
                <Input id="dens-cliente" placeholder="Razão social" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dens-email">E-mail</Label>
                <Input id="dens-email" type="email" leadingIcon={<Mail />} placeholder="financeiro@empresa.com.br" />
              </div>
              <Button className="w-full">Salvar</Button>
            </CardBody>
          </Card>
        </div>
      </Demo>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   C6b — ERROR PAGES
   ErrorPage (página inteira) reusando ErrorState + ilustrações DNEX. Aqui
   renderizada com `inline` para caber contida num card moldurado (no app real é
   o viewport cheio). Variantes 404/500/403/offline trocadas por segmented.
   ════════════════════════════════════════════════════════════════════════════ */
const variantes: { value: ErrorPageVariant; label: string }[] = [
  { value: "404", label: "404" },
  { value: "500", label: "500" },
  { value: "403", label: "403" },
  { value: "offline", label: "Offline" },
];

export function ErrorPagesSection() {
  const [variant, setVariant] = useState<ErrorPageVariant>("404");
  return (
    <div className="grid gap-6">
      <Demo label="ErrorPage — página inteira (variantes por código)" className="!block">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-[length:var(--text-small)] leading-relaxed text-fg-muted">
            Página de erro completa: logo no topo, ilustração protagonista, código
            discreto, título e descrição na voz de parceiro, ação primária. No app
            ocupa o viewport todo; aqui é <span className="font-mono text-fg">inline</span>{" "}
            dentro da moldura.
          </p>
          <SegmentedControl
            aria-label="Variante de erro"
            value={variant}
            onValueChange={(v) => setVariant(v as ErrorPageVariant)}
            items={variantes}
          />
        </div>

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--bg)]">
          <ErrorPage variant={variant} inline />
        </div>
      </Demo>
    </div>
  );
}
