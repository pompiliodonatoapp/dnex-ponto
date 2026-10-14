import type { CardProps, ButtonProps, BadgeProps, AlertProps, StatCardProps, EmptyStateProps, SectionPanelProps, PageHeaderProps } from "../types";

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function Button({ children, variant = "primary", size = "md", onClick, disabled, className = "" }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = variant === "primary"
    ? "bg-[var(--tone-action-fg)] text-white hover:bg-blue-700"
    : "bg-[var(--bg-subtle)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--bg)]";
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3";

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const toneClasses = {
    success: "bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)]",
    warning: "bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)]",
    danger: "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]",
    action: "bg-[var(--tone-action-bg)] text-[var(--tone-action-fg)]",
    neutral: "bg-[var(--bg-subtle)] text-[var(--fg-muted)]",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function Alert({ children, tone = "info", title }: AlertProps) {
  const toneClasses = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`border rounded-lg p-4 ${toneClasses[tone]}`}>
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function StatCard({ label, value, icon, tone }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        {icon && <div className="text-[var(--tone-action-fg)]">{icon}</div>}
        <div>
          <div className="text-2xl font-bold" style={{ color: "var(--fg)" }}>{value}</div>
          <div className="text-sm text-[var(--fg-muted)]">{label}</div>
        </div>
      </CardBody>
    </Card>
  );
}

export function StatsGrid({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--fg-muted)] mb-3">{label}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mx-auto mb-4 text-[var(--fg-muted)] opacity-40">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--fg)" }}>{title}</h3>
      {description && <p className="text-sm text-[var(--fg-muted)]">{description}</p>}
    </div>
  );
}

export function SectionPanel({ children, title, icon }: SectionPanelProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-[var(--tone-action-fg)]">{icon}</span>}
        <h2 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--fg)" }}>{title}</h1>
      {description && <p className="text-[var(--fg-muted)]">{description}</p>}
    </div>
  );
}