import type { ReactNode } from "react";

/**
 * Authorization is resolved by the control plane before this manifest reaches
 * the browser. The shell only renders the already-filtered visibility result.
 */
export type ShellProduct = {
  /** Host-supplied descriptive status; it never grants access. */
  statusLabel?: string;
  attention?: boolean;
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  visible: boolean;
  badge?: string | number;
};

type ShellNavigationItemPresentation = {
  key: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: string | number;
  /** Quando falso, o item continua no drawer mas não ocupa a barra inferior. */
  mobile?: boolean;
};

/** Leaf: real URL or host-owned local view. */
export type ShellNavigationLeaf = ShellNavigationItemPresentation & (
  | { kind?: "link"; href: string; onSelect?: never }
  | { kind: "action"; onSelect: () => void; href?: never }
);

/** Group: container with children (which may include nested groups). */
export type ShellNavigationGroup = ShellNavigationItemPresentation & {
  kind: "group";
  children: readonly ShellNavigationItem[];
  href?: never;
  onSelect?: never;
  /** mobile=false on a group excludes all descendants from mobile shortcuts. */
  mobile?: boolean;
};

/** Navigation item — leaf or group. Supports N-level nesting: group→group→...→leaf. */
export type ShellNavigationItem = ShellNavigationLeaf | ShellNavigationGroup;

export type ShellNavigationSection = {
  key: string;
  label?: string;
  items: readonly ShellNavigationItem[];
};

/**
 * Navigation owned by the DNEX platform rather than a product domain.
 * The control plane must filter these items before they reach the browser.
 * It renders in the topbar; keep people management nested below Settings so
 * it never leaks into a product's contextual navigation.
 */
export type ShellGlobalNavigationItem = {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  visible: boolean;
  badge?: string | number;
};

export function visibleShellProducts(products: readonly ShellProduct[]): ShellProduct[] {
  return products.filter((product) => product.visible);
}

export function visibleShellGlobalNavigation(items: readonly ShellGlobalNavigationItem[]): ShellGlobalNavigationItem[] {
  return items.filter((item) => item.visible);
}

/**
 * Normalizes text for search: removes diacritics and collapses whitespace.
 * Used for accent-insensitive, case-insensitive matching.
 */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Recursively collects all leaf items in DFS order across all sections.
 * Groups are traversed recursively but not included in the result.
 * Supports N-level nesting (group→group→...→leaf).
 */
export function navigationLeaves(sections: readonly ShellNavigationSection[]): ShellNavigationLeaf[] {
  const result: ShellNavigationLeaf[] = [];
  const collectFromItems = (items: readonly ShellNavigationItem[]): void => {
    for (const item of items) {
      if (item.kind === "group") {
        collectFromItems(item.children);
      } else {
        result.push(item);
      }
    }
  };
  for (const section of sections) {
    collectFromItems(section.items);
  }
  return result;
}

/**
 * Recursively finds the first active leaf key using DFS pre-order traversal.
 * Returns null if no leaf is active; groups are never returned as active.
 * Supports N-level nesting.
 */
export function activeNavigationKey(sections: readonly ShellNavigationSection[]): string | null {
  const searchInItems = (items: readonly ShellNavigationItem[]): string | null => {
    for (const item of items) {
      if (item.kind === "group") {
        const found = searchInItems(item.children);
        if (found !== null) return found;
      } else if (item.active) {
        return item.key;
      }
    }
    return null;
  };
  for (const section of sections) {
    const found = searchInItems(section.items);
    if (found !== null) return found;
  }
  return null;
}

/**
 * Recursively returns all ancestor group keys of the given leaf key in DFS order.
 * Returns empty array if the leaf is not found or is not nested in any group.
 * Supports N-level nesting (group→group→...→leaf).
 */
export function ancestorKeysOf(
  leafKey: string,
  sections: readonly ShellNavigationSection[],
): string[] {
  const searchInItems = (items: readonly ShellNavigationItem[], path: string[]): string[] | null => {
    for (const item of items) {
      if (item.kind === "group") {
        const found = searchInItems(item.children, [...path, item.key]);
        if (found !== null) return found;
      } else if (item.key === leafKey) {
        return path;
      }
    }
    return null;
  };
  for (const section of sections) {
    const found = searchInItems(section.items, []);
    if (found !== null) return found;
  }
  return [];
}

/**
 * Recursively collects all mobile-eligible leaves (top N) for mobile shortcuts.
 * mobile=false on a group excludes ALL descendants from shortcuts.
 */
export function mobileNavigationLeaves(
  sections: readonly ShellNavigationSection[],
  limit = 4,
): ShellNavigationLeaf[] {
  const leaves: ShellNavigationLeaf[] = [];
  const collect = (items: readonly ShellNavigationItem[]): void => {
    if (leaves.length >= limit) return;
    for (const item of items) {
      if (leaves.length >= limit) return;
      if (item.kind === "group") {
        if (item.mobile !== false) {
          collect(item.children);
        }
      } else if (item.mobile !== false) {
        leaves.push(item);
      }
    }
  };
  for (const section of sections) {
    collect(section.items);
  }
  return leaves;
}

/**
 * Recursively filters navigation sections by search query, returning a filtered tree.
 * Does not mutate the original sections. Preserves original leaf references.
 * Section headings are kept if any item in the section matches.
 */
export function filterNavigationSections(
  sections: readonly ShellNavigationSection[],
  query: string,
): readonly ShellNavigationSection[] {
  if (!query.trim()) return sections;
  const q = normalizeForSearch(query);

  const filterItems = (items: readonly ShellNavigationItem[]): ShellNavigationItem[] => {
    const result: ShellNavigationItem[] = [];
    for (const item of items) {
      if (item.kind === "group") {
        const labelMatches = normalizeForSearch(item.label).includes(q);
        const filteredChildren = filterItems(item.children);
        if (labelMatches || filteredChildren.length > 0) {
          // When group label matches, include with ALL original children
          // When only children match, include with filtered children
          result.push({
            ...item,
            children: labelMatches ? item.children : filteredChildren,
          });
        }
      } else {
        if (normalizeForSearch(item.label).includes(q)) {
          result.push(item);
        }
      }
    }
    return result;
  };

  const filtered: ShellNavigationSection[] = [];
  for (const section of sections) {
    // Check if section label matches
    const sectionLabelMatches = section.label ? normalizeForSearch(section.label).includes(q) : false;
    const filteredItems = filterItems(section.items);
    if (sectionLabelMatches || filteredItems.length > 0) {
      // When section label matches, include all items
      filtered.push({
        ...section,
        items: sectionLabelMatches ? section.items : filteredItems,
      });
    }
  }
  return filtered;
}
