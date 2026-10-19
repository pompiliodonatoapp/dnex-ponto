import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — concatena classes condicionais (clsx) e resolve conflitos de Tailwind
 * (tailwind-merge). Use em todos os componentes para permitir override via prop
 * `className` sem duplicar utilitários.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
