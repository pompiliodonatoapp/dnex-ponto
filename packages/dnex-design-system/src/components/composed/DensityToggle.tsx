import { Rows3, Rows4 } from "lucide-react";
import { useDensity } from "../../lib/density";
import { cn } from "../../lib/cn";

/**
 * DensityToggle — botão ÚNICO de alternância da densidade global
 * (confortável ↔ compacto). Mostra o ícone do estado atual e troca ao clicar.
 *
 * Escreve a densidade global via DensityProvider (data-density no <html> +
 * localStorage); os componentes de dado/lista respondem pelos tokens. Para a
 * densidade LOCAL de uma única tabela, prefira a prop `enableDensity` do
 * DataTable. Em telas de Configurações, prefira um SegmentedControl rotulado.
 */

export type DensityToggleProps = {
  className?: string;
};

export function DensityToggle({ className }: DensityToggleProps) {
  const { density, setDensity } = useDensity();
  const isCompact = density === "compact";
  const title = isCompact ? "Densidade: compacta" : "Densidade: confortável";

  return (
    <button
      type="button"
      aria-label={`${title}. Clique para alternar para ${isCompact ? "confortável" : "compacta"}.`}
      title={title}
      onClick={() => setDensity(isCompact ? "comfortable" : "compact")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] " +
          "border border-line bg-[var(--surface)] text-fg-muted outline-none transition-colors " +
          "hover:text-fg hover:border-action focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
        className,
      )}
    >
      {isCompact ? (
        <Rows4 className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Rows3 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
