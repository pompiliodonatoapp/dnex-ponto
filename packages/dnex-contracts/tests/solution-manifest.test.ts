import assert from "node:assert/strict";
import test from "node:test";
import { parseSolutionManifest } from "../src/solution-manifest.ts";

const manifest = {
  contractVersion: "1.0",
  productKey: "perdcomp",
  displayName: "PER/DCOMP",
  navigationGroup: "fiscal_tributario",
  launchPath: "/perdcomp/visao",
  modules: [
    { key: "perdcomp.core", label: "PER/DCOMP", path: "/perdcomp/documentos", requiredEntitlement: "perdcomp.core", mobilePriority: 10 },
  ],
};

test("a manifest is versioned and consumable without tenant data", () => {
  assert.deepEqual(parseSolutionManifest(manifest), manifest);
});

test("a manifest rejects external paths and duplicate module routes", () => {
  assert.throws(() => parseSolutionManifest({ ...manifest, launchPath: "https://unsafe.example" }));
  assert.throws(() => parseSolutionManifest({ ...manifest, modules: [...manifest.modules, { ...manifest.modules[0], key: "perdcomp.other" }] }));
});
