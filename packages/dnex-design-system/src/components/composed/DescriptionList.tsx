import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

const DLLayoutContext = createContext<"stacked" | "inline">("stacked");

/**
 * DescriptionList — lista de pares rótulo/valor (key-value) para telas de
 * detalhe e cadastro. Usa <dl>/<dt>/<dd> semânticos. Layout responsivo:
 * 1 coluna no mobile, 2 colunas no desktop. Valores numéricos/fiscais em mono
 * via prop `mono` no item. Conteúdo deve ser ilustrativo.
 *
 * Acessível: a relação rótulo→valor é nativa do <dl>; o rótulo é texto apagado,
 * o valor é o conteúdo de leitura.
 */

export type DescriptionListProps = {
  children: ReactNode;
  /** Número de colunas no desktop. Default: 2. */
  columns?: 1 | 2 | 3;
  /** "stacked": rótulo acima do valor. "inline": rótulo à esquerda. */
  layout?: "stacked" | "inline";
  className?: string;
};

const colsClass: Record<NonNullable<DescriptionListProps["columns"]>, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export function DescriptionList({
  children,
  columns = 2,
  layout = "stacked",
  className,
}: DescriptionListProps) {
  return (
    <DLLayoutContext.Provider value={layout}>
      <dl
        data-layout={layout}
        className={cn(
          "grid grid-cols-1 gap-x-8 gap-y-5",
          colsClass[columns],
          className,
        )}
      >
        {children}
      </dl>
    </DLLayoutContext.Provider>
  );
}

export type DescriptionItemProps = {
  label: ReactNode;
  children: ReactNode;
  /** Valor em IBM Plex Mono (dinheiro, documentos, datas). */
  mono?: boolean;
  /** Ocupa a largura toda da grade (ex.: endereço, observação longa). */
  full?: boolean;
  /** Layout do item; herda do <DescriptionList> quando omitido. */
  layout?: "stacked" | "inline";
  className?: string;
};

export function DescriptionItem({
  label,
  children,
  mono = false,
  full = false,
  layout,
  className,
}: DescriptionItemProps) {
  const ctxLayout = useContext(DLLayoutContext);
  const inline = (layout ?? ctxLayout) === "inline";
  return (
    <div
      className={cn(
        full && "sm:col-span-full",
        inline
          ? "flex items-baseline justify-between gap-4 border-b border-line pb-2"
          : "flex flex-col gap-1",
        className,
      )}
    >
      <dt className="text-[0.72rem] font-medium uppercase tracking-[0.08em] text-fg-subtle">
        {label}
      </dt>
      <dd
        className={cn(
          "text-[0.92rem] text-fg",
          inline && "text-right",
          mono && "font-mono tracking-tight",
        )}
      >
        {children}
      </dd>
    </div>
  );
}
