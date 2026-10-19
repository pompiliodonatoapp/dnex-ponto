// Real mobile emulation + real scroll attempt adapted from audit-mobile.mjs.
// Preview-only fixtures: no production mutations. Set PLAYWRIGHT_PATH outside this machine.
const pwPath =
  process.env.PLAYWRIGHT_PATH ||
  "/Users/pompiliordonato/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const { chromium } = require(pwPath);
const version = require(pwPath + "/package.json").version;
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const out =
  process.env.AUDIT_OUTPUT ||
  "/Users/pompiliordonato/Documents/Codex/2026-09-10/re/outputs/ds-revision3";
fs.mkdirSync(out, { recursive: true });
const results = [];
async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: ["--disable-gpu"],
  });
  try {
    for (const width of (process.env.WIDTHS || "390,320,768,1440")
      .split(",")
      .map(Number)) {
      const mobile = width < 500;
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        deviceScaleFactor: mobile ? 2 : 1,
        isMobile: mobile,
        hasTouch: mobile,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const errors = [];
      const mutations = [];
      page.setDefaultTimeout(15000);
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(r.method()))
          mutations.push(r.url());
      });
      const checks = [];
      const step = (name) => {
        checks.push(name);
        console.log(width, name);
      };
      try {
        await page.goto("http://127.0.0.1:5183/?revisao=3", {
          waitUntil: "domcontentloaded",
        });
        await page
          .locator(".ds-library-layout")
          .waitFor({ state: "attached", timeout: 60000 });
        await page.evaluate(() => document.fonts.ready);
        const experience = page.getByRole("region", {
          name: "Experiência interativa DNEX",
          exact: true,
        });
        const crud = page.getByRole("region", {
          name: "Prévia das telas de CRUD",
          exact: true,
        });
        const dialog = page.locator(".ds-wb-dialog");
        const openNav = async (scope) => {
          const hamburger = scope.locator(".ds-wb-menu-toggle");
          if (await hamburger.isVisible()) {
            await hamburger.click();
            return dialog;
          }
          return scope.locator(".ds-wb-sidebar");
        };
        const close = async () => {
          await dialog.getByRole("button", { name: /^Fechar/ }).click();
          await dialog.waitFor({ state: "hidden" });
        };
        const checkHorizontal = async (selector) => {
          await page.locator(selector).evaluate((el) => {
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, scrollY + el.getBoundingClientRect().top - 95);
          });
          const metric = await page.evaluate((selector) => {
            const y = scrollY;
            window.scrollTo(99999, y);
            const actualScrollX = scrollX;
            window.scrollTo(0, y);
            const root = document.querySelector(selector);
            const clipped = Array.from(
              root.querySelectorAll("button,input,select,.ds-crud-row,.ds-viz"),
            )
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && (r.left < -2 || r.right > innerWidth + 2);
              })
              .map((el) => ({
                class: el.className,
                text: el.textContent.slice(0, 50),
                left: el.getBoundingClientRect().left,
                right: el.getBoundingClientRect().right,
              }));
            return {
              actualScrollX,
              docWidth: document.documentElement.scrollWidth,
              viewport: innerWidth,
              clipped,
            };
          }, selector);
          assert.equal(
            metric.actualScrollX,
            0,
            `${selector} horizontal scroll`,
          );
          assert.deepEqual(
            metric.clipped,
            [],
            `${selector} offscreen functional content`,
          );
          return metric;
        };
        assert.equal(
          await page.evaluate(() => scrollY),
          0,
          "No unsolicited autofocus scroll",
        );
        const sections = await page
          .locator(".ds-library-layout section[id]")
          .evaluateAll((els) =>
            els.map((e) => ({
              id: e.id,
              opacity: getComputedStyle(e).opacity,
              height: e.getBoundingClientRect().height,
            })),
          );
        assert.equal(sections.length, 32);
        assert.ok(sections.every((e) => e.opacity === "1" && e.height > 0));
        step("32 visible catalog sections; no blank content");
        assert.equal(
          await experience.locator(".ds-wb-topbar .ds-wb-profile").count(),
          1,
        );
        assert.equal(
          await experience.locator(".ds-wb-sidebar .ds-wb-profile").count(),
          0,
        );
        assert.equal(
          await experience.getByText("Mais foco.", { exact: true }).count(),
          0,
        );
        const topbar = experience.locator(".ds-wb-topbar");
        assert.equal(
          await topbar
            .getByRole("button", { name: "Buscar no módulo", exact: true })
            .count(),
          1,
        );
        assert.equal(
          await topbar
            .getByRole("button", { name: "Abrir notificações", exact: true })
            .count(),
          1,
        );
        assert.equal(
          await topbar
            .getByRole("button", { name: "Abrir ajuda e suporte", exact: true })
            .count(),
          1,
        );
        assert.equal(
          await experience
            .locator(
              ".ds-wb-sidebar .ds-wb-search,.ds-wb-sidebar .ds-wb-utilities",
            )
            .count(),
          0,
        );
        const desktopCompany = await experience
          .locator(".ds-wb-company")
          .evaluate((e) => ({
            border: getComputedStyle(e).borderTopWidth,
            bg: getComputedStyle(e).backgroundColor,
          }));
        assert.deepEqual(desktopCompany, {
          border: "0px",
          bg: "rgba(0, 0, 0, 0)",
        });
        let menu;
        await topbar
          .getByRole("button", { name: "Buscar no módulo", exact: true })
          .click();
        const search = dialog.locator("input");
        await search.fill("apuracoes");
        await dialog
          .getByRole("button", { name: "Apurações", exact: true })
          .click();
        await dialog.waitFor({ state: "hidden" });
        assert.match(
          await experience.locator(".ds-wb-breadcrumb").innerText(),
          /Apurações/,
        );
        assert.equal(
          await topbar
            .getByRole("button", { name: "Buscar no módulo", exact: true })
            .evaluate((el) => el === document.activeElement),
          true,
          "Focus returned to topbar search",
        );
        await topbar
          .getByRole("button", { name: "Buscar no módulo", exact: true })
          .click();
        await dialog.locator("input").fill("xyznonexistent");
        assert.match(await dialog.innerText(), /Nenhuma página/);
        await close();
        menu = await openNav(experience);
        await menu.getByRole("button", { name: /Selecionar empresa/ }).click();
        await dialog.getByRole("button", { name: /Estúdio Horizonte/ }).click();
        await dialog.waitFor({ state: "hidden" });
        menu = await openNav(experience);
        assert.match(
          await menu.locator(".ds-wb-company").innerText(),
          /Estúdio Horizonte/,
        );
        if (width <= 1100) await close();
        await topbar
          .getByRole("button", { name: "Abrir notificações", exact: true })
          .click();
        await dialog
          .getByRole("button", { name: "Marcar como lidas", exact: true })
          .click();
        assert.match(await dialog.innerText(), /Tudo lido/);
        await close();
        await topbar
          .getByRole("button", { name: "Abrir ajuda e suporte", exact: true })
          .click();
        await dialog
          .getByRole("button", { name: "Encontrar uma página", exact: true })
          .click();
        await dialog
          .getByRole("button", { name: "Visão geral", exact: true })
          .click();
        await dialog.waitFor({ state: "hidden" });
        await experience
          .getByRole("button", { name: "Abrir perfil do usuário", exact: true })
          .click();
        assert.match(await dialog.innerText(), /Pompílio Donato/);
        await close();
        step(
          "Topbar search, notifications, help, profile; company and navigation in drawer",
        );
        if (width <= 1100) {
          menu = await openNav(experience);
          await menu
            .getByRole("button", { name: "Abrir DNEX Contratos", exact: true })
            .click();
        } else
          await experience
            .getByRole("button", { name: "Abrir DNEX Contratos", exact: true })
            .click();
        assert.match(
          await experience.locator(".ds-wb-breadcrumb").innerText(),
          /Contratos/,
        );
        if (width <= 1100) {
          menu = await openNav(experience);
          await menu
            .getByRole("button", { name: "Abrir DNEX Fiscal", exact: true })
            .click();
        } else
          await experience
            .getByRole("button", { name: "Abrir DNEX Fiscal", exact: true })
            .click();
        const activity = experience.locator(".ds-viz-trend");
        assert.match(
          await activity.locator(".ds-viz-summary").innerText(),
          /314/,
        );
        await activity
          .getByLabel("Período da atividade", { exact: true })
          .selectOption("Este trimestre");
        assert.match(
          await activity.locator(".ds-viz-summary").innerText(),
          /480/,
        );
        await activity
          .getByLabel("Período da atividade", { exact: true })
          .selectOption("Este mês");
        step("Product switching and period totals");
        // CRUD: create, read, update, cancel deletion, delete + undo, filter/sort and all entities.
        await crud
          .getByRole("button", { name: "Convidar usuário", exact: true })
          .click();
        await dialog.getByLabel("Nome", { exact: true }).fill("Joana Teste");
        await dialog
          .getByLabel("E-mail", { exact: true })
          .fill("joana@example.com");
        await dialog
          .getByRole("button", { name: "Salvar usuário", exact: true })
          .click();
        await dialog.waitFor({ state: "hidden" });
        await crud
          .getByRole("button", {
            name: "Ver detalhes de Joana Teste",
            exact: true,
          })
          .click();
        assert.match(await dialog.innerText(), /joana@example.com/);
        await dialog
          .getByRole("button", { name: "Editar cadastro", exact: true })
          .click();
        await dialog.getByLabel("Nome", { exact: true }).fill("Joana Revisada");
        await dialog
          .getByRole("button", { name: "Salvar usuário", exact: true })
          .click();
        await dialog.waitFor({ state: "hidden" });
        await crud
          .getByRole("button", { name: "Excluir Joana Revisada", exact: true })
          .click();
        await dialog
          .getByRole("button", { name: "Manter registro", exact: true })
          .click();
        await dialog.waitFor({ state: "hidden" });
        await crud
          .getByRole("button", { name: "Excluir Joana Revisada", exact: true })
          .click();
        await dialog
          .getByRole("button", { name: "Confirmar exclusão", exact: true })
          .click();
        await dialog.waitFor({ state: "hidden" });
        assert.equal(
          await crud
            .getByRole("button", {
              name: "Ver detalhes de Joana Revisada",
              exact: true,
            })
            .count(),
          0,
        );
        await crud
          .getByRole("button", { name: "Desfazer", exact: true })
          .click();
        assert.equal(
          await crud
            .getByRole("button", {
              name: "Ver detalhes de Joana Revisada",
              exact: true,
            })
            .count(),
          1,
        );
        await crud
          .getByRole("button", { name: "Convidados", exact: true })
          .click();
        assert.equal(await crud.locator(".ds-crud-row").count(), 1);
        await crud.getByRole("button", { name: "Todos", exact: true }).click();
        await crud
          .getByLabel("Buscar usuários", { exact: true })
          .fill("nothing");
        assert.equal(await crud.locator(".ds-crud-row").count(), 0);
        await crud
          .getByRole("button", { name: "Limpar filtros", exact: true })
          .click();
        await crud
          .getByLabel("Ordenar registros", { exact: true })
          .selectOption("Mais recentes");
        assert.match(
          await crud.locator(".ds-crud-row").first().innerText(),
          /Joana Revisada/,
        );
        for (const entity of ["Colaboradores", "Departamentos", "Usuários"]) {
          menu = await openNav(crud);
          await menu.getByRole("button", { name: entity, exact: true }).click();
          assert.match(
            await crud.locator(".ds-wb-breadcrumb").innerText(),
            new RegExp(entity),
          );
        }
        step(
          "CRUD create/read/edit/delete/cancel/undo/filter/sort; three entities",
        );
        // Chart controls are also reachable by touch and keyboard, with text alternatives.
        const gallery = page.locator(".ds-viz-gallery"),
          trend = gallery.locator(".ds-viz-trend");
        assert.match(await trend.locator(".ds-viz-summary").innerText(), /616/);
        await trend
          .getByLabel("Período do gráfico de receita", { exact: true })
          .selectOption("12 meses");
        assert.match(
          await trend.locator(".ds-viz-summary").innerText(),
          /1.054/,
        );
        await trend
          .getByRole("button", { name: "Comparação visível", exact: true })
          .click();
        assert.equal(
          await trend
            .getByRole("button", { name: "Comparação oculta", exact: true })
            .getAttribute("aria-pressed"),
          "false",
        );
        await trend
          .getByRole("button", { name: "Ver dados", exact: true })
          .click();
        assert.equal(await trend.locator("tbody tr").count(), 4);
        await trend
          .getByRole("button", { name: "Ocultar dados", exact: true })
          .click();
        await trend
          .getByLabel("Período do gráfico de receita", { exact: true })
          .selectOption("6 meses");
        const composition = gallery.locator(".ds-viz-composition");
        const services = composition.getByRole("button", {
          name: "Serviços 58%",
          exact: true,
        });
        if (mobile) await services.tap();
        else await services.click();
        assert.match(
          await composition.locator(".ds-viz-donut-center").innerText(),
          /58/,
        );
        const cashflow = gallery
          .locator("article")
          .filter({
            has: page.getByRole("heading", {
              name: "Entradas com intenção.",
              exact: true,
            }),
          });
        assert.equal(
          await cashflow.locator(".recharts-bar-rectangle path").count(),
          12,
          "Both flow series render, not just the axes",
        );
        await gallery
          .getByRole("button", { name: "Saldo", exact: true })
          .click();
        assert.equal(
          await gallery
            .getByRole("button", { name: "Saldo", exact: true })
            .getAttribute("aria-pressed"),
          "true",
        );
        assert.equal(
          await cashflow.locator(".recharts-bar-rectangle path").count(),
          6,
          "Balance series renders",
        );
        await gallery
          .getByRole("button", { name: "Fluxo", exact: true })
          .click();
        assert.equal(
          await cashflow.locator(".recharts-bar-rectangle path").count(),
          12,
          "Flow returns after switching",
        );
        await gallery.getByText("Consultar valores", { exact: true }).click();
        assert.equal(await gallery.locator("details tbody tr").count(), 6);
        step("Chart comparison, totals, tables, donut tap and cashflow toggle");
        const audits = [];
        for (const selector of [
          "#experiencia",
          "#telas-crud",
          ".ds-viz-gallery",
        ])
          audits.push({ selector, ...(await checkHorizontal(selector)) });
        if (mobile) {
          const short = await page
            .locator(
              ".ds-workbench button:visible,.ds-workbench select:visible,.ds-workbench input:visible,.ds-viz-gallery button:visible,.ds-viz-gallery select:visible",
            )
            .evaluateAll((els) =>
              els
                .map((el) => ({
                  label: el.getAttribute("aria-label") || el.textContent.trim(),
                  height: el.getBoundingClientRect().height,
                  width: el.getBoundingClientRect().width,
                }))
                .filter((r) => r.height < 43.9 || r.width < 43.9),
            );
          assert.deepEqual(short, [], "Scoped mobile touch targets >=44px");
        }
        // Screenshots of the actual content, beyond the section headings.
        for (const [sel, label] of [
          [".ds-crud-directory", "crud-cards"],
          [".ds-viz-gallery", "charts"],
          ["#experiencia .ds-workbench", "shell"],
        ]) {
          await page
            .locator(sel)
            .evaluate((e) =>
              window.scrollTo(0, scrollY + e.getBoundingClientRect().top - 90),
            );
          await page.screenshot({
            path: path.join(out, `${label}-tested-${width}.png`),
          });
        }
        if (mobile) {
          await page.setViewportSize({ width, height: 500 });
          await crud
            .getByRole("button", { name: "Convidar usuário", exact: true })
            .click();
          await dialog
            .getByLabel("E-mail", { exact: true })
            .fill("small@example.com");
          await dialog
            .getByRole("button", { name: "Cancelar", exact: true })
            .click();
          await dialog.waitFor({ state: "hidden" });
          await page.setViewportSize({ width, height: 844 });
          step("Short viewport dialog scroll and cancellation");
        }
        const theme = page
          .locator(".ds-header-actions")
          .getByRole("button", { name: /tema/i });
        if (await theme.count()) await theme.first().click();
        else throw Error("Missing theme button");
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          "dark",
        );
        const dark = await gallery
          .locator(".ds-viz")
          .first()
          .evaluate((e) => ({
            bg: getComputedStyle(e).backgroundColor,
            ink: getComputedStyle(e).color,
            primary: getComputedStyle(e)
              .getPropertyValue("--dv-primary")
              .trim(),
          }));
        assert.equal(dark.primary, "#a49aff");
        assert.notEqual(dark.bg, "rgb(255, 255, 255)");
        await page
          .locator(".ds-viz-gallery")
          .evaluate((e) =>
            window.scrollTo(0, scrollY + e.getBoundingClientRect().top - 90),
          );
        await page.screenshot({
          path: path.join(out, `charts-dark-${width}.png`),
        });
        await experience
          .getByRole("button", { name: "Abrir perfil do usuário", exact: true })
          .click();
        assert.notEqual(
          await dialog.evaluate((e) => getComputedStyle(e).backgroundColor),
          "rgb(255, 255, 255)",
        );
        await close();
        assert.deepEqual(errors, []);
        assert.deepEqual(mutations, []);
        step("Dark charts and portal; no runtime errors or server writes");
        results.push({
          width,
          mobile,
          deviceScaleFactor: mobile ? 2 : 1,
          checks,
          audits,
          dark,
          errors,
          mutations,
          status: "passed",
        });
      } catch (e) {
        await page.screenshot({ path: path.join(out, `FAIL-${width}.png`) });
        console.error("FAIL", width, e);
        results.push({
          width,
          status: "failed",
          error: String(e),
          checks,
          errors,
        });
        throw e;
      } finally {
        await context.close();
        fs.writeFileSync(
          path.join(out, "interaction-results.json"),
          JSON.stringify({ playwright: version, results }, null, 2),
        );
      }
    }
  } finally {
    await browser.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
