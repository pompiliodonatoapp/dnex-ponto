/**
 * Item do payload do Recharts (subconjunto que usamos). Tipado localmente para
 * NÃO depender de caminhos internos profundos do recharts (que mudam entre
 * versões e quebram o typecheck).
 */
type TooltipEntry = {
  value?: number | string;
  name?: string | number;
  color?: string;
};

export type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  valueFormatter?: (v: number, name?: string) => string;
};

/**
 * Tooltip custom na cara DNEX — superfície elevada (glass-like), número em
 * IBM Plex Mono, marcador da cor da série. Reage ao tema via CSS vars
 * semânticas (--surface-2, --fg…), então funciona em dark e light sem prop.
 *
 * `valueFormatter` permite formatar moeda/percentual; default = toLocaleString.
 * O Recharts passa `active`/`payload`/`label` em runtime — aceitos como
 * opcionais aqui.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-[var(--radius-control)] border border-[var(--line-strong)] bg-[var(--surface-2)] px-3 py-2 shadow-[var(--shadow-lg)]"
      role="tooltip"
    >
      {label != null && (
        <p className="mb-1.5 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
          {String(label)}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => {
          const raw = typeof entry.value === "number" ? entry.value : Number(entry.value);
          const text = valueFormatter
            ? valueFormatter(raw, String(entry.name ?? ""))
            : raw.toLocaleString("pt-BR");
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ background: entry.color ?? "var(--action)" }}
              />
              {entry.name != null && (
                <span className="text-[0.78rem] text-[var(--fg-muted)]">
                  {String(entry.name)}
                </span>
              )}
              <span className="ml-auto pl-3 font-mono text-[0.82rem] font-semibold text-[var(--fg)]">
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
