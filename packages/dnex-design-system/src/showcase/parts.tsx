import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { ThemeSwitcher } from "../components/composed/ThemeSwitcher";

/** Conteúdo visível desde a montagem: seções longas não podem depender de IntersectionObserver. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 ds-catalog-section">
      <header className="ds-section-header">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}

/** Painel de demonstração — superfície glass que agrupa exemplos. */
export function Demo({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="ds-demo">
      {label && <p className="ds-demo-label">{label}</p>}
      <div className={cn("flex flex-wrap items-center gap-4", className)}>
        {children}
      </div>
    </div>
  );
}

/**
 * Toggle de tema do showcase — fino wrapper sobre o componente OFICIAL
 * `ThemeSwitcher` do DS. Usa a variante `icon` (um único botão que cicla
 * claro → escuro → sistema), para não repetir botões de mesma função na topbar
 * e ficar consistente com as telas padrão (que já usam o ícone único).
 */
export function ThemeToggle() {
  return <ThemeSwitcher variant="icon" />;
}

/**
 * DeviceFrame — moldura sutil de celular (~390×~820) com scroll interno.
 * O conteúdo é renderizado na LARGURA REAL do frame (390px fixos), então os
 * componentes dentro se comportam como em ~390px de verdade — não é só um
 * "zoom out". Encaminha a ref para o miolo (área scrollável) para que o drawer
 * do app-shell seja portado e contido aqui dentro.
 */
export const DeviceFrame = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(function DeviceFrame({ children, className }, ref) {
  return (
    <div
      className={cn(
        "mx-auto w-[412px] max-w-full rounded-[40px] border border-line-strong bg-[var(--surface)] p-2.5 shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      {/* notch / alto-falante */}
      <div className="mx-auto mb-1.5 h-1.5 w-20 rounded-[var(--radius-pill)] bg-[var(--line-strong)]" />
      {/* viewport real do device: 390px de largura, scroll vertical interno.
            dnex-cq-frame torna o miolo um container-query para que a tipografia
            fluida (clamp) encolha contra os 390px do frame, não contra o viewport. */}
      <div
        ref={ref}
        className="dnex-cq-frame relative h-[760px] w-[390px] max-w-full overflow-y-auto overflow-x-hidden rounded-[30px] bg-[var(--bg)]"
      >
        {children}
      </div>
    </div>
  );
});

/** Toggle segmentado genérico (radiogroup acessível) — Desktop ↔ Mobile etc. */
export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-[var(--radius-control)] border border-line bg-[var(--surface)] p-1"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[7px] px-3 text-[length:var(--text-small)] font-medium outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
            value === opt.value
              ? "bg-[rgba(79,70,229,0.18)] text-fg"
              : "text-fg-muted hover:text-fg",
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Pequeno rótulo de propriedade para a grade de tokens. */
export function Swatch({
  name,
  value,
  varName,
}: {
  name: string;
  value: string;
  varName?: string;
}) {
  return (
    <div className="ds-swatch">
      <span
        className="h-9 w-9 shrink-0 rounded-[8px] border border-line"
        style={{ background: value }}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="truncate text-[0.82rem] font-medium text-fg">{name}</p>
        <p className="truncate font-mono text-[0.72rem] text-fg-subtle">
          {varName ?? value}
        </p>
      </div>
    </div>
  );
}
