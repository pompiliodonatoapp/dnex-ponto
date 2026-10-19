import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";

export type ActionBannerTone = "action" | "success" | "danger";

export type ActionBannerProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: ActionBannerTone;
  className?: string;
};

const toneClasses: Record<ActionBannerTone, string> = {
  action: "border-white/20 bg-white/10 text-white",
  success: "border-success/30 bg-success-tint text-[var(--color-success)]",
  danger: "border-danger/30 bg-danger-tint text-[var(--color-danger)]",
};

const toneIcons: Record<ActionBannerTone, ReactNode> = {
  action: <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />,
  success: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
  danger: <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />,
};

/**
 * ActionBanner — faixa de decisão da V1 para próxima melhor ação, sucesso
 * operacional ou risco. Mantém o fundo institucional, o nexo âmbar e a ação
 * separados do canvas neutro do produto.
 */
export function ActionBanner({
  eyebrow,
  title,
  description,
  action,
  tone = "action",
  className,
}: ActionBannerProps) {
  return (
    <section
      className={cn(
        "dnex-v1-card relative overflow-hidden rounded-[var(--radius-card)]",
        "bg-[radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.15),transparent_27%),linear-gradient(110deg,var(--color-indigo-800),var(--color-indigo-950)_68%,var(--color-ink))]",
        "p-[var(--card-pad)] text-white sm:flex sm:items-center sm:justify-between sm:gap-8",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 right-[15%] h-56 w-36 rotate-[32deg] rounded-[var(--radius-pill)] border border-white/10"
      />
      <div className="relative z-10 min-w-0">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em]",
            toneClasses[tone],
          )}
        >
          {toneIcons[tone]}
          {eyebrow}
        </span>
        <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-3xl text-small leading-relaxed text-white/75">
            {description}
          </p>
        )}
      </div>
      {action && <div className="relative z-10 mt-5 shrink-0 sm:mt-0">{action}</div>}
    </section>
  );
}
