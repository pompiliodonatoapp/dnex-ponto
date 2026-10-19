import type { ReactNode } from "react";
import { Progress } from "../composed/Progress";

export type SidebarStatusProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  value: number;
};

/** Cartão de pulso operacional no rodapé da sidebar V1. */
export function SidebarStatus({ title, description, icon, value }: SidebarStatusProps) {
  return (
    <div className="rounded-[13px] border border-white/[0.08] bg-white/[0.035] p-[13px]">
      <div className="flex items-center gap-[7px] text-[0.6875rem] font-semibold text-[#e3e4fb]">
        {icon && <span className="text-amber-400 [&>svg]:h-[15px] [&>svg]:w-[15px]">{icon}</span>}
        {title}
      </div>
      <p className="my-[9px] text-[0.625rem] leading-[1.5] text-[#aeb1d4]">{description}</p>
      <Progress value={value} tone="warning" className="h-1.5 bg-white/10" aria-label={`${value}%`} />
    </div>
  );
}
