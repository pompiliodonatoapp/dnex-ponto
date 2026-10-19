import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { ConfirmDialog, ConfirmProvider, useConfirm } from "../../src/components/composed/ConfirmDialog";
import { Dialog, DialogContent, DialogTrigger } from "../../src/components/composed/Dialog";
import { Button } from "../../src/components/primitives/Button";
import "../../src/styles/theme.css";

// Isolated UI fixture. No API, authentication or tenant records.
declare global { interface Window { confirmQA: { release: () => void } } }
const params = new URLSearchParams(location.search);
document.documentElement.dataset.theme = params.get("theme") ?? "light";
function Imperative() {
  const confirm = useConfirm();
  const [result, setResult] = useState("Aguardando");
  return <>
    <Button id="imperative" variant="secondary" onClick={async () => setResult(String(await confirm({ title: "Continuar?" })))}>Confirmação simples</Button>
    <output id="result">{result}</output>
  </>;
}
function Fixture() {
  const [open, setOpen] = useState(params.has("open"));
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(0);
  const [canceled, setCanceled] = useState(0);
  window.confirmQA = { release: () => { setLoading(false); setOpen(false); } };
  return <main style={{ padding: "clamp(20px, 5vw, 64px)", minHeight: "100dvh", background: "var(--bg)", color: "var(--fg)" }}>
    <header style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <strong style={{ fontFamily: "var(--font-display)" }}>DNEX Contratos</strong><span>Prévia do Design System · 1.2 RC</span>
    </header>
    <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600 }}>Clientes</h1>
    <p style={{ color: "var(--fg-muted)", marginBlock: 16 }}>Demonstração de interface. Nenhum dado real é alterado.</p>
    <section style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 24, background: "var(--surface)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
      <span style={{ flex: 1, minWidth: 180 }}>EMPRESA EXEMPLO LTDA.</span>
      <Button id="trigger" variant="secondary" onClick={() => setOpen(true)}>Excluir com confirmação</Button>
    </section>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginTop: 32 }}>
      <ConfirmProvider><Imperative /></ConfirmProvider>
      <Dialog><DialogTrigger asChild><Button variant="secondary">Abrir modal padrão</Button></DialogTrigger>
        <DialogContent title="Detalhes do cliente" description="O mesmo padrão visual, nos dois temas.">
          <label>Nome <input aria-label="Nome" style={{ maxWidth: "100%", border: "1px solid var(--line)", borderRadius: 8, padding: 12 }} /></label>
        </DialogContent>
      </Dialog>
    </div>
    <output id="counts" data-confirmed={confirmed} data-canceled={canceled} style={{ display: "block", marginTop: 32 }}>Confirmações simuladas: {confirmed} · Cancelamentos: {canceled}</output>
    <ConfirmDialog open={open} onOpenChange={setOpen} tone="danger" title="Excluir cliente?"
      subject={params.has("long") ? "EMPRESA DE TECNOLOGIA E SERVIÇOS " + "NOMESEMESPACO".repeat(16) + " LTDA." : "EMPRESA EXEMPLO LTDA."}
      subjectLabel="Cliente selecionado"
      description="O cliente será removido da carteira ativa. A exclusão será bloqueada se houver contratos ou propostas vinculados."
      confirmLabel="Excluir cliente" loading={loading} onCancel={() => setCanceled((n) => n + 1)}
      onConfirm={() => { setConfirmed((n) => n + 1); setLoading(true); }} />
  </main>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><Fixture /></StrictMode>);
