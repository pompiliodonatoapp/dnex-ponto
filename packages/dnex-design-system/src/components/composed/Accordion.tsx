import * as RA from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Accordion acessível sobre Radix UI. Radix entrega teclado (setas, Home/End,
 * Enter/Space), aria-expanded, roles e foco. Animação de altura via CSS
 * (.acc-content em theme.css), desligada com prefers-reduced-motion.
 */
export function Accordion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <RA.Root type="single" collapsible className={cn("flex flex-col gap-3", className)}>
      {children}
    </RA.Root>
  );
}

export function AccordionItem({
  value,
  question,
  children,
}: {
  value: string;
  question: string;
  children: ReactNode;
}) {
  return (
    <RA.Item
      value={value}
      className="glass glass-edge overflow-hidden rounded-[var(--radius-card)] transition-colors data-[state=open]:[background:var(--surface-hover)]"
    >
      <RA.Header className="m-0">
        <RA.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-[1.02rem] font-semibold text-fg transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
          {question}
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-indigo-300 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]:rotate-45 group-data-[state=open]:border-[rgba(245,158,11,0.4)] group-data-[state=open]:text-accent"
          >
            <Plus className="h-3.5 w-3.5" />
          </span>
        </RA.Trigger>
      </RA.Header>
      <RA.Content className="acc-content overflow-hidden">
        <div className="px-5 pb-5 pt-0 text-[0.95rem] leading-relaxed text-fg-muted">
          {children}
        </div>
      </RA.Content>
    </RA.Item>
  );
}
