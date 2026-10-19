import { Laptop, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useTheme } from "../../lib/theme";
import type { Theme } from "../../lib/theme";
import { cn } from "../../lib/cn";

/**
 * ThemeSwitcher — alternador de tema OFICIAL do DS (claro / escuro / sistema).
 *
 * Promovido do ThemeToggle do showcase. Persistência fica no ThemeProvider
 * (localStorage); aqui é só o controle. Implementado como `radiogroup`
 * acessível: setas/Tab navegam, `aria-checked` reflete a preferência, foco
 * visível herdado do DS. Reage ao tema via tokens.
 *
 * Variantes:
 *  - `variant="segmented"` (default): três pílulas lado a lado (claro/escuro/sistema).
 *  - `variant="icon"`: um único botão que cicla claro → escuro → sistema (compacto
 *    p/ topbars apertadas).
 *
 * Use `showSystem={false}` p/ esconder a opção "sistema" (apenas claro↔escuro).
 */

export type ThemeSwitcherProps = {
  variant?: "segmented" | "icon";
  /** Mostra a opção "Sistema" (segue o SO). Default: true. */
  showSystem?: boolean;
  /** Mostra os rótulos de texto nas pílulas (segmented). Default: false (só ícone). */
  showLabels?: boolean;
  className?: string;
};

type Opt = { value: Theme; icon: ReactNode; label: string };

const allOptions: Opt[] = [
  { value: "light", icon: <Sun className="h-4 w-4" />, label: "Claro" },
  { value: "dark", icon: <Moon className="h-4 w-4" />, label: "Escuro" },
  { value: "system", icon: <Laptop className="h-4 w-4" />, label: "Sistema" },
];

export function ThemeSwitcher({
  variant = "segmented",
  showSystem = true,
  showLabels = false,
  className,
}: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const options = showSystem
    ? allOptions
    : allOptions.filter((o) => o.value !== "system");

  // ---- Variante ícone: um botão que cicla pelas opções ----
  if (variant === "icon") {
    const order = options.map((o) => o.value);
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length]!;
    // o ícone mostrado é o do tema EFETIVO quando em "system", senão o da preferência
    const shown =
      theme === "system"
        ? allOptions.find((o) => o.value === "system")!
        : allOptions.find((o) => o.value === resolvedTheme)!;
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={`Tema: ${shown.label}. Trocar para ${
          allOptions.find((o) => o.value === next)!.label
        }`}
        title={`Tema: ${shown.label}`}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-line bg-[var(--surface)] text-fg-muted outline-none transition-colors",
          "hover:bg-[var(--surface-hover)] hover:text-fg",
          "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
          className,
        )}
      >
        {shown.icon}
      </button>
    );
  }

  // ---- Variante segmented (default) ----
  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-control)] border border-line bg-[var(--surface)] p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-[0.82rem] font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
              active
                ? "bg-[rgba(79,70,229,0.18)] text-fg"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {opt.icon}
            {showLabels && <span className="hidden sm:inline">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
