import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Laptop, Smartphone, ShieldCheck } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/form";
import { Button } from "../../components/primitives/Button";
import { Switch } from "../../components/primitives/Switch";
import { Badge } from "../../components/primitives/Badge";
import { Alert } from "../../components/composed/Alert";
import { EmptyState } from "../../components/composed/EmptyState";
import {
  PasswordField,
  scorePassword,
} from "../../components/auth/PasswordField";
import { OtpInput } from "../../components/auth/OtpInput";
import { ConfirmDialog } from "../../components/composed/ConfirmDialog";
import { SettingsSection, SettingRow, SettingRows } from "./parts";

/**
 * SecuritySettings — senha, autenticação em duas etapas e sessões ativas (D2).
 *  - Trocar senha: PasswordField (atual + nova com força + confirmação).
 *  - 2FA: Switch que revela o setup com OtpInput (confirmar código do app).
 *  - Sessões ativas: lista com "revogar" via ConfirmDialog (a atual é marcada e
 *    não pode ser revogada).
 *
 * Conteúdo ILUSTRATIVO — sessões e dispositivos são exemplos. Tudo via tokens.
 */

/* ---------- Trocar senha ---------- */

const passwordSchema = z
  .object({
    current: z.string().min(1, "Informe a senha atual."),
    next: z
      .string()
      .min(8, "Use ao menos 8 caracteres.")
      .refine(
        (v) => scorePassword(v) >= 2,
        "Senha muito fraca — combine letras, números e símbolos.",
      ),
    confirm: z.string().min(1, "Repita a nova senha."),
  })
  .refine((v) => v.next === v.confirm, {
    path: ["confirm"],
    message: "As senhas não conferem.",
  });

export type ChangePasswordValues = z.infer<typeof passwordSchema>;

/* ---------- Sessões ativas ---------- */

export type Session = {
  id: string;
  device: string;
  /** "desktop" | "mobile" — define o ícone. */
  kind?: "desktop" | "mobile";
  location: string;
  lastActive: string;
  current?: boolean;
};

export type SecuritySettingsProps = {
  onChangePassword: (values: ChangePasswordValues) => void | Promise<void>;
  /** Estado do 2FA. */
  twoFactorEnabled?: boolean;
  /** Liga/desliga o 2FA — recebe o código quando ativando. */
  onToggleTwoFactor?: (enabled: boolean, code?: string) => void | Promise<void>;
  sessions?: Session[];
  onRevokeSession?: (id: string) => void | Promise<void>;
  passwordError?: string | null;
  passwordSuccess?: boolean;
  passwordLoading?: boolean;
  twoFactorError?: string | null;
  twoFactorLoading?: boolean;
};

export function SecuritySettings({
  onChangePassword,
  twoFactorEnabled = false,
  onToggleTwoFactor,
  sessions = [],
  onRevokeSession,
  passwordError,
  passwordSuccess,
  passwordLoading,
  twoFactorError,
  twoFactorLoading,
}: SecuritySettingsProps) {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  // 2FA: ao LIGAR, revela a etapa de confirmação por código.
  const [setupOpen, setSetupOpen] = useState(false);
  const [code, setCode] = useState("");

  // revogar sessão
  const [revokeId, setRevokeId] = useState<string | null>(null);

  function handleToggle(next: boolean) {
    if (next && !twoFactorEnabled) {
      setSetupOpen(true);
      return;
    }
    // desligar é imediato (callback decide se pede confirmação no app)
    onToggleTwoFactor?.(false);
  }

  function confirmSetup() {
    void onToggleTwoFactor?.(true, code);
    setSetupOpen(false);
    setCode("");
  }

  const revokeTarget = sessions.find((s) => s.id === revokeId) ?? null;

  return (
    <div className="space-y-6">
      {/* ---------- Senha ---------- */}
      <SettingsSection
        title="Senha"
        description="Use uma senha forte e exclusiva para o hub."
        footer={
          <Button type="submit" form="password-form" loading={passwordLoading}>
            Atualizar senha
          </Button>
        }
      >
        <Form
          form={form}
          id="password-form"
          onSubmit={form.handleSubmit(onChangePassword)}
          className="space-y-5"
        >
          {passwordError && (
            <Alert tone="danger" title="Não foi possível alterar a senha">
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert tone="success" title="Senha alterada">
              Da próxima vez, entre com a nova senha.
            </Alert>
          )}

          <FormField
            control={form.control}
            name="current"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormLabel required>Senha atual</FormLabel>
                <FormControl>
                  <PasswordField autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="next"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nova senha</FormLabel>
                  <FormControl>
                    <PasswordField
                      autoComplete="new-password"
                      showStrength
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <PasswordField autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </SettingsSection>

      {/* ---------- 2FA ---------- */}
      <SettingsSection
        title="Autenticação em duas etapas"
        description="Um segundo fator (app autenticador) protege sua conta mesmo se a senha vazar."
        headerAside={
          twoFactorEnabled ? (
            <Badge tone="success">
              Ativa
            </Badge>
          ) : (
            <Badge tone="neutral">
              Inativa
            </Badge>
          )
        }
      >
        {twoFactorError && (
          <Alert tone="danger" title="Não foi possível concluir" className="mb-4">
            {twoFactorError}
          </Alert>
        )}

        <SettingRow
          label="Aplicativo autenticador (TOTP)"
          description="Gere códigos por um app como Google Authenticator ou 1Password."
          control={
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleToggle}
              aria-label="Ativar autenticação em duas etapas"
            />
          }
        />

        {setupOpen && (
          <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[rgba(79,70,229,0.14)] text-[var(--tone-action-fg)]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.92rem] font-medium text-fg">
                  Confirme o código do app
                </p>
                <p className="mt-0.5 text-[0.82rem] leading-relaxed text-fg-subtle">
                  Escaneie o QR no seu app autenticador e digite o código de 6
                  dígitos gerado.{" "}
                  <span className="font-mono text-fg-muted">
                    [CONFIRMAR: QR/segredo do servidor]
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col items-start gap-4">
              <OtpInput
                value={code}
                onChange={setCode}
                onComplete={(c) => setCode(c)}
                aria-label="Código do aplicativo autenticador"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  loading={twoFactorLoading}
                  disabled={code.length < 6}
                  onClick={confirmSetup}
                >
                  Confirmar e ativar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSetupOpen(false);
                    setCode("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </SettingsSection>

      {/* ---------- Sessões ativas ---------- */}
      <SettingsSection
        title="Sessões ativas"
        description="Dispositivos com acesso à sua conta. Revogue os que não reconhecer."
      >
        {sessions.length === 0 ? (
          <EmptyState
            title="Nenhuma outra sessão"
            description="Você está conectado apenas neste dispositivo."
          />
        ) : (
          <SettingRows>
            {sessions.map((s) => (
              <SettingRow
                key={s.id}
                label={
                  <span className="flex items-center gap-2.5">
                    <span className="text-fg-subtle">
                      {s.kind === "mobile" ? (
                        <Smartphone className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Laptop className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    {s.device}
                    {s.current && (
                      <Badge tone="action">Este dispositivo</Badge>
                    )}
                  </span>
                }
                description={
                  <span className="font-mono text-[0.78rem]">
                    {s.location} · {s.lastActive}
                  </span>
                }
                control={
                  s.current ? (
                    <span className="text-[0.8rem] text-fg-subtle">Atual</span>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRevokeId(s.id)}
                    >
                      Revogar
                    </Button>
                  )
                }
              />
            ))}
          </SettingRows>
        )}
      </SettingsSection>

      <ConfirmDialog
        open={revokeId !== null}
        onOpenChange={(o) => !o && setRevokeId(null)}
        tone="danger"
        title="Revogar esta sessão?"
        description={
          revokeTarget
            ? `O acesso de "${revokeTarget.device}" (${revokeTarget.location}) será encerrado imediatamente.`
            : undefined
        }
        confirmLabel="Revogar acesso"
        onConfirm={() => {
          if (revokeId) void onRevokeSession?.(revokeId);
          setRevokeId(null);
        }}
      />
    </div>
  );
}
