import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
const requireDemo = createRequire(new URL("../../../apps/demo/package.json", import.meta.url));
const { createServer } = await import(pathToFileURL(requireDemo.resolve("vite")).href);
const playwright = await import(process.env.DNEX_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.DNEX_PLAYWRIGHT_MODULE).href : "playwright");
const { chromium } = playwright.default ?? playwright;
const server = await createServer({ configFile: false, envFile: false,
  root: fileURLToPath(new URL("./browser/", import.meta.url)),
  server: { host: "127.0.0.1", port: 0, fs: { allow: [fileURLToPath(new URL("../../../", import.meta.url))] } },
});
let browser;
try {
  await server.listen();
  const origin = "http://127.0.0.1:" + server.httpServer.address().port;
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const errors = []; const unexpected = [];
  await context.route("**/*", route => { if (route.request().url().startsWith(origin)) return route.continue(); unexpected.push(route.request().url()); return route.abort(); });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(origin + "/rail.html");
  await page.getByRole("heading", { name: "Rail de teste" }).waitFor();
  const nav = page.locator(".dnex-shell-product-list");
  const buttons = page.locator(".dnex-shell-rail-scroll");
  const state = async (previous, next) => {
    await page.waitForFunction(([previous, next]) => {
      const buttons = [...document.querySelectorAll('.dnex-shell-rail-scroll')];
      return buttons.length === 2 && buttons.every((button, i) => {
        const visible = i === 0 ? previous : next;
        return button.disabled === !visible && button.tabIndex === (visible ? 0 : -1)
          && button.getAttribute('aria-hidden') === String(!visible)
          && getComputedStyle(button).visibility === (visible ? 'visible' : 'hidden');
      });
    }, [previous, next]);
  };
  await state(false, false);
  await page.getByRole("link", { name: "Abrir Hub DNEX" }).focus();
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'App 1');
  for (let i = 0; i < 2; i++) {
    assert.equal(await buttons.nth(i).evaluate(e => { e.focus(); return document.activeElement === e; }), false);
  }
  const artifacts = new URL('../.artifacts/', import.meta.url);
  await mkdir(artifacts, { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL('rail-single.png', artifacts)) });
  await page.getByRole('button', { name: 'Poucos aplicativos' }).click();
  await state(false, false);
  await page.getByRole('button', { name: 'Muitos aplicativos' }).click();
  await state(false, true);
  // The native Windows gutter must not consume the narrow product rail.
  assert.equal(await nav.evaluate(e => getComputedStyle(e).scrollbarWidth), 'none');
  assert.equal(await nav.evaluate(e => getComputedStyle(e, '::-webkit-scrollbar').display), 'none');
  assert.equal(await nav.evaluate(e => getComputedStyle(e).overflowY), 'auto');
  await nav.hover();
  await page.mouse.wheel(0, 180);
  await state(true, true);
  await nav.locator('a').first().focus();
  await state(false, true);
  await nav.locator('a').last().focus();
  await state(true, false);
  await nav.locator('a').first().focus();
  await state(false, true);
  const sidebar = page.locator('.dnex-shell-context-scroll');
  assert.equal(await sidebar.evaluate(e => getComputedStyle(e).scrollbarWidth), 'none');
  assert.equal(await sidebar.evaluate(e => getComputedStyle(e).overflowY), 'auto');
  assert.ok(await sidebar.evaluate(e => e.scrollHeight > e.clientHeight));
  await sidebar.locator('a').last().focus();
  assert.ok(await sidebar.evaluate(e => e.scrollTop > 0));
  await sidebar.locator('a').first().focus();
  assert.equal(await sidebar.evaluate(e => e.scrollTop), 0);
  await page.emulateMedia({ forcedColors: 'active' });
  assert.equal(await nav.evaluate(e => getComputedStyle(e).scrollbarWidth), 'auto');
  assert.equal(await sidebar.evaluate(e => getComputedStyle(e).scrollbarWidth), 'auto');
  await page.emulateMedia({ forcedColors: 'none' });
  const viewportHeight = await nav.evaluate(e => e.clientHeight);
  await page.evaluate(() => {
    window.scrollCalls = [];
    const element = document.querySelector('.dnex-shell-product-list');
    const original = element.scrollBy.bind(element);
    element.scrollBy = options => { window.scrollCalls.push(options); original(options); };
  });
  await buttons.last().click();
  await state(true, true);
  assert.equal(await page.evaluate(() => window.scrollCalls.at(-1).behavior), 'auto');
  assert.equal(await nav.evaluate(e => e.clientHeight), viewportHeight, 'Changing arrow visibility must not resize the list');
  await nav.evaluate(e => { e.scrollTop = e.scrollHeight; });
  await state(true, false);
  await buttons.first().click();
  await state(true, true);
  await nav.evaluate(e => { e.scrollTop = 0; });
  await state(false, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await buttons.last().click();
  await state(true, true);
  assert.equal(await page.evaluate(() => window.scrollCalls.at(-1).behavior), 'smooth');
  // Wait for the requested movement to finish before resizing. Arrow state changes
  // on the first animation frame, while Chromium may still have pending scrolling.
  await page.waitForFunction(() => Math.abs(document.querySelector('.dnex-shell-product-list').scrollTop - window.scrollCalls.at(-1).top) < 1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1600 });
  await state(false, false);
  await page.setViewportSize({ width: 1440, height: 600 });
  await state(false, true);
  await page.screenshot({ path: fileURLToPath(new URL('rail-overflow.png', artifacts)) });
  await page.setViewportSize({ width: 1024, height: 600 });
  await state(false, false);
  assert.equal(await page.locator('.dnex-shell-product-rail').isVisible(), false);
  await page.setViewportSize({ width: 1440, height: 600 });
  await state(false, true);
  // Reach the end with the focused button, then verify focus leaves the hidden control.
  await nav.evaluate(e => { e.scrollTop = e.scrollHeight - e.clientHeight - 80; });
  await state(true, true);
  await buttons.last().click();
  await state(true, false);
  assert.equal(await nav.evaluate(e => document.activeElement === e), true);
  await page.getByRole('button', { name: 'Um aplicativo' }).click();
  await state(false, false);
  assert.equal(await nav.evaluate(e => e.scrollTop), 0);
  // ResizeObserver observes item geometry even without new product props or window resize.
  await page.getByRole('button', { name: 'Poucos aplicativos' }).click();
  await state(false, false);
  await nav.locator('a').first().evaluate(e => { e.style.minHeight = '700px'; });
  await state(false, true);
  await nav.locator('a').first().evaluate(e => { e.style.minHeight = ''; });
  await state(false, false);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await state(false, false);
  assert.deepEqual(errors, []); assert.deepEqual(unexpected, []);
  console.log(JSON.stringify({ pass: true, browser: browser.version(), scenarios: ['single and few', 'keyboard exclusion', 'top/middle/bottom', 'stable list height', 'motion preference', 'viewport resize', 'rail hide/show', 'focused edge', 'dynamic products', 'item ResizeObserver', 'no native gutter', 'wheel and keyboard with hidden gutter', 'context menu focus scrolling', 'forced colors native scrolling'], pageErrors: errors }));
} finally {
  if (browser) await browser.close();
  await server.close();
}
