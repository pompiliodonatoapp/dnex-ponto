import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/**
 * Guarda da ESCALA DE CAMADAS.
 *
 * O design system publica tokens (`--z-overlay` 1200, `--z-modal` 1300, `--z-popover` 1400,
 * `--z-toast` 1500, `--z-tooltip` 1600) e, até 26/08/2026, 12 componentes os ignoravam com `z-50`
 * cravado. Conviviam três escalas na mesma tela.
 *
 * DEFEITO REAL QUE ISSO CONSERTOU (medido por pixel, não deduzido): com um diálogo aberto, a
 * `Topbar` fixa (`--z-sticky`, 1100) ficava PINTADA POR CIMA da sobreposição do modal (50) — a
 * tela inteira escurecia e a barra do topo continuava acesa. E o `MobileMenu` de tela cheia (50)
 * ficava SOB a barra inferior fixa (1100).
 *
 * O QUE NÃO ERA DEFEITO, e chegou a ser publicado como se fosse: "um Select dentro de um Dialog
 * abre atrás dele". Medido no estado anterior — NÃO ocorria. Os dois portais do Radix são filhos
 * de <body> e o do Select é anexado depois; com z-index empatado, a ordem de documento decide
 * sempre a favor de quem abriu por último. A hierarquia explícita continua sendo a correção certa,
 * mas por outro motivo. Dedução apresentada como medição é o erro que este repositório já
 * registrou nos dois sentidos.
 *
 * Herdado de `dnex-processos/client/src/lib/design-system-layers.test.ts`, que o tinha desde 30/07
 * e nunca chegou às outras cópias — o argumento mais forte a favor do design system único.
 */
const raizDS = fileURLToPath(new URL("../src", import.meta.url));
const raizShell = fileURLToPath(new URL("../../dnex-workspace-shell/src", import.meta.url));

function tsx(base: string): string[] {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsx(join(base, e.name)) : e.name.endsWith(".tsx") ? [join(base, e.name)] : [],
  );
}

/** Só linhas de código: comentário não pode satisfazer asserção de comportamento. */
function codigo(fonte: string): string {
  return fonte
    .split("\n")
    .filter((l) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(l))
    .join("\n");
}

/** Papel de cada componente na pilha GLOBAL. Quem não está aqui não empilha globalmente. */
const PAPEL: Record<string, string> = {
  // sobreposição — abaixo do conteúdo que ela escurece
  "composed/Dialog.tsx": "--z-overlay", "composed/Sheet.tsx": "--z-overlay",
  "composed/ConfirmDialog.tsx": "--z-overlay", "composed/CommandPalette.tsx": "--z-overlay",
  // menu flutuante — ACIMA de modal, senão abre atrás quando aninhado
  "primitives/Select.tsx": "--z-popover", "primitives/Combobox.tsx": "--z-popover",
  "primitives/MultiSelect.tsx": "--z-popover", "composed/Popover.tsx": "--z-popover",
  "composed/DropdownMenu.tsx": "--z-popover", "composed/HoverCard.tsx": "--z-popover",
  "primitives/Tooltip.tsx": "--z-tooltip",
};

/** Conteúdo de modal — o papel que a versão anterior deste teste NÃO cobria com asserção alguma. */
const CONTEUDO_MODAL = ["composed/Dialog.tsx", "composed/Sheet.tsx", "composed/ConfirmDialog.tsx", "composed/CommandPalette.tsx", "shell/Sidebar.tsx"];

test("nenhum componente crava z-index fora dos tokens, em NENHUM pacote", () => {
  // Varre DS inteiro (components, layouts, showcase) E o workspace-shell, que estava sem guarda.
  // `z-0`..`z-30` e `-z-*` são empilhamento LOCAL dentro de um componente e seguem legítimos;
  // proibi-los seria rigor de fachada. `z-40` para cima já disputa a pilha global — a versão
  // anterior parava em `z-50` e deixava `z-40` passar (mutante sobrevivente, medido).
  const infratores: string[] = [];
  for (const [raiz, rotulo] of [[raizDS, "ds"], [raizShell, "shell"]] as const) {
    for (const f of tsx(raiz)) {
      const s = codigo(readFileSync(f, "utf8"));
      for (const m of s.match(/(?<!-)\bz-(?:[4-9]\d|\d{3,}|\[\d+\])/g) ?? []) infratores.push(`${rotulo}:${f.slice(raiz.length + 1)} → ${m}`);
      for (const m of s.match(/zIndex:\s*\d+/g) ?? []) infratores.push(`${rotulo}:${f.slice(raiz.length + 1)} → style ${m}`);
    }
  }
  assert.deepEqual(infratores, [], `use os tokens: ${infratores.join(" | ")}`);
});

test("cada componente usa o token do SEU papel — inclusive conteúdo de modal", () => {
  for (const [arq, token] of Object.entries(PAPEL)) {
    const s = codigo(readFileSync(join(raizDS, "components", arq), "utf8"));
    assert.ok(s.includes(`z-[var(${token})]`), `${arq}: falta ${token} (papel declarado)`);
  }
  // A lacuna que deixava 3 mutantes vivos: nada exigia `--z-modal` no conteúdo de modal, então um
  // ConfirmDialog de exclusão podia renderizar ATRÁS da própria sobreposição e o gate ficava verde.
  for (const arq of CONTEUDO_MODAL) {
    const s = codigo(readFileSync(join(raizDS, "components", arq), "utf8"));
    assert.ok(s.includes("z-[var(--z-modal)]"), `${arq}: o conteúdo de modal precisa de --z-modal (1300), acima da sobreposição (1200)`);
  }
  const toast = codigo(readFileSync(join(raizDS, "components/composed/Toast.tsx"), "utf8"));
  assert.ok(toast.includes("z-[var(--z-toast)]"), "Toast: aviso que o usuário precisa ver não pode ficar sob a barra inferior");
});

test("a sobreposição fica ABAIXO do conteúdo que ela escurece", () => {
  for (const f of ["composed/Dialog.tsx", "composed/Sheet.tsx", "composed/ConfirmDialog.tsx"]) {
    const linha = codigo(readFileSync(join(raizDS, "components", f), "utf8"))
      .split("\n").find((l) => l.includes("Overlay") && l.includes("z-["));
    assert.ok(linha, `${f}: não achei a linha da sobreposição`);
    assert.match(linha, /z-\[var\(--z-overlay\)\]/, `${f}: a sobreposição precisa de --z-overlay; acima disso ela cobre o próprio diálogo`);
  }
});

test("a ordem da escala é estritamente crescente por papel", () => {
  // Sem isto, alguém "arruma" um token e inverte dois papéis sem que nada acuse.
  const tema = readFileSync(fileURLToPath(new URL("../src/styles/theme.css", import.meta.url)), "utf8");
  const valor = (t: string) => Number(tema.match(new RegExp(`--z-${t}:\\s*(\\d+)`))?.[1] ?? NaN);
  const ordem = ["sticky", "overlay", "modal", "popover", "toast", "tooltip"];
  const valores = ordem.map(valor);
  assert.ok(valores.every(Number.isFinite), `token faltando no tema: ${ordem.filter((t) => !Number.isFinite(valor(t)))}`);
  for (let i = 1; i < valores.length; i++) {
    assert.ok(valores[i] > valores[i - 1], `--z-${ordem[i]} (${valores[i]}) tem de ser MAIOR que --z-${ordem[i - 1]} (${valores[i - 1]})`);
  }
});
