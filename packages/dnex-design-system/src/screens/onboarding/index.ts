/**
 * Telas de Onboarding (D2b) — page templates da jornada pós-signup: criar
 * workspace, setup guiado (Wizard) e convidar a equipe. Conteúdo ilustrativo;
 * o provisionamento real (tenant, Stripe, RBAC) é do servidor.
 */

export { CreateWorkspaceScreen } from "./CreateWorkspaceScreen";
export type {
  CreateWorkspaceScreenProps,
  CreateWorkspaceValues,
} from "./CreateWorkspaceScreen";

export { SetupWizardScreen } from "./SetupWizardScreen";
export type { SetupWizardScreenProps, SetupData } from "./SetupWizardScreen";

export { InviteTeamScreen } from "./InviteTeamScreen";
export type {
  InviteTeamScreenProps,
  PendingInvite,
} from "./InviteTeamScreen";
