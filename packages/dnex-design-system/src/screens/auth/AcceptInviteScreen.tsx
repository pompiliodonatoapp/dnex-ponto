import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/form";
import { Input } from "../../components/primitives/Input";
import { Button } from "../../components/primitives/Button";
import { Avatar } from "../../components/primitives/Avatar";
import { Badge } from "../../components/primitives/Badge";
import { Alert } from "../../components/composed/Alert";
import { Separator } from "../../components/primitives/Separator";
import { PasswordField, scorePassword } from "../../components/auth/PasswordField";
import { AuthCard, AuthLink } from "./AuthCard";

/**
 * AcceptInviteScreen — entrar num tenant existente via convite. Mostra a
 * empresa, quem convidou e o papel atribuído, e oferece dois caminhos:
 *  - usuário NOVO (`mode="signup"`): define nome + senha e entra;
 *  - usuário JÁ LOGADO/EXISTENTE (`mode="existing"`): aceita em 1 clique.
 * Trata convite expirado/revogado com aviso e CTA de voltar.
 */

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
  viewer: "Visualizador",
};

const signupSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  password: z
    .string()
    .min(8, "Use ao menos 8 caracteres.")
    .refine((v) => scorePassword(v) >= 2, "Senha muito fraca — combine letras, números e símbolos."),
});

export type AcceptInviteValues = z.infer<typeof signupSchema>;

export type AcceptInviteScreenProps = {
  /** Empresa (tenant) do convite. */
  tenantName: string;
  /** Quem convidou. */
  inviterName: string;
  /** E-mail convidado (pré-preenchido, somente leitura). */
  email: string;
  /** Papel atribuído (owner/admin/member/viewer ou texto livre). */
  role?: string;
  /** "signup": usuário novo define senha · "existing": aceita em 1 clique. */
  mode?: "signup" | "existing";
  /** Convite expirado/revogado → estado de erro. */
  invalid?: boolean;
  onAccept: (values?: AcceptInviteValues) => void | Promise<void>;
  onDecline?: () => void;
  onBackToLogin?: () => void;
  error?: string | null;
  loading?: boolean;
};

export function AcceptInviteScreen({
  tenantName,
  inviterName,
  email,
  role = "member",
  mode = "signup",
  invalid = false,
  onAccept,
  onDecline,
  onBackToLogin,
  error,
  loading,
}: AcceptInviteScreenProps) {
  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", password: "" },
  });

  if (invalid) {
    return (
      <AuthCard
        title="Convite indisponível"
        description="Este convite expirou ou foi revogado. Peça ao administrador para enviar um novo."
        footer={<AuthLink onClick={onBackToLogin}>Ir para o login</AuthLink>}
      >
        <Button onClick={onBackToLogin} variant="secondary" className="w-full">
          Voltar
        </Button>
      </AuthCard>
    );
  }

  const inviteHeader = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-3.5 text-left">
        <Avatar fallback={inviterName.slice(0, 2).toUpperCase()} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[0.9rem] leading-snug text-fg">
            <span className="font-semibold">{inviterName}</span> convidou você
            para <span className="font-semibold">{tenantName}</span>
          </p>
          <p className="mt-0.5 truncate text-[0.78rem] text-fg-subtle">{email}</p>
        </div>
        <Badge tone="action">{roleLabels[role] ?? role}</Badge>
      </div>
    </div>
  );

  if (mode === "existing") {
    return (
      <AuthCard
        title="Você foi convidado"
        description="Aceite para começar a colaborar nesta empresa."
        footer={
          onDecline && (
            <AuthLink onClick={onDecline}>Recusar convite</AuthLink>
          )
        }
      >
        <div className="space-y-5">
          {error && (
            <Alert tone="danger" title="Não foi possível aceitar">
              {error}
            </Alert>
          )}
          {inviteHeader}
          <Button onClick={() => onAccept()} loading={loading} className="w-full">
            Aceitar e entrar
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Aceitar convite"
      description="Crie seu acesso para entrar nesta empresa."
      footer={onDecline && <AuthLink onClick={onDecline}>Recusar convite</AuthLink>}
    >
      <div className="space-y-5">
        {error && (
          <Alert tone="danger" title="Não foi possível aceitar">
            {error}
          </Alert>
        )}
        {inviteHeader}

        <Separator />

        <Form
          form={form}
          onSubmit={form.handleSubmit((v) => onAccept(v))}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Seu nome</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder="Como devemos te chamar"
                    leadingIcon={<User />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Defina uma senha</FormLabel>
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

          <Button type="submit" loading={loading} className="w-full">
            Entrar em {tenantName}
          </Button>
        </Form>
      </div>
    </AuthCard>
  );
}
