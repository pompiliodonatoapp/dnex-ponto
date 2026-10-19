import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type TopbarProps = {
  /** Conteúdo à esquerda (ex.: breadcrumb, AppLauncher, busca). */
  left?: ReactNode;
  /** Conteúdo central (normalmente a busca global do produto). */
  center?: ReactNode;
  /** Conteúdo à direita (ex.: ações, avatar, toggle de tema). */
  right?: ReactNode;
  className?: string;
};

/**
 * Topbar — barra superior canônica do ecossistema DNEX. Sticky, glass sutil,
 * hairline inferior. Contexto à esquerda, busca ao centro e ações globais à
 * direita; ações da página pertencem ao PageHeader.
 */
export function Topbar({ left, center, right, className }: TopbarProps) {
  return (
    <header
      // A 3ª coluna é `auto` (tamanho do conteúdo), NÃO `minmax(0,1fr)`.
      //
      // Com `1fr` ela valia 174px em 1024px contra ~250px de ações — e como o grupo é
      // `justify-end` com filhos `shrink-0`, o excesso transbordava PARA A ESQUERDA, por cima da
      // busca. Medido em 27/08: sobreposição de 56px em 1024px, e `click()` no botão "Ajuda"
      // estourava timeout com a busca interceptando o ponteiro. O botão existia, era invisível e
      // não clicava. Trocar `xl:`→`lg:` trouxe os 5 ícones para 1024 sem alargar esta coluna:
      // uma faixa órfã virou outra.
      className={cn(
        "sticky top-0 z-[var(--z-sticky)] grid h-[var(--shell-topbar-height)] shrink-0 grid-cols-[minmax(0,1fr)_minmax(96px,1fr)_auto] items-center gap-4 border-b border-line bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-[var(--shell-topbar-padding-inline-mobile)] backdrop-blur-[var(--shell-topbar-blur)] md:px-[var(--shell-topbar-padding-inline)] lg:grid-cols-[minmax(0,1fr)_minmax(var(--shell-topbar-search-min),var(--shell-topbar-search-max))_auto] lg:gap-[var(--shell-topbar-column-gap)]",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">{left}</div>
      <div className="min-w-0">{center}</div>
      <div className="flex shrink-0 items-center justify-end gap-2">{right}</div>
    </header>
  );
}
