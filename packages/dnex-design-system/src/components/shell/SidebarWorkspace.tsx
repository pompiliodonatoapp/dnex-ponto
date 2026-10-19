import { ChevronDown } from "lucide-react";

export type SidebarWorkspaceProps = {
  name: string;
  label?: string;
  initials?: string;
  onClick?: () => void;
  disabled?: boolean;
};

/** Seletor visual do workspace no shell índigo V1. */
export function SidebarWorkspace({ name, label = "Workspace", initials = "DN", onClick, disabled }: SidebarWorkspaceProps) {
  const conteudo = (
    <>
      <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-gradient-to-br from-white to-indigo-200 font-display text-xs font-extrabold text-indigo-950">
        {initials}
      </span>
      <span className="flex min-w-0 flex-col">
        <small className="text-[0.5625rem] font-semibold uppercase tracking-[0.15em] text-[#9da1cf]">{label}</small>
        <strong className="mt-[3px] truncate text-xs">{name}</strong>
      </span>
      <ChevronDown className="h-4 w-4 text-[#9da1cf]" aria-hidden="true" />
    </>
  );
  // SEM contorno branco: o pedido do dono (25/08/2026) era tirar A LINHA do retângulo, não o
  // seletor. A distinção importa porque a leitura errada desse mesmo pedido apagou o seletor
  // inteiro da produção da Drogaria Siloé. O retângulo continua existindo pelo fundo translúcido
  // (`bg-white/[0.045]`) e pelo canto arredondado — o que sai é só o traço.
  const classe = "mb-2 grid w-full grid-cols-[34px_1fr_16px] items-center gap-[9px] rounded-xl bg-white/[0.045] p-2.5 text-left text-white";
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`Trocar cliente. Cliente atual: ${name}`}
        className={`${classe} outline-none transition-colors hover:bg-white/[0.085] focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {conteudo}
      </button>
    );
  }
  return <div className={classe}>{conteudo}</div>;
}
