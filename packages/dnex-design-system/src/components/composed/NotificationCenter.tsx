import { forwardRef } from "react";
import type { ReactNode } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CircleAlert,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../../lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { EmptyState } from "./EmptyState";

/**
 * NotificationCenter — sino com badge de contagem (não-lidas) que abre um painel
 * (Popover) com o HISTÓRICO de notificações. Persistente e revisável.
 * -----------------------------------------------------------------------------
 * Diferença do Toast (composed/Toast.tsx):
 *   - Toast = transiente: aparece, anuncia, some sozinho. Sem histórico.
 *   - NotificationCenter = persistente: lista que fica, com estado lida/não-lida,
 *     "marcar como lida" individual e "marcar todas". É um centro de mensagens.
 *
 * Estado controlado pelo app (lista + callbacks) — o DS não guarda dados.
 * Acessível: gatilho rotulado com a contagem ("Notificações, N não lidas"),
 * painel é uma lista (<ul>/<li>); cada item tem ação de marcar como lida.
 */

export type NotificationType = "info" | "success" | "warning" | "error";

export type DnexNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  /** Momento do evento — usado para o "há X min" relativo. */
  date: Date;
  read?: boolean;
  /** Ação opcional (ex.: "Ver guia") renderizada no rodapé do item. */
  action?: ReactNode;
};

const typeMeta: Record<
  NotificationType,
  { icon: ReactNode; ring: string }
> = {
  info: {
    icon: <Info className="h-4 w-4" aria-hidden="true" />,
    ring: "text-[var(--tone-action-fg)] bg-[var(--tone-action-bg)]",
  },
  success: {
    icon: <Check className="h-4 w-4" aria-hidden="true" />,
    ring: "text-[var(--tone-success-fg)] bg-[var(--tone-success-bg)]",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
    ring: "text-[var(--tone-warning-fg)] bg-[var(--tone-warning-bg)]",
  },
  error: {
    icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
    ring: "text-[var(--tone-danger-fg)] bg-[var(--tone-danger-bg)]",
  },
};

function relativeTime(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationItem — uma linha do centro. Reutilizável fora do painel.
   ───────────────────────────────────────────────────────────────────────────── */
export type NotificationItemProps = {
  notification: DnexNotification;
  /** Marca esta notificação como lida. */
  onRead?: (id: string) => void;
  className?: string;
};

export const NotificationItem = forwardRef<HTMLLIElement, NotificationItemProps>(
  function NotificationItem({ notification, onRead, className }, ref) {
    const meta = typeMeta[notification.type];
    const unread = !notification.read;

    return (
      <li
        ref={ref}
        className={cn(
          "group relative flex gap-3 rounded-[10px] px-3 py-3 transition-colors",
          unread ? "bg-[var(--tone-action-bg)]" : "bg-transparent",
          "hover:bg-[var(--surface-hover)]",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-[9px]",
            meta.ring,
          )}
        >
          {meta.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-[0.88rem] leading-snug",
                unread ? "font-semibold text-fg" : "font-medium text-fg-muted",
              )}
            >
              {notification.title}
            </p>
            {unread && onRead && (
              <button
                type="button"
                aria-label={`Marcar "${notification.title}" como lida`}
                onClick={() => onRead?.(notification.id)}
                title="Marcar como lida"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[9px] text-fg-muted transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {notification.description && (
            <p className="mt-0.5 text-[0.82rem] leading-snug text-fg-muted">
              {notification.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <time
              dateTime={notification.date.toISOString()}
              className="font-mono text-[0.7rem] text-fg-subtle"
            >
              {relativeTime(notification.date)}
            </time>
            {notification.action}
          </div>
        </div>
      </li>
    );
  },
);

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationCenter — sino + badge + painel.
   ───────────────────────────────────────────────────────────────────────────── */
export type NotificationCenterProps = {
  notifications: DnexNotification[];
  onRead?: (id: string) => void;
  onReadAll?: () => void;
  /** Posicionamento do painel (Radix Popover). */
  align?: "start" | "center" | "end";
  /** Container do portal — útil para conter o painel num frame de device. */
  container?: HTMLElement | null;
  /** No mobile, apresenta as notificações em uma tela modal completa. */
  presentation?: "popover" | "screen";
  /** Abertura controlada opcional; omitir preserva o comportamento interno do Radix. */
  open?: boolean;
  /** Permite ao app fechar o painel antes de navegar a uma entidade. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** Rótulo acessível do gatilho. */
  label?: string;
};

export function NotificationCenter({
  notifications,
  onRead,
  onReadAll,
  align = "end",
  container,
  presentation = "popover",
  open,
  onOpenChange,
  className,
  label = "Notificações",
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const trigger = (
    <button
      type="button"
      aria-label={hasUnread ? `${label}, ${unreadCount} não lidas` : `${label}, nenhuma nova`}
      className={cn(
        "relative grid h-11 w-11 place-items-center rounded-[9px] border border-line bg-[var(--surface)] text-fg-muted outline-none transition-colors hover:border-line-strong hover:bg-[var(--surface-hover)] hover:text-[var(--tone-action-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
        className,
      )}
    >
      <Bell className="h-[18px] w-[18px]" />
      {hasUnread && (
        <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-[var(--radius-pill)] border-2 border-[var(--bg)] bg-accent px-1 font-mono text-[0.62rem] font-bold leading-none text-[var(--color-deep)]">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  const list = (
    <>
      {notifications.length === 0 ? (
        <EmptyState icon={<CircleAlert />} title="Tudo em dia" description="Sem notificações por aqui. Avisaremos quando algo precisar da sua atenção." className="px-6 py-10" />
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1.5">
          {notifications.map((n) => <NotificationItem key={n.id} notification={n} onRead={onRead} />)}
        </ul>
      )}
    </>
  );

  if (presentation === "screen") {
    return (
      <RDialog.Root open={open} onOpenChange={onOpenChange}>
        <RDialog.Trigger asChild>{trigger}</RDialog.Trigger>
        <RDialog.Portal container={container ?? undefined}>
          <RDialog.Overlay className={cn("z-[var(--z-overlay)] bg-[rgba(5,4,18,0.6)] backdrop-blur-sm", container ? "absolute inset-0" : "fixed inset-0")} />
          <RDialog.Content className={cn("z-[var(--z-modal)] flex flex-col bg-[var(--surface)] text-fg outline-none", container ? "absolute inset-0" : "fixed inset-0 h-[100dvh] w-screen")}>
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_44px] items-center gap-2 border-b border-line px-4 py-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <RDialog.Title className="font-display text-[1.05rem] font-semibold tracking-tight">Notificações</RDialog.Title>
                {hasUnread && <span className="rounded-[var(--radius-pill)] bg-[var(--tone-warning-bg)] px-1.5 py-0.5 font-mono text-[0.66rem] font-semibold text-[var(--tone-warning-fg)]">{unreadCount} nova{unreadCount > 1 ? "s" : ""}</span>}
              </div>
              <RDialog.Close aria-label="Fechar notificações" className="grid h-11 w-11 place-items-center rounded-[9px] text-fg-muted hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"><X className="h-5 w-5" aria-hidden="true" /></RDialog.Close>
              {hasUnread && onReadAll && <button type="button" onClick={onReadAll} className="col-span-2 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-[7px] px-2 py-1 text-[0.78rem] font-medium text-[var(--tone-action-fg)] hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"><CheckCheck className="h-4 w-4" aria-hidden="true" />Marcar todas como lidas</button>}
              <RDialog.Description className="sr-only">Histórico de eventos. Revise cada notificação, marque como lida ou abra o item relacionado.</RDialog.Description>
            </div>
            {list}
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent
        align={align}
        container={container}
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
        aria-label="Painel de notificações"
      >
        {/* cabeçalho do painel */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[0.95rem] font-semibold tracking-tight text-fg">
              Notificações
            </h2>
            {hasUnread && (
              <span className="rounded-[var(--radius-pill)] bg-[var(--tone-warning-bg)] px-1.5 py-0.5 font-mono text-[0.66rem] font-semibold text-[var(--tone-warning-fg)]">
                {unreadCount} nova{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {hasUnread && onReadAll && (
            <button
              type="button"
              onClick={() => onReadAll?.()}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-[7px] px-2 py-1 text-[0.78rem] font-medium text-[var(--tone-action-fg)] outline-none transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* lista (com scroll) ou estado vazio */}
        <div className="flex min-h-0 max-h-[min(24rem,60vh)] flex-col overflow-hidden">{list}</div>
      </PopoverContent>
    </Popover>
  );
}
