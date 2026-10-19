import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");

test("auth limita a viewport e mantém rolagem no conteúdo, não no documento", () => {
  const layout = source("layouts/AuthLayout.tsx");
  assert.match(layout, /grid-cols-\[minmax\(0,1fr\)\]/);
  assert.match(layout, /grid-rows-\[minmax\(0,1fr\)\]/);
  assert.match(layout, /h-\[100dvh\]/);
  assert.doesNotMatch(layout, /min-h-\[100dvh\]/);
  assert.equal((layout.match(/flex-1 flex-col items-center overflow-y-auto overscroll-y-contain/g) ?? []).length, 2);
  assert.equal((layout.match(/my-auto w-full min-w-0/g) ?? []).length, 2);
});

test("a marca não é duplicada automaticamente e rodapé é opt-in", () => {
  const layout = source("layouts/AuthLayout.tsx");
  assert.doesNotMatch(layout, /DEFAULT_DISCLAIMER|pessoas jurídicas distintas|DnexSymbol/);
  assert.equal((layout.match(/\(footerLinks \|\| disclaimer\) &&/g) ?? []).length, 2);
});

test("o campo compartilhado tem 16px e pode encolher sem autozoom ou largura intrínseca", () => {
  const input = source("components/primitives/Input.tsx");
  assert.match(input, /w-full min-w-0 max-w-full/);
  assert.match(input, /text-base/);
  assert.doesNotMatch(input, /text-\[0\.95rem\]/);
  assert.match(source("screens/auth/AuthCard.tsx"), /\[overflow-wrap:anywhere\]/);
});

test("preview usa componente real, container query e landmark section", () => {
  const layout = source("layouts/AuthLayout.tsx");
  assert.match(layout, /embedded \? "section" : "main"/);
  assert.match(layout, /@\[64rem\]\/dnex-auth:grid-cols/);
  for (const file of ["showcase/sectionsScreens.tsx", "showcase/sectionsScreens2.tsx"]) {
    const canvas = source(file);
    assert.match(canvas, /<AuthLayout/);
    assert.match(canvas, /embedded/);
    assert.doesNotMatch(canvas, /pessoas jurídicas distintas/);
  }
});
