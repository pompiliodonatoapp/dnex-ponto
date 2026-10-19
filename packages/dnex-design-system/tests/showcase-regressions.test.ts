import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { navGroups } from "../src/showcase/navigation.ts";

const source = (name: string) =>
  readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8");

test("o índice mantém destinos únicos e todos os grupos do catálogo", () => {
  const ids = navGroups.flatMap((group) => group.items.map((item) => item.id));
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(navGroups.length, 6);
  for (const id of [
    "foundations",
    "identidade-produtos",
    "primitivos",
    "formularios",
    "inputs-br",
    "dados",
    "sidebar",
    "topbar",
    "shell",
    "responsivo",
    "telas-crud",
    "telas-onboarding",
  ])
    assert.ok(ids.includes(id), `Destino preservado: ${id}`);
});

test("a vitrine não registra duas paletas no mesmo atalho global", () => {
  assert.doesNotMatch(
    source("showcase/sectionsC5.tsx"),
    /useCommandPalette\s*\(/,
  );
  assert.match(
    source("showcase/ShowcaseExperience.tsx"),
    /event\.metaKey\s*\|\|\s*event\.ctrlKey/,
  );
});

test("onboarding preserva autofocus padrão no produto, mas não na vitrine", () => {
  const screen = source("screens/onboarding/CreateWorkspaceScreen.tsx");
  assert.match(screen, /autoFocus\s*=\s*true/);
  assert.match(screen, /autoFocus=\{autoFocus\}/);
  const instances =
    source("showcase/sectionsScreens2.tsx").match(
      /<CreateWorkspaceScreen[\s\S]*?\/>/g,
    ) ?? [];
  assert.equal(instances.length, 2);
  for (const instance of instances)
    assert.match(instance, /autoFocus=\{false\}/);
});

test("a abertura não importa estaticamente o catálogo pesado", () => {
  const app = source("showcase/App.tsx");
  assert.match(app, /lazy\(\(\) => import\("\.\/Catalog"\)\)/);
  assert.doesNotMatch(app, /import .* from ["']\.\/Catalog["']/);
  assert.match(source("main.tsx"), /storageKey="dnex-showcase-theme"/);
});

test("seções longas nunca dependem de um limiar de interseção para ficar visíveis", () => {
  const parts = source("showcase/parts.tsx");
  assert.doesNotMatch(
    parts,
    /motion\.section|\.\.\.inView|variants=\{fadeUp\}/,
  );
  assert.match(parts, /<section/);
});

test("experiência e CRUD usam o mesmo shell, sem moldura do layout antigo", () => {
  assert.match(source("showcase/ShowcaseExperience.tsx"), /<PreviewShell/);
  assert.match(source("showcase/ModernCrud.tsx"), /<PreviewShell/);
  assert.match(source("showcase/sectionsCrud.tsx"), /<ModernCrud/);
  assert.doesNotMatch(
    source("showcase/sectionsCrud.tsx"),
    /AppLayout|Avatar|userFooter/,
  );
});

test("perfil, busca e assistência ficam na topbar; empresa fica no contexto", () => {
  const shell = source("showcase/PreviewShell.tsx");
  const sidebar = shell.slice(
    shell.indexOf("const sidebar"),
    shell.indexOf('role="region"'),
  );
  assert.match(sidebar, /ds-wb-company/);
  assert.doesNotMatch(sidebar, /ds-wb-search|Notificações|Ajuda e suporte/);
  assert.doesNotMatch(sidebar, /ds-wb-profile|Mais foco|Menos complexidade/);
  const topbar = shell.slice(
    shell.indexOf('<header className="ds-wb-topbar"'),
    shell.indexOf("</header>"),
  );
  assert.match(topbar, /ds-wb-profile/);
  assert.match(topbar, /ds-wb-topbar-search/);
  assert.match(topbar, /Bell|CircleHelp/);
  assert.match(
    source("styles/workbench.css"),
    /\.ds-wb-company\s*\{[^}]*border: 0;[^}]*background: transparent;/,
  );
});

test("mobile tem painel navegável, cartões de cadastro e retorno de foco", () => {
  assert.match(source("showcase/PreviewShell.tsx"), /Dialog\.Content/);
  assert.match(source("showcase/PreviewShell.tsx"), /onCloseAutoFocus/);
  const css = source("styles/workbench.css");
  assert.match(css, /\.ds-wb-drawer/);
  assert.match(css, /100dvh/);
  assert.match(css, /\.ds-crud-column-head\s*\{\s*display: none/);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test("gráficos têm dados alternativos, escala de radar fixa e sem animação compulsória", () => {
  const viz = source("showcase/DataViz.tsx");
  assert.match(viz, /<caption>/);
  assert.match(viz, /domain=\{\[0, 100\]\}/);
  assert.match(viz, /isAnimationActive=\{false\}/);
  assert.match(viz, /aria-pressed=\{comparison\}/);
  const barChart = viz.slice(
    viz.indexOf("<BarChart"),
    viz.indexOf("</BarChart>"),
  );
  assert.doesNotMatch(
    barChart,
    /<>/,
    "Series must be direct children in this runtime",
  );
});

test("catálogo referencia uma experiência e não monta os shells antigos", () => {
  assert.doesNotMatch(
    source("showcase/Catalog.tsx"),
    /ShellDemo|DeviceFrame|shellView/,
  );
  assert.doesNotMatch(
    source("showcase/sectionsShellV11.tsx"),
    /TwoTierShellPreview/,
  );
  assert.match(source("showcase/Catalog.tsx"), /<ShellAnatomy/);
});
