import { useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  KeyRound,
  Plug,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";

import { SettingsLayout } from "../layouts/SettingsLayout";
import type { SettingsNavItem } from "../layouts/SettingsLayout";
import { AuthLayout, AuthMarketingPanel } from "../layouts/AuthLayout";
import { Logo } from "../components/brand/Logo";
import { ThemeSwitcher } from "../components/composed/ThemeSwitcher";
import { Badge } from "../components/primitives/Badge";

import {
  ProfileSettings,
  SecuritySettings,
  CompanySettings,
  TeamSettings,
  NotificationSettings,
  BillingSettings,
  IntegrationsSettings,
  ApiKeysSettings,
  RolesPermissionsSettings,
} from "../screens/settings";
import type { TeamMember, Department, Session } from "../screens/settings";
import {
  CreateWorkspaceScreen,
  SetupWizardScreen,
  InviteTeamScreen,
} from "../screens/onboarding";
import { Demo } from "./parts";

/**
 * Vitrine das TELAS DE CONFIGURAÇÕES (D2a) e ONBOARDING (D2b).
 *
 * Configurações: hospeda as telas no SettingsLayout REAL — a nav lateral troca
 * a seção, exatamente como num app. Onboarding: o AuthLayout REAL em modo
 * embedded, com seletor de tela e rolagem interna dos fluxos longos.
 *
 * Todo conteúdo é ILUSTRATIVO — e-mails, empresas, CNPJ e chaves são exemplos
 * sintéticos; valores de plano/billing ficam marcados [CONFIRMAR].
 */

const noop = () => {};

/* ════════════════ dados ilustrativos ════════════════ */

const DEPARTMENTS: Department[] = [
  { id: "d1", name: "Diretoria" },
  { id: "d2", name: "Fiscal" },
  { id: "d3", name: "Contábil" },
  { id: "d4", name: "Pessoal / Folha" },
  { id: "d5", name: "Financeiro" },
];

const MEMBERS: TeamMember[] = [
  { id: "1", name: "Donato Pompilio", email: "donato@empresa.com.br", role: "owner", status: "active", departmentId: "d1" },
  { id: "2", name: "Marina Alves", email: "marina@empresa.com.br", role: "admin", status: "active", departmentId: "d2" },
  { id: "3", name: "Rafael Souza", email: "rafael@empresa.com.br", role: "member", status: "active", departmentId: "d3" },
  { id: "4", name: "Bianca Costa", email: "bianca@empresa.com.br", role: "viewer", status: "invited", departmentId: "d4" },
  { id: "5", name: "Paulo Henrique", email: "paulo@empresa.com.br", role: "member", status: "suspended" },
];

const SESSIONS: Session[] = [
  { id: "s1", device: "Chrome · macOS", kind: "desktop", location: "Salvador, BA", lastActive: "agora", current: true },
  { id: "s2", device: "Safari · iPhone", kind: "mobile", location: "Salvador, BA", lastActive: "há 2 h" },
  { id: "s3", device: "Edge · Windows", kind: "desktop", location: "São Paulo, SP", lastActive: "ontem" },
];

const INVOICES = [
  { id: "i1", date: "01/06/2026", description: "Plano Essencial — junho", amount: "R$ 149,00", status: "paid" as const, url: "#" },
  { id: "i2", date: "01/05/2026", description: "Plano Essencial — maio", amount: "R$ 149,00", status: "paid" as const, url: "#" },
  { id: "i3", date: "01/04/2026", description: "Plano Essencial — abril", amount: "R$ 149,00", status: "failed" as const },
];

const USAGE = [
  { label: "Notas fiscais", value: 1840, limit: 5000, unit: "NFs" },
  { label: "Usuários", value: 5, limit: 10 },
  { label: "Armazenamento", value: 7, limit: 8, unit: "GB" },
];

const PLANS = [
  {
    name: "Inicial",
    description: "Para começar a organizar a casa.",
    price: "R$ 0",
    pricePeriod: "/mês",
    features: [
      { label: "Até 3 usuários" },
      { label: "1 empresa" },
      { label: "Suporte por e-mail" },
      { label: "API pública", included: false },
    ],
    ctaLabel: "Selecionar",
  },
  {
    name: "Essencial",
    description: "O equilíbrio para o dia a dia fiscal.",
    price: "R$ 149",
    pricePeriod: "/mês",
    highlighted: true,
    features: [
      { label: "Até 10 usuários" },
      { label: "3 empresas" },
      { label: "Integrações", hint: "5" },
      { label: "API pública", included: false },
    ],
    ctaLabel: "Selecionar",
  },
  {
    name: "Avançado",
    description: "Escala, governança e API.",
    price: "R$ 399",
    pricePeriod: "/mês",
    features: [
      { label: "Usuários ilimitados" },
      { label: "Empresas ilimitadas" },
      { label: "Integrações", hint: "∞" },
      { label: "API pública" },
    ],
    ctaLabel: "Selecionar",
  },
];

const INTEGRATIONS = [
  { id: "stripe", name: "Stripe", description: "Cobrança recorrente e faturas.", status: "connected" as const, meta: "conectado como acct_••••8F2", icon: <CreditCard aria-hidden="true" /> },
  { id: "slack", name: "Slack", description: "Avisos de eventos no seu canal.", status: "available" as const, icon: <Bell aria-hidden="true" /> },
  { id: "drive", name: "Google Drive", description: "Anexe documentos da nuvem.", status: "available" as const, icon: <Plug aria-hidden="true" /> },
  { id: "erp", name: "ERP Legado", description: "Sincronização de cadastros.", status: "error" as const, icon: <Plug aria-hidden="true" /> },
];

const API_KEYS = [
  { id: "k1", name: "Integração Faturas", masked: "dnex_live_••••3f9a", createdAt: "12/03/2026", lastUsed: "há 1 h" },
  { id: "k2", name: "Webhook Conciliação", masked: "dnex_live_••••71c4", createdAt: "28/01/2026", lastUsed: "ontem" },
];

/* ════════════════ Configurações ════════════════ */

type SettingsKey =
  | "profile"
  | "security"
  | "company"
  | "team"
  | "roles"
  | "notifications"
  | "billing"
  | "integrations"
  | "apikeys";

const SETTINGS_NAV: (SettingsNavItem & { id: SettingsKey })[] = [
  { id: "profile", label: "Perfil", icon: <UserRound />, description: "Nome, avatar e idioma" },
  { id: "security", label: "Segurança", icon: <ShieldCheck />, description: "Senha, 2FA e sessões" },
  { id: "company", label: "Empresa", icon: <Building2 />, description: "Dados cadastrais" },
  { id: "team", label: "Equipe", icon: <Users />, description: "Membros e papéis" },
  { id: "roles", label: "Papéis & permissões", icon: <UserCog />, description: "RBAC por módulo" },
  { id: "notifications", label: "Notificações", icon: <Bell />, description: "Canais por evento" },
  { id: "billing", label: "Faturamento", icon: <CreditCard />, description: "Plano, uso e faturas" },
  { id: "integrations", label: "Integrações", icon: <Plug />, description: "Serviços externos" },
  { id: "apikeys", label: "Chaves de API", icon: <KeyRound />, description: "Acesso programático" },
];

function renderSettings(key: SettingsKey): ReactNode {
  switch (key) {
    case "profile":
      return (
        <ProfileSettings
          defaultValues={{ name: "Donato Pompilio", email: "donato@empresa.com.br" }}
          onSubmit={noop}
          onChangeAvatar={noop}
        />
      );
    case "security":
      return (
        <SecuritySettings
          onChangePassword={noop}
          twoFactorEnabled={false}
          onToggleTwoFactor={noop}
          sessions={SESSIONS}
          onRevokeSession={noop}
        />
      );
    case "company":
      return (
        <CompanySettings
          defaultValues={{
            legalName: "Alpha Comércio e Serviços Ltda.",
            tradeName: "Alpha",
            cnpj: "11.222.333/0001-81",
            cep: "41820-021",
            city: "Salvador",
            uf: "BA",
            repName: "Donato Pompilio",
            repCpf: "529.982.247-25",
            repRole: "Sócio-administrador",
            repEmail: "donato@empresa.com.br",
            accountantName: "Marina Alves",
            accountantCrc: "BA-012345/O-7",
            accountantEmail: "marina@empresa.com.br",
            accountantPhone: "(71) 3333-0000",
          }}
          onSubmit={noop}
          onCepComplete={noop}
        />
      );
    case "team":
      return (
        <TeamSettings
          members={MEMBERS}
          departments={DEPARTMENTS}
          onInvite={noop}
          onEdit={noop}
          onChangeRole={noop}
          onRemove={noop}
          onResetPassword={noop}
          onResendInvite={noop}
        />
      );
    case "roles":
      return <RolesPermissionsSettings onSave={noop} />;
    case "notifications":
      return <NotificationSettings onSubmit={noop} />;
    case "billing":
      return (
        <BillingSettings
          planName="Essencial"
          planPrice="R$ 149"
          planStatus={{ label: "Ativo", tone: "success" }}
          usage={USAGE}
          invoices={INVOICES}
          plans={PLANS}
          onOpenPortal={noop}
          onSelectPlan={noop}
        />
      );
    case "integrations":
      return (
        <IntegrationsSettings
          integrations={INTEGRATIONS}
          onConnect={noop}
          onDisconnect={noop}
          onReconnect={noop}
        />
      );
    case "apikeys":
      return (
        <ApiKeysSettings
          keys={API_KEYS}
          onCreate={() => "dnex_live_3f9a72c4e1b8d6a05e2f1c93b7a4d8e0"}
          onRevoke={noop}
        />
      );
  }
}

export function SettingsScreensSection() {
  const [active, setActive] = useState<SettingsKey>("profile");

  return (
    <div className="grid gap-6">
      <Demo
        label="SettingsLayout — nav lateral troca a seção (como num app real)"
        className="!block"
      >
        <div className="rounded-[var(--radius-hero)] border border-line bg-[var(--bg)] p-5 sm:p-7">
          <SettingsLayout
            items={SETTINGS_NAV}
            activeId={active}
            onSelect={(id) => setActive(id as SettingsKey)}
            pageHeader={{
              title: "Configurações",
              description: "Ajuste sua conta, sua empresa e o workspace.",
            }}
          >
            {renderSettings(active)}
          </SettingsLayout>
        </div>
      </Demo>

      <p className="text-[0.78rem] leading-relaxed text-fg-subtle">
        Conteúdo ilustrativo — membros, e-mails, CNPJ e chaves são exemplos
        sintéticos. Valores de plano/faturamento ficam marcados{" "}
        <span className="font-mono">[CONFIRMAR]</span> até validação do titular
        (política de trial/cancelamento e limites por plano). Cada tela recebe
        callbacks (<span className="font-mono">onSubmit</span>/
        <span className="font-mono">onInvite</span>/
        <span className="font-mono">onRevoke</span>…) e desenha estados
        vazio/erro/sucesso.
      </p>
    </div>
  );
}

/* ════════════════ Onboarding ════════════════ */

type OnboardingKey = "create" | "wizard" | "invite";

const ONBOARDING: { key: OnboardingKey; label: string }[] = [
  { key: "create", label: "Criar empresa" },
  { key: "wizard", label: "Setup (Wizard)" },
  { key: "invite", label: "Convidar equipe" },
];

/** Moldura da prévia; estrutura, marca e rolagem pertencem ao AuthLayout. */
function OnboardingCanvas({
  children,
  wide,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="@container/dnex-auth h-[44rem] min-w-0 overflow-hidden rounded-[var(--radius-hero)] border border-line">
      <AuthLayout
        embedded
        mobileBrand={<Logo height={24} />}
        themeToggle={<ThemeSwitcher variant="icon" />}
        contentClassName={wide ? "max-w-2xl" : undefined}
      >
        {children}
      </AuthLayout>
    </div>
  );
}

function renderOnboarding(key: OnboardingKey): ReactNode {
  switch (key) {
    case "create":
      return <CreateWorkspaceScreen onSubmit={noop} onBack={noop} autoFocus={false} />;
    case "wizard":
      return (
        <div className="rounded-[var(--radius-card)] glass glass-edge p-6 sm:p-8">
          <SetupWizardScreen onComplete={noop} defaultCompanyName="Alpha Comércio" />
        </div>
      );
    case "invite":
      return (
        <div className="rounded-[var(--radius-card)] glass glass-edge p-6 sm:p-8">
          <InviteTeamScreen onSubmit={noop} onSkip={noop} />
        </div>
      );
  }
}

export function OnboardingScreensSection() {
  const [active, setActive] = useState<OnboardingKey>("create");
  const wide = active !== "create";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {ONBOARDING.map((s) => (
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

      <OnboardingCanvas wide={wide}>{renderOnboarding(active)}</OnboardingCanvas>

      <Demo
        label="Onboarding split — painel de boas-vindas + criar empresa (≥ lg)"
        className="!block"
      >
        <div className="@container/dnex-auth h-[44rem] min-w-0 overflow-hidden rounded-[var(--radius-hero)] border border-line">
          <AuthLayout
            embedded
            themeToggle={<ThemeSwitcher variant="icon" />}
            aside={
              <AuthMarketingPanel
                eyebrow="Bem-vindo ao hub"
                title={
                  <>
                    Vamos montar
                    <br />
                    sua empresa.
                  </>
                }
                description="Em poucos passos: crie o workspace, defina preferências e traga a equipe. Dá para ajustar tudo depois."
              >
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">3 passos</Badge>
                  <span className="text-[0.78rem] text-[var(--color-indigo-300)]">
                    Menos de 2 minutos
                  </span>
                </div>
              </AuthMarketingPanel>
            }
          >
            <CreateWorkspaceScreen onSubmit={noop} autoFocus={false} />
          </AuthLayout>
        </div>
      </Demo>

      <p className="text-[0.78rem] leading-relaxed text-fg-subtle">
        Conteúdo ilustrativo — sem backend. O provisionamento real (criar tenant,
        Stripe Customer, JWT com <span className="font-mono">tenant_id</span>) é
        do servidor; aqui as telas só coletam e chamam{" "}
        <span className="font-mono">onComplete</span>/
        <span className="font-mono">onSubmit</span>.
      </p>
    </div>
  );
}
