import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/layouts/AppLayout.tsx", import.meta.url), "utf8");

test("barra inferior pode encolher rótulos longos sem empurrar atalhos para fora", () => {
  const navigation = source.slice(source.indexOf('aria-label="Navegação principal (barra inferior)"'));

  assert.match(navigation, /data-bottom-nav-item=\{item\.id\}/);
  assert.match(navigation, /flex min-w-0 flex-1 flex-col/);
  assert.match(navigation, /block min-w-0 max-w-full truncate px-1/);
  assert.match(navigation, /data-bottom-nav-item="more"/);
});
