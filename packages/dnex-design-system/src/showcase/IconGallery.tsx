import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../components/primitives/Input";
import { iconGroups } from "./iconCatalog";

/**
 * IconGallery — grade dos ícones lucide curados do ecossistema, agrupados, com
 * busca por nome. Mostra a diretriz oficial: lucide-react, 16/20/24, stroke ~2,
 * herda currentColor. Vive na showcase (não é um componente do DS exportado).
 */
export function IconGallery() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!q) return iconGroups;
    return iconGroups
      .map((g) => ({
        ...g,
        icons: g.icons.filter((i) => i.name.toLowerCase().includes(q)),
      }))
      .filter((g) => g.icons.length > 0);
  }, [q]);

  const total = groups.reduce((n, g) => n + g.icons.length, 0);

  return (
    <div className="grid gap-6">
      {/* diretriz + busca */}
      <div className="rounded-[var(--radius-card)] glass glass-edge p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[0.88rem] leading-relaxed text-fg-muted">
            <strong className="font-semibold text-fg">lucide-react</strong> é a
            biblioteca oficial de ícones do DS. Tamanhos canônicos{" "}
            <span className="font-mono text-fg">16 / 20 / 24</span>, stroke{" "}
            <span className="font-mono text-fg">~2</span>, cor herda{" "}
            <span className="font-mono text-fg">currentColor</span> (tinge via{" "}
            <span className="font-mono text-fg">text-*</span> do tema).
          </p>
          <div className="w-full sm:w-64">
            <Input
              leadingIcon={<Search />}
              placeholder="Buscar ícone…"
              aria-label="Buscar ícone por nome"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 font-mono text-[0.72rem] text-fg-subtle">
          {total} ícone{total === 1 ? "" : "s"}
          {q && " correspondem à busca"}
        </p>
      </div>

      {/* grupos */}
      {groups.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] px-6 py-10 text-center">
          <p className="text-[0.9rem] text-fg-muted">
            Nenhum ícone com “{query}”. Tente outro termo — ou busque na lib
            oficial.
          </p>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.id}>
            <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-fg-subtle">
              {g.label}
            </h3>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {g.icons.map(({ name, Icon }) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4 text-center transition-colors hover:border-line-strong hover:text-[var(--tone-action-fg)]"
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className="w-full truncate font-mono text-[0.7rem] text-fg-subtle">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
