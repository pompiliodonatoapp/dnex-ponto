import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "../brand/Logo";
import { ProductGlyph, type DnexProductKey } from "../brand/ProductGlyph";
import { cn } from "../../lib/cn";
import {
  getGlobalRailAvailability,
  getGlobalRailAvailabilityLabel,
  getGlobalRailDescription,
  isGlobalRailActionable,
  type GlobalRailAvailabilityItem,
} from "./globalRailAvailability";

export type GlobalRailProduct = GlobalRailAvailabilityItem & {
  key: DnexProductKey;
  /** Contagem ilustrativa ou operacional; nunca representa autorização. */
  badge?: number;
};

export type GlobalRailProps = {
  /** O control plane já deve entregar esta lista filtrada por acesso. */
  products: readonly GlobalRailProduct[];
  activeKey: DnexProductKey;
  onSelect: (key: DnexProductKey) => void;
  onOpenHub?: () => void;
  className?: string;
};

export type { GlobalRailAvailability } from "./globalRailAvailability";

/**
 * Rail global do App Shell V2. Contém somente produtos autorizados; ações da
 * conta, ajuda e configuração pertencem à topbar. Produtos autorizados mas
 * ainda sem handoff operacional aparecem com explicação, nunca como links
 * otimistas. Quando a lista ultrapassa a altura disponível, controles de
 * rolagem aparecem apenas no hover ou foco.
 */
export function GlobalRail({
  products,
  activeKey,
  onSelect,
  onOpenHub,
  className,
}: GlobalRailProps) {
  const scrollRef = useRef<HTMLElement | null>(null);
  const descriptionScope = useId();
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    canUp: false,
    canDown: false,
  });

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const hasOverflow = node.scrollHeight > node.clientHeight + 1;
    setScrollState({
      hasOverflow,
      canUp: hasOverflow && node.scrollTop > 1,
      canDown:
        hasOverflow &&
        node.scrollTop + node.clientHeight < node.scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const node = scrollRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);
    return () => observer.disconnect();
  }, [products.length, updateScrollState]);

  const scroll = (direction: "up" | "down") => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({
      top:
        (direction === "up" ? -1 : 1) *
        Math.max(96, Math.round(node.clientHeight * 0.65)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <aside
      className={cn(
        "dnex-brand-sidebar group/rail relative isolate flex w-16 shrink-0 flex-col items-center border-r border-white/[0.08] bg-[image:var(--shell-sidebar-bg)] py-3 text-white before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[image:var(--shell-sidebar-atmosphere)]",
        className,
      )}
      aria-label="Produtos DNEX"
    >
      {onOpenHub ? <button
        type="button"
        onClick={onOpenHub}
        aria-label="Abrir DNEX"
        className="grid h-10 w-10 place-items-center rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <Logo height={27} tone="inverse" symbolOnly />
      </button> : <div className="grid h-10 w-10 place-items-center" aria-label="DNEX"><Logo height={27} tone="inverse" symbolOnly /></div>}
      <div className="my-3 h-px w-8 bg-white/10" />
      <nav
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Aplicativos"
      >
        {products.map((item) => {
          const availability = getGlobalRailAvailability(item);
          const actionable = isGlobalRailActionable(item);
          const active = item.key === activeKey && actionable;
          const availabilityLabel = getGlobalRailAvailabilityLabel(item);
          const descriptionId = `${descriptionScope}-${item.key}`;
          return (
            <button
              key={item.key}
              type="button"
              title={
                actionable
                  ? `DNEX ${item.label}`
                  : `${availabilityLabel}: ${getGlobalRailDescription(item)}`
              }
              aria-label={
                actionable
                  ? `Abrir DNEX ${item.label}`
                  : `DNEX ${item.label} — ${availabilityLabel}`
              }
              aria-describedby={actionable ? undefined : descriptionId}
              aria-disabled={actionable ? undefined : true}
              aria-current={active ? "page" : undefined}
              data-availability={availability}
              onClick={actionable ? () => onSelect(item.key) : undefined}
              className={cn(
                "relative grid h-10 w-10 shrink-0 place-items-center rounded-[10px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-amber-300",
                active && actionable
                  ? "bg-white/[0.18] ring-1 ring-inset ring-white/25"
                  : actionable
                    ? "hover:bg-white/[0.08]"
                    : "cursor-not-allowed opacity-45 saturate-50",
              )}
            >
              <ProductGlyph product={item.key} size={28} />
              {item.badge != null && item.badge > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 font-mono text-[9px] font-bold text-indigo-950">
                  {item.badge}
                </span>
              )}
              {!actionable && (
                <span id={descriptionId} className="sr-only">
                  {getGlobalRailDescription(item)}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      {scrollState.hasOverflow && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 top-[58px] flex flex-col justify-between px-2 opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
          <RailScrollButton
            direction="up"
            disabled={!scrollState.canUp}
            onClick={() => scroll("up")}
          />
          <RailScrollButton
            direction="down"
            disabled={!scrollState.canDown}
            onClick={() => scroll("down")}
          />
        </div>
      )}
    </aside>
  );
}

function RailScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  const label =
    direction === "up" ? "Ver produtos anteriores" : "Ver mais produtos";
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="pointer-events-none grid h-8 w-8 place-items-center self-center rounded-full border border-white/15 bg-indigo-950/90 text-white opacity-0 shadow-[var(--shadow-md)] backdrop-blur transition-colors hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 group-hover/rail:pointer-events-auto group-hover/rail:opacity-100 group-focus-within/rail:pointer-events-auto group-focus-within/rail:opacity-100 disabled:pointer-events-none disabled:cursor-default disabled:opacity-0"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
