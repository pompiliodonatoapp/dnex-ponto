import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, CommandGroup, CommandItem, CommandPalette, PageHeader, useCommandPalette } from "@dnex/ds";
import "@dnex/ds/styles";

function Fixture() {
  const enabled = !new URLSearchParams(location.search).has("disabled");
  const commands = useCommandPalette(false, { enabled });
  const [custom, setCustom] = useState(false);
  const [selected, setSelected] = useState("Nenhum");
  const [modal, setModal] = useState<"dialog" | "alertdialog" | null>(null);
  return <main style={{ margin: 16 }}>
    <h2>C6 — contratos do DS</h2>
    <section aria-label="Controles da fixture" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBlock: 16 }}>
      <Button onClick={() => commands.setOpen(true)}>Abrir padrão</Button>
      <Button onClick={() => setCustom(true)}>Abrir personalizada</Button>
      <Button onClick={() => setModal("dialog")}>Abrir diálogo externo</Button>
      <Button onClick={() => setModal("alertdialog")}>Abrir alerta externo</Button>
      <input aria-label="Editor input" />
      <textarea aria-label="Editor textarea" />
      <select aria-label="Editor select"><option>Opção</option></select>
      <div contentEditable suppressContentEditableWarning tabIndex={0} data-testid="contenteditable"><span data-testid="editable-child">Editor livre</span></div>
      <div role="textbox" tabIndex={0} aria-label="Editor textbox">Texto</div>
      <div role="combobox" tabIndex={0} aria-label="Editor combobox" aria-expanded="false">Opção</div>
    </section>
    <output data-testid="selecionado">{selected}</output>
    {modal && <div role={modal} aria-modal="true" aria-label="Tarefa externa" style={{ padding: 16, border: "1px solid" }}>
      <button onClick={() => setModal(null)}>Fechar tarefa externa</button>
    </div>}
    <CommandPalette open={commands.open} onOpenChange={commands.setOpen} label="Paleta padrão">
      <CommandGroup heading="Navegação">
        {["Entradas", "Apuração", "Certificados"].map(nome => <CommandItem key={nome} onSelect={() => { setSelected(nome); commands.setOpen(false); }}>{nome}</CommandItem>)}
      </CommandGroup>
    </CommandPalette>
    <CommandPalette open={custom} onOpenChange={setCustom} label="Paleta personalizada" inputLabel="Buscar telas fiscais">
      <CommandItem onSelect={() => setCustom(false)}>Outro destino</CommandItem>
    </CommandPalette>
    {(["plain", "bar", "detail"] as const).map((variant, index) => <section key={variant} data-testid={`header-${variant}`} style={{ marginBlock: 24, padding: 12, border: "1px solid" }}>
      <PageHeader variant={variant} align={index === 1 ? "center" : "start"}
        title="Conferência de documentos e responsabilidades fiscais da competência"
        eyebrow="Escrituração fiscal" description="Revise os documentos da empresa selecionada, preserve as escolhas e acompanhe as pendências antes de concluir esta etapa."
        leading={index !== 0 ? <span data-testid="leading" style={{ width: 44, height: 44, display: "inline-flex", flexShrink: 0 }}>NF-e</span> : undefined}
        actions={<><Button>Importar documentos</Button><Button variant="secondary">Conferir selecionadas (128)</Button><Button variant="ghost" leadingIcon={<span aria-hidden="true">↓</span>}>Exportar relatório completo da competência</Button><Button asChild variant="secondary"><a href="#relatorio">Consultar relatório detalhado de conferência</a></Button></>} />
    </section>)}
  </main>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
