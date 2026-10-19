import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Stepper — indicador de progresso por passos. Horizontal (padrão) ou vertical.
 * Três estados por passo: done (concluído, índigo + check), active (atual, anel
 * âmbar) e upcoming (futuro, neutro). Numeração em IBM Plex Mono.
 *
 * É um indicador visual; o foco/navegação vive no <Wizard>. Marca o passo atual
 * com aria-current="step" para leitores de tela. Cada item é um <li> dentro de
 * uma <ol> rotulada — semântica de "lista ordenada de etapas".
 */
export type StepItem = {
  id: string;
  label: string;
  /** Descrição curta opcional sob o rótulo. */
  description?: string;
};

export type StepState = "done" | "active" | "upcoming";

export type StepperProps = {
  steps: StepItem[];
  /** Índice (0-based) do passo atual. */
  current: number;
  orientation?: "horizontal" | "vertical";
  /** Rótulo acessível da lista de etapas. */
  "aria-label"?: string;
  className?: string;
};

function stateOf(index: number, current: number): StepState {
  if (index < current) return "done";
  if (index === current) return "active";
  return "upcoming";
}

function Bullet({ state, n }: { state: StepState; n: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-pill)] border font-mono text-[0.85rem] font-semibold transition-colors duration-200",
        state === "done" &&
          "border-transparent bg-action text-fg-on-action",
        state === "active" &&
          "border-accent bg-[rgba(245,158,11,0.12)] text-accent",
        state === "upcoming" &&
          "border-line bg-[var(--surface)] text-fg-subtle",
      )}
    >
      {state === "done" ? <Check className="h-4 w-4" /> : n}
    </span>
  );
}

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  className,
  ...rest
}: StepperProps) {
  const ariaLabel = rest["aria-label"] ?? "Progresso das etapas";

  if (orientation === "vertical") {
    return (
      <ol aria-label={ariaLabel} className={cn("flex flex-col", className)}>
        {steps.map((step, i) => {
          const state = stateOf(i, current);
          const last = i === steps.length - 1;
          return (
            <li
              key={step.id}
              aria-current={state === "active" ? "step" : undefined}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <Bullet state={state} n={i + 1} />
                {!last && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "my-1 w-px flex-1 transition-colors duration-300",
                      i < current ? "bg-action" : "bg-line",
                    )}
                  />
                )}
              </div>
              <div className={cn("pb-6 pt-1", last && "pb-0")}>
                <p
                  className={cn(
                    "font-display text-[0.92rem] font-semibold tracking-tight transition-colors",
                    state === "upcoming" ? "text-fg-subtle" : "text-fg",
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-[0.8rem] leading-snug text-fg-muted">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  // Horizontal
  return (
    <ol
      aria-label={ariaLabel}
      className={cn("flex w-full items-start", className)}
    >
      {steps.map((step, i) => {
        const state = stateOf(i, current);
        const last = i === steps.length - 1;
        return (
          <li
            key={step.id}
            aria-current={state === "active" ? "step" : undefined}
            className={cn("flex items-start", !last && "flex-1")}
          >
            <div className="flex min-w-0 flex-col items-center text-center">
              <Bullet state={state} n={i + 1} />
              <p
                className={cn(
                  "mt-2 max-w-[10rem] truncate font-display text-[0.82rem] font-semibold tracking-tight transition-colors sm:max-w-[12rem]",
                  state === "upcoming" ? "text-fg-subtle" : "text-fg",
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="mt-0.5 hidden max-w-[12rem] text-[0.75rem] leading-snug text-fg-muted sm:block">
                  {step.description}
                </p>
              )}
            </div>
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "mt-[1.0625rem] h-px flex-1 transition-colors duration-300",
                  i < current ? "bg-action" : "bg-line",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
