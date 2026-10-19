import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Receipt,
  UploadCloud,
  UserPlus,
} from "lucide-react";

import { DataTable } from "../components/composed/DataTable";
import {
  DescriptionList,
  DescriptionItem,
} from "../components/composed/DescriptionList";
import { Timeline, TimelineItem } from "../components/composed/Timeline";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import { Button } from "../components/primitives/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/composed/DropdownMenu";
import { EmptyState } from "../components/composed/EmptyState";
import { Demo } from "./parts";

/* ════════════════════════════════════════════════════════════════════════════
   Dados ILUSTRATIVOS — clientes/lançamentos fictícios, só para demonstrar os
   componentes de dados. Não representam cadastro real de nenhuma empresa.
   ════════════════════════════════════════════════════════════════════════════ */

type Cliente = {
  id: string;
  nome: string;
  cnpj: string;
  regime: "Simples" | "Presumido" | "Real";
  status: "ativo" | "pendente" | "inadimplente";
  honorario: number; // em centavos
};

const STATUS_META: Record<
  Cliente["status"],
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  ativo: { label: "Ativo", tone: "success" },
  pendente: { label: "Pendente", tone: "warning" },
  inadimplente: { label: "Inadimplente", tone: "danger" },
};

const clientes: Cliente[] = [
  { id: "1", nome: "Aurora Tech Ltda.", cnpj: "12.345.678/0001-90", regime: "Real", status: "ativo", honorario: 480000 },
  { id: "2", nome: "Padaria Pão Quente", cnpj: "98.765.432/0001-10", regime: "Simples", status: "ativo", honorario: 120000 },
  { id: "3", nome: "Construtora Horizonte", cnpj: "11.222.333/0001-44", regime: "Presumido", status: "pendente", honorario: 350000 },
  { id: "4", nome: "Moda Bella Confecções", cnpj: "22.333.444/0001-55", regime: "Simples", status: "inadimplente", honorario: 98000 },
  { id: "5", nome: "Clínica Vida Plena", cnpj: "33.444.555/0001-66", regime: "Presumido", status: "ativo", honorario: 270000 },
  { id: "6", nome: "AgroSul Insumos", cnpj: "44.555.666/0001-77", regime: "Real", status: "ativo", honorario: 620000 },
  { id: "7", nome: "Studio Pixel Design", cnpj: "55.666.777/0001-88", regime: "Simples", status: "pendente", honorario: 145000 },
  { id: "8", nome: "Transportes Veloz", cnpj: "66.777.888/0001-99", regime: "Presumido", status: "ativo", honorario: 390000 },
  { id: "9", nome: "Café Central", cnpj: "77.888.999/0001-00", regime: "Simples", status: "ativo", honorario: 110000 },
  { id: "10", nome: "Metalúrgica Ferro Forte", cnpj: "88.999.000/0001-11", regime: "Real", status: "inadimplente", honorario: 540000 },
  { id: "11", nome: "Livraria Saber", cnpj: "99.000.111/0001-22", regime: "Simples", status: "ativo", honorario: 95000 },
  { id: "12", nome: "Imobiliária Lar Doce", cnpj: "10.111.222/0001-33", regime: "Presumido", status: "pendente", honorario: 230000 },
];

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const colunasClientes: ColumnDef<Cliente>[] = [
  {
    accessorKey: "nome",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar fallback={row.original.nome.slice(0, 2).toUpperCase()} size="sm" />
        <span className="font-medium text-fg">{row.original.nome}</span>
      </div>
    ),
  },
  {
    accessorKey: "cnpj",
    header: "CNPJ",
    enableSorting: false,
    meta: { mono: true },
  },
  {
    accessorKey: "regime",
    header: "Regime",
    cell: ({ getValue }) => (
      <Badge tone="neutral">{getValue<string>()}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const meta = STATUS_META[getValue<Cliente["status"]>()];
      return (
        <Badge tone={meta.tone}>
          {meta.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "honorario",
    header: "Honorário",
    meta: { align: "right", mono: true },
    cell: ({ getValue }) => brl(getValue<number>()),
  },
  {
    id: "acoes",
    header: () => <span className="sr-only">Ações</span>,
    enableSorting: false,
    enableHiding: false,
    meta: { align: "right" },
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Ações para ${row.original.nome}`}
            className="inline-grid h-8 w-8 place-items-center rounded-[8px] text-fg-subtle outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <FileText /> Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Receipt /> Gerar guia
          </DropdownMenuItem>
          <DropdownMenuItem destructive>
            <Building2 /> Arquivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const columnLabels: Record<string, string> = {
  nome: "Cliente",
  cnpj: "CNPJ",
  regime: "Regime",
  status: "Status",
  honorario: "Honorário",
  acoes: "Ações",
};

function DataTableShowcase() {
  return (
    <DataTable
      columns={colunasClientes}
      data={clientes}
      columnLabels={columnLabels}
      enableSelection
      placeholderBusca="Buscar cliente ou CNPJ…"
      pageSize={6}
      empty={
        <EmptyState
          icon={<Building2 />}
          title="Nenhum cliente encontrado"
          description="Tente outro termo de busca ou limpe o filtro."
        />
      }
      toolbarActions={
        <Button size="sm" leadingIcon={<UserPlus className="h-4 w-4" />}>
          Novo cliente
        </Button>
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   DescriptionList — tela de detalhe de um cliente
   ──────────────────────────────────────────────────────────────────────────── */
function DescriptionShowcase() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Demo label="DescriptionList — empilhado (2 colunas)" className="!block">
        <DescriptionList columns={2}>
          <DescriptionItem label="Razão social">
            Aurora Tech Ltda.
          </DescriptionItem>
          <DescriptionItem label="Nome fantasia">Aurora</DescriptionItem>
          <DescriptionItem label="CNPJ" mono>
            12.345.678/0001-90
          </DescriptionItem>
          <DescriptionItem label="Inscrição estadual" mono>
            123.456.789.012
          </DescriptionItem>
          <DescriptionItem label="Regime tributário">
            Lucro Real
          </DescriptionItem>
          <DescriptionItem label="Honorário mensal" mono>
            R$ 4.800,00
          </DescriptionItem>
          <DescriptionItem label="Endereço" full>
            Av. das Nações, 1500, sala 1203 — Centro, São Paulo/SP
          </DescriptionItem>
        </DescriptionList>
      </Demo>

      <Demo label="DescriptionList — inline (rótulo à esquerda)" className="!block">
        <DescriptionList columns={1} layout="inline">
          <DescriptionItem label="Competência" mono>
            05/2026
          </DescriptionItem>
          <DescriptionItem label="Faturamento" mono>
            R$ 142.840,00
          </DescriptionItem>
          <DescriptionItem label="DAS apurado" mono>
            R$ 9.998,80
          </DescriptionItem>
          <DescriptionItem label="Vencimento" mono>
            20/06/2026
          </DescriptionItem>
          <DescriptionItem label="Situação">
            <Badge tone="success">
              Em dia
            </Badge>
          </DescriptionItem>
        </DescriptionList>
      </Demo>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Timeline + Activity Feed
   ──────────────────────────────────────────────────────────────────────────── */
const agora = Date.now();
const min = 60_000;
const hora = 60 * min;
const dia = 24 * hora;

function TimelineShowcase() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Demo label="Timeline — marcos do processo (ícones)" className="!block">
        <Timeline>
          <TimelineItem
            tone="success"
            icon={<CheckCircle2 />}
            title="Apuração de maio fechada"
            description="DAS gerado e disponível para pagamento."
            date={new Date(agora - 2 * hora)}
            meta={
              <Badge tone="success">
                Concluído
              </Badge>
            }
          />
          <TimelineItem
            tone="action"
            icon={<UploadCloud />}
            title="Notas fiscais importadas"
            description="48 NF-e processadas do mês de maio."
            date={new Date(agora - 6 * hora)}
          />
          <TimelineItem
            tone="accent"
            icon={<Receipt />}
            title="Conciliação bancária pendente"
            description="3 lançamentos aguardando classificação."
            date={new Date(agora - 1 * dia)}
            meta={<Badge tone="warning">Atenção</Badge>}
          />
          <TimelineItem
            tone="neutral"
            icon={<FileText />}
            title="Documentos do mês recebidos"
            description="Extratos e folha enviados pelo cliente."
            date={new Date(agora - 3 * dia)}
            last
          />
        </Timeline>
      </Demo>

      <Demo label="Activity Feed — quem fez o quê (avatares)" className="!block">
        <Timeline variant="feed">
          <TimelineItem
            avatar={{ fallback: "DP" }}
            title="Donato classificou 12 lançamentos"
            description="Categoria: despesas operacionais."
            date={new Date(agora - 8 * min)}
          />
          <TimelineItem
            avatar={{ fallback: "MA" }}
            title="Marina anexou o contrato social"
            description="contrato-social-v3.pdf · 2,4 MB"
            date={new Date(agora - 45 * min)}
          />
          <TimelineItem
            avatar={{ fallback: "JS" }}
            title="João aprovou a folha de pagamento"
            description="Competência 05/2026 — 14 colaboradores."
            date={new Date(agora - 4 * hora)}
          />
          <TimelineItem
            avatar={{ fallback: "AU" }}
            title="Aurora solicitou um relatório gerencial"
            date={new Date(agora - 2 * dia)}
            last
          />
        </Timeline>
      </Demo>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Export — bloco "Dados"
   ════════════════════════════════════════════════════════════════════════════ */
export function DadosSection() {
  return (
    <div className="grid gap-10">
      <div>
        <h3 className="mb-1 flex items-center gap-2 font-display text-[length:var(--text-h3)] font-semibold text-fg">
          <Building2 className="h-5 w-5 text-[var(--tone-action-fg)]" aria-hidden="true" />
          DataTable — tabela avançada
        </h3>
        <p className="mb-5 max-w-2xl text-[0.92rem] leading-relaxed text-fg-muted">
          Sobre @tanstack/react-table: ordene clicando no cabeçalho, busque no
          campo global, selecione linhas (inclusive “todas” da página), oculte
          colunas, alterne a densidade e navegue pelas páginas. Valores em IBM
          Plex Mono. Conteúdo ilustrativo.
        </p>
        <DataTableShowcase />
      </div>

      <div>
        <h3 className="mb-1 flex items-center gap-2 font-display text-[length:var(--text-h3)] font-semibold text-fg">
          <FileText className="h-5 w-5 text-[var(--tone-action-fg)]" aria-hidden="true" />
          DescriptionList — pares rótulo/valor
        </h3>
        <p className="mb-5 max-w-2xl text-[0.92rem] leading-relaxed text-fg-muted">
          Para telas de detalhe e cadastro. <code>&lt;dl&gt;/&lt;dt&gt;/&lt;dd&gt;</code>{" "}
          semânticos, responsivo (1 col no mobile, 2+ no desktop), valores
          numéricos em mono. Conteúdo ilustrativo.
        </p>
        <DescriptionShowcase />
      </div>

      <div>
        <h3 className="mb-1 flex items-center gap-2 font-display text-[length:var(--text-h3)] font-semibold text-fg">
          <CheckCircle2 className="h-5 w-5 text-[var(--tone-action-fg)]" aria-hidden="true" />
          Timeline / Activity Feed
        </h3>
        <p className="mb-5 max-w-2xl text-[0.92rem] leading-relaxed text-fg-muted">
          Linha do tempo vertical com marcador por tipo, título, descrição e
          tempo relativo em pt-BR. Variante “feed” com avatares para atividade de
          pessoas. Lista semântica. Conteúdo ilustrativo.
        </p>
        <TimelineShowcase />
      </div>
    </div>
  );
}
