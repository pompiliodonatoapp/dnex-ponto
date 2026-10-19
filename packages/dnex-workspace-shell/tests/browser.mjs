import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const requireDemo = createRequire(new URL("../../../apps/demo/package.json", import.meta.url));
const { createServer } = await import(pathToFileURL(requireDemo.resolve("vite")).href);
const browserModule = process.env.DNEX_PLAYWRIGHT_MODULE;
const { chromium } = await import(browserModule ? pathToFileURL(browserModule).href : "playwright");
const server = await createServer({
  configFile: false, root: fileURLToPath(new URL("./browser/", import.meta.url)),
  server: { host: "127.0.0.1", port: 0, fs: { allow: [fileURLToPath(new URL("../../../", import.meta.url))] } },
});
await server.listen();
const port = server.httpServer.address().port;
const origin = "http://127.0.0.1:" + port;
let browser; try { browser = await chromium.launch({ headless: true }); } catch (error) { await server.close(); throw error; }
const errors = [];
let checks = 0;
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  for (const theme of ["light", "dark"]) {
    for (const legacy of [false, true]) {
      await page.goto(origin + (legacy ? "/?legacy=1" : "/"));
      await page.getByRole("heading", { name: "Biblioteca de teste" }).waitFor();
      await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), theme);
      for (const width of [320, 375, 700, 768, 1023, 1024, 1100, 1101, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const geometry = await page.evaluate(() => {
          const rect = selector => {
            const e = document.querySelector(selector); const r = e.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, visible: e.getClientRects().length > 0 };
          };
          return {
            rail: rect(".dnex-shell-product-rail"), sidebar: rect(".dnex-shell-context-sidebar"),
            header: rect(".dnex-shell-topbar"),
            center: rect(".dnex-shell-topbar > div:nth-child(2)"),
            right: rect(".dnex-shell-topbar > div:last-child"),
            overflow: document.documentElement.scrollWidth > innerWidth,
            background: getComputedStyle(document.querySelector(".dnex-shell-product-rail")).backgroundColor,
          };
        });
        assert.equal(geometry.overflow, false, JSON.stringify({ width, theme, legacy, geometry }));
        assert.ok(geometry.center.right <= geometry.right.x + 1, "center/actions overlap at " + width);
        assert.ok(geometry.right.right <= width, "actions outside viewport at " + width);
        assert.equal(geometry.rail.visible, width > 1100);
        assert.equal(geometry.sidebar.visible, width > 1100);
        if (width > 1100) {
          assert.equal(geometry.rail.width, 72); assert.equal(geometry.sidebar.width, 226);
          assert.equal(geometry.sidebar.y, 0); assert.equal(geometry.header.x, 298);
          assert.notEqual(geometry.background, "rgba(0, 0, 0, 0)");
          assert.equal(await page.getByTestId("context-selector").isVisible(), true);
        }
        if (width < 1024) {
          await page.getByRole("button", { name: "Mais ações globais", exact: true }).click();
          assert.equal(await page.getByRole("button", { name: "Minha conta", exact: true }).last().isVisible(), true);
          await page.keyboard.press("Escape");
        } else {
          assert.equal(await page.getByRole("button", { name: "Minha conta", exact: true }).isVisible(), true);
        }
        checks++;
      }
    }
  }

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(origin);
  const menu = page.getByRole("button", { name: "Abrir navegação", exact: true });
  await menu.click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  assert.equal(await dialog.getByTestId("context-selector").isVisible(), true);
  assert.equal(await dialog.getByRole("link", { name: "Rascunhos", exact: true }).isVisible(), true);
  assert.equal(await dialog.getByRole("link", { name: "Configurações", exact: true }).isVisible(), true);
  assert.equal(await page.getByRole("link", { name: "Produto oculto", exact: true }).count(), 0);
  await page.keyboard.press("Control+k");
  assert.equal(await page.evaluate(() => window.searchCalls), 0, "search must not nest inside drawer");
  await page.keyboard.press("Escape");
  assert.equal(await menu.evaluate(e => document.activeElement === e), true, "Escape returns to opener");

  const more = page.getByRole("button", { name: "Mais opções do módulo", exact: true });
  await more.click(); await dialog.waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await more.evaluate(e => document.activeElement === e), true, "More also receives return focus");

  await menu.click();
  await dialog.getByRole("link", { name: "Aceites", exact: true }).click();
  await dialog.waitFor({ state: "detached" });
  assert.deepEqual(await page.evaluate(() => window.spaCalls), ["/aceites"]);

  const shortcuts = page.getByRole("navigation", { name: "Atalhos do módulo" });
  const popupPromise = context.waitForEvent("page");
  await shortcuts.getByRole("link", { name: "Biblioteca" }).click({ modifiers: ["Control"] });
  const popup = await popupPromise; await popup.waitForLoadState();
  assert.ok(popup.url().includes("/documentos?tab=todos"), "Ctrl+click opens the native deep URL");
  await popup.close();
  assert.deepEqual(await page.evaluate(() => window.spaCalls), ["/aceites"]);

  await menu.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]') && document.body.style.pointerEvents !== "none");
  assert.equal(await page.locator("#dnex-main").evaluate(e => document.activeElement === e), true, "resize restores visible focus");

  await page.getByRole("button", { name: "Recolher menu do produto", exact: true }).click();
  assert.equal(await page.locator(".dnex-shell-context-sidebar").getAttribute("data-collapsed"), "true");
  await page.waitForFunction(() => document.querySelector(".dnex-shell-context-sidebar").getBoundingClientRect().width === 72);
  await page.reload();
  await page.waitForFunction(() => document.querySelector(".dnex-shell-context-sidebar")?.dataset.collapsed === "true");

  await page.getByRole("link", { name: "DNEX Contratos", exact: true }).click();
  await page.waitForURL("**/outro-produto");
  assert.deepEqual(await page.evaluate(() => window.spaCalls), [], "cross-product link never invokes the host router");

  const blockedStorage = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await blockedStorage.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } }));
  const blockedPage = await blockedStorage.newPage();
  blockedPage.on("pageerror", error => errors.push(error.message));
  await blockedPage.goto(origin);
  await blockedPage.getByRole("button", { name: "Recolher menu do produto", exact: true }).click();
  assert.equal(await blockedPage.locator(".dnex-shell-context-sidebar").getAttribute("data-collapsed"), "true");
  await blockedStorage.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ viewportThemeApiChecks: checks, navigation: "SPA/native/modified/product switch passed", mobile: "account/header/focus/resize passed", storage: "blocked storage passed", pageErrors: errors }));
} finally {
  await browser.close();
  await server.close();
}
