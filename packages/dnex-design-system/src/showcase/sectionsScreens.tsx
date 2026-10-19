import { useState } from "react";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import {
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerifyEmailScreen,
  MfaScreen,
  AcceptInviteScreen,
  AccountBlockedScreen,
} from "../screens/auth";
import { AuthLayout, AuthMarketingPanel } from "../layouts/AuthLayout";
import { Badge } from "../components/primitives/Badge";
import { Logo } from "../components/brand/Logo";
import { ThemeSwitcher } from "../components/composed/ThemeSwitcher";
import { Demo } from "./parts";

/**
 * Seção da vitrine: TELAS DE AUTH (D1c) + layouts (D1a).
 *
 * Cada tela é montada com dados ILUSTRATIVOS e callbacks no-op — nenhuma fala
 * com backend. A moldura usa o AuthLayout REAL em modo embedded: a mesma
 * composição da aplicação, contida na altura da prévia. Formulários longos
 * rolam internamente, sem expandir a página nem duplicar a identidade.
 */

const noop = () => {};

type ScreenKey =
  | "login"
  | "signup"
  | "forgot"
  | "forgot-sent"
  | "reset"
  | "verify"
  | "mfa"
  | "invite"
  | "blocked";

const SCREENS: { key: ScreenKey; label: string }[] = [
  { key: "login", label: "Login" },
  { key: "signup", label: "Cadastro" },
  { key: "forgot", label: "Esqueci a senha" },
  { key: "forgot-sent", label: "Link enviado" },
  { key: "reset", label: "Redefinir senha" },
  { key: "verify", label: "Verificar e-mail" },
  { key: "mfa", label: "MFA / 2FA" },
  { key: "invite", label: "Aceitar convite" },
  { key: "blocked", label: "Conta bloqueada" },
];

function renderScreen(key: ScreenKey) {
  switch (key) {
    case "login":
      return (
        <LoginScreen
          onSubmit={noop}
          onForgotPassword={noop}
          onSignup={noop}
          error={null}
        />
      );
    case "signup":
      return (
        <SignupScreen onSubmit={noop} onLogin={noop} />
      );
    case "forgot":
      return <ForgotPasswordScreen onSubmit={noop} onBackToLogin={noop} />;
    case "forgot-sent":
      return (
        <ForgotPasswordScreen
          onSubmit={noop}
          onBackToLogin={noop}
          sent
          sentTo="voce@empresa.com.br"
        />
      );
    case "reset":
      return <ResetPasswordScreen onSubmit={noop} />;
    case "verify":
      return (
        <VerifyEmailScreen
          email="voce@empresa.com.br"
          onVerify={noop}
          onResend={noop}
          onBackToLogin={noop}
          resendIn={0}
        />
      );
    case "mfa":
      return (
        <MfaScreen
          onSubmit={noop}
          onUseRecoveryCode={noop}
          onBackToLogin={noop}
        />
      );
    case "invite":
      return (
        <AcceptInviteScreen
          tenantName="Alpha Comércio Ltda."
          inviterName="Donato Pompilio"
          email="novo.membro@empresa.com.br"
          role="admin"
          mode="signup"
          onAccept={noop}
          onDecline={noop}
        />
      );
    case "blocked":
      return (
        <AccountBlockedScreen
          reason="suspended"
          onContactSupport={noop}
          onLogout={noop}
        />
      );
  }
}

/** Apenas limita a prévia; toda a estrutura visual vem do AuthLayout real. */
function AuthCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="@container/dnex-auth h-[42rem] min-w-0 overflow-hidden rounded-[var(--radius-hero)] border border-line">
      <AuthLayout
        embedded
        mobileBrand={<Logo height={24} />}
        themeToggle={<ThemeSwitcher variant="icon" />}
      >
        {children}
      </AuthLayout>
    </div>
  );
}

export function AuthScreensSection() {
  const [active, setActive] = useState<ScreenKey>("login");

  return (
    <div className="grid gap-6">
      {/* seletor de tela */}
      <div className="flex flex-wrap items-center gap-2">
        {SCREENS.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={active === s.key}
            onClick={() => setActive(s.key)}
            className={
              "inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-[0.82rem] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--action-ring)] " +
              (active === s.key
                ? "border-[rgba(129,139,246,0.4)] bg-[rgba(79,70,229,0.16)] text-fg"
                : "border-line text-fg-muted hover:text-fg")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* canvas com a tela ativa */}
      <AuthCanvas>{renderScreen(active)}</AuthCanvas>

      {/* Split real: a mesma estrutura usada pelos produtos, sem clone visual. */}
      <Demo
        label="AuthLayout — variante split (painel marketing à esquerda em ≥ lg)"
        className="!block"
      >
        <div className="@container/dnex-auth h-[44rem] min-w-0 overflow-hidden rounded-[var(--radius-hero)] border border-line">
          <AuthLayout
            embedded
            themeToggle={<ThemeSwitcher variant="icon" />}
            aside={
              <AuthMarketingPanel
                title={
                  <>
                    Seu negócio,
                    <br />
                    sob controle.
                  </>
                }
                description="Financeiro, fiscal e operacional unificados — do mesmo sistema, com o acabamento do hub DNEX."
              >
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">Multi-tenant</Badge>
                  <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-[var(--color-indigo-300)]">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Isolamento por empresa
                  </span>
                </div>
              </AuthMarketingPanel>
            }
          >
            <LoginScreen onSubmit={noop} onForgotPassword={noop} onSignup={noop} />
          </AuthLayout>
        </div>
      </Demo>

      <p className="text-[0.78rem] leading-relaxed text-fg-subtle">
        Conteúdo ilustrativo — e-mails, nomes e empresas são exemplos. Métricas e
        depoimentos de marca ficam marcados <span className="font-mono">[CONFIRMAR]</span>{" "}
        até validação do titular. Cada tela recebe <span className="font-mono">onSubmit</span>/
        <span className="font-mono">onResend</span> e expõe estados idle/loading/erro/sucesso.
      </p>
    </div>
  );
}
