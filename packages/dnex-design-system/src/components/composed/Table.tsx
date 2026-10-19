import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Render da célula; recebe a linha. */
  cell: (row: T) => ReactNode;
  /** Alinha à direita (ex.: valores numéricos). */
  align?: "left" | "right";
  /** Usa fonte mono na célula (valores fiscais). */
  mono?: boolean;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  /** Chave única por linha. */
  rowKey: (row: T) => string;
  /** Conteúdo quando data está vazio (use <EmptyState>). */
  empty?: ReactNode;
  className?: string;
};

/**
 * Table — data table simples, acessível e on-brand. Cabeçalho apagado,
 * linhas que respiram, hover sutil. Valores fiscais em mono via `mono` na coluna.
 *
 * Densidade: o padding-block das células segue o token `--cell-py` (e o header
 * um valor proporcional), então a tabela compacta/relaxa junto com a densidade
 * global (DensityProvider) ou com qualquer ancestral que defina `data-density`.
 */
export function Table<T>({
  columns,
  data,
  rowKey,
  empty,
  className,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface)]",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[0.9rem]">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-[var(--cell-px)] py-[calc(var(--cell-py)_-_0.125rem)] text-[0.72rem] font-medium uppercase tracking-[0.08em] text-fg-subtle",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10">
                  {empty ?? (
                    <p className="text-center text-fg-muted">
                      Nada por aqui ainda.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-line transition-colors last:border-0 hover:bg-[var(--surface-hover)]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-[var(--cell-px)] py-[var(--cell-py)] text-fg",
                        col.align === "right" && "text-right",
                        col.mono && "font-mono tracking-tight",
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
