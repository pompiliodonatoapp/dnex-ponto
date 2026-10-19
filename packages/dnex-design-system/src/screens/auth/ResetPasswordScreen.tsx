import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/form";
import { Button } from "../../components/primitives/Button";
import { Alert } from "../../components/composed/Alert";
import { PasswordField, scorePassword } from "../../components/auth/PasswordField";
import { AuthCard, AuthLink } from "./AuthCard";

/**
 * ResetPasswordScreen — define a nova senha (após o link de redefinição).
 * Dois campos com confirmação; medidor de força no primeiro. Trata o caso de
 * token expirado/inválido com um CTA de reenviar.
 */

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use ao menos 8 caracteres.")
      .refine((v) => scorePassword(v) >= 2, "Senha muito fraca — combine letras, números e símbolos."),
    confirm: z.string().min(1, "Confirme a senha."),
  })
  .refine((v) => v.password === v.confirm, {
    message: "As senhas não coincidem.",
    path: ["confirm"],
  });

export type ResetPasswordValues = z.infer<typeof schema>;

export type ResetPasswordScreenProps = {
  onSubmit: (values: ResetPasswordValues) => void | Promise<void>;
  /** Token inválido/expirado → mostra erro + CTA de reenviar. */
  tokenExpired?: boolean;
  onResendLink?: () => void;
  onBackToLogin?: () => void;
  error?: string | null;
  loading?: boolean;
};

export function ResetPasswordScreen({
  onSubmit,
  tokenExpired = false,
  onResendLink,
  onBackToLogin,
  error,
  loading,
}: ResetPasswordScreenProps) {
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  if (tokenExpired) {
    return (
      <AuthCard
        title="Link expirado"
        description="Este link de redefinição não é mais válido. Solicite um novo para continuar."
        footer={<AuthLink onClick={onBackToLogin}>Voltar para o login</AuthLink>}
      >
        <Button onClick={onResendLink} className="w-full">
          Enviar novo link
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Criar nova senha"
      description="Escolha uma senha forte que você ainda não usou em outros lugares."
    >
      <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert tone="danger" title="Não foi possível redefinir">
            {error}
          </Alert>
        )}

        <FormField
          control={form.control}
          name="password"
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

        <Button type="submit" loading={loading} className="w-full">
          Salvar nova senha
        </Button>
      </Form>
    </AuthCard>
  );
}
