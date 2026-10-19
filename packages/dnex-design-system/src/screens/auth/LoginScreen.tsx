import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/form";
import { Input } from "../../components/primitives/Input";
import { Checkbox } from "../../components/primitives/Checkbox";
import { Button } from "../../components/primitives/Button";
import { Alert } from "../../components/composed/Alert";
import { PasswordField } from "../../components/auth/PasswordField";
import { AuthCard, AuthLink } from "./AuthCard";

/**
 * LoginScreen — page template de autenticação por e-mail + senha.
 *
 * Recebe callbacks (onSubmit, onForgotPassword, onSignup) e estados
 * (loading/error). Não fala com backend: o app injeta a lógica. Copy sóbria,
 * transacional, pt-BR. Erro de credencial vem por prop (`error`).
 */

const schema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
  remember: z.boolean().optional(),
});

export type LoginValues = z.infer<typeof schema>;

export type LoginScreenProps = {
  onSubmit: (values: LoginValues) => void | Promise<void>;
  onForgotPassword?: () => void;
  onSignup?: () => void;
  /** Mensagem de erro (credencial inválida, rate-limit…). */
  error?: string | null;
  loading?: boolean;
  /** Pré-preenche o e-mail (ex.: vindo de convite). */
  defaultEmail?: string;
  title?: ReactNode;
  description?: ReactNode;
};

export function LoginScreen({
  onSubmit,
  onForgotPassword,
  onSignup,
  error,
  loading,
  defaultEmail = "",
  title = "Entrar no DNEX",
  description = "Acesse o painel do seu negócio — financeiro, fiscal e operacional num lugar só.",
}: LoginScreenProps) {
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail, password: "", remember: true },
  });

  return (
    <AuthCard
      title={title}
      description={description}
      footer={
        onSignup ? (
          <span>
            Ainda não tem conta?{" "}
            <AuthLink onClick={onSignup}>Criar conta</AuthLink>
          </span>
        ) : undefined
      }
    >
      <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert tone="danger" title="Não foi possível entrar">
            {error}
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com.br"
                  leadingIcon={<Mail />}
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
              <div className="flex items-center justify-between">
                <FormLabel required>Senha</FormLabel>
                <AuthLink onClick={onForgotPassword}>Esqueci a senha</AuthLink>
              </div>
              <FormControl>
                <PasswordField autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
              <span className="text-[0.88rem] text-fg-muted">
                Manter conectado neste dispositivo
              </span>
            </label>
          )}
        />

        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </Form>
    </AuthCard>
  );
}
