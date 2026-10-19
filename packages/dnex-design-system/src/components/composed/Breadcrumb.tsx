import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

export type Crumb = { label: string; href?: string };

export type BreadcrumbProps = {
  items: Crumb[];
  className?: string;
};

/**
 * Breadcrumb — trilha de navegação acessível. Último item = página atual
 * (aria-current), sem link.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.85rem]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li>
                {last || !item.href ? (
                  <span
                    aria-current={last ? "page" : undefined}
                    className={cn(last ? "font-medium text-fg" : "text-fg-muted")}
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className="text-fg-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </a>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="text-fg-subtle">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
