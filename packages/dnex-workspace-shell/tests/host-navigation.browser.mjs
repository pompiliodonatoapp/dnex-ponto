import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { copyFile, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const requireDemo = createRequire(new URL("../../../apps/demo/package.json", import.meta.url));
const { build, preview } = await import(pathToFileURL(requireDemo.resolve("vite")).href);
const loaded = await import(process.env.DNEX_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.DNEX_PLAYWRIGHT_MODULE).href : "playwright");
const { chromium } = loaded.chromium ? loaded : loaded.default;
const artifacts = fileURLToPath(new URL("../.artifacts/", import.meta.url));
await mkdir(artifacts, { recursive: true });
const outDir = await mkdtemp(path.join(artifacts, "host-production-"));
await build({ configFile: false, envDir: false, root: fileURLToPath(new URL("./browser/", import.meta.url)),
  build: { outDir, emptyOutDir: true, minify: "esbuild", rollupOptions: { input: fileURLToPath(new URL("./browser/host.html", import.meta.url)) } },
});
await copyFile(path.join(outDir, "host.html"), path.join(outDir, "index.html"));
const server = await preview({ configFile: false, envDir: false, build: { outDir }, preview: { host: "127.0.0.1", port: 0 } });
const origin = "http://127.0.0.1:" + server.httpServer.address().port;
let browser;
const checks = []; const errors = []; const external = [];
try {
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await context.route("**/*", route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    external.push(route.request().url()); return route.abort();
  });
  const page = await context.newPage(); page.on("pageerror", error => errors.push(error.message));
  const open = async mode => {
    await page.goto(origin + "/host.html" + (mode ? "?mode=" + mode : ""));
    await page.getByRole("heading", { name: "Contrato do host" }).waitFor();
  };
  await open("guard");
  assert.equal(await page.locator(".dnex-shell-product-rail").evaluate(e => getComputedStyle(e).width), "72px");
  assert.equal(await page.locator(".dnex-shell-frame").evaluate(e => getComputedStyle(e).display), "flex");
  checks.push("production CSS present");
  const boot = await page.getByTestId("boot").textContent();
  const rail = page.getByRole("navigation", { name: "Aplicativos DNEX", exact: true });
  await rail.getByRole("link", { name: "DNEX Contratos", exact: true }).click();
  await page.getByRole("dialog", { name: "Confirmar saída" }).waitFor();
  assert.equal(await page.getByTestId("pending-key").textContent(), "contratos");
  assert.equal(await page.getByTestId("boot").textContent(), boot);
  assert.equal(await page.getByTestId("spa").textContent(), "0");
  await page.getByRole("button", { name: "Cancelar saída" }).click();
  assert.equal(await page.getByTestId("view").textContent(), "Inicial");
  checks.push("guard cancellation preserves page and document");
  await rail.getByRole("link", { name: "DNEX Contratos", exact: true }).focus(); await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Continuar saída" }).click();
  assert.equal(await page.getByTestId("view").textContent(), "contratos");
  checks.push("keyboard product activation reaches host");
  await rail.getByRole("link", { name: "DNEX Fiscal", exact: true }).click();
  assert.equal(await page.getByTestId("pending-key").textContent(), "fiscal");
  await page.getByRole("button", { name: "Cancelar saída" }).click();
  checks.push("external HTTP product intercepted without request");
  const sidebar = page.getByRole("navigation", { name: "Navegação de DNEX Normas", exact: true });
  const action = sidebar.getByRole("button", { name: "Visão local", exact: true });
  assert.equal(await action.getAttribute("href"), null); assert.equal(await action.getAttribute("type"), "button");
  await action.focus(); await page.keyboard.press("Enter"); await page.keyboard.press("Space");
  assert.equal(await page.getByTestId("local").textContent(), "2");
  assert.equal(await action.getAttribute("aria-current"), "page");
  assert.equal(await page.getByTestId("boot").textContent(), boot);
  checks.push("local action native Enter Space without URL");
  await sidebar.getByRole("link", { name: "Página real", exact: true }).click();
  assert.equal(await page.getByTestId("spa").textContent(), "1");
  assert.ok(page.url().endsWith("/real"));
  checks.push("real links preserve SPA adapter");
  assert.equal(await page.getByRole("link", { name: "Produto oculto" }).count(), 0);
  checks.push("hidden products absent desktop");

  await open("guard");
  const popupPromise = context.waitForEvent("page");
  await rail.getByRole("link", { name: "DNEX Contratos", exact: true }).click({ modifiers: ["Control"] });
  const popup = await popupPromise;
  await popup.waitForURL("**/other-product"); await popup.waitForLoadState();
  assert.ok(popup.url().endsWith("/other-product")); await popup.close();
  assert.equal(await page.getByRole("dialog", { name: "Confirmar saída" }).count(), 0);
  checks.push("modified product click remains native");

  await page.setViewportSize({ width: 375, height: 900 });
  const shortcuts = page.getByRole("navigation", { name: "Atalhos do módulo" });
  await shortcuts.getByRole("button", { name: "Visão local", exact: true }).focus(); await page.keyboard.press("Space");
  assert.equal(await page.getByTestId("local").textContent(), "1");
  assert.equal(await shortcuts.getByRole("button", { name: "Ação sem atalho" }).count(), 0);
  checks.push("mobile local action and mobile false");
  const menu = page.getByRole("button", { name: "Abrir navegação", exact: true });
  await menu.click();
  const drawer = page.getByRole("dialog", { name: "Navegação de DNEX Normas" });
  await drawer.waitFor();
  assert.equal(await drawer.getByRole("button", { name: "Trocar empresa" }).isVisible(), true);
  assert.equal(await drawer.getByRole("link", { name: "Produto oculto" }).count(), 0);
  await drawer.getByRole("button", { name: "Ação sem atalho", exact: true }).focus(); await page.keyboard.press("Enter");
  await drawer.waitFor({ state: "detached" });
  assert.equal(await page.getByTestId("local").textContent(), "2");
  checks.push("drawer local callback and shared header");
  await menu.click(); await drawer.waitFor();
  await drawer.getByRole("link", { name: "DNEX Contratos", exact: true }).click();
  await drawer.waitFor({ state: "detached" });
  await page.getByRole("dialog", { name: "Confirmar saída" }).waitFor();
  await page.getByRole("button", { name: "Cancelar saída" }).click();
  assert.equal(await page.getByTestId("local").textContent(), "2");
  checks.push("drawer product interception closes drawer without losing state");

  for (const mode of [undefined, "decline"]) {
    await page.setViewportSize({ width: 1440, height: 900 }); await open(mode);
    await rail.getByRole("link", { name: "DNEX Normas", exact: true }).click();
    assert.equal(await page.getByTestId("spa").textContent(), "1");
    checks.push("current product fallback " + (mode ?? "absent"));
    await open(mode); const previous = await page.getByTestId("boot").textContent();
    await rail.getByRole("link", { name: "DNEX Contratos", exact: true }).click();
    await page.waitForURL("**/other-product");
    // The static SPA fallback serves the same compiled fixture after a real document navigation.
    assert.notEqual(page.url(), origin + "/host.html");
    await page.getByRole("heading", { name: "Contrato do host" }).waitFor();
    assert.notEqual(await page.getByTestId("boot").textContent(), previous);
    checks.push("other product native fallback " + (mode ?? "absent"));
  }
  await open("persistent");
  const persistentSidebar = page.locator(".dnex-shell-context-sidebar");
  const originalSidebar = await persistentSidebar.elementHandle();
  const navigationId = await persistentSidebar.locator(".dnex-shell-context-scroll").getAttribute("id");
  await persistentSidebar.getByRole("button", { name: "Recolher menu do produto" }).click();
  const changeProduct = async name => {
    await rail.getByRole("link", { name, exact: true }).click();
    await page.getByRole("button", { name: "Continuar saída" }).click();
    assert.equal(await persistentSidebar.evaluate((element, original) => element === original, originalSidebar), true);
    assert.equal(await persistentSidebar.locator(".dnex-shell-context-scroll").getAttribute("id"), navigationId);
  };
  await changeProduct("DNEX Contratos");
  await persistentSidebar.getByRole("button", { name: "Recolher menu do produto" }).waitFor();
  await changeProduct("DNEX Normas");
  await persistentSidebar.getByRole("button", { name: "Expandir menu do produto" }).waitFor();
  await page.evaluate(() => { Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); }; });
  await changeProduct("DNEX Contratos");
  await persistentSidebar.getByRole("button", { name: "Recolher menu do produto" }).waitFor();
  checks.push("persistentSidebar DOM and navigation ID persist; collapse scoped by product; storage failure resets safely");
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  const result = { mode: "production", checks, passed: checks.length, errors, externalRequests: external.length };
  await writeFile(path.join(artifacts, "host-browser-results.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
} finally {
  await browser?.close(); await new Promise(resolve => server.httpServer.close(resolve));
}
