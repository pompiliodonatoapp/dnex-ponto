import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const requireDemo = createRequire(new URL("../../../apps/demo/package.json", import.meta.url));
const { build } = await import(pathToFileURL(requireDemo.resolve("vite")).href);
const artifactRoot = fileURLToPath(new URL("../.artifacts/", import.meta.url));
const fixture = fileURLToPath(new URL("./consumer-build/", import.meta.url));
const base = "/shell-consumer/";

test("minified Vite consumer links shell CSS from the public browser entry", async () => {
  await mkdir(artifactRoot, { recursive: true });
  const output = await mkdtemp(resolve(artifactRoot, "consumer-build-"));
  try {
    const result = await build({
      configFile: false, envDir: false, root: fixture, base, logLevel: "error",
      // No source alias, optimizeDeps or treeshake override may mask public entry metadata.
      build: { outDir: output, emptyOutDir: true, minify: "esbuild", cssMinify: true, sourcemap: false },
    });
    const html = await readFile(resolve(output, "index.html"), "utf8");
    assert.match(html, /<script[^>]+type="module"[^>]+src=/, "The real consumer must emit its JavaScript entry");
    const links = [...html.matchAll(/<link\b[^>]*>/g)]
      .map(([tag]) => ({ rel: /\brel="([^"]+)"/.exec(tag)?.[1], href: /\bhref="([^"]+)"/.exec(tag)?.[1] }))
      .filter(link => link.rel?.split(/\s+/).includes("stylesheet"));
    assert(links.length > 0, "Production HTML must link a stylesheet, not merely emit an orphan asset");
    let linkedCss = "";
    for (const { href } of links) {
      assert(href?.startsWith(base), "Stylesheet must belong to the built consumer base");
      const target = resolve(output, href.slice(base.length));
      const path = relative(output, target);
      assert(!isAbsolute(path) && path !== ".." && !path.startsWith(".." + sep));
      linkedCss += await readFile(target, "utf8");
    }
    assert(/\.dnex-shell-root[,{]/.test(linkedCss), "Linked CSS must contain the shell layout, even after tree-shaking");
    assert(/\.dnex-shell-product-rail\{/.test(linkedCss), "Linked CSS must contain the desktop rail");
    assert(/\.dnex-shell-rail-scroll:disabled\{/.test(linkedCss), "Linked CSS must preserve conditional controls");
    assert(/@media[^{}]*max-width:\s*1100px/.test(linkedCss), "Linked CSS must contain the mobile breakpoint");
    assert(/\.dnex-shell-product-list,\.dnex-shell-context-scroll\{scrollbar-width:none\}/.test(linkedCss), "Production must preserve hidden sidebar gutters");
    assert(/::-webkit-scrollbar\{display:none\}/.test(linkedCss), "Production must preserve WebKit fallback");
    assert(/forced-colors:\s*active/.test(linkedCss), "Production must preserve forced-colors accessibility override");
    assert(result.output.some(item => item.type === "chunk" && item.isEntry), "Vite must build an executable consumer");
  } finally {
    const absolute = resolve(output);
    assert.equal(dirname(absolute), resolve(artifactRoot));
    assert(relative(artifactRoot, absolute).startsWith("consumer-build-"));
    await rm(absolute, { recursive: true, force: true });
  }
});
