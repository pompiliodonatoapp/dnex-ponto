import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";
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
import { Alert } from "../../components/composed/Alert";
import { IllustrationSuccess } from "../../components/illustrations";
import { AuthCard, AuthLink } from "./AuthCard";

/**
 * ForgotPasswordScreen — solicita o e-mail para disparar o link de redefinição.
 * Dois estados: formulário (idle/loading/error) e confirmação ("enviamos o
 * link"). A confirmação é deliberadamente neutra (não revela se o e-mail existe
 * — boa prática de segurança).
 */

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail.").email("E-mail inválido."),
});

export type ForgotPasswordValues = z.infer<typeof schema>;

export type ForgotPasswordScreenProps = {
  onSubmit: (values: ForgotPasswordValues) => void | Promise<void>;
  onBackToLogin?: () => void;
  /** Quando true, mostra a tela de confirmação de envio. */
  sent?: boolean;
  /** E-mail enviado (mostrado na confirmação). */
  sentTo?: string;
  error?: string | null;
  loading?: boolean;
};

export function ForgotPasswordScreen({
  onSubmit,
  onBackToLogin,
  sent = false,
  sentTo,
  error,
  loading,
}: ForgotPasswordScreenProps) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  if (sent) {
    return (
      <AuthCard
        media={<IllustrationSuccess size={88} />}
        title="Verifique seu e-mail"
        description={
          <>
            Se houver uma conta para{" "}
            <span className="font-medium text-fg">{sentTo || "esse e-mail"}</span>,
            enviamos um link para redefinir a senha. O link expira em breve.
          </>
        }
        footer={
          <AuthLink onClick={onBackToLogin}>Voltar para o login</AuthLink>
        }
      >
        <p className="text-center text-[0.85rem] leading-relaxed text-fg-muted">
          Não recebeu? Confira a caixa de spam ou tente novamente em alguns
          minutos.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Esqueceu a senha?"
      description="Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha."
      footer={
        <span className="inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <AuthLink onClick={onBackToLogin}>Voltar para o login</AuthLink>
        </span>
      }
    >
      <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert tone="danger" title="Algo deu errado">
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

        <Button type="submit" loading={loading} className="w-full">
          Enviar link de redefinição
        </Button>
      </Form>
    </AuthCard>
  );
}
