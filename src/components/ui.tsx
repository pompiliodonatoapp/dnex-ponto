import { Alert as DnexAlert, Badge, Button, Card, CardBody, EmptyState, PageHeader, SectionPanel, StatCard } from "@dnex/ds";
import type { AlertProps } from "../types";

export { Badge, Button, Card, CardBody, EmptyState, PageHeader, SectionPanel, StatCard };

export function Alert({ tone = "info", ...props }: AlertProps) {
  return <DnexAlert tone={tone === "error" ? "danger" : tone} {...props} />;
}

export function StatsGrid({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><h3 className="mb-3 text-sm font-semibold text-fg-muted">{label}</h3><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div></div>;
}
