/**
 * Disponibilidade de lançamento de um produto no App Shell.
 *
 * Este estado é visual e de interação: a autorização, o tenant e o handoff
 * continuam sendo decididos pelo control plane. Um item que ainda não está
 * pronto não pode virar um atalho otimista no cliente.
 */
export type GlobalRailAvailability = "ready" | "provisioning" | "unavailable";

export type GlobalRailAvailabilityItem = {
  label: string;
  /** `ready` mantém compatibilidade com consumidores do rail anteriores ao contrato 1.2 RC. */
  availability?: GlobalRailAvailability;
  /** Explicação humana exibida para estados sem lançamento. */
  description?: string;
};

const availabilityCopy: Record<
  GlobalRailAvailability,
  { label: string; description: (product: string) => string }
> = {
  ready: {
    label: "Disponível",
    description: (product) => `DNEX ${product} está disponível para abrir.`,
  },
  provisioning: {
    label: "Preparando acesso",
    description: (product) =>
      `O acesso ao DNEX ${product} está sendo preparado. Tente novamente em breve.`,
  },
  unavailable: {
    label: "Indisponível",
    description: (product) =>
      `DNEX ${product} não está disponível para esta organização neste momento.`,
  },
};

export function getGlobalRailAvailability(
  item: GlobalRailAvailabilityItem,
): GlobalRailAvailability {
  return item.availability === undefined || item.availability === "ready"
    ? "ready"
    : item.availability === "provisioning"
      ? "provisioning"
      : "unavailable";
}

export function isGlobalRailActionable(
  item: GlobalRailAvailabilityItem,
): boolean {
  return getGlobalRailAvailability(item) === "ready";
}

export function getGlobalRailAvailabilityLabel(
  item: GlobalRailAvailabilityItem,
): string {
  return availabilityCopy[getGlobalRailAvailability(item)].label;
}

export function getGlobalRailDescription(
  item: GlobalRailAvailabilityItem,
): string {
  return (
    item.description ??
    availabilityCopy[getGlobalRailAvailability(item)].description(item.label)
  );
}
