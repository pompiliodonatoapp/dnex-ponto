import { LogOut } from "lucide-react";
import { Avatar } from "../primitives/Avatar";
import { Button } from "../primitives/Button";

export type SidebarAccountProps = {
  name: string;
  role: string;
  initials: string;
  profileHref?: string;
  onLogout?: () => void;
};

/** Identidade do operador e saída no rodapé da sidebar V1. */
export function SidebarAccount({ name, role, initials, profileHref, onLogout }: SidebarAccountProps) {
  const identity = (
    <>
      <Avatar fallback={initials} size="sm" className="border-white/20" />
      <span className="flex min-w-0 flex-col">
        <strong className="truncate text-[0.6875rem]">{name}</strong>
        <small className="mt-[3px] truncate text-[0.5625rem] text-[#9da1cf]">{role}</small>
      </span>
    </>
  );

  return (
    <div className="mt-2.5 grid grid-cols-[34px_1fr_34px] items-center gap-[9px] px-2 pt-1 text-white">
      {profileHref ? (
        <a
          className="col-span-2 grid min-w-0 grid-cols-[34px_1fr] items-center gap-[9px] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          href={profileHref}
          aria-label="Abrir meu perfil no Hub DNEX"
        >
          {identity}
        </a>
      ) : identity}
      {onLogout && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#9da1cf] hover:bg-white/10 hover:text-white"
          onClick={onLogout}
          title="Sair"
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
