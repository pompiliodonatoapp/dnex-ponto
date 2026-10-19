/**
 * Telas de autenticação (page templates) — prontas para os apps do hub.
 * Cada tela recebe callbacks e estados; não fala com backend.
 * Todas vivem no <AuthLayout>.
 */
export { AuthCard, AuthLink } from "./AuthCard";
export type { AuthCardProps } from "./AuthCard";

export { LoginScreen } from "./LoginScreen";
export type { LoginScreenProps, LoginValues } from "./LoginScreen";

export { SignupScreen } from "./SignupScreen";
export type { SignupScreenProps, SignupValues } from "./SignupScreen";

export { ForgotPasswordScreen } from "./ForgotPasswordScreen";
export type {
  ForgotPasswordScreenProps,
  ForgotPasswordValues,
} from "./ForgotPasswordScreen";

export { ResetPasswordScreen } from "./ResetPasswordScreen";
export type {
  ResetPasswordScreenProps,
  ResetPasswordValues,
} from "./ResetPasswordScreen";

export { VerifyEmailScreen } from "./VerifyEmailScreen";
export type { VerifyEmailScreenProps } from "./VerifyEmailScreen";

export { MfaScreen } from "./MfaScreen";
export type { MfaScreenProps } from "./MfaScreen";

export { AcceptInviteScreen } from "./AcceptInviteScreen";
export type {
  AcceptInviteScreenProps,
  AcceptInviteValues,
} from "./AcceptInviteScreen";

export { AccountBlockedScreen } from "./AccountBlockedScreen";
export type {
  AccountBlockedScreenProps,
  AccountBlockedReason,
} from "./AccountBlockedScreen";
