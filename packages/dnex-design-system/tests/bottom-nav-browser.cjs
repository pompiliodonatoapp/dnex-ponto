const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const { mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const base = process.env.DS_PREVIEW_URL || "http://127.0.0.1:5220";
assert.match(base, /^http:\/\/127\.0\.0\.1:\d+$/);
const output = process.env.AUDIT_OUTPUT || "/tmp/dnex-ds-bottom-nav-032";
const labels = [
  "Empresas clientes",
  "Catálogo e planos",
  "Central de comunicação",
  "Governança tributária",
  "Configurações gerais",
];

async function main() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {}) });
  const report = { cases: [], errors: [] };
  try {
    for (const width of [320, 390, 768]) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        deviceScaleFactor: width < 768 ? 2 : 1,
        isMobile: width < 768,
        hasTouch: width < 768,
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => report.errors.push(error.message));
      await page.route("**/*", (route) => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
      await page.goto(`${base}/tests/fixtures/bottom-nav.html`);
      const nav = page.getByRole("navigation", { name: "Navegação principal (barra inferior)" });
      await nav.waitFor();

      const bounds = [];
      for (const label of labels) {
        const item = nav.getByRole("button", { name: label, exact: true });
        await item.waitFor();
        const box = await item.boundingBox();
        assert.ok(box, `${label}: botão deve ter bounds`);
        assert.ok(box.x >= -0.5 && box.x + box.width <= width + 0.5, `${label}: fora do viewport ${width}px (${JSON.stringify(box)})`);
        assert.ok(box.height >= 44, `${label}: alvo de toque abaixo de 44px (${box.height}px)`);
        await item.click();
        await assertEventually(async () => page.getByRole("status").textContent(), `Atalho selecionado: ${idFor(label)}`);
        await item.focus();
        await page.keyboard.press("Enter");
        await assertEventually(async () => page.getByRole("status").textContent(), `Atalho selecionado: ${idFor(label)}`);
        await page.keyboard.press("Space");
        await assertEventually(async () => page.getByRole("status").textContent(), `Atalho selecionado: ${idFor(label)}`);
        bounds.push({ label, ...box });
      }

      await page.evaluate(() => scrollTo(10_000, scrollY));
      const scrollX = await page.evaluate(() => scrollX);
      assert.equal(scrollX, 0, `${width}px: nenhuma rolagem horizontal real`);
      await page.screenshot({ path: resolve(output, `bottom-nav-${width}.png`) });
      report.cases.push({ width, bounds, checks: ["todos os atalhos no viewport", "alvos >= 44px", "click/Enter/Space selecionam", "nome acessível", "sem scroll horizontal real"] });
      await context.close();
    }
    assert.deepEqual(report.errors, []);
  } finally {
    writeFileSync(resolve(output, "report.json"), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(JSON.stringify(report, null, 2));
}

function idFor(label) {
  return {
    "Empresas clientes": "empresas",
    "Catálogo e planos": "catalogo",
    "Central de comunicação": "comunicacao",
    "Governança tributária": "governanca",
    "Configurações gerais": "configuracoes",
  }[label];
}

async function assertEventually(read, expected) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await read() === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.equal(await read(), expected);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
