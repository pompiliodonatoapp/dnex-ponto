import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { appShell } from "../src/tokens/tokens.ts";

const source = (name: string) =>
  readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8");

test("geometria RC mantém menu 226/72, topbar 60/56 e controles de 44 px", () => {
  assert.equal(appShell.sidebar.width, 226);
  assert.equal(appShell.sidebar.collapsedWidth, 72);
  assert.equal(appShell.topbar.height, 60);
  assert.equal(appShell.topbar.mobileHeight, 56);
  assert.equal(appShell.topbar.controlSize, 44);
  assert.equal(appShell.topbar.searchHeight, 44);

  const css = source("styles/theme.css");
  assert.match(css, /--shell-sidebar-width:\s*14\.125rem;/);
  assert.match(css, /--shell-sidebar-collapsed-width:\s*4\.5rem;/);
  assert.match(css, /--shell-topbar-height:\s*3\.75rem;/);
  assert.match(css, /--shell-topbar-height-mobile:\s*3\.5rem;/);
  assert.match(css, /--shell-topbar-control-size:\s*2\.75rem;/);
  assert.match(css, /--shell-topbar-search-height:\s*2\.75rem;/);
});

test("vitrine consome os tokens e não soma padding vertical à topbar", () => {
  const css = source("styles/workbench.css");
  assert.match(css, /--wb-sidebar-width:\s*var\(--shell-sidebar-width\)/);
  assert.match(css, /data-sidebar-collapsed="true"[^}]*--wb-sidebar-width:\s*var\(--shell-sidebar-collapsed-width\)/);
  const topbar = css.match(/\.ds-wb-topbar\s*\{[^}]*\}/)?.[0] ?? "";
  assert.match(topbar, /height:\s*var\(--shell-topbar-height\)/);
  assert.match(topbar, /padding:\s*0 var\(--shell-topbar-padding-inline\)/);
  assert.match(css, /height:\s*var\(--shell-topbar-height-mobile\)/);
});

test("recolher preserva botão de reabrir e nomes acessíveis sem afetar drawer", () => {
  const shell = source("showcase/PreviewShell.tsx");
  assert.match(shell, /aria-expanded=\{!sidebarCollapsed\}/);
  assert.match(shell, /aria-controls=\{`\$\{scope\}-sidebar-pages`\}/);
  assert.match(shell, /Expandir menu do produto/);
  assert.match(shell, /Recolher menu do produto/);
  assert.match(shell, /aria-label=\{label\}/);
  assert.match(shell, /!mobile && \([\s\S]*?ds-wb-sidebar-toggle/);
  assert.match(shell, /sidebar\(true\)/);
  const css = source("styles/workbench.css");
  assert.match(css, /\.ds-wb-sidebar\[data-collapsed="true"\] :is\(/);
  const collapsedSelectors = css.match(/\.ds-wb-sidebar\[data-collapsed="true"\][^{]*\{[^}]*\}/g) ?? [];
  assert.ok(collapsedSelectors.length > 0);
  for (const rule of collapsedSelectors) {
    if (rule.includes("display: none")) assert.ok(!rule.includes("ds-wb-sidebar-toggle"));
    assert.ok(!rule.includes("ds-wb-drawer"));
  }
});
