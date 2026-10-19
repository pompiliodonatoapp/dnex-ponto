import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as RTabs from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

/**
 * Tabs — navegação por abas acessível (Radix). Indicador ativo com pill tinted.
 * Composição: <Tabs><TabsList><TabsTrigger/></TabsList><TabsContent/></Tabs>
 */
export const Tabs = RTabs.Root;

export const TabsList = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RTabs.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <RTabs.List
      ref={ref}
      className={cn(
        "inline-flex items-center gap-[var(--selection-gap)] rounded-[var(--radius-control)] border border-line bg-[var(--surface)] p-[var(--selection-inset)]",
        className,
      )}
      {...props}
    />
  );
});

export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof RTabs.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <RTabs.Trigger
      ref={ref}
      className={cn(
        "inline-flex h-[var(--selection-height)] items-center justify-center rounded-[var(--selection-item-radius)] px-[var(--selection-padding-inline)] text-[length:var(--selection-font-size)] font-medium text-fg-muted outline-none transition-colors",
        "hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]",
        "data-[state=active]:bg-[var(--selection-active-background)] data-[state=active]:text-fg",
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RTabs.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <RTabs.Content
      ref={ref}
      className={cn("mt-4 outline-none", className)}
      {...props}
    />
  );
});
