/* global document, KeyboardEvent, innerWidth */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

const requireDs = createRequire(new URL("../package.json", import.meta.url));
const { build, preview } = await import(pathToFileURL(requireDs.resolve("vite")).href);
const artifacts = await mkdtemp(path.join(tmpdir(), "dnex-c6-browser-"));
const outDir = path.join(artifacts, "production");
// Package exports deliberately resolve the built dist JS and public styles, never src.
await build({ configFile: false, envDir: false, root: fileURLToPath(new URL("./c6-fixture/", import.meta.url)),
  build: { outDir, emptyOutDir: true, minify: "esbuild" } });
let browser; let server;
const checks = []; const errors = []; const external = [];
try {
  server = await preview({ configFile: false, envDir: false, build: { outDir }, preview: { host: "127.0.0.1", port: 0 } });
  const origin = "http://127.0.0.1:" + server.httpServer.address().port;
  browser = await chromium.launch({ headless: true, executablePath: process.env.DNEX_CHROMIUM_EXECUTABLE || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: "reduce" });
  await context.route("**/*", route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    external.push(route.request().url()); return route.abort();
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  const open = async (suffix = "") => {
    await page.goto(origin + "/" + suffix);
    await page.getByRole("heading", { name: "C6 — contratos do DS" }).waitFor();
  };
  const palette = () => page.getByRole("dialog", { name: "Paleta padrão", exact: true });
  const close = async () => { await page.keyboard.press("Escape"); await page.getByRole("dialog").waitFor({ state: "detached" }); };
  const focused = async locator => {
    await page.waitForFunction(el => document.activeElement === el, await locator.elementHandle());
  };
  await open();
  const trigger = page.getByRole("button", { name: "Abrir padrão", exact: true });
  await trigger.focus(); await page.keyboard.press("Control+k"); await palette().waitFor();
  const input = page.getByRole("combobox", { name: "Buscar comandos", exact: true });
  await focused(input);
  const firstId = await input.getAttribute("id");
  const firstLabel = await input.getAttribute("aria-labelledby");
  assert.ok(firstId); assert.ok(firstLabel);
  assert.equal(await page.locator(`[id="${firstLabel}"]`).textContent(), "Buscar comandos");
  await page.keyboard.press("Control+k"); assert.equal(await palette().isVisible(), true);
  // cmdk also interprets Ctrl+K as previous item. Home gives the arrow check a known origin.
  await page.keyboard.press("Home");
  await page.waitForFunction(el => el.getAttribute("aria-selected") === "true",
    await page.getByRole("option", { name: "Entradas", exact: true }).elementHandle());
  await page.keyboard.press("ArrowDown");
  await page.waitForFunction(el => el.getAttribute("aria-selected") === "true",
    await page.getByRole("option", { name: "Apuração", exact: true }).elementHandle());
  await page.keyboard.press("Enter"); await palette().waitFor({ state: "detached" });
  assert.equal(await page.getByTestId("selecionado").textContent(), "Apuração");
  await focused(trigger);
  checks.push("default accessible input, keyboard navigation, single opening and restored focus");
  await page.keyboard.press("Meta+k"); await palette().waitFor();
  await input.fill("inexistente"); await page.getByText("Nada encontrado.", { exact: true }).waitFor();
  await close(); await focused(trigger);
  await trigger.click(); await palette().waitFor(); assert.equal(await input.inputValue(), ""); await close();
  checks.push("Meta shortcut, empty results, Escape and clean reopening");

  const customTrigger = page.getByRole("button", { name: "Abrir personalizada", exact: true });
  await customTrigger.click();
  const custom = page.getByRole("combobox", { name: "Buscar telas fiscais", exact: true });
  await custom.waitFor();
  assert.notEqual(await custom.getAttribute("id"), firstId);
  const customLabel = await custom.getAttribute("aria-labelledby");
  assert.ok(customLabel); assert.notEqual(customLabel, firstLabel);
  assert.equal(await page.locator(`[id="${customLabel}"]`).textContent(), "Buscar telas fiscais");
  await close(); await focused(customTrigger);
  checks.push("two instances keep distinct input and label IDs with custom accessible name");

  for (const locator of [page.getByLabel("Editor input"), page.getByLabel("Editor textarea"), page.getByLabel("Editor select"),
    page.getByTestId("contenteditable"), page.getByRole("textbox", { name: "Editor textbox" }), page.getByRole("combobox", { name: "Editor combobox" })]) {
    await locator.focus(); await page.keyboard.press("Control+k");
    assert.equal(await palette().count(), 0); await focused(locator);
  }
  await page.getByTestId("editable-child").dispatchEvent("keydown", { key: "k", ctrlKey: true, bubbles: true, cancelable: true });
  assert.equal(await palette().count(), 0);
  checks.push("native editable fields, contenteditable descendants and ARIA editors retain shortcuts");
  for (const event of [{ repeat: true }, { isComposing: true }, { altKey: true }, { shiftKey: true }, { prevented: true }]) {
    await trigger.focus();
    const cancelled = await trigger.evaluate((el, extra) => {
      const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true, cancelable: true, ...extra });
      if (extra.prevented) e.preventDefault();
      el.dispatchEvent(e); return e.defaultPrevented;
    }, event);
    assert.equal(cancelled, Boolean(event.prevented));
    assert.equal(await palette().count(), 0);
  }
  checks.push("repeat, composition, extra modifiers and prevented events ignored");
  for (const name of ["Abrir diálogo externo", "Abrir alerta externo"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("button", { name: "Fechar tarefa externa" }).focus();
    await page.keyboard.press("Control+k"); assert.equal(await palette().count(), 0);
    await page.getByRole("button", { name: "Fechar tarefa externa" }).click();
  }
  checks.push("dialog and alertdialog protect the current task");
  await open("?disabled"); await trigger.focus(); await page.keyboard.press("Control+k");
  assert.equal(await palette().count(), 0);
  await trigger.click(); await palette().waitFor(); await close();
  checks.push("enabled false disables only shortcut while controlled opening stays compatible");

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1200 }); await open();
    for (const variant of ["plain", "bar", "detail"]) {
      const header = page.getByTestId(`header-${variant}`);
      const issues = await header.evaluate(parent => {
        const box = parent.getBoundingClientRect(); const issues = [];
        const nodes = parent.querySelectorAll("h1, p, button, a, [data-testid=leading]");
        for (const el of nodes) {
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 || rect.left < box.left - 1 || rect.right > box.right + 1 || rect.right > innerWidth + 1) issues.push("bounds: " + el.textContent);
          if (el.scrollWidth > el.clientWidth + 1) issues.push(`clipped (${el.scrollWidth}/${el.clientWidth}px): ${el.textContent}`);
          if (["BUTTON", "A"].includes(el.tagName) && el.scrollHeight > el.clientHeight + 1) issues.push("height: " + el.textContent);
          if (["H1", "P", "BUTTON", "A"].includes(el.tagName)) {
            const range = document.createRange(); range.selectNodeContents(el);
            for (const r of range.getClientRects()) {
              if (r.left < box.left - 1 || r.right > box.right + 1) issues.push("text: " + el.textContent);
              if (["BUTTON", "A"].includes(el.tagName) && (r.top < rect.top - 1 || r.bottom > rect.bottom + 1)) issues.push("text height: " + el.textContent);
            }
          }
        }
        return issues;
      });
      assert.deepEqual(issues, [], `${variant} at ${width}px`);
      for (const button of await header.getByRole("button").all()) assert.equal(await button.isVisible(), true);
      const heading = await header.getByRole("heading", { level: 1 }).boundingBox();
      const actions = await header.getByRole("button").first().boundingBox();
      if (width < 640) assert.ok(actions.y >= heading.y + heading.height, "mobile actions must follow heading");
      else assert.ok(heading.width >= 240, "desktop title must remain readable beside long actions");
    }
    await page.screenshot({ path: path.join(artifacts, `headers-${width}.png`), fullPage: true });
    checks.push(`PageHeader plain/bar/leading at ${width}px within parent margins; text and actions unclipped`);
  }
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  const result = { mode: "production", checks, passed: checks.length, errors, externalRequests: external.length, artifacts };
  await writeFile(path.join(artifacts, "results.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
} catch (error) {
  // Anota o diagnóstico no check da CI mesmo quando o download dos logs está indisponível.
  if (process.env.GITHUB_ACTIONS === "true") {
    const diagnostic = `C6 (${checks.length} grupos concluídos): ${error instanceof Error ? error.stack : String(error)}`;
    console.error(`::error::${diagnostic.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A")}`);
  }
  throw error;
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
}
