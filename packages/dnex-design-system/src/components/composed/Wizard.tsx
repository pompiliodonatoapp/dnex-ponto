import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";
import { Stepper } from "./Stepper";
import type { StepItem } from "./Stepper";
import { easeSoft } from "../../lib/motion";

/**
 * Wizard — container de formulário multi-step (ex.: qualificação de lead).
 * -----------------------------------------------------------------------------
 * - Renderiza o <Stepper> (orientação configurável) + barra de progresso fina.
 * - Navegação: Voltar / Avançar / Concluir. "Avançar" só habilita se
 *   `canAdvance(index)` retornar true (validação por passo, controlada pelo app).
 * - Transição suave entre passos (slide+fade direcional) que RESPEITA
 *   reduced-motion (cai para troca instantânea via useReducedMotion).
 * - Acessibilidade: cada passo é um painel rotulado pelo seu passo no Stepper;
 *   ao trocar de passo o foco vai para o painel atual (tabIndex -1) e anunciamos
 *   "Passo X de N" em uma região aria-live.
 *
 * Use controlado (`step` + `onStepChange`) ou não controlado (`defaultStep`).
 */
export type WizardStep = StepItem & {
  /** Conteúdo do passo (campos do formulário). */
  content: ReactNode;
};

export type WizardProps = {
  steps: WizardStep[];
  /** Validação por passo: retorne false para travar o "Avançar". Default: livre. */
  canAdvance?: (index: number) => boolean;
  /** Chamado ao concluir o último passo. */
  onComplete?: () => void;
  /** Passo inicial (não controlado). */
  defaultStep?: number;
  /** Passo atual (controlado). */
  step?: number;
  onStepChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  /** Rótulos dos botões (i18n / customização). */
  labels?: {
    back?: string;
    next?: string;
    complete?: string;
  };
  className?: string;
};

export function Wizard({
  steps,
  canAdvance,
  onComplete,
  defaultStep = 0,
  step: controlledStep,
  onStepChange,
  orientation = "horizontal",
  labels,
  className,
}: WizardProps) {
  const isControlled = controlledStep !== undefined;
  const [internal, setInternal] = useState(defaultStep);
  const current = isControlled ? controlledStep : internal;
  // Direção da transição: +1 avançando, -1 voltando (para o slide direcional).
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const baseId = useId();

  const total = steps.length;
  const isLast = current === total - 1;
  const isFirst = current === 0;
  const nextAllowed = canAdvance ? canAdvance(current) : true;

  const goTo = useCallback(
    (index: number, direction: number) => {
      const clamped = Math.max(0, Math.min(total - 1, index));
      setDir(direction);
      if (!isControlled) setInternal(clamped);
      onStepChange?.(clamped);
    },
    [isControlled, onStepChange, total],
  );

  const handleNext = () => {
    if (!nextAllowed) return;
    if (isLast) {
      onComplete?.();
      return;
    }
    goTo(current + 1, 1);
  };

  const handleBack = () => {
    if (isFirst) return;
    goTo(current - 1, -1);
  };

  // Move o foco para o painel ao trocar de passo (pula o 1º render p/ não roubar
  // o foco ao montar a página).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    panelRef.current?.focus();
  }, [current]);

  const progress = ((current + 1) / total) * 100;
  const stepLabels = steps.map(({ content, ...s }) => s);
  const active = steps[current]!;

  const slide = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
      }
    : {
        initial: { opacity: 0, x: dir * 32 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -32 },
        transition: { duration: 0.32, ease: easeSoft },
      };

  return (
    <div className={cn("w-full", className)}>
      {/* Indicador de passos */}
      <div className={cn(orientation === "vertical" && "sm:grid sm:grid-cols-[auto_1fr] sm:gap-8")}>
        <div className={cn(orientation === "horizontal" ? "mb-6" : "mb-6 sm:mb-0")}>
          <Stepper
            steps={stepLabels}
            current={current}
            orientation={orientation}
          />
          {/* Barra de progresso fina — reforço visual do avanço. */}
          {orientation === "horizontal" && (
            <div
              className="mt-5 h-1 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--surface-hover)]"
              role="progressbar"
              aria-valuenow={current + 1}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label="Progresso do formulário"
            >
              <motion.div
                className="h-full rounded-[var(--radius-pill)] bg-action"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, ease: easeSoft }}
              />
            </div>
          )}
        </div>

        {/* Painel do passo */}
        <div>
          {/* Anúncio para leitores de tela. */}
          <p className="sr-only" aria-live="polite">
            Passo {current + 1} de {total}: {active.label}
          </p>

          {/* -mx/-mb + px/pb: alarga o clip do slide para o anel de foco (ring
              outset 2px) dos campos não ser cortado nas laterais/base; o padding
              recompõe a posição do conteúdo. */}
          <div className="relative overflow-hidden -mx-2 px-2 -mb-2 pb-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                ref={panelRef}
                role="group"
                aria-labelledby={`${baseId}-step-${current}-title`}
                tabIndex={-1}
                className="outline-none"
                initial={slide.initial}
                animate={slide.animate}
                exit={slide.exit}
                transition={slide.transition}
              >
                <h3
                  id={`${baseId}-step-${current}-title`}
                  className="font-display text-[length:var(--text-h3)] font-semibold tracking-tight text-fg"
                >
                  {active.label}
                </h3>
                {active.description && (
                  <p className="mt-1 text-[0.9rem] leading-relaxed text-fg-muted">
                    {active.description}
                  </p>
                )}
                <div className="mt-5">{active.content}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navegação */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isFirst}
              leadingIcon={<ArrowLeft className="h-4 w-4" />}
            >
              {labels?.back ?? "Voltar"}
            </Button>
            <span className="font-mono text-[0.8rem] text-fg-subtle">
              {current + 1} / {total}
            </span>
            <Button
              onClick={handleNext}
              disabled={!nextAllowed}
              trailingIcon={
                isLast ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )
              }
            >
              {isLast
                ? (labels?.complete ?? "Concluir")
                : (labels?.next ?? "Avançar")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
