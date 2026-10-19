// Isolated component fixture: no production credentials or mutation calls.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const { mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const base = process.env.DS_PREVIEW_URL || "http://127.0.0.1:5188";
assert.match(base, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
const output = process.env.CONFIRM_SCREENSHOTS || "/tmp/dnex-confirm-dialog";
const report = { cases: [], errors: [], warnings: [] };
function luminance(rgb) {
  return rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map((n) => n / 255).map((n) => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((a, n, i) => a + n * [.2126, .7152, .0722][i], 0);
}
function contrast(a, b) { const l = [luminance(a), luminance(b)].sort((x, y) => y - x); return (l[0] + .05) / (l[1] + .05); }
async function geometry(page) {
  const result = await page.evaluate(() => {
    scrollTo(99999, scrollY);
    const panel = document.querySelector('[role="alertdialog"]');
    const rect = panel.getBoundingClientRect();
    const style = getComputedStyle(panel);
    const veil = getComputedStyle(document.querySelector('.dnex-dialog-backdrop'));
    const action = getComputedStyle(panel.querySelector('.dnex-confirm-action'));
    const text = getComputedStyle(panel.querySelector('.dnex-dialog-description'));
    return { scroll: scrollX, viewport: innerWidth, content: document.documentElement.scrollWidth, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, height: innerHeight, background: style.backgroundColor, filter: style.backdropFilter, veilFilter: veil.backdropFilter, color: style.color, description: text.color, action: { background: action.backgroundColor, color: action.color }, buttons: [...panel.querySelectorAll('button')].map((b) => ({ height: b.getBoundingClientRect().height, width: b.getBoundingClientRect().width })) };
  });
  assert.equal(result.scroll, 0, "No horizontal drag");
  assert.ok(result.content <= result.viewport + 1, "No document overflow");
  assert.ok(result.left >= 15 && result.right <= result.viewport - 15, "Modal fits viewport");
  assert.ok(result.top >= 15 && result.bottom <= result.height - 15, "Modal fits dynamic height");
  assert.match(result.background, /^rgb\(/, "Surface is fully opaque");
  assert.equal(result.filter, "none"); assert.equal(result.veilFilter, "none");
  assert.ok(contrast(result.color, result.background) >= 4.5, "Title contrast AA");
  assert.ok(contrast(result.description, result.background) >= 4.5, "Body contrast AA");
  assert.ok(contrast(result.action.color, result.action.background) >= 4.5, "Destructive action contrast AA");
  result.buttons.forEach((b) => assert.ok(b.height >= 44 && b.width >= 44, "Touch targets >= 44px"));
  return result;
}
async function main() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  report.browser = browser.version();
  try {
    for (const width of [320, 390, 768, 1440]) for (const theme of ["light", "dark"]) for (const reducedMotion of ["reduce", "no-preference"]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 768, hasTouch: width < 768, deviceScaleFactor: width < 768 ? 3 : 1, colorScheme: theme, reducedMotion, serviceWorkers: "block" });
      const page = await context.newPage();
      page.on("pageerror", (error) => report.errors.push(error.message));
      page.on("console", (msg) => { if (msg.type() === "warning" && /Dialog|Description|aria-/.test(msg.text())) report.warnings.push(msg.text()); });
      await context.route("**/*", (route) => {
        const request = route.request(), url = new URL(request.url());
        if (request.method() === "GET" && (url.origin === new URL(base).origin || ["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname))) return route.continue();
        return route.abort();
      });
      await page.goto(`${base}/tests/fixtures/confirm-dialog.html?theme=${theme}`);
      await page.evaluate(() => document.fonts.ready);
      const trigger = page.locator("#trigger");
      await trigger.click();
      const dialog = page.getByRole("alertdialog", { name: "Excluir cliente?" });
      await dialog.waitFor();
      await page.waitForFunction(() => document.querySelector('[role="alertdialog"]').getAnimations().every((a) => a.playState === "finished"));
      const metrics = await geometry(page);
      assert.equal(await page.evaluate(() => document.activeElement.textContent), "Cancelar");
      await page.keyboard.press("Shift+Tab");
      assert.equal(await page.evaluate(() => document.activeElement.textContent), "Excluir cliente");
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.textContent), "Cancelar");
      if ([390, 1440].includes(width) && reducedMotion === "no-preference") await page.screenshot({ path: resolve(output, `confirm-${width}-${theme}.png`) });
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "detached" });
      assert.equal(await page.evaluate(() => document.activeElement.id), "trigger", "Restores focus to origin");
      assert.equal(await page.locator("#counts").getAttribute("data-confirmed"), "0");
      await trigger.click();
      await page.getByRole("button", { name: "Excluir cliente", exact: true }).click();
      assert.equal(await dialog.getAttribute("aria-busy"), "true");
      for (const b of await dialog.getByRole("button").all()) assert.ok(await b.isDisabled());
      await page.keyboard.press("Escape"); await page.mouse.click(4, 4);
      assert.ok(await dialog.isVisible(), "Pending action blocks dismissal");
      assert.equal(await page.locator("#counts").getAttribute("data-confirmed"), "1");
      await page.evaluate(() => window.confirmQA.release());
      await dialog.waitFor({ state: "detached" });
      await page.locator("#imperative").click();
      const simple = page.getByRole("alertdialog", { name: "Continuar?" });
      await simple.getByRole("button", { name: "Cancelar" }).click();
      await simple.waitFor({ state: "detached" });
      assert.equal(await page.locator("#result").textContent(), "false");
      assert.equal(await page.evaluate(() => document.activeElement.id), "imperative");
      await page.getByRole("button", { name: "Abrir modal padrão" }).click();
      const general = page.getByRole("dialog", { name: "Detalhes do cliente" });
      await general.waitFor();
      assert.equal(await general.evaluate((el) => getComputedStyle(el).backgroundColor), metrics.background);
      await general.getByRole("button", { name: "Fechar" }).click();
      await general.waitFor({ state: "detached" });
      report.cases.push({ width, theme, reducedMotion, metrics, checks: ["opaque surface", "44px targets", "keyboard trap", "safe initial focus", "focus restored", "escape", "loading lock", "imperative API", "standard dialog", "AA contrast", "no real mutation"] });
      await context.close();
    }
    const page = await browser.newPage({ viewport: { width: 320, height: 480 } });
    await page.goto(`${base}/tests/fixtures/confirm-dialog.html?long&open`);
    await page.getByRole("alertdialog").waitFor();
    await page.waitForFunction(() => document.querySelector('[role="alertdialog"]').getAnimations().every((a) => a.playState === "finished"));
    await geometry(page);
    const body = page.locator(".dnex-confirm-body");
    assert.ok(await body.evaluate((el) => el.scrollHeight > el.clientHeight), "Long content has its own scrolling");
    await page.getByRole("button", { name: "Cancelar" }).click();
    report.cases.push({ width: 320, height: 480, checks: ["unbroken long name wraps", "scrollable body", "footer accessible"] });
    assert.deepEqual(report.errors, [], "No runtime errors");
    assert.deepEqual(report.warnings, [], "No missing accessible descriptions");
  } finally {
    writeFileSync(resolve(output, "report.json"), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(`${report.cases.length} confirmation scenarios passed. No real records changed.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
