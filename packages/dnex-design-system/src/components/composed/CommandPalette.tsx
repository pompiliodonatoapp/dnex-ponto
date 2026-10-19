import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Command } from "cmdk";
import * as RDialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { cn } from "../../lib/cn";
import { Kbd } from "../primitives/Kbd";

/**
 * CommandPalette — paleta de comandos ⌘K estilo Linear.
 *
 * DECISÃO (cmdk vs. custom): usamos `cmdk` (peer React 18 || 19; v1.0.x) pela
 * filtragem/ranqueamento e navegação por teclado já resolvidos e acessíveis
 * (roles de combobox/listbox, aria-selected, setas/Enter/Home/End). Em vez do
 * `Command.Dialog` embutido, montamos o overlay sobre o **Radix Dialog do DS**
 * para herdar exatamente o mesmo overlay/blur, animação (.dnex-pop) e foco
 * preso dos demais overlays — controle total do tema DNEX, sem dois Dialogs
 * concorrendo. cmdk cuida da lista; o Dialog cuida da moldura.
 *
 * O atalho global ⌘K/Ctrl+K é registrado pelo hook `useCommandPalette` (abaixo)
 * ou pode-se controlar `open`/`onOpenChange` manualmente.
 */

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Placeholder do campo de busca. */
  placeholder?: string;
  /** Nome acessível do campo de busca, independente do título e placeholder. */
  inputLabel?: string;
  /** Texto exibido quando nada casa com a busca. */
  emptyMessage?: string;
  /** Rótulo acessível do diálogo. */
  label?: string;
  /** Nó-alvo do Portal — permite conter num frame (ex.: device). */
  container?: HTMLElement | null;
  children: ReactNode;
};

export function CommandPalette({
  open,
  onOpenChange,
  placeholder = "Buscar ou digitar um comando…",
  inputLabel = "Buscar comandos",
  emptyMessage = "Nada encontrado.",
  label = "Paleta de comandos",
  container,
  children,
}: CommandPaletteProps) {
  const focoAnterior = useRef<HTMLElement | null>(null);
  const conteudo = useRef<HTMLDivElement>(null);
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal container={container ?? undefined}>
        <RDialog.Overlay className="dnex-overlay fixed inset-0 z-[var(--z-overlay)] bg-[rgba(5,4,18,0.6)] backdrop-blur-sm" />
        <RDialog.Content
          ref={conteudo}
          aria-label={label}
          onOpenAutoFocus={() => {
            focoAnterior.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(evento) => {
            evento.preventDefault();
            // Não sobrescreve foco que a navegação/consumidor já moveu para outro controle.
            const atual = document.activeElement;
            if (atual !== document.body && atual !== focoAnterior.current && !conteudo.current?.contains(atual)) return;
            const anterior = focoAnterior.current;
            if (anterior?.isConnected && anterior !== document.body && anterior.getClientRects().length > 0
              && !anterior.closest('[hidden], [inert]') && !anterior.matches(':disabled')) anterior.focus({ preventScroll: true });
          }}
          className="dnex-pop fixed left-1/2 top-[12vh] z-[var(--z-modal)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-[var(--radius-hero)] border border-line bg-[var(--surface-2)] shadow-[var(--shadow-lg)] glass-edge outline-none"
        >
          {/* Título visualmente oculto — satisfaz a a11y do Dialog. */}
          <RDialog.Title className="sr-only">{label}</RDialog.Title>

          <Command
            label={inputLabel}
            loop
            className="flex max-h-[60vh] flex-col"
            // filtro padrão do cmdk (substring + ranqueamento) já é robusto;
            // mantemos shouldFilter implícito = true.
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-fg-subtle"
              />
              <Command.Input
                placeholder={placeholder}
                className="h-12 w-full bg-transparent text-[0.95rem] text-fg placeholder:text-fg-subtle outline-none"
              />
              <Kbd className="hidden sm:inline-flex">Esc</Kbd>
            </div>

            <Command.List className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="px-3 py-8 text-center text-[0.9rem] text-fg-muted">
                {emptyMessage}
              </Command.Empty>
              {children}
            </Command.List>
          </Command>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

/** Grupo de itens com cabeçalho (ex.: "Navegação", "Ações"). */
export function CommandGroup({
  heading,
  className,
  children,
}: {
  heading: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Command.Group
      heading={heading}
      className={cn(
        "overflow-hidden p-1",
        // estiliza o cabeçalho que o cmdk injeta
        "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
        "[&_[cmdk-group-heading]]:text-[0.68rem] [&_[cmdk-group-heading]]:font-semibold",
        "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em]",
        "[&_[cmdk-group-heading]]:text-fg-subtle",
        className,
      )}
    >
      {children}
    </Command.Group>
  );
}

export type CommandItemProps = {
  /** Valor único usado na filtragem/seleção. Default: o texto do label. */
  value?: string;
  /** Aliases extras de busca (ranqueiam o item). */
  keywords?: string[];
  /** Ícone à esquerda. */
  icon?: ReactNode;
  /** Atalho exibido à direita (string vira <Kbd>, ou nó livre). */
  shortcut?: ReactNode;
  /** Variante destrutiva (vermelho). */
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  children: ReactNode;
};

/** Item da paleta — ícone + label + atalho. Teclado/seleção via cmdk. */
export function CommandItem({
  value,
  keywords,
  icon,
  shortcut,
  destructive = false,
  disabled = false,
  onSelect,
  className,
  children,
}: CommandItemProps) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        "group flex cursor-pointer select-none items-center gap-3 rounded-[10px] px-3 py-2.5 text-[0.9rem] outline-none",
        "text-fg-muted",
        // estado ativo (cmdk seta data-selected pela navegação por teclado/mouse)
        "data-[selected=true]:bg-[var(--surface-hover)] data-[selected=true]:text-fg",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        destructive &&
          "text-[var(--color-danger)] data-[selected=true]:bg-[rgba(239,68,68,0.12)] data-[selected=true]:text-[var(--color-danger)]",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="grid h-4 w-4 shrink-0 place-items-center [&_svg]:h-4 [&_svg]:w-4"
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut != null &&
        (typeof shortcut === "string" ? (
          <Kbd className="shrink-0">{shortcut}</Kbd>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1">
            {shortcut}
          </span>
        ))}
    </Command.Item>
  );
}

/** Separador entre grupos. */
export function CommandSeparator({ className }: { className?: string }) {
  return (
    <Command.Separator className={cn("my-1 h-px bg-line", className)} />
  );
}

/**
 * Atalho global de abertura ⌘K/Ctrl+K. Respeita edição e diálogos já abertos;
 * Escape fecha pelo Dialog. `enabled` controla só o atalho: `setOpen` continua
 * disponível para abertura explícita pelo produto. Limpa o listener no unmount.
 */
export function useCommandPalette(initial = false, { enabled = true }: { enabled?: boolean } = {}) {
  const [open, setOpen] = useState<boolean>(initial);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!enabled || open || e.defaultPrevented || e.repeat || e.isComposing
        || e.altKey || e.shiftKey || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      const alvo = e.target instanceof Element ? e.target : null;
      if (alvo?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]')) return;
      const dialogoAberto = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open], [aria-modal="true"]')]
        .some((dialogo) => dialogo.getClientRects().length > 0 && !dialogo.closest('[hidden], [inert], [aria-hidden="true"]'));
      if (dialogoAberto) return;
      e.preventDefault();
      setOpen(true);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enabled, open]);

  return { open, setOpen };
}
