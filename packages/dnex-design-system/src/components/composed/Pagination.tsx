import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/** Gera a lista de páginas com elipses (…) para conjuntos grandes. */
function buildRange(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < pageCount - 1) pages.push("…");
  pages.push(pageCount);
  return pages;
}

const cellBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-[8px] px-2 text-[0.88rem] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Pagination — navegação de páginas acessível. Elipses para conjuntos longos,
 * aria-current na página ativa.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationProps) {
  const range = buildRange(page, pageCount);
  return (
    <nav
      aria-label="Paginação"
      className={cn("flex items-center gap-1", className)}
    >
      <button
        type="button"
        className={cn(cellBase, "text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg")}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {range.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-9 min-w-9 items-center justify-center text-fg-subtle"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPageChange(p)}
            className={cn(
              cellBase,
              p === page
                ? "bg-[rgba(79,70,229,0.16)] text-fg"
                : "text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(cellBase, "text-fg-muted hover:bg-[var(--surface-hover)] hover:text-fg")}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
