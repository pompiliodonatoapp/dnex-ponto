import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Loaders can overlap during auth/route transitions. Only the last one releases
// the page, and pre-existing inert/scroll state belongs to the host application.
let pageLock: { count: number; release: () => void } | undefined;

function lockPage(layer: HTMLDivElement) {
  if (pageLock) {
    pageLock.count += 1;
  } else {
    const body = layer.ownerDocument.body;
    const root = layer.ownerDocument.documentElement;
    const previousFocus = layer.ownerDocument.activeElement;
    const overflow = body.style.overflow;
    const rootOverflow = root.style.overflow;
    const inert = new Map<HTMLElement, boolean>();
    const lockSiblings = () => {
      for (const sibling of body.children) {
        if (!(sibling instanceof HTMLElement) || sibling.dataset.dnexPageLoader === "fixed" || inert.has(sibling)) continue;
        inert.set(sibling, sibling.inert);
        sibling.inert = true;
      }
    };
    lockSiblings();
    const observer = new MutationObserver(lockSiblings);
    observer.observe(body, { childList: true });
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    pageLock = { count: 1, release: () => {
      observer.disconnect();
      for (const [element, wasInert] of inert) element.inert = wasInert;
      if (body.style.overflow === "hidden") body.style.overflow = overflow;
      if (root.style.overflow === "hidden") root.style.overflow = rootOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && !previousFocus.closest("[inert]")) {
        previousFocus.focus({ preventScroll: true });
      }
    } };
  }
  layer.focus({ preventScroll: true });
  return () => {
    if (pageLock && --pageLock.count === 0) {
      pageLock.release();
      pageLock = undefined;
    }
  };
}

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = {
  size?: SpinnerSize;
  /** Espessura do anel em px (default escala com o tamanho). */
  thickness?: number;
  /** Rótulo para leitor de tela (role=status). */
  label?: string;
  className?: string;
};

const SIZE: Record<SpinnerSize, number> = { sm: 18, md: 28, lg: 44 };
const THICK: Record<SpinnerSize, number> = { sm: 2.5, md: 3, lg: 4 };

/**
 * Spinner — anel circular animado com gradiente índigo→âmbar girando.
 *
 * Técnica: um disco com `conic-gradient` (índigo claro → ação → âmbar →
 * transparente) recortado em anel por uma máscara radial (só a borda fica
 * visível). Gira com a keyframe `dnex-spin` (em theme.css), que é zerada em
 * `prefers-reduced-motion` pelo bloco global — então em reduced-motion o anel
 * fica estático, sem piscar.
 *
 * Acessível: `role="status"` + `aria-label`; o texto fica em sr-only para o
 * leitor de tela anunciar "Carregando".
 */
export function Spinner({
  size = "md",
  thickness,
  label = "Carregando",
  className,
}: SpinnerProps) {
  const px = SIZE[size];
  const ring = thickness ?? THICK[size];

  const ringStyle: CSSProperties = {
    width: px,
    height: px,
    background:
      "conic-gradient(from 0deg, transparent 0deg, var(--color-indigo-400) 90deg, var(--color-indigo-600) 210deg, var(--color-amber-500) 320deg, transparent 360deg)",
    // recorta o miolo deixando só o anel (espessura = ring px)
    WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
    mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
  };

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-grid place-items-center", className)}
    >
      <span
        aria-hidden="true"
        className="dnex-spin rounded-[var(--radius-pill)]"
        style={ringStyle}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export type PageLoaderProps = {
  /** Mensagem opcional abaixo do spinner. */
  message?: string;
  /** Mostra a marca DNEX animada com progresso (default true). */
  showSymbol?: boolean;
  /**
   * Onde portar visualmente: "fixed" cobre a viewport (default, app real);
   * "absolute" cobre o ancestral `relative` mais próximo (uso em frame/card).
   */
  position?: "fixed" | "absolute";
  /** Rótulo para leitor de tela. */
  label?: string;
  className?: string;
};

/**
 * PageLoader — carregamento de página inteira com fundo sólido e opaco.
 * O portal no body evita recorte por transform/filter/overflow de ancestrais
 * animados. Marca DNEX + progresso preservados; página bloqueada até concluir.
 *
 * `position="absolute"` permite demonstrá-lo contido num card/frame; o padrão
 * `"fixed"` cobre a viewport em produção. `aria-busy` + `role="status"`.
 */
export function PageLoader({
  message,
  showSymbol = true,
  position = "fixed",
  label = "Carregando a página",
  className,
}: PageLoaderProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  useClientLayoutEffect(() => {
    if (position === "fixed" && layerRef.current) return lockPage(layerRef.current);
  }, [position]);

  const layer = (
    <div
      ref={layerRef}
      data-dnex-page-loader={position}
      role="status"
      aria-busy="true"
      aria-label={label}
      tabIndex={position === "fixed" ? -1 : undefined}
      className={cn(
        "z-[var(--z-modal)] grid place-items-center bg-[var(--bg)] text-fg outline-none",
        position === "fixed" ? "fixed inset-0" : "absolute inset-0",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        {showSymbol ? <DnexLoadingMark label={message ?? "Carregando"} /> : <Spinner size="lg" label={label} />}
      </div>
    </div>
  );

  if (position === "absolute") return layer;
  return typeof document === "undefined" ? null : createPortal(layer, document.body);
}

/** Marca DNEX para transições de carregamento de página.
 *
 * Os dois chevrons respiram em sequência e o nexo âmbar responde logo depois.
 * Em `prefers-reduced-motion` a marca fica estática. `forceMotion` existe só
 * para a vitrine, para permitir revisão sem alterar as preferências do SO.
 */
export type DnexLoadingMarkProps = {
  label?: string;
  forceMotion?: boolean;
};

export function DnexLoadingMark({ label = "Carregando", forceMotion = false }: DnexLoadingMarkProps) {
  return (
    <div className="dnex-loading-mark" data-force-motion={forceMotion || undefined} aria-hidden="true">
      <svg width="260" height="96" viewBox="0 0 308 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="dnex-loading-chevron-1" d="M22 24L46 48L22 72" stroke="#818BF6" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <path className="dnex-loading-chevron-2" d="M44 24L68 48L44 72" stroke="#4F46E5" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="dnex-loading-node" cx="68" cy="48" r="10" fill="#F59E0B" />
        <text x="108" y="67" fill="currentColor" className="dnex-loading-wordmark">DNE<tspan fill="#818BF6">X</tspan></text>
      </svg>
      <div className="dnex-loading-progress" aria-hidden="true"><span /></div>
      <p className="dnex-loading-label">{label}<span className="dnex-loading-dots" /></p>
    </div>
  );
}
