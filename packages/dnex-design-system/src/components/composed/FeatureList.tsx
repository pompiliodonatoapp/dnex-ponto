import type { ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";

export type FeatureItem = {
  /** Texto da feature. */
  label: ReactNode;
  /** true = incluída (check índigo) · false = ausente (traço apagado). */
  included?: boolean;
  /** Nota auxiliar à direita (ex.: limite "até 5"). Mono se numérica. */
  hint?: ReactNode;
};

export type FeatureListProps = {
  items: FeatureItem[];
  className?: string;
  /** Tamanho do texto: padrão (md) ou compacto (sm). */
  size?: "sm" | "md";
};

/**
 * FeatureList — lista de features de um plano com check (incluída) ou traço
 * (ausente). Usada dentro do PricingCard ou em tabelas comparativas. Acessível:
 * o estado vem por ícone + cor, e a ausência é anunciada via aria-label.
 */
export function FeatureList({ items, className, size = "md" }: FeatureListProps) {
  const text = size === "sm" ? "text-[0.85rem]" : "text-[0.9rem]";
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((it, i) => {
        const included = it.included ?? true;
        return (
          <li key={i} className="flex items-start gap-2.5">
            {included ? (
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-[rgba(79,70,229,0.16)] text-indigo-300"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-[var(--surface-hover)] text-fg-subtle"
              >
                <Minus className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            <span
              className={cn(
                "flex-1",
                text,
                included ? "text-fg-muted" : "text-fg-subtle line-through",
              )}
            >
              <span className="sr-only">
                {included ? "Incluído: " : "Não incluído: "}
              </span>
              {it.label}
            </span>
            {it.hint != null && (
              <span className="shrink-0 font-mono text-[0.8rem] text-fg-subtle">
                {it.hint}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
