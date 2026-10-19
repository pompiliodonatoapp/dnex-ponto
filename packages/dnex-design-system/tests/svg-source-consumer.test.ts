import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import ts from "typescript";

test("ProductGlyph source resolves SVG types without Vite ambient declarations", () => {
  const entry = fileURLToPath(new URL("../src/components/brand/ProductGlyph.tsx", import.meta.url));
  const program = ts.createProgram([entry], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    types: [],
    allowImportingTsExtensions: true,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: path => path,
    getNewLine: () => "\n",
  }));
  assert.ok(!program.getSourceFiles().some(file => file.fileName.endsWith("vite/client.d.ts")));
});
