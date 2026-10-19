import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/form";
import { Input } from "../../components/primitives/Input";
import { Button } from "../../components/primitives/Button";
import { Alert } from "../../components/composed/Alert";
import { CnpjInput } from "../../components/inputs-br/CnpjInput";
import { isValidCnpj, normalizeCnpj } from "../../lib/br";
import { AuthCard, AuthLink } from "../auth/AuthCard";

/**
 * CreateWorkspaceScreen — provisiona o tenant (B1): nome do workspace + CNPJ
 * opcional. Pensada para viver sobre o AuthLayout (pós-signup) ou um layout
 * próprio centrado. CNPJ, quando preenchido, é validado pelos dígitos.
 *
 * Conteúdo ILUSTRATIVO — exemplos sintéticos. O provisionamento real (Stripe
 * Customer, JWT com tenant_id) é do servidor.
 */

const schema = z.object({
  name: z.string().min(2, "Dê um nome à sua empresa."),
  cnpj: z
    .string()
    .optional()
    .refine(
      (v) => !v || normalizeCnpj(v).length === 0 || normalizeCnpj(v).length === 14,
      "Informe o CNPJ completo.",
    )
    .refine(
      (v) => !v || normalizeCnpj(v).length !== 14 || isValidCnpj(v),
      "CNPJ inválido.",
    ),
});

export type CreateWorkspaceValues = z.infer<typeof schema>;

export type CreateWorkspaceScreenProps = {
  onSubmit: (values: CreateWorkspaceValues) => void | Promise<void>;
  /** Voltar (ex.: trocar de conta / sair). */
  onBack?: () => void;
  /** Primeira empresa (pós-signup) muda a copy. */
  firstCompany?: boolean;
  loading?: boolean;
  error?: string | null;
  /** Desative em vitrines com múltiplas telas para não deslocar a página. */
  autoFocus?: boolean;
};

export function CreateWorkspaceScreen({
  onSubmit,
  onBack,
  firstCompany = true,
  loading,
  error,
  autoFocus = true,
}: CreateWorkspaceScreenProps) {
  const form = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", cnpj: "" },
  });

  return (
    <AuthCard
      media={
        <span className="grid h-14 w-14 place-items-center rounded-[var(--radius-card)] bg-[rgba(79,70,229,0.14)] text-[var(--tone-action-fg)]">
          <Building2 className="h-7 w-7" aria-hidden="true" />
        </span>
      }
      title={firstCompany ? "Crie sua empresa" : "Nova empresa"}
      description={
        firstCompany
          ? "É o espaço onde sua equipe e seus dados vão viver. Você pode ajustar tudo depois."
          : "Adicione outra empresa ao seu acesso. Você poderá alternar entre elas a qualquer momento."
      }
      footer={onBack && <AuthLink onClick={onBack}>Voltar</AuthLink>}
    >
      <Form
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {error && (
          <Alert tone="danger" title="Não foi possível criar a empresa">
            {error}
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Nome da empresa</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex.: Alpha Comércio"
                  leadingIcon={<Building2 />}
                  autoFocus={autoFocus}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <CnpjInput
                  hideMessage
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Opcional agora — você pode informar depois nas configurações.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" loading={loading} className="w-full">
          {firstCompany ? "Criar e continuar" : "Criar empresa"}
        </Button>
      </Form>
    </AuthCard>
  );
}
