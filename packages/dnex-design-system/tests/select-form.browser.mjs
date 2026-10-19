import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
const here = path.dirname(fileURLToPath(import.meta.url)), require = createRequire(new URL('../package.json', import.meta.url)), { build, preview } = await import(pathToFileURL(require.resolve('vite'))), tw = (await import(pathToFileURL(require.resolve('@tailwindcss/vite')))).default, out = process.env.DNEX_SELECT_ARTIFACTS || path.resolve(here, '../../../../../inbox/mobile-ds-20261008/select-form-focal');
await fs.mkdir(out, { recursive: true });
const manifest = process.env.DNEX_FONT_MANIFEST ? JSON.parse(await fs.readFile(process.env.DNEX_FONT_MANIFEST, 'utf8')) : null;
if (manifest)
    for (const entry of manifest.entries)
        assert.equal(createHash('sha256').update(await fs.readFile(entry.file)).digest('hex'), entry.sha256);
let browser, server;
const rows = [], errors = [], external = [];
try {
    await build({ configFile: false, envDir: false, root: path.join(here, 'select-form-fixture'), plugins: [{ name: 'optional-public-font-cache', transformIndexHtml: html => manifest ? html.replace('</head>', `<link rel="stylesheet" href="${manifest.entries.find(e => e.contentType.includes('css')).url}"></head>`) : html }, tw()], esbuild: { jsx: 'automatic' }, build: { outDir: out + '/production', emptyOutDir: true } });
    server = await preview({ configFile: false, envDir: false, build: { outDir: out + '/production' }, preview: { host: '127.0.0.1', port: 0 } });
    const origin = 'http://127.0.0.1:' + server.httpServer.address().port;
    browser = await chromium.launch({ headless: true });
    for (const width of [320, 390, 1440])
        for (const theme of ['light', 'dark']) {
            const ctx = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
            await ctx.route('**/*', async (r) => { const u = r.request().url(), entry = manifest?.entries.find(e => e.url === u); if (entry)
                return r.fulfill({ body: await fs.readFile(entry.file), contentType: entry.contentType, headers: { 'Access-Control-Allow-Origin': '*' } }); if (new URL(u).origin === origin)
                return r.continue(); external.push(u); return r.abort(); });
            const page = await ctx.newPage();
            page.on('pageerror', e => errors.push(e.message));
            await page.goto(origin);
            await page.locator('html').evaluate((e, t) => e.dataset.theme = t, theme);
            let fonts = [];
            if (manifest)
                fonts = await page.evaluate(async () => { const r = []; for (const [f, weights] of [['Space Grotesk', ['600', '700']], ['Plus Jakarta Sans', ['400', '500', '600', '700', '800']], ['IBM Plex Mono', ['500', '600', '700']]])
                    for (const w of weights) {
                        const a = await document.fonts.load(`${w} 16px "${f}"`);
                        r.push({ family: f, weight: w, decoded: a.length, check: document.fonts.check(`${w} 16px "${f}"`) });
                    } await document.fonts.ready; return r; });
            if (manifest)
                assert(fonts.every(f => f.decoded > 0 && f.check));
            const rhf = page.getByRole('combobox', { name: 'Categoria RHF' });
            await page.getByRole('button', { name: 'Focar categoria' }).focus();
            await page.getByRole('button', { name: 'Focar categoria' }).press('Enter');
            await page.waitForFunction(() => document.activeElement?.id === 'controlled');
            assert.equal(await rhf.getAttribute('aria-describedby'), 'category-error');
            await page.getByRole('button', { name: 'Limpar categoria' }).focus();
            await page.waitForFunction(() => document.querySelector('[data-testid=touched]').textContent === 'true');
            assert.equal(await rhf.getAttribute('aria-invalid'), 'true');
            assert.equal(await page.locator('#category-error').textContent(), 'Escolha uma categoria');
            await rhf.click();
            assert(await page.getByRole('option', { name: 'Indisponível' }).getAttribute('data-disabled') !== null);
            await page.getByRole('option', { name: 'Opção Alpha', exact: true }).click();
            await page.getByRole('listbox').waitFor({ state: 'hidden' });
            assert.equal(await page.getByTestId('calls').textContent(), '1');
            await page.getByRole('button', { name: 'Limpar categoria' }).focus();
            await page.getByRole('button', { name: 'Limpar categoria' }).press('Enter');
            await page.waitForFunction(() => document.querySelector('[data-testid=resets]').textContent === '1');
            assert.equal(await page.getByTestId('rhf-value').textContent(), '');
            await page.waitForFunction(() => document.querySelector('#controlled')?.textContent.includes('Escolha'));
            await page.getByRole('button', { name: 'Alternar bloqueio' }).click();
            assert(await rhf.isDisabled());
            await page.getByRole('button', { name: 'Alternar bloqueio' }).click();
            const native = page.getByRole('combobox', { name: 'Valor nativo externo' });
            assert.equal(await page.locator('select[name=nativeCategory]').evaluate(e => e.required), true);
            assert.equal(await page.locator('select[name=nativeCategory]').evaluate(e => e.form?.id), 'native-form');
            assert.equal(await page.locator('select[name=nativeCategory]').evaluate(e => e.value), '');
            assert.equal(await page.locator('#native-form').evaluate(e => e.checkValidity()), false);
            await native.click();
            await page.getByRole('option', { name: 'Opção Alpha', exact: true }).click();
            await page.getByRole('listbox').waitFor({ state: 'hidden' });
            assert.equal(await page.locator('#native-form').evaluate(e => e.checkValidity()), true);
            await page.getByRole('button', { name: 'Enviar formulário nativo' }).click();
            assert.deepEqual(JSON.parse(await page.getByTestId('payload').textContent()), { nativeCategory: 'alpha' });
            await native.click();
            const options = page.getByRole('option');
            for (const o of await options.all()) {
                const rect = await o.boundingBox();
                assert(rect.height >= 44);
                assert(rect.x >= -.5 && rect.x + rect.width <= width + .5);
            }
            await page.screenshot({ path: out + '/' + width + '-' + theme + '-options.png', fullPage: true });
            await options.nth(1).click();
            await page.getByRole('listbox').waitFor({ state: 'hidden' });
            const bounds = await native.boundingBox();
            assert(bounds.x + bounds.width <= width + .5);
            const selectedValue = await native.evaluate(el => ({ html: el.outerHTML, client: el.clientWidth, scroll: el.scrollWidth, children: [...el.querySelectorAll('span')].map(e => ({ html: e.outerHTML, rect: e.getBoundingClientRect().toJSON(), css: { display: getComputedStyle(e).display, overflow: getComputedStyle(e).overflow, minWidth: getComputedStyle(e).minWidth, flex: getComputedStyle(e).flex } })) }));
            await fs.writeFile(out + '/' + width + '-' + theme + '-selected-value.json', JSON.stringify(selectedValue, null, 2));
            await page.screenshot({ path: out + '/' + width + '-' + theme + '-selected-value.png', fullPage: true });
            assert(selectedValue.scroll <= selectedValue.client + 1, 'selected long label must not overflow trigger');
            await page.evaluate(() => window.scrollTo(99999, 0));
            assert.equal(await page.evaluate(() => window.scrollX), 0, 'selected long label must not pan page');
            const editorSelect = page.getByRole('combobox', { name: 'Formatação do editor' });
            await editorSelect.click();
            await page.getByRole('option', { name: 'Opção Alpha', exact: true }).click();
            await page.getByRole('listbox').waitFor({ state: 'hidden' });
            await page.waitForFunction(() => document.activeElement?.id === 'editor');
            await page.screenshot({ path: out + '/' + width + '-' + theme + '-editor-focus.png', fullPage: true });
            rows.push({ width, theme, fonts, reactHookFormFocusBlurErrorReset: true, disabled: true, requiredNativeFormPayload: true, callbackExactlyOnce: true, options44: true, popupWithinViewport: true, editorFocusOverride: true });
            await ctx.close();
        }
    for (const width of [320, 390, 1440])
        for (const theme of ['light', 'dark']) {
            const ctx = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
            await ctx.route('**/*', async r => {
                const url = r.request().url(), entry = manifest?.entries.find(e => e.url === url);
                if (entry) return r.fulfill({ body: await fs.readFile(entry.file), contentType: entry.contentType, headers: { 'Access-Control-Allow-Origin': '*' } });
                if (new URL(url).origin === origin) return r.continue();
                external.push(url); return r.abort();
            });
            const page = await ctx.newPage();
            page.on('pageerror', e => errors.push(e.message));
            await page.goto(origin + '/?async-form=1');
            await page.locator('html').evaluate((element, value) => element.dataset.theme = value, theme);
            if (manifest) {
                const fonts = await page.evaluate(async faces => {
                    const unique = [...new Map(faces.map(face => [face.family + face.weight, face])).values()];
                    const result = [];
                    for (const face of unique) {
                        const spec = face.weight + ' 16px ' + face.family;
                        const decoded = await document.fonts.load(spec);
                        result.push(decoded.length > 0 && decoded.every(font => font.status === 'loaded') && document.fonts.check(spec));
                    }
                    await document.fonts.ready; return result;
                }, manifest.fontFaces);
                assert.equal(fonts.length, 10); assert(fonts.every(Boolean));
            }
            await page.getByLabel('Código preservado', {exact: true}).fill('A-101');
            assert.equal(await page.locator('#async-controlled-form').evaluate(form => form.checkValidity()), false);
            await page.getByRole('button', {name: 'Carregar opções e selecionar Alpha', exact: true}).click();
            await page.waitForFunction(() => document.querySelector('[data-testid=async-loaded]').textContent === 'true');
            // BubbleInput's programmatic native change runs after the controlled render.
            await page.waitForTimeout(250);
            const state = await page.evaluate(() => ({
                value: document.querySelector('[data-testid=async-value]').textContent,
                changes: JSON.parse(document.querySelector('[data-testid=async-changes]').textContent),
                nativeValue: document.querySelector('select[name=unitBlock]')?.value,
                payload: Object.fromEntries(new FormData(document.querySelector('#async-controlled-form'))),
                valid: document.querySelector('#async-controlled-form').checkValidity(),
                sibling: document.querySelector('#async-sibling').value,
                trigger: document.querySelector('#async-controlled').textContent,
            }));
            await fs.writeFile(out + '/' + width + '-' + theme + '-async-state.json', JSON.stringify(state, null, 2));
            await page.screenshot({path: out + '/' + width + '-' + theme + '-async-state.png', fullPage: true});
            assert.deepEqual(state.changes, [], 'programmatic controlled selection must not emit user callbacks');
            assert.equal(state.value, 'alpha'); assert.equal(state.nativeValue, 'alpha');
            assert.equal(state.valid, true); assert.deepEqual(state.payload, {unitBlock: 'alpha', unitCode: 'A-101'});
            assert.equal(state.sibling, 'A-101'); assert.match(state.trigger, /Torre Alpha/);
            const select = page.getByRole('combobox', {name: 'Bloco com opções assíncronas', exact: true});
            await select.click(); await page.getByRole('option', {name: 'Torre Beta', exact: true}).click();
            await page.getByRole('listbox').waitFor({state: 'hidden'});
            assert.equal(await page.getByTestId('async-changes').textContent(), '["beta"]');
            assert.equal(await page.getByTestId('async-value').textContent(), 'beta');
            await select.click(); await page.getByRole('option', {name: 'Limpar bloco', exact: true}).click();
            await page.getByRole('listbox').waitFor({state: 'hidden'});
            await page.waitForTimeout(250);
            assert.equal(await page.getByTestId('async-changes').textContent(), '["beta","__none__"]', 'explicit clear remains a real callback');
            assert.equal(await page.getByTestId('async-value').textContent(), '');
            assert.equal(await page.locator('#async-controlled-form').evaluate(form => form.checkValidity()), false);
            assert.deepEqual(await page.locator('#async-controlled-form').evaluate(form => Object.fromEntries(new FormData(form))), {unitBlock: '', unitCode: 'A-101'});
            assert.equal(await page.getByLabel('Código preservado', {exact: true}).inputValue(), 'A-101');
            rows.push({width, theme, asyncControlledForm: true, programmaticCallbackCount: 0, betaCallbackCount: 1, clearCallbackCount: 1, nativeRequiredEmptyInvalid: true, siblingPreserved: true});
            await ctx.close();
        }
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    await fs.writeFile(out + '/result.json', JSON.stringify({ rows, errors, external, fontMode: manifest ? 'official-cache' : 'system-font-ci' }, null, 2));
    console.log('PASS ' + rows.length);
}
finally {
    await fs.writeFile(out + '/partial-result.json', JSON.stringify({rows, errors, external, fontMode: manifest ? 'official-cache' : 'system-font-ci'}, null, 2));
    await browser?.close();
    if (server)
        await new Promise(r => server.httpServer.close(r));
}
