import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const requireDs = createRequire(new URL("../package.json", import.meta.url));
const { build, preview } = await import(pathToFileURL(requireDs.resolve("vite")).href);
const artifacts = process.env.QA_OUTPUT || await mkdtemp(path.join(tmpdir(), "dnex-topbar-extras-"));
await mkdir(artifacts, { recursive: true });
const outDir = path.join(artifacts, "production");
await build({ configFile: false, envDir: false,
  root: fileURLToPath(new URL("./topbar-extras-fixture/", import.meta.url)),
  build: { outDir, emptyOutDir: true, minify: "esbuild" } });
let server, browser;
const checks = [], errors = [], external = [];
try {
  server = await preview({ configFile: false, envDir: false, build: { outDir }, preview: { host: "127.0.0.1", port: 0 } });
  const origin = "http://127.0.0.1:" + server.httpServer.address().port;
  browser = await chromium.launch({ headless: true });
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: width < 600, hasTouch: width < 600, reducedMotion: "reduce" });
    await context.route("**/*", r => new URL(r.request().url()).origin === origin ? r.continue() : (external.push(r.request().url()), r.abort()));
    const page = await context.newPage();
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(origin);
    await page.locator("html").evaluate((el, t) => el.dataset.theme = t, theme);
    const trigger = page.getByRole("button", { name: "Mais ações globais", exact: true });
    if (width < 1024) {
      width < 600 ? await trigger.tap() : await trigger.click();
      await page.getByRole("dialog").waitFor();
    }
    const client = page.getByRole("button", { name: "Trocar cliente", exact: true });
    const rect = await client.boundingBox();
    assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= width + 1, JSON.stringify({ width, theme, rect }));
    if (width < 1024) {
      const bounds = await page.getByRole("dialog").boundingBox();
      assert.ok(rect.x >= bounds.x && rect.x + rect.width <= bounds.x + bounds.width + 1, "client control remains inside menu");
    }
    await client.click();
    assert.equal(await page.getByLabel("Cliques").textContent(), "1");
    await page.screenshot({ path: path.join(artifacts, `${width}-${theme}.png`) });
    if (width < 1024) {
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "detached" });
      await page.waitForFunction(el => document.activeElement === el, await trigger.elementHandle());
    }
    await page.evaluate(() => scrollTo(999999, 0));
    assert.ok(await page.evaluate(() => scrollX) <= 2);
    checks.push({ width, theme, clientVisibleAndClickable: true, insideMenu: width < 1024, noHorizontalPan: true });
    await context.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(path.join(artifacts, "result.json"), JSON.stringify({ checks, errors, externalRequests: external.length }, null, 2));
  console.log(JSON.stringify({ cases: checks.length, errors, externalRequests: external.length, artifacts }));
} finally {
  await browser?.close();
  if (server) await new Promise(r => server.httpServer.close(r));
}
