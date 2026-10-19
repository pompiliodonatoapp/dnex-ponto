import type { MouseEvent } from "react";

/** Return true synchronously when the host router accepted this URL. */
export type ShellNavigate = (href: string) => boolean;

/** Opt-in host interception, including product URLs on another HTTP(S) origin. */
export type ShellProductNavigate = (productKey: string, href: string) => boolean;

type LinkClick = Pick<MouseEvent<HTMLAnchorElement>,
  "defaultPrevented" | "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey" | "preventDefault"
> & { currentTarget: Pick<HTMLAnchorElement, "getAttribute" | "hasAttribute" | "ownerDocument"> };

function isPlainLinkClick(event: LinkClick, href: string | undefined): href is string {
  const target = event.currentTarget.getAttribute("target");
  return Boolean(href) && !event.defaultPrevented && event.button === 0
    && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
    && !event.currentTarget.hasAttribute("download")
    && (!target || target.toLowerCase() === "_self");
}

function webDestination(event: LinkClick, href: string): URL | null {
  const base = event.currentTarget.ownerDocument.location?.href;
  if (!base || href.startsWith("#")) return null;
  try {
    const destination = new URL(href, base);
    return destination.protocol === "https:" || destination.protocol === "http:" ? destination : null;
  } catch { return null; }
}

/** Only a plain same-window click can invoke the optional SPA adapter. */
export function handleShellLinkClick(event: LinkClick, href: string | undefined, onNavigate?: ShellNavigate, onActivate?: () => void): void {
  if (!isPlainLinkClick(event, href)) return;

  // Cross-origin URLs and hash-only links retain native navigation.
  const base = event.currentTarget.ownerDocument.location?.href;
  const destination = webDestination(event, href);
  const sameOrigin = base && destination && destination.origin === new URL(base).origin;
  // Outside the URL parsing catch: never conceal a host router failure.
  if (sameOrigin && onNavigate?.(href)) event.preventDefault();
  onActivate?.();
}

/** The new callback is opt-in; declining it preserves the pre-existing link behavior. */
export function handleShellProductLinkClick(event: LinkClick, productKey: string, href: string | undefined,
  onProductNavigate?: ShellProductNavigate, onCurrentProductNavigate?: ShellNavigate, onActivate?: () => void): void {
  if (!isPlainLinkClick(event, href)) return;
  if (onProductNavigate && webDestination(event, href) && onProductNavigate(productKey, href) === true) {
    // A host with an async guard must claim the click synchronously, then decide whether to navigate.
    event.preventDefault();
    onActivate?.();
    return;
  }
  handleShellLinkClick(event, href, onCurrentProductNavigate, onActivate);
}
