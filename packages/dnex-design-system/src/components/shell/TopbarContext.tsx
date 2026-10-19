import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

export type TopbarContextProps = {
  /** Nome do produto. Ex.: DNEX Processos. */
  product: string;
  /** Página ou área atual. */
  page?: string;
  /** Contexto multiempresa opcional. */
  company?: string;
  className?: string;
};

/**
 * Contexto canônico da topbar DNEX V1.1.
 * Mantém produto, página e empresa na mesma hierarquia visual em todo o SaaS.
 */
export function TopbarContext({
  product,
  page,
  company,
  className,
}: TopbarContextProps) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-2 text-small", className)}
      aria-label={[product, page, company].filter(Boolean).join(" — ")}
    >
      <strong className="shrink-0 font-semibold text-fg">{product}</strong>
      {page ? (
        <>
          <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <span className="min-w-0 truncate font-medium text-fg-muted">{page}</span>
        </>
      ) : null}
      {company ? (
        <span className="hidden min-w-0 truncate border-l border-line pl-2 text-fg-subtle xl:block">
          {company}
        </span>
      ) : null}
    </div>
  );
}
