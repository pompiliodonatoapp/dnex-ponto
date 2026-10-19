import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RSwitch from "@radix-ui/react-switch";
import { cn } from "../../lib/cn";

export type SwitchProps = ComponentPropsWithoutRef<typeof RSwitch.Root>;

/**
 * Switch — alternância on/off acessível (Radix). Track âmbar-quando-on? Não:
 * ação = índigo (consistência). Âmbar é reservado a acento/destaque.
 * Plano, sem sombra (decisão do dono, 10/10/2026): desligado = trilha
 * --line-strong com botão --fg-subtle (≥3:1 contra trilha e superfície nos dois
 * temas); ligado = trilha ação com botão branco.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <RSwitch.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-line-strong p-0.5 outline-none transition-colors",
        "bg-[var(--line-strong)] data-[state=checked]:border-action data-[state=checked]:bg-action",
        "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <RSwitch.Thumb className="block h-[18px] w-[18px] rounded-full bg-[var(--fg-subtle)] transition-[translate,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=checked]:translate-x-5 data-[state=checked]:bg-white" />
    </RSwitch.Root>
  );
});
