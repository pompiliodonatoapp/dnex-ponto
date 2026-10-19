// Run with the DS Vite dev server. No production data or authenticated session.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const base = process.env.DS_PREVIEW_URL || "http://127.0.0.1:5184";
const output = process.env.DS_SCREENSHOTS || "/tmp/dnex-loader-checks";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const report = { browser: browser.version(), checks: [], errors: [] };
  mkdirSync(output, { recursive: true });
  try {
    for (const width of [320, 390, 768, 1440]) {
      for (const theme of ["light", "dark"]) {
        for (const reducedMotion of ["no-preference", "reduce"]) {
          const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: width < 768, hasTouch: width < 768, deviceScaleFactor: width < 768 ? 2 : 1, reducedMotion });
          page.on("pageerror", (error) => report.errors.push(error.message));
          await page.goto(`${base}/tests/fixtures/page-loader.html?theme=${theme}`);
          await page.evaluate(() => document.fonts.ready);
          await page.locator("#trigger").click();
          const loader = page.locator('[data-dnex-page-loader="fixed"]');
          await loader.waitFor();
          const geometry = await loader.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            const css = getComputedStyle(element);
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bg: css.backgroundColor, opacity: css.opacity, filter: css.backdropFilter, bodyChild: element.parentElement === document.body,
              covering: [[2, 2], [innerWidth - 2, 2], [2, innerHeight - 2], [innerWidth - 2, innerHeight - 2]].every(([x, y]) => element.contains(document.elementFromPoint(x, y))) };
          });
          assert.deepEqual([geometry.x, geometry.y, geometry.width, geometry.height], [0, 0, width, 844]);
          assert.ok(geometry.bodyChild && geometry.covering);
          assert.match(geometry.bg, /^rgb\(/, "opaque color, not rgba/color-mix transparency");
          assert.equal(geometry.opacity, "1");
          assert.equal(geometry.filter, "none");
          assert.equal(await loader.getAttribute("aria-label"), "Organizando sua visão geral");
          assert.equal(await page.locator("#root").evaluate((node) => node.inert), true);
          await page.keyboard.press("Tab");
          assert.equal(await page.evaluate(() => document.getElementById("root").contains(document.activeElement)), false);
          await page.mouse.click(width - 5, 5);
          assert.equal(await page.evaluate(() => window.loaderQA.clicks), 0);
          const beforeScroll = await page.evaluate(() => scrollY);
          await page.mouse.wheel(0, 300);
          await page.waitForTimeout(100);
          assert.equal(await page.evaluate(() => scrollY), beforeScroll);
          assert.equal(await page.evaluate(() => { scrollTo(99999, scrollY); return scrollX; }), 0);
          if (reducedMotion === "reduce") {
            const motion = await page.locator(".dnex-loading-chevron-1").evaluate((el) => ({ duration: getComputedStyle(el).animationDuration, iterations: getComputedStyle(el).animationIterationCount }));
            assert.ok(parseFloat(motion.duration) < 0.01);
            assert.equal(motion.iterations, "1");
          } else {
            assert.equal(await page.locator(".dnex-loading-chevron-1").evaluate((el) => getComputedStyle(el).animationName), "dnex-loader-breathe");
            if (width === 390 || width === 1440) await page.screenshot({ path: join(output, `loader-${width}-${theme}.png`) });
          }

          // An independently loading route must not unlock the page too soon.
          await page.evaluate(() => window.loaderQA.set(2));
          await page.waitForFunction(() => document.querySelectorAll('[data-dnex-page-loader="fixed"]').length === 2);
          await page.evaluate(() => window.loaderQA.set(1));
          await page.waitForFunction(() => document.querySelectorAll('[data-dnex-page-loader="fixed"]').length === 1);
          assert.equal(await page.locator("#root").evaluate((node) => node.inert), true);
          await page.evaluate(() => window.loaderQA.set(0));
          await loader.waitFor({ state: "detached" });
          assert.equal(await page.locator("#root").evaluate((node) => node.inert), false);
          assert.equal(await page.locator("#already-inert").evaluate((node) => node.inert), true);
          assert.equal(await page.evaluate(() => document.body.style.overflow), "");
          assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
          assert.equal(await page.evaluate(() => document.activeElement.id), "trigger");
          await page.locator("#behind").click();
          assert.equal(await page.evaluate(() => window.loaderQA.clicks), 1);

          // Contained showcase variant does not portal or lock the whole app.
          await page.evaluate(() => window.loaderQA.set(1, "absolute"));
          const embedded = page.locator('[data-dnex-page-loader="absolute"]');
          await embedded.waitFor();
          assert.equal(await embedded.evaluate((node) => node.parentElement.id), "animated-ancestor");
          assert.equal(await page.locator("#root").evaluate((node) => node.inert), false);
          assert.equal(await page.evaluate(() => document.body.style.overflow), "");
          await page.evaluate(() => window.loaderQA.set(0));
          await embedded.waitFor({ state: "detached" });
          report.checks.push({ width, theme, reducedMotion, result: "passed", geometry });
          await page.close();
        }
      }
    }
    assert.deepEqual(report.errors, []);
  } finally {
    writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(`${report.checks.length} cenários passaram; cobertura opaca, portal, teclado, scroll, temas, motion e restauração.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
