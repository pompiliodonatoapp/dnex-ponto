import { ProductGlyph } from "../components/brand/ProductGlyph";
import type { DnexProductKey } from "../components/brand/ProductGlyph";

const PRODUCTS: { key: DnexProductKey; label: string; type: "Produto" | "Plataforma" }[] = [
  { key: "aurora", label: "Aurora", type: "Produto" },
  { key: "contratos", label: "Contratos", type: "Produto" },
  { key: "normas", label: "Normas", type: "Produto" },
  { key: "processos", label: "Processos", type: "Produto" },
  { key: "crm", label: "CRM", type: "Produto" },
  { key: "marketing", label: "Marketing", type: "Produto" },
  { key: "portal-cliente", label: "Portal do Cliente", type: "Produto" },
  { key: "metas", label: "Metas", type: "Produto" },
  { key: "folha", label: "Folha", type: "Produto" },
  { key: "gestao", label: "Gestão", type: "Produto" },
  { key: "xml", label: "XML", type: "Produto" },
  { key: "nfe", label: "Notas Fiscais", type: "Produto" },
  { key: "juridico", label: "Jurídico", type: "Produto" },
  { key: "incorporadora", label: "Incorporadora", type: "Produto" },
  { key: "fiscal", label: "Fiscal", type: "Produto" },
  { key: "contabil", label: "Contábil", type: "Produto" },
  { key: "perdcomp", label: "PER/DCOMP", type: "Produto" },
  { key: "gestao-contador", label: "Gestão Contador", type: "Produto" },
  { key: "hub", label: "Hub", type: "Plataforma" },
  { key: "painel", label: "Painel", type: "Plataforma" },
  { key: "console", label: "Console", type: "Plataforma" },
];

export function ProductIdentitySection() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PRODUCTS.map((product) => (
          <article key={product.key} className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4">
            <ProductGlyph product={product.key} size={56} label={`Ícone DNEX ${product.label}`} />
            <strong className="mt-3 block font-display text-sm text-fg">DNEX {product.label}</strong>
            <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.1em] text-fg-subtle">{product.type}</span>
          </article>
        ))}
      </div>

      <div className="grid gap-3 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-5 text-sm text-fg-muted md:grid-cols-2">
        <p><strong className="text-fg">Use:</strong> launcher do Hub, sidebar recolhida, favicon/PWA e marca compacta de acesso.</p>
        <p><strong className="text-fg">Não use:</strong> como ícone de funcionalidade, decoração de card ou substituto do lockup horizontal em materiais institucionais.</p>
      </div>
    </div>
  );
}
