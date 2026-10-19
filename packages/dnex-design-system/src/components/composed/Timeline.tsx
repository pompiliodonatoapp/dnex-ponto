import type { ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../../lib/cn";
import { Avatar } from "../primitives/Avatar";

/**
 * Timeline / Activity Feed — linha do tempo vertical de eventos. Cada item tem
 * um marcador (ícone ou avatar) tingido por tipo, título, descrição e timestamp
 * relativo em pt-BR, ligados por uma linha conectora contínua.
 * -----------------------------------------------------------------------------
 * Duas formas:
 *   - <Timeline> + <TimelineItem icon={...}> → eventos do sistema (status, marcos).
 *   - variant="feed" com <TimelineItem avatar={{...}}> → feed de atividade de
 *     pessoas (quem fez o quê, quando).
 *
 * Acessível: a Timeline é uma lista (<ol>/<li>) semântica; o marcador é
 * decorativo (aria-hidden), o conteúdo textual carrega o significado.
 * Conteúdo deve ser ilustrativo.
 */

export type TimelineTone =
  | "neutral"
  | "action"
  | "accent"
  | "success"
  | "warning"
  | "danger";

const toneRing: Record<TimelineTone, string> = {
  neutral: "text-fg-muted bg-[var(--surface-hover)] border-line",
  action:
    "text-indigo-300 bg-[rgba(79,70,229,0.16)] border-[rgba(129,139,246,0.3)]",
  accent:
    "text-amber-400 bg-[rgba(245,158,11,0.14)] border-[rgba(245,158,11,0.3)]",
  success:
    "text-[#4ade80] bg-[rgba(34,197,94,0.14)] border-[rgba(34,197,94,0.3)]",
  warning:
    "text-amber-400 bg-[rgba(245,158,11,0.14)] border-[rgba(245,158,11,0.3)]",
  danger:
    "text-[#f87171] bg-[rgba(239,68,68,0.14)] border-[rgba(239,68,68,0.3)]",
};

export type TimelineProps = {
  children: ReactNode;
  /** "default" usa marcador de ícone; "feed" reserva mais espaço p/ avatar. */
  variant?: "default" | "feed";
  className?: string;
};

export function Timeline({
  children,
  variant = "default",
  className,
}: TimelineProps) {
  return (
    <ol
      data-variant={variant}
      className={cn("relative flex flex-col", className)}
    >
      {children}
    </ol>
  );
}

export type TimelineItemProps = {
  /** Conteúdo complementar expansível ou ações abaixo da descrição. */
  children?: ReactNode;
  /** Ícone do marcador (ex.: <CheckCircle2 />). Ignorado se `avatar` for usado. */
  icon?: ReactNode;
  /** Marcador como avatar (modo feed). Tem precedência sobre `icon`. */
  avatar?: { src?: string; fallback: string; alt?: string };
  tone?: TimelineTone;
  title: ReactNode;
  description?: ReactNode;
  /** Momento do evento — vira "há X" relativo (pt-BR). */
  date?: Date;
  /** Sobrescreve o texto de tempo (ex.: "agora"). */
  timeLabel?: string;
  /** Conteúdo extra (badge, botão) à direita do título. */
  meta?: ReactNode;
  /** Última posição? Esconde a linha conectora abaixo. */
  last?: boolean;
  className?: string;
};

export function TimelineItem({
  children,
  icon,
  avatar,
  tone = "neutral",
  title,
  description,
  date,
  timeLabel,
  meta,
  last = false,
  className,
}: TimelineItemProps) {
  const time =
    timeLabel ??
    (date
      ? formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
      : undefined);

  return (
    <li className={cn("relative flex gap-3.5 pb-6 last:pb-0", className)}>
      {/* coluna do marcador + conectora */}
      <div className="relative flex flex-col items-center">
        {avatar ? (
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            fallback={avatar.fallback}
            size="sm"
            className="z-10 ring-4 ring-[var(--bg)]"
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border ring-4 ring-[var(--bg)]",
              toneRing[tone],
              "[&>svg]:h-4 [&>svg]:w-4",
            )}
          >
            {icon}
          </span>
        )}
        {!last && (
          <span
            aria-hidden="true"
            className="absolute top-8 bottom-[-1.5rem] w-px bg-line"
          />
        )}
      </div>

      {/* conteúdo */}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[0.9rem] font-medium leading-snug text-fg">
            {title}
          </p>
          {meta}
        </div>
        {description && (
          <p className="mt-1 text-[0.85rem] leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
        {children}
        {time && (
          <time
            dateTime={date?.toISOString()}
            className="mt-1.5 block font-mono text-[0.72rem] text-fg-subtle"
          >
            {time}
          </time>
        )}
      </div>
    </li>
  );
}
