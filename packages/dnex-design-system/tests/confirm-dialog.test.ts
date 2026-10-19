import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
test("Dialog e ConfirmDialog compartilham superfície sólida e véu sem blur", () => {
  for (const file of ["ConfirmDialog", "Dialog"]) {
    const code = source(`components/composed/${file}.tsx`);
    assert.match(code, /dnex-dialog-panel/);
    assert.match(code, /dnex-dialog-backdrop/);
    assert.doesNotMatch(code, /glass|backdrop-blur|bg-white|text-slate-/);
  }
  const css = source("styles/theme.css");
  assert.match(css, /background: var\(--dialog-surface\)/);
  assert.match(css, /max-height: calc\(100dvh - 2rem\)/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(css, /\.dnex-confirm-footer \{ flex-direction: column/);
});
test("confirmação identifica o registro e começa na ação segura", () => {
  const code = source("components/composed/ConfirmDialog.tsx");
  assert.match(code, /subject\?: string/);
  assert.match(code, /subjectLabel\?: string/);
  assert.match(code, /role="alertdialog"/);
  assert.match(code, /cancelRef\.current\?\.focus\(\)/);
  assert.match(code, /returnFocusRef\.current\.focus\(\)/);
  assert.match(code, /onEscapeKeyDown=\{\(e\) => loading && e.preventDefault\(\)\}/);
  assert.match(code, /onInteractOutside=\{\(e\) => loading && e.preventDefault\(\)\}/);
  assert.match(code, /danger-action-fg/);
});
test("a vitrine ilustra a confirmação sem executar exclusões reais", () => {
  const code = source("showcase/sectionsC5.tsx");
  assert.match(code, /subject="EMPRESA EXEMPLO LTDA\."/);
  assert.match(code, /Exclusão simulada/);
  assert.match(code, /Nenhum dado real foi alterado/);
});
