/**
 * Telas de Configurações (D2a) — page templates compostos sobre o
 * SettingsLayout. Cada um recebe callbacks e mostra estados; conteúdo é
 * responsabilidade de quem usa (ilustrativo na vitrine).
 */

export {
  SettingsSection,
  SettingRow,
  SettingRows,
  SettingsStack,
} from "./parts";
export type { SettingsSectionProps } from "./parts";

export { ProfileSettings } from "./ProfileSettings";
export type { ProfileSettingsProps, ProfileValues } from "./ProfileSettings";

export { SecuritySettings } from "./SecuritySettings";
export type {
  SecuritySettingsProps,
  ChangePasswordValues,
  Session,
} from "./SecuritySettings";

export { CompanySettings } from "./CompanySettings";
export type { CompanySettingsProps, CompanyValues } from "./CompanySettings";

export { TeamSettings, ROLE_LABELS } from "./TeamSettings";
export type {
  TeamSettingsProps,
  TeamMember,
  TeamRole,
  MemberStatus,
  Department,
  InviteValues,
  EditMemberValues,
} from "./TeamSettings";

export { NotificationSettings } from "./NotificationSettings";
export type {
  NotificationSettingsProps,
  NotificationPrefs,
  NotificationKind,
  NotificationChannel,
} from "./NotificationSettings";

export { BillingSettings } from "./BillingSettings";
export type {
  BillingSettingsProps,
  Invoice,
  InvoiceStatus,
  UsageItem,
} from "./BillingSettings";

export { IntegrationsSettings } from "./IntegrationsSettings";
export type {
  IntegrationsSettingsProps,
  Integration,
  IntegrationStatus,
} from "./IntegrationsSettings";

export { ApiKeysSettings } from "./ApiKeysSettings";
export type {
  ApiKeysSettingsProps,
  ApiKey,
  CreateKeyValues,
} from "./ApiKeysSettings";

export { RolesPermissionsSettings } from "./RolesPermissionsSettings";
export type {
  RolesPermissionsSettingsProps,
  RoleMatrix,
  ModuleKey,
  PermissionAction,
} from "./RolesPermissionsSettings";
