import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../composed/DropdownMenu";
import { cn } from "../../lib/cn";

export type DnexApp = {
  id: string;
  name: string;
  description?: string;
  icon: ReactNode;
  /** Cor do tile (índigo por padrão). Use com parcimônia. */
  tone?: "indigo" | "amber";
  href?: string;
  /** App atual (destacado, não navegável). */
  current?: boolean;
};

export type AppLauncherProps = {
  apps: DnexApp[];
  onLaunch?: (id: string) => void;
  align?: "start" | "center" | "end";
  /** Nome acessível do controle canônico exibido na Topbar. */
  triggerLabel?: string;
  className?: string;
};

const toneTile: Record<NonNullable<DnexApp["tone"]>, string> = {
  indigo:
    "bg-[rgba(79,70,229,0.16)] text-indigo-300 group-hover:bg-[rgba(79,70,229,0.26)]",
  amber:
    "bg-[rgba(245,158,11,0.14)] text-amber-400 group-hover:bg-[rgba(245,158,11,0.24)]",
};

/**
 * AppLauncher — grid switcher dos apps do hub DNEX (DON Dashboard, DON
 * Documentação, Aurora…). Botão grid na Topbar abre um menu com tiles.
 */
export function AppLauncher({
  apps,
  onLaunch,
  align = "start",
  triggerLabel = "Abrir Hub DNEX",
  className,
}: AppLauncherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={triggerLabel}
        title={triggerLabel}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-[10px] text-fg-muted outline-none transition-colors",
          "hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
          className,
        )}
      >
        <LayoutGrid className="h-[18px] w-[18px]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="overflow-y-auto overscroll-contain"
        style={{
          width: "var(--shell-app-launcher-width, 18rem)",
          maxHeight:
            "var(--shell-app-launcher-max-height, min(42rem, calc(100dvh - 2rem)))",
        }}
      >
        <DropdownMenuLabel>Hub DNEX</DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1.5 p-1">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              aria-current={app.current ? "true" : undefined}
              onClick={() => onLaunch?.(app.id)}
              className={cn(
                "group flex flex-col gap-2 rounded-[12px] border border-line p-3 text-left outline-none transition-colors",
                "hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
                app.current && "border-[rgba(129,139,246,0.4)] bg-[rgba(79,70,229,0.08)]",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center overflow-hidden rounded-[10px] transition-colors [&>img]:h-9 [&>img]:w-9 [&>svg]:h-[18px] [&>svg]:w-[18px]",
                  toneTile[app.tone ?? "indigo"],
                )}
              >
                {app.icon}
              </span>
              <span className="block w-full truncate font-display text-[0.85rem] font-semibold text-fg">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
