import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  RowSelectionState,
  SortingState,
  Table as TanstackTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Columns3,
  Rows3,
  Rows4,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Checkbox } from "../primitives/Checkbox";
import { SearchInput } from "../primitives/SearchInput";
import { SegmentedControl } from "../primitives/SegmentedControl";

/**
 * Augmenta o `meta` de coluna do TanStack com os adornos visuais do DS:
 * `align` (direita p/ números) e `mono` (IBM Plex Mono p/ valores fiscais).
 * Sem isso, `meta: { mono: true }` na coluna seria erro de tipo (ColumnMeta
 * é vazio por padrão na v8).
 */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "right";
    mono?: boolean;
  }
}
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Pagination } from "./Pagination";

export type DataTableDensity = "comfortable" | "compact";
export type DnexColumnDef<T> = ColumnDef<T>;

/**
 * Coluna de seleção pronta (checkbox "selecionar todas" no header + por linha).
 * Anexe ao topo do array `columns` quando `enableSelection` estiver ligado —
 * o DataTable já injeta esta coluna automaticamente, então normalmente NÃO
 * precisa adicioná-la manualmente. Exportada caso queira customizar.
 */
export function makeSelectionColumn<T>(): ColumnDef<T> {
  return {
    id: "__select",
    enableSorting: false,
    enableHiding: false,
    size: 44,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
        aria-label="Selecionar todas as linhas desta página"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(v) => row.toggleSelected(v === true)}
        aria-label="Selecionar linha"
      />
    ),
  };
}

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  /** Texto rotular de cada coluna no menu de visibilidade (fallback p/ id). */
  columnLabels?: Record<string, string>;
  /** Filtro de texto global (busca em todas as colunas). Default: true. */
  enableGlobalFilter?: boolean;
  placeholderBusca?: string;
  /** Seleção de linhas com checkbox. Default: false. */
  enableSelection?: boolean;
  /** Estado de seleção controlado (opcional). */
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Controle de visibilidade de colunas via DropdownMenu. Default: true. */
  enableColumnVisibility?: boolean;
  /** Alternância de densidade (compacto/confortável). Default: true. */
  enableDensity?: boolean;
  densityDefault?: DataTableDensity;
  /** Paginação client-side. Default: true. */
  enablePagination?: boolean;
  pageSize?: number;
  /** Conteúdo quando não há linhas (após filtro). Use <EmptyState>. */
  empty?: ReactNode;
  /** Slot opcional à direita da toolbar (ex.: botão "Novo"). */
  toolbarActions?: ReactNode;
  /** Remove a borda externa quando a tabela já está dentro de um Card/Panel. */
  embedded?: boolean;
  className?: string;
};

/**
 * Padding-block por densidade LOCAL da tabela. Quando o controle local de
 * densidade está desligado (`enableDensity={false}`), a tabela herda a
 * densidade GLOBAL do app via token `--cell-py` (DensityProvider / data-density).
 */
const densityRowPad: Record<DataTableDensity, string> = {
  comfortable: "py-3.5",
  compact: "py-2",
};

/**
 * DataTable — tabela de dados avançada na cara DNEX, sobre @tanstack/react-table.
 * Ordenação por coluna (clique no header, aria-sort), filtro global, seleção de
 * linhas (com "selecionar todas"), paginação, visibilidade de colunas e
 * densidade. Visual herdado da Table base: cabeçalho apagado, linhas que
 * respiram, hover sutil. Números em mono via `meta.mono` na coluna.
 *
 * Acessibilidade: <table> semântica, scope nos headers, aria-sort no header
 * ordenável, foco visível nos controles, rótulos nos checkboxes.
 *
 * Conteúdo deve ser ilustrativo — o DS não embute dados reais.
 */
export function DataTable<T>({
  columns,
  data,
  columnLabels,
  enableGlobalFilter = true,
  placeholderBusca = "Buscar…",
  enableSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  enableColumnVisibility = true,
  enableDensity = true,
  densityDefault = "comfortable",
  enablePagination = true,
  pageSize = 8,
  empty,
  toolbarActions,
  embedded = false,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>(
    {},
  );
  const [density, setDensity] = useState<DataTableDensity>(densityDefault);

  const selectionControlled = rowSelectionProp !== undefined;
  const rowSelection = selectionControlled
    ? rowSelectionProp
    : internalSelection;

  // Injeta a coluna de seleção no topo quando habilitada.
  const resolvedColumns = useMemo<ColumnDef<T>[]>(
    () =>
      enableSelection ? [makeSelectionColumn<T>(), ...columns] : columns,
    [enableSelection, columns],
  );

  const table: TanstackTable<T> = useReactTable<T>({
    data,
    columns: resolvedColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      if (!selectionControlled) setInternalSelection(next);
      onRowSelectionChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enablePagination
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
    initialState: enablePagination
      ? { pagination: { pageSize } }
      : undefined,
  });

  // Densidade local (controle na toolbar) vence; sem ela, herda o token global
  // de densidade (--cell-py via DensityProvider / data-density).
  const rowPad = enableDensity
    ? densityRowPad[density]
    : "py-[var(--cell-py)]";
  const visibleRows = table.getRowModel().rows;
  const totalCols = table.getVisibleLeafColumns().length;

  // Colunas que podem ser ocultadas (para o menu de visibilidade).
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((c) => c.getCanHide() && c.id !== "__select");

  const selectedCount = enableSelection
    ? table.getSelectedRowModel().rows.length
    : 0;

  const showToolbar =
    enableGlobalFilter ||
    enableColumnVisibility ||
    enableDensity ||
    !!toolbarActions ||
    selectedCount > 0;

  return (
    <div className={cn(embedded ? "space-y-0" : "space-y-3", className)}>
      {/* ---------- Toolbar ---------- */}
      {showToolbar && (
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
            embedded && "border-b border-line bg-[var(--surface-2)] px-[var(--card-pad)] py-3",
          )}
        >
          <div className="flex flex-1 items-center gap-3">
            {enableGlobalFilter && (
              <div className="w-full max-w-xs">
                <SearchInput
                  value={globalFilter}
                  onValueChange={setGlobalFilter}
                  placeholder={placeholderBusca}
                  aria-label="Buscar na tabela"
                />
              </div>
            )}
            {selectedCount > 0 && (
              <span className="hidden whitespace-nowrap font-mono text-[0.78rem] text-fg-muted sm:inline">
                {selectedCount} selecionada{selectedCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {toolbarActions}

            {enableDensity && (
              <SegmentedControl
                aria-label="Densidade da tabela"
                size="sm"
                value={density}
                onValueChange={(v) => setDensity(v as DataTableDensity)}
                items={[
                  {
                    value: "comfortable",
                    label: <span className="sr-only">Confortável</span>,
                    icon: <Rows3 className="h-4 w-4" aria-hidden="true" />,
                  },
                  {
                    value: "compact",
                    label: <span className="sr-only">Compacto</span>,
                    icon: <Rows4 className="h-4 w-4" aria-hidden="true" />,
                  },
                ]}
              />
            )}

            {enableColumnVisibility && hideableColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-[var(--surface)] px-3 text-[0.85rem] font-medium text-fg-muted outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]"
                  >
                    <Columns3 className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Colunas</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hideableColumns.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(v) => col.toggleVisibility(!!v)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {columnLabels?.[col.id] ?? col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* ---------- Tabela ---------- */}
      <div
        className={cn(
          "overflow-hidden bg-[var(--surface)]",
          embedded ? "rounded-none border-0" : "rounded-[var(--radius-card)] border border-line",
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[0.9rem]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-line">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();
                    const meta = header.column.columnDef.meta as
                      | { align?: "left" | "right"; mono?: boolean }
                      | undefined;
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          !canSort
                            ? undefined
                            : sortDir === "asc"
                              ? "ascending"
                              : sortDir === "desc"
                                ? "descending"
                                : "none"
                        }
                        style={
                          header.getSize() !== 150
                            ? { width: header.getSize() }
                            : undefined
                        }
                        className={cn(
                          "px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-fg-subtle",
                          meta?.align === "right" && "text-right",
                        )}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "group/sort inline-flex items-center gap-1.5 rounded-[6px] outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
                              meta?.align === "right" && "flex-row-reverse",
                              sortDir && "text-fg",
                            )}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            <span
                              aria-hidden="true"
                              className="text-fg-subtle group-hover/sort:text-fg-muted"
                            >
                              {sortDir === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[var(--tone-action-fg)]" />
                              ) : sortDir === "desc" ? (
                                <ArrowDown className="h-3.5 w-3.5 text-[var(--tone-action-fg)]" />
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover/sort:opacity-100" />
                              )}
                            </span>
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="px-4 py-10">
                    {empty ?? (
                      <p className="text-center text-fg-muted">
                        Nenhum resultado para os filtros atuais.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const selected = row.getIsSelected();
                  return (
                    <tr
                      key={row.id}
                      data-state={selected ? "selected" : undefined}
                      className={cn(
                        "border-b border-line transition-colors last:border-0 hover:bg-[var(--surface-hover)]",
                        selected && "bg-[rgba(79,70,229,0.08)]",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as
                          | { align?: "left" | "right"; mono?: boolean }
                          | undefined;
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "px-4 text-fg",
                              rowPad,
                              meta?.align === "right" && "text-right",
                              meta?.mono && "font-mono tracking-tight",
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Rodapé / Paginação ---------- */}
      {enablePagination && table.getPageCount() > 1 && (
        <div
          className={cn(
            "flex flex-col items-center justify-between gap-3 sm:flex-row",
            embedded && "border-t border-line px-[var(--card-pad)] py-3",
          )}
        >
          <p className="font-mono text-[0.78rem] text-fg-subtle">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()} · {table.getFilteredRowModel().rows.length}{" "}
            registro{table.getFilteredRowModel().rows.length > 1 ? "s" : ""}
          </p>
          <Pagination
            page={table.getState().pagination.pageIndex + 1}
            pageCount={table.getPageCount()}
            onPageChange={(p) => table.setPageIndex(p - 1)}
          />
        </div>
      )}
    </div>
  );
}
