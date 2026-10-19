/**
 * Helpers compartilhados por Combobox e MultiSelect.
 * Filtragem própria (sem cmdk): normaliza acentos e caixa para busca tolerante
 * em pt-BR ("sao" encontra "São", "icms" encontra "ICMS").
 */

export type ComboOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** Sempre visível na lista, mesmo com busca ativa (ex.: ação "+ Novo…"). */
  pinned?: boolean;
};

/** Remove acentos e baixa a caixa — base da comparação de busca. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Filtra opções por query normalizada (match em qualquer ponto do rótulo). */
export function filterOptions(
  options: ComboOption[],
  query: string,
): ComboOption[] {
  const q = normalize(query);
  if (!q) return options;
  // Opções `pinned` (ex.: ação "+ Novo…") ficam sempre na lista, mesmo filtrando.
  return options.filter((o) => o.pinned || normalize(o.label).includes(q));
}

/** Próximo índice navegável (pula desabilitados) numa direção (+1 / -1). */
export function nextEnabledIndex(
  options: ComboOption[],
  from: number,
  dir: 1 | -1,
): number {
  if (options.length === 0) return -1;
  let i = from;
  for (let step = 0; step < options.length; step++) {
    i = (i + dir + options.length) % options.length;
    if (!options[i]?.disabled) return i;
  }
  return -1;
}
