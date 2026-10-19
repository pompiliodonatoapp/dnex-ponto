import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User } from "lucide-react";
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
import { Select } from "../../components/primitives/Select";
import { Button } from "../../components/primitives/Button";
import { Avatar } from "../../components/primitives/Avatar";
import { Alert } from "../../components/composed/Alert";
import { SettingsSection } from "./parts";

/**
 * ProfileSettings — preferências pessoais do usuário (D1): nome, e-mail, avatar,
 * idioma e fuso horário. Form rhf+zod; o avatar tem ação de troca (callback, sem
 * upload real). Idioma/fuso por Select. Estados de erro/sucesso via Alert + flag.
 *
 * Conteúdo ILUSTRATIVO — valores default são exemplos. Tudo via tokens.
 */

const schema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  language: z.string().min(1),
  timezone: z.string().min(1),
});

export type ProfileValues = z.infer<typeof schema>;

const LANGUAGES = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

const TIMEZONES = [
  { value: "America/Bahia", label: "Salvador (GMT-3)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "UTC", label: "UTC (GMT+0)" },
];

export type ProfileSettingsProps = {
  defaultValues?: Partial<ProfileValues>;
  /** URL do avatar atual (opcional). */
  avatarUrl?: string;
  onSubmit: (values: ProfileValues) => void | Promise<void>;
  /** Acionado ao clicar em "Trocar foto" (abre seletor/upload no app). */
  onChangeAvatar?: () => void;
  onRemoveAvatar?: () => void;
  loading?: boolean;
  /** Mensagem de erro do servidor (opcional). */
  error?: string | null;
  /** Mostra o alerta de sucesso (auto-controlado pelo app). */
  success?: boolean;
};

export function ProfileSettings({
  defaultValues,
  avatarUrl,
  onSubmit,
  onChangeAvatar,
  onRemoveAvatar,
  loading,
  error,
  success,
}: ProfileSettingsProps) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      language: defaultValues?.language ?? "pt-BR",
      timezone: defaultValues?.timezone ?? "America/Bahia",
    },
  });

  const name = form.watch("name");
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "DP";

  return (
    <SettingsSection
      title="Perfil"
      description="Como você aparece e é contatado no hub DNEX."
      footer={
        <Button type="submit" form="profile-form" loading={loading}>
          Salvar alterações
        </Button>
      }
    >
      <Form
        form={form}
        id="profile-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {error && (
          <Alert tone="danger" title="Não foi possível salvar">
            {error}
          </Alert>
        )}
        {success && (
          <Alert tone="success" title="Perfil atualizado">
            Suas informações foram salvas.
          </Alert>
        )}

        {/* avatar */}
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl} fallback={initials} size="lg" />
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onChangeAvatar}
              >
                Trocar foto
              </Button>
              {onRemoveAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveAvatar}
                >
                  Remover
                </Button>
              )}
            </div>
            <p className="text-[0.78rem] text-fg-subtle">
              PNG ou JPG, até 2&nbsp;MB.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Nome</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder="Seu nome completo"
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
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Usado para login e avisos da conta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idioma</FormLabel>
                <FormControl>
                  <Select
                    aria-label="Idioma"
                    value={field.value}
                    onValueChange={field.onChange}
                    items={LANGUAGES}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuso horário</FormLabel>
                <FormControl>
                  <Select
                    aria-label="Fuso horário"
                    value={field.value}
                    onValueChange={field.onChange}
                    items={TIMEZONES}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </SettingsSection>
  );
}
