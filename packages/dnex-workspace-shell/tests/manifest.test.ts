import assert from "node:assert/strict";
import test from "node:test";
import { activeNavigationKey, visibleShellGlobalNavigation, visibleShellProducts } from "../src/manifest.ts";

test("the shell only renders products pre-authorized by the control plane", () => {
  assert.deepEqual(visibleShellProducts([
    { key: "fiscal", label: "Fiscal", href: "/fiscal", visible: true },
    { key: "perdcomp", label: "PER/DCOMP", href: "/perdcomp", visible: false },
  ]).map((product) => product.key), ["fiscal"]);
});

test("the contextual navigation exposes at most one active location", () => {
  assert.equal(activeNavigationKey([{ key: "main", items: [
    { key: "overview", label: "Visão", href: "/visao", active: true },
    { key: "documents", label: "Documentos", href: "/documentos" },
  ] }]), "overview");
});

test("the rail only receives authorized global settings", () => {
  assert.deepEqual(visibleShellGlobalNavigation([
    { key: "settings", label: "Configurações e pessoas", href: "/configuracoes", visible: true },
    { key: "billing", label: "Faturamento", href: "/faturamento", visible: false },
  ]).map((item) => item.key), ["settings"]);
});
