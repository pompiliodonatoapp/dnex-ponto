import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { PageHeader } from "../../components/shell/PageHeader";
import { Button } from "../../components/primitives/Button";
import { DataTable } from "../../components/composed/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/composed/DropdownMenu";
import { EmptyState } from "../../components/composed/EmptyState";
import { ErrorState } from "../../components/composed/ErrorState";
import { Skeleton } from "../../components/composed/Skeleton";
import {
  IllustrationEmpty,
  IllustrationNoConnection,
  IllustrationNoPermission,
} from "../../components/illustrations";

/**
 * CrudListTemplate — a "lista" do quarteto CRUD genérico do hub DNEX.
 *
 * Cabeçalho (título + descrição + botão "Novo") · busca embutida na DataTable
 * (SearchInput) · DataTable (ordenação/paginação/densidade/visibilidade) com
 * uma coluna de ações por linha (ver/editar/excluir via DropdownMenu) ·
 * filtros opcionais (slot) · os 4+ estados desenhados: carregando (skeleton),
 * vazio (EmptyState), erro (ErrorState) e sem-permissão (ErrorState +
 * IllustrationNoPermission).
 *
 * Não recria nada: compõe DataTable, DropdownMenu, EmptyState/ErrorState,
 * Skeleton e PageHeader já existentes no DS. As colunas de DOMÍNIO vêm do
 * consumidor; este template só injeta a coluna de ações ao final quando há
 * algum callback de linha.
 *
 * Conteúdo é responsabilidade do consumidor — o template é puro arcabouço.
 */

export type CrudListTemplateProps<T> = {
  /** Título da página (ex.: "Usuários"). */
  title: string;
  /** Descrição apagada sob o título. */
  description?: string;
  /** Trilha opcional acima do título (ex.: <Breadcrumb>). */
  breadcrumb?: ReactNode;

  /** Colunas de DOMÍNIO (sem a de ações — o template a injeta). */
  columns: ColumnDef<T>[];
  /** Linhas a exibir. */
  data: T[];
  /** Rótulo de cada coluna no menu de visibilidade (id → label). */
  columnLabels?: Record<string, string>;

  /** Texto do botão primário do cabeçalho. Default: "Novo". */
  createLabel?: string;
  /** Criar novo registro (esconde o botão se ausente). */
  onCreate?: () => void;

  /** Abrir detalhe da linha. */
  onView?: (row: T) => void;
  /** Abrir edição da linha. */
  onEdit?: (row: T) => void;
  /** Excluir a linha (abre confirmação no consumidor). */
  onDelete?: (row: T) => void;
  /** Rótulo acessível das ações por linha (ex.: (u) => u.name). */
  rowActionLabel?: (row: T) => string;
  /** Ações extras por linha, inseridas antes de "Excluir". */
  extraRowActions?: (row: T) => ReactNode;

  /** Slot de filtros à esquerda da toolbar da tabela (Select/SegmentedControl…). */
  filters?: ReactNode;
  placeholderBusca?: string;
  pageSize?: number;
  enableSelection?: boolean;

  /** Estado de carregamento — mostra skeleton de tabela. */
  loading?: boolean;
  /** Mensagem de erro do servidor — mostra ErrorState com "tentar de novo". */
  error?: string | null;
  onRetry?: () => void;
  /** Usuário sem permissão de ver a lista — mostra ErrorState 403. */
  noPermission?: boolean;

  /** Customização do estado vazio (quando data === []). */
  emptyTitle?: string;
  emptyDescription?: string;

  className?: string;
};

/** Skeleton de tabela — N linhas de barras, no lugar do spinner solo. */
function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
      <div className="border-b border-line px-4 py-3">
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="hidden h-3 w-24 sm:block" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CrudListTemplate<T>({
  title,
  description,
  breadcrumb,
  columns,
  data,
  columnLabels,
  createLabel = "Novo",
  onCreate,
  onView,
  onEdit,
  onDelete,
  rowActionLabel,
  extraRowActions,
  filters,
  placeholderBusca = "Buscar…",
  pageSize = 8,
  enableSelection = false,
  loading = false,
  error = null,
  onRetry,
  noPermission = false,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription = "Quando o primeiro registro for criado, ele aparece nesta lista.",
  className,
}: CrudListTemplateProps<T>) {
  const hasRowActions =
    !!onView || !!onEdit || !!onDelete || !!extraRowActions;

  // Coluna de ações por linha — só entra quando há algum callback.
  const actionColumn: ColumnDef<T> = {
    id: "__actions",
    header: () => <span className="sr-only">Ações</span>,
    enableSorting: false,
    enableHiding: false,
    size: 56,
    meta: { align: "right" },
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={
              rowActionLabel
                ? `Ações para ${rowActionLabel(row.original)}`
                : "Ações da linha"
            }
            className="inline-grid h-8 w-8 place-items-center rounded-[8px] text-fg-subtle outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onView && (
            <DropdownMenuItem onSelect={() => onView(row.original)}>
              <Eye /> Ver detalhes
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onSelect={() => onEdit(row.original)}>
              <Pencil /> Editar
            </DropdownMenuItem>
          )}
          {extraRowActions?.(row.original)}
          {onDelete && (
            <>
              {(onView || onEdit || extraRowActions) && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                destructive
                onSelect={() => onDelete(row.original)}
              >
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const resolvedColumns = hasRowActions
    ? [...columns, actionColumn]
    : columns;

  const createButton = onCreate ? (
    <Button
      size="sm"
      leadingIcon={<Plus className="h-4 w-4" />}
      onClick={onCreate}
    >
      {createLabel}
    </Button>
  ) : undefined;

  return (
    <div className={cn("flex flex-col", className)}>
      <PageHeader
        title={title}
        description={description}
        breadcrumb={breadcrumb}
        actions={createButton}
      />

      {noPermission ? (
        <ErrorState
          illustration={<IllustrationNoPermission />}
          code="403"
          title="Você não tem acesso a esta lista"
          description="Fale com um administrador do workspace para liberar a permissão."
        />
      ) : error ? (
        <ErrorState
          illustration={<IllustrationNoConnection />}
          title="Não conseguimos carregar agora"
          description={error}
          action={
            onRetry ? (
              <Button onClick={onRetry}>Tentar de novo</Button>
            ) : undefined
          }
        />
      ) : loading ? (
        <div className="space-y-3">
          {filters}
          <TableSkeleton rows={pageSize > 6 ? 6 : pageSize} />
        </div>
      ) : (
        <DataTable
          columns={resolvedColumns}
          data={data}
          columnLabels={columnLabels}
          placeholderBusca={placeholderBusca}
          pageSize={pageSize}
          enableSelection={enableSelection}
          toolbarActions={filters}
          empty={
            <EmptyState
              illustration={<IllustrationEmpty />}
              title={emptyTitle}
              description={emptyDescription}
              action={createButton}
            />
          }
        />
      )}
    </div>
  );
}
