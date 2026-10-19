import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Run the real TSX implementation, substituting only Vite's SVG loader and CSS helper.
const componentPath = fileURLToPath(new URL("../src/components/brand/ProductGlyph.tsx", import.meta.url));
const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(readFileSync(componentPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const moduleExports: Record<string, unknown> = {};
runInNewContext(compiled, {
  exports: moduleExports,
  require: (id: string) => id.endsWith(".svg")
    ? resolve(dirname(componentPath), id)
    : id === "../../lib/cn"
      ? { cn: (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ") }
      : require(id),
});
const { DNEX_PRODUCT_KEYS, normalizeDnexProductKey, ProductGlyph } = moduleExports as typeof import("../src/components/brand/ProductGlyph.tsx");
const newKeys = ["gestao", "xml", "nfe", "juridico", "incorporadora", "marketing", "portal-cliente"];
const legacyHashes: Record<string, string> = {
  "dnex-aurora.svg": "6a30d224424a55b96d68fde971fbf2be05ac1f891719b6b4e4ca341151e20078",
  "dnex-console.svg": "aef9264d7ac688eed62faaa4b9ad00b3ee3ba9d9d469eeadccdca06de41d4d1d",
  "dnex-contabil.svg": "ebe2cdd3e9c561db67b03c459456164764c6240ee66c0b42180e7d93f78517b1",
  "dnex-contratos.svg": "8a3ca320771f90e0c4ea6d25ba33d649c6a089ecb1af2c8b1dd8235a72b8a5d2",
  "dnex-crm.svg": "0e62ea6d2a2a4e90b3dee5601357a7a72adf34292248ff636438604ec7c44f71",
  "dnex-fiscal.svg": "c8ef4f3685f1929377728f24e76670cfdb722fc23c3e4240febb78d5e7bb59ef",
  "dnex-folha.svg": "5660fba027c31a7f3fd9bf347abcd4433f56d4f58d69567f10fc5fcdb92eb525",
  "dnex-gestao-contador.svg": "46630ff0dbb6b82d1b4b83cbff1b3c0b43e4f90e430cbf817180aec0c11a67fd",
  "dnex-hub.svg": "60101967795d8c49d1cb165b070bcbcfbc3950830b0d905dee29c1cb50b0036c",
  "dnex-metas.svg": "8f7050c179eca8fbfbea73a25736d10eff40c3987cadb78d3ff784cca2a4774f",
  "dnex-normas.svg": "e8e5cfdfa199f39528a62a5071ab8a198e12a81f4b99714d1f9c5df9206908b9",
  "dnex-painel.svg": "fa406d303a863e5d9fe7121c2003f5be1e239c184cdb0669783c2e5a80dfdb3a",
  "dnex-perdcomp.svg": "89f4baa9aeaed43158bf196c83f30354356e75d8f45a7369e901716ad6f06df4",
  "dnex-processos.svg": "a860c84cfd32808c1520fd3e0fddc045b2ae5461d9d80a2e1f8374590140b247"
};

// Fixed hashes of all 14 SVGs from the reviewed base 54113b6. Expansion must not redraw existing brands.
test("21 canonical products have distinct real assets and appear once in the identity showcase", () => {
  const keys = [...DNEX_PRODUCT_KEYS] as string[];
  assert.equal(keys.length, 21);
  assert.equal(new Set(keys).size, 21);
  const sources = keys.map((key) => {
    assert.equal(normalizeDnexProductKey(key), key);
    const source = ProductGlyph({ product: key }).props.src as string;
    assert.match(readFileSync(source, "utf8"), /<svg\b/);
    return source;
  });
  assert.equal(new Set(sources).size, 21, "no canonical product may silently use the Hub fallback");
  const showcase = readFileSync(new URL("../src/showcase/ProductIdentitySection.tsx", import.meta.url), "utf8");
  const showcaseKeys = [...showcase.matchAll(/key: "([a-z-]+)"/g)].map((match) => match[1]);
  assert.deepEqual(showcaseKeys.sort(), keys.sort());
});

test("aliases retain legacy meanings and connect Hub product names to the new assets", () => {
  const cases = {
    gestao360: "hub", econte: "fiscal", juris: "normas",
    "notas-fiscais": "nfe", contador: "gestao-contador", "jurídico": "juridico",
    " DNEX_JURÍDICO ": "juridico", "DNEX NFe": "nfe", " DNEX XML ": "xml",
    "DNEX-Incorporadora": "incorporadora", desconhecido: "hub", "": "hub",
  };
  for (const [input, expected] of Object.entries(cases)) {
    assert.equal(normalizeDnexProductKey(input), expected, input);
    assert.equal(ProductGlyph({ product: input }).props.src, ProductGlyph({ product: expected }).props.src);
  }
  assert.notEqual(ProductGlyph({ product: "gestao" }).props.src, ProductGlyph({ product: "contador" }).props.src);
});

test("ProductGlyph preserves accessible labels, decorative semantics and compact dimensions", () => {
  const decorative = ProductGlyph({ product: "xml" }).props;
  assert.equal(decorative.alt, "");
  assert.equal(decorative["aria-hidden"], true);
  assert.equal(decorative.width, 40);
  for (const size of [24, 32, 56]) {
    const labeled = ProductGlyph({ product: "nfe", size, label: "Notas fiscais", alt: "Fallback" }).props;
    assert.equal(labeled.alt, "Notas fiscais");
    assert.equal(labeled["aria-hidden"], undefined);
    assert.equal(labeled.width, size);
    assert.equal(labeled.height, size);
    assert.equal(labeled.draggable, false);
  }
  assert.equal(ProductGlyph({ product: "juridico", alt: "Jurídico" }).props.alt, "Jurídico");
});

test("new SVGs remain native, self-contained and within the official visual family", () => {
  const palette = new Set(["#1E1B4B", "#C7CCFE", "#818BF6", "#4F46E5", "#F59E0B"]);
  for (const key of newKeys) {
    const svg = readFileSync(ProductGlyph({ product: key }).props.src, "utf8");
    assert.match(svg, /viewBox="0 0 128 128"/);
    assert.match(svg, /aria-labelledby="title desc"/);
    assert.match(svg, /<title id="title">Ícone DNEX [^<]+<\/title>/);
    assert.match(svg, /<desc id="desc">[^<]+<\/desc>/);
    assert.match(svg, /<rect width="128" height="128" rx="28" fill="#1E1B4B"\/>/);
    assert.doesNotMatch(svg, /<(?:image|script|foreignObject|text)\b|(?:href|onload|onclick)=|data:|url\(/i);
    for (const [color] of svg.matchAll(/#[0-9A-Fa-f]{6}/g)) assert.ok(palette.has(color), `${key}: ${color}`);
    assert.equal([...svg.matchAll(/#F59E0B/g)].length, 1, `${key}: one amber accent`);
    for (const [, width] of svg.matchAll(/stroke-width="([^"]+)"/g)) assert.ok(["7", "8"].includes(width));
  }
});

test("all existing product SVGs are byte-for-byte preserved", () => {
  for (const [filename, expected] of Object.entries(legacyHashes)) {
    const bytes = readFileSync(new URL(`../src/assets/products/${filename}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected, filename);
  }
});
