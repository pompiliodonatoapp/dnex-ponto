/* Run against a running showcase. PLAYWRIGHT_MODULE may point to the host runtime. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const previewUrl = process.env.DS_PREVIEW_URL || "http://127.0.0.1:5183/";
const outputDir = process.env.DS_SCREENSHOTS || "/tmp/dnex-showcase-checks";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || "chrome",
    args: ["--disable-gpu"],
  });
  const report = { viewports: [], errors: [], checks: [] };
  mkdirSync(outputDir, { recursive: true });
  try {
    for (const viewport of [
      { width: 1440, height: 700 },
      { width: 1280, height: 600 },
      { width: 1024, height: 768 },
      { width: 390, height: 844 },
    ]) {
      const page = await browser.newPage({
        viewport,
        reducedMotion: "no-preference",
      });
      page.on("pageerror", (error) => report.errors.push(error.message));
      await page.goto(previewUrl, { waitUntil: "domcontentloaded" });
      await page.locator(".ds-library-layout").waitFor({ state: "attached" });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(
        await page.evaluate(() => scrollY),
        0,
        "Opening must not focus a form lower in the catalog",
      );
      const sections = await page
        .locator(".ds-catalog-section")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return {
              id: element.id,
              opacity: style.opacity,
              height: element.getBoundingClientRect().height,
              display: style.display,
              visibility: style.visibility,
            };
          }),
        );
      assert.ok(
        sections.length > 25,
        "Full catalog loaded, not just a placeholder",
      );
      assert.deepEqual(
        sections.filter(
          (section) =>
            section.opacity !== "1" ||
            section.height === 0 ||
            section.display === "none" ||
            section.visibility === "hidden",
        ),
        [],
        "Every catalog section visible from mount, even before scrolling",
      );
      const brokenAnchors = await page
        .locator(".ds-index a")
        .evaluateAll((links) =>
          links
            .map((link) => link.hash.slice(1))
            .filter((id) => !document.getElementById(id)),
        );
      assert.deepEqual(brokenAnchors, [], "Index destinations preserved");
      assert.equal(
        await page.locator(".ds-product-window").count(),
        1,
        "Only one complete reference preview",
      );
      assert.equal(
        await page.locator(".ds-product-tabs").count(),
        0,
        "No duplicate product switcher above preview",
      );
      assert.equal(
        await page.locator(".ds-compatibility[open]").count(),
        0,
        "Previous components closed by default",
      );

      const rail = page.getByRole("navigation", {
        name: "Aplicativos do workspace demonstrativo",
        exact: true,
      });
      for (const name of ["Fiscal", "Contratos", "Metas"]) {
        const button = page.getByRole("button", {
          name: `Abrir DNEX ${name}`,
          exact: true,
        });
        assert.equal(
          await button.count(),
          1,
          "Product action appears only once",
        );
        await rail
          .getByRole("button", { name: `Abrir DNEX ${name}`, exact: true })
          .click();
        assert.equal(await button.getAttribute("aria-pressed"), "true");
        assert.equal(
          await page.locator(".ds-preview-context strong").innerText(),
          `DNEX ${name}`,
        );
        const contextual = page.getByRole("navigation", {
          name: `Menu da demonstração ${name}`,
          exact: true,
        });
        assert.equal(await contextual.getByRole("button").count(), 4);
        assert.equal(
          await contextual.locator("svg.lucide-bell").count(),
          0,
          "Bell reserved for notifications",
        );
      }
      await page.evaluate(() =>
        document
          .getElementById("experiencia")
          .scrollIntoView({ behavior: "instant", block: "start" }),
      );
      const escapedNavigation = await page
        .locator(
          '#telas-crud nav[aria-label="Navegação principal (barra inferior)"]',
        )
        .evaluateAll(
          (elements) =>
            elements.filter((element) => {
              const bounds = element.getBoundingClientRect();
              return (
                getComputedStyle(element).display !== "none" &&
                bounds.top < innerHeight &&
                bounds.bottom > 0
              );
            }).length,
        );
      assert.equal(
        escapedNavigation,
        0,
        "Fixed navigation of the CRUD example must not escape over the main preview",
      );
      await page.screenshot({
        path: join(outputDir, `experience-${viewport.width}.png`),
      });
      await page
        .locator(".ds-product-content")
        .getByRole("button", { name: "Criar exemplo", exact: true })
        .click();
      await page
        .getByLabel("Nome do registro", { exact: true })
        .fill("Objetivo de regressão visual");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Criar exemplo", exact: true })
        .click();
      assert.match(
        await page.locator(".ds-record-list").innerText(),
        /Objetivo de regressão visual/,
      );
      await page
        .getByLabel("Filtrar registros da demonstração", { exact: true })
        .fill("registro-inexistente");
      assert.match(
        await page.locator(".ds-no-records").innerText(),
        /Nenhum registro/,
      );
      await rail
        .getByRole("button", { name: "Abrir DNEX Fiscal", exact: true })
        .click();
      assert.equal(
        await page
          .getByLabel("Filtrar registros da demonstração", { exact: true })
          .inputValue(),
        "",
      );
      assert.doesNotMatch(
        await page.locator(".ds-product-content").innerText(),
        /Exemplo criado nesta sessão/,
      );

      for (const id of ["foundations", "compostos", "shell"]) {
        await page.evaluate(
          (id) =>
            document
              .getElementById(id)
              .scrollIntoView({ behavior: "instant", block: "start" }),
          id,
        );
        const measured = await page
          .locator(`#${id}`)
          .evaluate((element) => ({
            opacity: getComputedStyle(element).opacity,
            top: element.getBoundingClientRect().top,
          }));
        assert.equal(
          measured.opacity,
          "1",
          `Scrolled section ${id} must be opaque`,
        );
        assert.ok(
          measured.top >= 0 && measured.top < viewport.height / 2,
          "Anchor heading in viewport below sticky header",
        );
        if (viewport.width === 1440 || viewport.width === 390)
          await page.screenshot({
            path: join(outputDir, `${id}-${viewport.width}.png`),
          });
      }
      await page.keyboard.press("Control+k");
      await page.getByRole("dialog").waitFor({ state: "visible" });
      assert.equal(await page.getByRole("dialog").count(), 1);
      await page.getByLabel("Buscar seções", { exact: true }).fill("sidebar");
      await page
        .locator(".ds-search-results")
        .getByRole("link")
        .first()
        .click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      const disclosure = page.locator("#sidebar .ds-compatibility");
      await disclosure.locator("summary").click();
      assert.equal(await disclosure.getAttribute("open"), "");
      await disclosure
        .getByRole("button", { name: "Recolher demonstração", exact: true })
        .click();
      await disclosure
        .getByRole("button", { name: "Expandir demonstração", exact: true })
        .waitFor();
      await disclosure.locator("summary").click();
      assert.equal(await disclosure.getAttribute("open"), null);
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      assert.equal(
        dimensions.document,
        dimensions.viewport,
        "No document horizontal overflow",
      );
      report.viewports.push({
        ...viewport,
        visibleSections: sections.length,
        dimensions,
      });
      if (viewport.width === 390) {
        await page
          .locator(".ds-contained-app-preview")
          .scrollIntoViewIfNeeded();
        const containment = await page
          .locator(".ds-contained-app-preview")
          .evaluate((frame) => {
            const outer = frame.getBoundingClientRect();
            const bar = frame
              .querySelector(
                'nav[aria-label="Navegação principal (barra inferior)"]',
              )
              .getBoundingClientRect();
            return {
              left: bar.left >= outer.left,
              right: bar.right <= outer.right,
              bottom: bar.bottom <= outer.bottom + 1,
              top: bar.top >= outer.top,
            };
          });
        assert.ok(
          Object.values(containment).every(Boolean),
          "The legacy navigation stays functional inside its own frame",
        );
        await page.screenshot({
          path: join(outputDir, "crud-contained-mobile.png"),
        });
      }

      if (viewport.width === 1440 || viewport.width === 390) {
        await page
          .locator(".ds-header")
          .getByRole("button", {
            name: "Tema: Claro. Trocar para Escuro",
            exact: true,
          })
          .click();
        await page.waitForFunction(
          () =>
            document.documentElement.dataset.theme === "dark" ||
            document.documentElement.classList.contains("dark"),
        );
        await page.evaluate(() =>
          document
            .getElementById("foundations")
            .scrollIntoView({ behavior: "instant" }),
        );
        assert.equal(
          await page
            .locator("#foundations")
            .evaluate((element) => getComputedStyle(element).opacity),
          "1",
        );
        await page.screenshot({
          path: join(outputDir, `foundations-dark-${viewport.width}.png`),
        });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.evaluate(() =>
          document
            .getElementById("compostos")
            .scrollIntoView({ behavior: "instant" }),
        );
        assert.equal(
          await page
            .locator("#compostos")
            .evaluate((element) => getComputedStyle(element).opacity),
          "1",
        );
      }
      await page.close();
      console.log(
        `Verified ${viewport.width}×${viewport.height}: ${sections.length} visible sections, unique navigation, no escaped controls.`,
      );
    }
    assert.deepEqual(report.errors, [], "No uncaught browser errors");
    report.checks = [
      "all sections opaque at mount",
      "short desktop and mobile viewport",
      "unique product navigation",
      "product contextual routes",
      "local creation and filtering",
      "state reset on product switch",
      "catalog search",
      "previous component disclosure",
      "dark theme",
      "reduced motion",
      "anchor navigation",
    ];
    writeFileSync(
      join(outputDir, "results.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
