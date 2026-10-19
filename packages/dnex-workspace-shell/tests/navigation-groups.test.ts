/**
 * Unit tests for navigation helpers in manifest.ts.
 * Uses node --test --experimental-strip-types
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  activeNavigationKey,
  ancestorKeysOf,
  filterNavigationSections,
  mobileNavigationLeaves,
  navigationLeaves,
  normalizeForSearch,
  type ShellNavigationSection,
} from "../src/manifest.ts";

const sectionsWithTwoLevels: ShellNavigationSection[] = [
  {
    key: "config",
    label: "Configurações",
    items: [
      { key: "grupo-acesso", label: "Acesso", kind: "group", children: [
        { key: "usuarios", label: "Usuários", href: "/config/acesso/usuarios" },
        { key: "permissoes", label: "Permissões", href: "/config/acesso/permissoes" },
      ]},
      { key: "direct-link", label: "Direto", href: "/config/direto" },
    ],
  },
];

const sectionsWithThreeLevels: ShellNavigationSection[] = [
  {
    key: "admin",
    label: "Admin",
    items: [
      { key: "admin-sistema", label: "Sistema", kind: "group", children: [
        { key: "admin-perfis", label: "Perfis", kind: "group", children: [
          { key: "admin-perfis-visualizar", label: "Visualizar", href: "/admin/perfis/visualizar" },
          { key: "admin-perfis-editar", label: "Editar", href: "/admin/perfis/editar" },
        ]},
        { key: "admin-configs", label: "Config", href: "/admin/configs" },
      ]},
      { key: "admin-audit", label: "Audit", href: "/admin/audit" },
    ],
  },
];

test("normalizeForSearch removes accents", () => {
  assert.strictEqual(normalizeForSearch("São Paulo"), "sao paulo");
});

test("normalizeForSearch collapses whitespace", () => {
  assert.strictEqual(normalizeForSearch("  foo   bar  "), "foo bar");
});

test("normalizeForSearch normalizes to lowercase", () => {
  assert.strictEqual(normalizeForSearch("ABC"), "abc");
});

test("navigationLeaves collects all leaves from two-level hierarchy", () => {
  const leaves = navigationLeaves(sectionsWithTwoLevels);
  assert.strictEqual(leaves.length, 3);
  assert.deepStrictEqual(leaves.map(l => l.key), ["usuarios", "permissoes", "direct-link"]);
});

test("navigationLeaves collects all leaves from three-level hierarchy (DFS order)", () => {
  const leaves = navigationLeaves(sectionsWithThreeLevels);
  assert.strictEqual(leaves.length, 4);
  assert.deepStrictEqual(leaves.map(l => l.key), [
    "admin-perfis-visualizar",
    "admin-perfis-editar",
    "admin-configs",
    "admin-audit",
  ]);
});

test("navigationLeaves returns empty array for empty sections", () => {
  assert.strictEqual(navigationLeaves([]).length, 0);
});

test("navigationLeaves handles mixed flat and nested items", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "mixed",
      items: [
        { key: "flat-1", label: "Flat 1", href: "/flat1" },
        { key: "group-1", label: "Group", kind: "group", children: [
          { key: "nested-1", label: "Nested 1", href: "/nested1" },
        ]},
        { key: "flat-2", label: "Flat 2", href: "/flat2" },
      ],
    },
  ];
  const leaves = navigationLeaves(sections);
  assert.deepStrictEqual(leaves.map(l => l.key), ["flat-1", "nested-1", "flat-2"]);
});

test("activeNavigationKey returns active leaf key from two-level group", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "config",
      items: [
        { key: "grupo-acesso", label: "Acesso", kind: "group", children: [
          { key: "usuarios", label: "Usuários", href: "/usuarios" },
          { key: "permissoes", label: "Permissões", href: "/permissoes", active: true },
        ]},
      ],
    },
  ];
  assert.strictEqual(activeNavigationKey(sections), "permissoes");
});

test("activeNavigationKey returns first active leaf in DFS order (three levels)", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "admin",
      items: [
        { key: "admin-sistema", label: "Sistema", kind: "group", children: [
          { key: "admin-perfis", label: "Perfis", kind: "group", children: [
            { key: "admin-perfis-visualizar", label: "Visualizar", href: "/v" },
            { key: "admin-perfis-editar", label: "Editar", href: "/e", active: true },
          ]},
        ]},
      ],
    },
  ];
  assert.strictEqual(activeNavigationKey(sections), "admin-perfis-editar");
});

test("activeNavigationKey returns null when no active leaf", () => {
  assert.strictEqual(activeNavigationKey(sectionsWithTwoLevels), null);
});

test("activeNavigationKey returns null for empty sections", () => {
  assert.strictEqual(activeNavigationKey([]), null);
});

test("ancestorKeysOf returns ancestor keys for two-level nesting", () => {
  const ancestors = ancestorKeysOf("usuarios", sectionsWithTwoLevels);
  assert.deepStrictEqual(ancestors, ["grupo-acesso"]);
});

test("ancestorKeysOf returns all ancestor keys for three-level nesting in order", () => {
  const ancestors = ancestorKeysOf("admin-perfis-editar", sectionsWithThreeLevels);
  assert.deepStrictEqual(ancestors, ["admin-sistema", "admin-perfis"]);
});

test("ancestorKeysOf returns empty array for leaf with no ancestors", () => {
  const ancestors = ancestorKeysOf("direct-link", sectionsWithTwoLevels);
  assert.deepStrictEqual(ancestors, []);
});

test("ancestorKeysOf returns empty array for non-existent key", () => {
  const ancestors = ancestorKeysOf("non-existent", sectionsWithTwoLevels);
  assert.deepStrictEqual(ancestors, []);
});

test("ancestorKeysOf returns empty array for empty sections", () => {
  assert.deepStrictEqual(ancestorKeysOf("any", []), []);
});

test("ancestorKeysOf returns correct ancestors across multiple sections", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "section-1",
      items: [
        { key: "group-a", label: "A", kind: "group", children: [
          { key: "leaf-a1", label: "A1", href: "/a1" },
        ]},
      ],
    },
    {
      key: "section-2",
      items: [
        { key: "group-b", label: "B", kind: "group", children: [
          { key: "leaf-b1", label: "B1", href: "/b1" },
        ]},
      ],
    },
  ];
  assert.deepStrictEqual(ancestorKeysOf("leaf-a1", sections), ["group-a"]);
  assert.deepStrictEqual(ancestorKeysOf("leaf-b1", sections), ["group-b"]);
});

test("mobileNavigationLeaves returns top 4 eligible leaves", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "test",
      items: [
        { key: "leaf-1", label: "Leaf 1", href: "/1" },
        { key: "leaf-2", label: "Leaf 2", href: "/2" },
        { key: "leaf-3", label: "Leaf 3", href: "/3" },
        { key: "leaf-4", label: "Leaf 4", href: "/4" },
        { key: "leaf-5", label: "Leaf 5", href: "/5" },
      ],
    },
  ];
  const leaves = mobileNavigationLeaves(sections);
  assert.strictEqual(leaves.length, 4);
  assert.deepStrictEqual(leaves.map(l => l.key), ["leaf-1", "leaf-2", "leaf-3", "leaf-4"]);
});

test("mobileNavigationLeaves mobile=false on group excludes all descendants", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "test",
      items: [
        { key: "parent", label: "Parent", kind: "group", mobile: false, children: [
          { key: "child-1", label: "Child 1", href: "/c1" },
          { key: "child-2", label: "Child 2", href: "/c2" },
        ]},
        { key: "visible", label: "Visible", href: "/v" },
      ],
    },
  ];
  const leaves = mobileNavigationLeaves(sections);
  assert.deepStrictEqual(leaves.map(l => l.key), ["visible"]);
});

test("mobileNavigationLeaves mobile=false on individual leaf excludes it", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "test",
      items: [
        { key: "hidden", label: "Hidden", href: "/h", mobile: false },
        { key: "visible", label: "Visible", href: "/v" },
      ],
    },
  ];
  const leaves = mobileNavigationLeaves(sections);
  assert.deepStrictEqual(leaves.map(l => l.key), ["visible"]);
});

test("mobileNavigationLeaves respects custom limit", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "test",
      items: [
        { key: "leaf-1", label: "L1", href: "/1" },
        { key: "leaf-2", label: "L2", href: "/2" },
      ],
    },
  ];
  assert.strictEqual(mobileNavigationLeaves(sections, 1).length, 1);
});

test("mobileNavigationLeaves returns empty array for all mobile=false", () => {
  const sections: ShellNavigationSection[] = [
    {
      key: "test",
      items: [
        { key: "hidden", label: "H", href: "/h", mobile: false },
      ],
    },
  ];
  assert.strictEqual(mobileNavigationLeaves(sections).length, 0);
});

// filterNavigationSections tests

test("filterNavigationSections empty query returns original sections", () => {
  const result = filterNavigationSections(sectionsWithTwoLevels, "");
  assert.strictEqual(result, sectionsWithTwoLevels);
});

test("filterNavigationSections whitespace-only query returns original sections", () => {
  const result = filterNavigationSections(sectionsWithTwoLevels, "   ");
  assert.strictEqual(result, sectionsWithTwoLevels);
});

test("filterNavigationSections leaf label match includes leaf", () => {
  const result = filterNavigationSections(sectionsWithTwoLevels, "usuarios");
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].key, "config");
  // usuarios should be under grupo-acesso which is under config
  const grupoAcesso = result[0].items.find(i => i.key === "grupo-acesso");
  assert.ok(grupoAcesso);
  assert.strictEqual(grupoAcesso.kind, "group");
});

test("filterNavigationSections group label match includes group with all children", () => {
  const result = filterNavigationSections(sectionsWithTwoLevels, "Acesso");
  assert.strictEqual(result.length, 1);
  const grupoAcesso = result[0].items.find(i => i.key === "grupo-acesso");
  assert.ok(grupoAcesso);
  assert.strictEqual(grupoAcesso.kind, "group");
  // When group label matches, all children are preserved
  assert.strictEqual((grupoAcesso as any).children.length, 2);
});

test("filterNavigationSections descendant match includes ancestor with filtered children", () => {
  const result = filterNavigationSections(sectionsWithThreeLevels, "Editar");
  assert.strictEqual(result.length, 1);
  const sistema = result[0].items.find(i => i.key === "admin-sistema");
  assert.ok(sistema);
  assert.strictEqual(sistema.kind, "group");
  const perfis = (sistema as any).children.find((c: any) => c.key === "admin-perfis");
  assert.ok(perfis);
  assert.strictEqual(perfis.kind, "group");
  // Only "Editar" child should be present (not "Visualizar")
  assert.strictEqual((perfis as any).children.length, 1);
  assert.strictEqual((perfis as any).children[0].key, "admin-perfis-editar");
});

test("filterNavigationSections section heading match preserves all items", () => {
  const result = filterNavigationSections(sectionsWithThreeLevels, "Admin");
  // Section label "Admin" matches, so all items in that section are preserved
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].items.length, 2); // Sistema group + audit link
  // All original children of Sistema group preserved
  const sistema = result[0].items.find(i => i.key === "admin-sistema");
  assert.ok(sistema);
  assert.strictEqual(sistema.kind, "group");
  assert.strictEqual((sistema as any).children.length, 2); // perfis + configs
});

test("filterNavigationSections no results returns empty array", () => {
  const result = filterNavigationSections(sectionsWithTwoLevels, "xyz123");
  assert.strictEqual(result.length, 0);
});

test("filterNavigationSections accent-insensitive matching", () => {
  const result = filterNavigationSections(sectionsWithTwoLevels, "Permissoes");
  assert.strictEqual(result.length, 1);
});

test("filterNavigationSections does not mutate original sections", () => {
  const original = JSON.stringify(sectionsWithTwoLevels);
  filterNavigationSections(sectionsWithTwoLevels, "usuarios");
  assert.strictEqual(JSON.stringify(sectionsWithTwoLevels), original);
});
