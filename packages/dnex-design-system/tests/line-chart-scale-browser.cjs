/* Gate de navegador do demo "Linha — escala fixa (progresso 0–100%)".
 * Roda contra a vitrine BUILDADA servida localmente (DS_PREVIEW_URL).
 * PLAYWRIGHT_MODULE pode apontar para uma instalação existente do Playwright;
 * CHROME_CHANNEL (default "chrome") escolhe o binário, como nos outros gates. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { join } = require("node:path");

const previewUrl = process.env.DS_PREVIEW_URL || "http://127.0.0.1:5187/";
const outputDir = process.env.DS_SCREENSHOTS || "/tmp/kit073";
const TICKS = ["0%", "25%", "50%", "75%", "100%"];

async function openGraficos(browser, { width, theme, reducedMotion }) {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 844 : 900 },
    deviceScaleFactor: width < 768 ? 2 : 1,
    isMobile: width < 768,
    hasTouch: width < 768,
    colorScheme: theme,
    reducedMotion,
  });
  await context.addInitScript((value) => localStorage.setItem("dnex-showcase-theme", value), theme);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(previewUrl, { waitUntil: "domcontentloaded" });
  await page.locator(".ds-library-layout").waitFor({ state: "attached" });
  await page.locator("#demo-okr-escala-fixa").waitFor({ state: "attached", timeout: 60000 });
  await page.locator("#demo-okr-escala-fixa").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: process.env.CHROME_CHANNEL || "chrome", args: ["--disable-gpu"] });
  mkdirSync(outputDir, { recursive: true });
  const report = [];
  try {
    for (const width of [320, 390, 768, 1280]) {
      for (const theme of ["light", "dark"]) {
        const { context, page, errors } = await openGraficos(browser, { width, theme, reducedMotion: "reduce" });
        const applied = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
        assert.equal(applied, theme, `tema aplicado em ${width}px`);

        // Sem rolagem horizontal: métrica E tentativa real de rolar.
        const overflow = await page.evaluate(() => {
          const root = document.scrollingElement;
          window.scrollTo(10000, window.scrollY);
          const scrolled = window.scrollX;
          window.scrollTo(0, window.scrollY);
          const section = document.getElementById("graficos");
          return {
            scrollWidth: root.scrollWidth,
            innerWidth: window.innerWidth,
            scrolledX: scrolled,
            sectionOverflow: section ? section.scrollWidth - section.clientWidth : 0,
          };
        });
        assert.ok(overflow.scrollWidth <= overflow.innerWidth, `scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth} em ${width}px`);
        assert.equal(overflow.scrolledX, 0, `página rolou horizontalmente em ${width}px`);
        assert.ok(overflow.sectionOverflow <= 0, `seção de gráficos transborda ${overflow.sectionOverflow}px em ${width}px`);

        // Demo novo presente, com os ticks pedidos visíveis dentro do gráfico.
        const fixed = page.locator("#demo-okr-escala-fixa figure");
        assert.equal(await fixed.count(), 1, "demo de escala fixa presente");
        const tickLocator = fixed.locator(".recharts-yAxis .recharts-cartesian-axis-tick-value tspan");
        await tickLocator.first().waitFor({ state: "visible", timeout: 30000 });
        assert.deepEqual(await tickLocator.allTextContents(), TICKS, `ticks em ${width}px/${theme}`);
        const chartBox = await fixed.locator(".recharts-responsive-container").boundingBox();
        assert.ok(chartBox && chartBox.width > 0 && chartBox.height > 0, "gráfico com geometria real");
        for (let i = 0; i < TICKS.length; i += 1) {
          const box = await tickLocator.nth(i).boundingBox();
          assert.ok(box && box.width > 0, `tick ${TICKS[i]} visível`);
          assert.ok(box.y >= chartBox.y - 1 && box.y + box.height <= chartBox.y + chartBox.height + 1, `tick ${TICKS[i]} dentro do gráfico`);
          assert.ok(box.x >= 0 && box.x + box.width <= width, `tick ${TICKS[i]} dentro da viewport`);
        }
        assert.equal(await fixed.locator(".recharts-reference-line").count(), 1, "linha de meta presente");
        assert.equal(await fixed.locator(".recharts-line-dot").count(), 17, "17 pontos medidos (6×3 − 1 lacuna)");
        assert.equal(await fixed.locator(".recharts-line-curve").count(), 3, "três séries desenhadas");

        // Par automático × fixo: mesmos dados, teto diferente.
        const autoTicks = await page.locator('#demo-okr-auto-vs-fixo [data-scale="auto"] .recharts-yAxis .recharts-cartesian-axis-tick-value tspan').allTextContents();
        const fixedTicks = await page.locator('#demo-okr-auto-vs-fixo [data-scale="fixed"] .recharts-yAxis .recharts-cartesian-axis-tick-value tspan').allTextContents();
        assert.deepEqual(fixedTicks, TICKS, "lado fixo do par");
        assert.ok(autoTicks.length > 0 && !autoTicks.includes("100%"), `lado automático não chega a 100% (${autoTicks.join(",")})`);

        // Reduced motion: curva estática (Recharts só põe stroke-dasharray quando anima).
        const dashed = await fixed.locator(".recharts-line-curve").evaluateAll((paths) => paths.filter((p) => p.hasAttribute("stroke-dasharray")).length);
        assert.equal(dashed, 0, "sem animação de entrada sob prefers-reduced-motion");

        await page.locator("#demo-okr-escala-fixa").screenshot({ path: join(outputDir, `okr-escala-fixa-${width}-${theme}.png`) });
        await page.locator("#demo-okr-auto-vs-fixo").screenshot({ path: join(outputDir, `okr-auto-vs-fixo-${width}-${theme}.png`) });
        assert.deepEqual(errors, [], `erros de página em ${width}px/${theme}`);
        report.push({ width, theme, ...overflow, ticks: TICKS.length, autoTicks });
        await context.close();
      }
    }

    // Contraprova: sem a preferência, a animação de entrada existe (o interruptor é real).
    const { context, page } = await openGraficos(browser, { width: 1280, theme: "dark", reducedMotion: "no-preference" });
    await page.waitForTimeout(2000);
    const animated = await page.locator("#demo-okr-escala-fixa figure .recharts-line-curve").evaluateAll((paths) => paths.filter((p) => p.hasAttribute("stroke-dasharray")).length);
    assert.ok(animated > 0, "com movimento permitido, o Recharts anima (stroke-dasharray presente)");
    await context.close();
    report.push({ width: 1280, theme: "dark", reducedMotion: "no-preference", animatedCurves: animated });
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(report, null, 2));
  console.log(`line-chart-scale browser gate: ${report.length} cenários OK; screenshots em ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
