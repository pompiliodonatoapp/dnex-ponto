import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { WorkspaceShell } from "@dnex/workspace-shell";

test("the package exports the complete CSS and declares its side effect", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.exports["./styles"], "./dist/workspace-shell.css");
  assert.ok(pkg.sideEffects.includes("**/*.css"));
  assert.ok(pkg.sideEffects.includes("./dist/index.js"), "The browser barrel must retain its CSS side effect");
  assert.equal(
    readFileSync(new URL("../dist/workspace-shell.css", import.meta.url), "utf8"),
    readFileSync(new URL("../src/workspace-shell.css", import.meta.url), "utf8"),
  );
});

test("native Node import renders legacy slots without a CSS loader", () => {
  const html = renderToString(createElement(WorkspaceShell, {
    products: [], sections: [], currentProductKey: "normas", productLabel: "DNEX Normas", pageLabel: "Biblioteca",
    sidebarHeader: createElement("button", null, "Contexto legado"),
    topbar: createElement("button", null, "Ações legadas"),
    children: "Conteúdo SSR",
  }));
  for (const label of ["Contexto legado", "Ações legadas", "Conteúdo SSR", "Biblioteca"]) assert.ok(html.includes(label));
});

test("new right slot takes precedence over legacy aliases", () => {
  const html = renderToString(createElement(WorkspaceShell, {
    products: [], sections: [], currentProductKey: "normas", productLabel: "DNEX Normas",
    topbar: "legacy-action", topbarActions: "reference-action", topbarRight: "preferred-action", children: null,
  }));
  assert.ok(html.includes("preferred-action"));
  assert.ok(!html.includes("legacy-action")); assert.ok(!html.includes("reference-action"));
});


test("local-view items render native buttons while URLs remain links in SSR", () => {
  const html = renderToString(createElement(WorkspaceShell, {
    products: [{ key: "hidden", label: "Produto oculto", href: "/hidden", visible: false }],
    sections: [{ key: "views", items: [
      { key: "local", label: "Visão local", kind: "action", onSelect: () => assert.fail("SSR must not run actions"), active: true },
      { key: "url", label: "Página real", href: "/real" },
    ] }], currentProductKey: "normas", productLabel: "DNEX Normas", children: null,
  }));
  assert.match(html, /<button[^>]*aria-label="Visão local"[^>]*type="button"/);
  assert.match(html, /<a[^>]*aria-label="Página real"[^>]*href="\/real"/);
  assert.doesNotMatch(html, /<a[^>]*aria-label="Visão local"/);
  assert.doesNotMatch(html, /Produto oculto/);
  // The closed mobile drawer is not rendered by Radix SSR; desktop and bottom bar each render the action.
  assert.equal((html.match(/type="button">[^<]*<span[^>]*>VL<\/span><span>Visão local<\/span>/g) ?? []).length, 1);
});


test("sidebar brand override preserves product context and legacy default", () => {
  const html = renderToString(createElement(WorkspaceShell, {
    products: [], sections: [], currentProductKey: "hub", productLabel: "DNEX Hub",
    sidebarBrand: createElement("strong", null, "Marca do Hub"), children: null,
  }));
  assert.match(html, /class="dnex-shell-context-brand"><strong>Marca do Hub<\/strong>/);
  assert.match(html, /class="dnex-shell-page-label">DNEX Hub<\/div>/);
});
