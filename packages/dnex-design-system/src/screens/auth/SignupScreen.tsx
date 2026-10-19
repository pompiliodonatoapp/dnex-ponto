import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User } from "lucide-react";
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
import { PasswordField, scorePassword } from "../../components/auth/PasswordField";
import { AuthCard, AuthLink } from "./AuthCard";

/**
 * SignupScreen — page template de criação de conta. Nome, e-mail, senha com
 * medidor de força e aceite de termos. Após sucesso, o app encaminha ao
 * onboarding/verificação. Copy transacional, pt-BR.
 *
 * Exige força mínima "razoável" (score ≥ 2) — apenas UX; a política real é do
 * servidor. Aceite de termos é obrigatório.
 */

const schema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  password: z
    .string()
    .min(8, "Use ao menos 8 caracteres.")
    .refine((v) => scorePassword(v) >= 2, "Senha muito fraca — combine letras, números e símbolos."),
  accept: z
    .boolean()
    .refine((v) => v === true, "É necessário aceitar os termos para continuar."),
});

export type SignupValues = z.infer<typeof schema>;

export type SignupScreenProps = {
  onSubmit: (values: SignupValues) => void | Promise<void>;
  onLogin?: () => void;
  /** Links de termos e privacidade (sobrescrevíveis). */
  termsHref?: string;
  privacyHref?: string;
  error?: string | null;
  loading?: boolean;
  /** Pré-preenche e bloqueia o e-mail (fluxo via convite). */
  defaultEmail?: string;
  lockEmail?: boolean;
};

export function SignupScreen({
  onSubmit,
  onLogin,
  termsHref = "#",
  privacyHref = "#",
  error,
  loading,
  defaultEmail = "",
  lockEmail = false,
}: SignupScreenProps) {
  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: defaultEmail,
      password: "",
      accept: false,
    },
  });

  return (
    <AuthCard
      title="Criar sua conta"
      description="Leva menos de um minuto. Depois você cria a empresa e convida sua equipe."
      footer={
        <span>
          Já tem conta? <AuthLink onClick={onLogin}>Entrar</AuthLink>
        </span>
      }
    >
      <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert tone="danger" title="Não foi possível criar a conta">
            {error}
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Nome completo</FormLabel>
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
                  readOnly={lockEmail}
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
              <FormLabel required>Senha</FormLabel>
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
          name="accept"
          render={({ field, fieldState }) => (
            <FormItem>
              <label className="flex cursor-pointer items-start gap-2.5">
                <Checkbox
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  aria-invalid={fieldState.error ? true : undefined}
                />
                <span className="text-[0.85rem] leading-relaxed text-fg-muted">
                  Li e aceito os{" "}
                  <AuthLink href={termsHref}>Termos de Uso</AuthLink> e a{" "}
                  <AuthLink href={privacyHref}>Política de Privacidade</AuthLink>.
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" loading={loading} className="w-full">
          Criar conta
        </Button>
      </Form>
    </AuthCard>
  );
}
