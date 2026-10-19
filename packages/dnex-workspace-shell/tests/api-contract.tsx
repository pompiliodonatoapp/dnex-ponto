import { WorkspaceShell, type WorkspaceShellProps } from "../src/index.js";
import type { ShellNavigationItem, ShellNavigationSection } from "../src/manifest.js";
const legacy: WorkspaceShellProps = {
  products: [], currentProductKey: "normas", productLabel: "DNEX Normas", pageLabel: "Biblioteca",
  sections: [], sidebarHeader: <button>Empresa</button>, topbar: <button>Legado</button>,
  topbarCenter: <input />, topbarRight: <button>Conta via grupo DS</button>, children: <p>Conteúdo</p>,
};
const oldUsage = <WorkspaceShell {...legacy} />;
const referenceUsage = <WorkspaceShell {...legacy} onNavigate={() => true} workspaceLabel="Empresa"
  workspaceHref="/" catalogHref="/produtos" productsNotice={<p>Aviso</p>} topbarLeft="Biblioteca"
  topbarActions={<button>Ações</button>} topbarCenterCompact={<button>Buscar</button>} onSearchOpen={() => {}} />;
const invalid = { ...legacy, account: <button>Conta isolada</button> };
// @ts-expect-error Account must not silently disappear when props are spread.
const rejectedUsage = <WorkspaceShell {...invalid} />;
void [oldUsage, referenceUsage, rejectedUsage];

const hostActions: WorkspaceShellProps = { ...legacy, sections: [{ key: "local", items: [
  { key: "callback-view", label: "Balancete", kind: "action", onSelect: () => {}, active: true },
  { key: "real-url", label: "Biblioteca", href: "/normas/biblioteca" },
] }], sidebarBrand: <span>Marca do Hub</span>, onProductNavigate: (key, href) => Boolean(key && href) };
const actionsUsage = <WorkspaceShell {...hostActions} />;
const invalidAction: WorkspaceShellProps = { ...legacy, sections: [{ key: "local", items: [
  // @ts-expect-error Local actions cannot invent a fallback URL.
  { key: "mixed", label: "Inválido", kind: "action", onSelect: () => {}, href: "/inventado" },
] }] };
const missingAction: WorkspaceShellProps = { ...legacy, sections: [{ key: "local", items: [
  // @ts-expect-error An action without its host callback cannot be selected.
  { key: "missing", label: "Inválido", kind: "action" },
] }] };
// @ts-expect-error Async guards belong in the host; claiming a link must be synchronous.
const asyncProductUsage = <WorkspaceShell {...legacy} onProductNavigate={async () => true} />;
void [actionsUsage, invalidAction, missingAction, asyncProductUsage];

// Group navigation items — single level with mixed children (links and actions)
const groupSections: ShellNavigationSection[] = [{
  key: "config", label: "Configurações", items: [
    { key: "grupo-acesso", label: "Acesso", kind: "group", children: [
      { key: "usuarios", label: "Usuários", href: "/config/acesso/usuarios" },
      { key: "permissoes", label: "Permissões", href: "/config/acesso/permissoes" },
    ] satisfies ShellNavigationItem[]},
    { key: "integracoes", label: "Integrações", kind: "group", children: [
      { key: "webhooks", label: "Webhooks", kind: "action", onSelect: () => {} },
    ] satisfies ShellNavigationItem[]},
    { key: "direct-link", label: "Direto", href: "/config/direto" },
  ] as const,
}];
const groupUsage = <WorkspaceShell {...legacy} sections={groupSections} navigationSearchLabel="Buscar no menu…" />;

// Group with href — type error expected
// @ts-expect-error Groups cannot have href.
const groupWithHref: ShellNavigationItem = { key: 'g', label: 'Grupo', kind: 'group', href: '/invalido', children: [] };

// Group with onSelect — type error expected
// @ts-expect-error Groups cannot have onSelect.
const groupWithOnSelect: ShellNavigationItem = { key: 'g', label: 'Grupo', kind: 'group', onSelect: () => {}, children: [] };

// Two-level nested groups (group→group→leaf) — validates N-level recursion
const nestedGroupSections: ShellNavigationSection[] = [{
  key: "admin", label: "Administração", items: [
    { key: "admin-sistema", label: "Sistema", kind: "group", children: [
      { key: "admin-perfis", label: "Perfis", kind: "group", children: [
        { key: "admin-perfis-visualizar", label: "Visualizar", href: "/admin/perfis/visualizar" },
        { key: "admin-perfis-editar", label: "Editar", href: "/admin/perfis/editar", active: true },
      ] as const},
      { key: "admin-configs", label: "Configurações", href: "/admin/configs" },
    ] as const},
    { key: "admin-audit", label: "Auditoria", href: "/admin/audit" },
  ] as const,
}];
const nestedGroupUsage = <WorkspaceShell {...legacy} sections={nestedGroupSections} />;

// mobile=false on grandparent excludes all descendants from mobile shortcuts
const mobileExclusionSections: ShellNavigationSection[] = [{
  key: "tools", label: "Ferramentas", items: [
    { key: "tools-parent", label: "Pai", kind: "group", mobile: false, children: [
      { key: "tools-child", label: "Filho", href: "/tools/child" },
    ] as const},
    { key: "tools-visible", label: "Visível", href: "/tools/visible" },
  ] as const,
}];
const mobileExclusionUsage = <WorkspaceShell {...legacy} sections={mobileExclusionSections} />;

void [groupUsage, nestedGroupUsage, mobileExclusionUsage];
