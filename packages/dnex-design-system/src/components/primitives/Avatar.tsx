import * as RAvatar from "@radix-ui/react-avatar";
import { cn } from "../../lib/cn";

export type AvatarProps = {
  src?: string;
  alt?: string;
  /** Iniciais exibidas no fallback (ex.: "DP"). */
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-[0.7rem]",
  md: "h-10 w-10 text-[0.85rem]",
  lg: "h-14 w-14 text-base",
};

/**
 * Avatar — imagem de perfil com fallback de iniciais (Radix).
 * Fallback usa o gradiente índigo canônico da V1.
 */
export function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  return (
    <RAvatar.Root
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-[9px] border-2 border-[color-mix(in_srgb,var(--surface)_82%,transparent)]",
        sizes[size],
        className,
      )}
    >
      {src && (
        <RAvatar.Image
          src={src}
          alt={alt ?? fallback}
          className="h-full w-full object-cover"
        />
      )}
      <RAvatar.Fallback
        delayMs={src ? 300 : 0}
        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-400 font-mono font-bold text-fg-on-action"
      >
        {fallback}
      </RAvatar.Fallback>
    </RAvatar.Root>
  );
}
