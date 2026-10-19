import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/composed/Spinner.tsx", import.meta.url), "utf8");

test("PageLoader tem fundo sólido sem transparência ou backdrop blur", () => {
  assert.match(source, /bg-\[var\(--bg\)\]/);
  assert.doesNotMatch(source, /color-mix|backdrop-blur/);
});

test("loader global escapa dos ancestrais animados, preservando preview contido", () => {
  assert.match(source, /createPortal\(layer, document.body\)/);
  assert.match(source, /if \(position === "absolute"\) return layer/);
  assert.match(source, /typeof document === "undefined" \? null/);
});

test("mantém semântica acessível e libera o bloqueio somente ao sair o último loader", () => {
  assert.match(source, /role="status"/);
  assert.match(source, /aria-label=\{label\}/);
  assert.match(source, /--pageLock.count === 0/);
  assert.match(source, /element.inert = wasInert/);
  assert.match(source, /body.style.overflow = overflow/);
});
