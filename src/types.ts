import type { ReactNode } from "react";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface BadgeProps {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "action" | "neutral";
}

export interface AlertProps {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
}

export interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: "success" | "warning" | "danger" | "action";
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export interface SectionPanelProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
}