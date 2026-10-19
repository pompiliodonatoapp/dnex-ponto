import { useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Mail,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/composed/Tabs";
import { CnpjInput } from "../../components/inputs-br/CnpjInput";
import { CpfInput } from "../../components/inputs-br/CpfInput";
import { CepInput } from "../../components/inputs-br/CepInput";
import { TelefoneInput } from "../../components/inputs-br/TelefoneInput";
import { WhatsAppInput } from "../../components/inputs-br/WhatsAppInput";
import { isValidCnpj, isValidCpf, normalizeCnpj, onlyDigits } from "../../lib/br";
import { SettingsSection } from "./parts";

/**
 * CompanySettings — dados cadastrais do tenant em ABAS:
 *   • Empresa — logomarca, razão social, fantasia, CNPJ, contato e endereço.
 *   • Representante legal — nome, CPF, cargo e e-mail (assina relatórios).
 *   • Contador — nome, CRC, e-mail e telefone (assinatura contábil).
 * As abas "Representante legal" e "Contador" são opcionais via prop.
 *
 * Esses dados alimentam o CABEÇALHO e a ASSINATURA de relatórios e documentos
 * gerados. Form rhf+zod ÚNICO (seções por aba); a logomarca é gerenciada à
 * parte (arquivo via `onLogoChange`); os demais campos saem no `onSubmit`.
 *
 * Conteúdo ILUSTRATIVO — CNPJ/CPF/CRC/endereço/contato são exemplos sintéticos.
 */

const schema = z.object({
  // ---- Empresa
  legalName: z.string().min(2, "Informe a razão social."),
  tradeName: z.string().optional(),
  cnpj: z
    .string()
    .refine((v) => normalizeCnpj(v).length === 14, "Informe o CNPJ completo.")
    .refine((v) => isValidCnpj(v), "CNPJ inválido."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().optional(),
  // WhatsApp é um campo PRÓPRIO, distinto do telefone institucional — ver nota
  // no schema do servidor (`empresas.whatsapp`). O NÚMERO é o canal operacional
  // (links/token de assinatura); o @usuário (novo formato) é informativo.
  whatsapp: z.string().optional(),
  whatsappUser: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().optional(),
  // ---- Representante legal (opcional)
  repName: z.string().optional(),
  repCpf: z
    .string()
    .optional()
    .refine(
      (v) => !v || onlyDigits(v).length === 0 || isValidCpf(v),
      "CPF inválido.",
    ),
  repRole: z.string().optional(),
  repEmail: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  // ---- Contador (opcional)
  accountantName: z.string().optional(),
  accountantCrc: z.string().optional(),
  accountantEmail: z
    .string()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal("")),
  accountantPhone: z.string().optional(),
  accountantWhatsapp: z.string().optional(),
});

export type CompanyValues = z.infer<typeof schema>;

type CompanyTab = "company" | "legalRep" | "accountant";

export type CompanySettingsProps = {
  defaultValues?: Partial<CompanyValues>;
  /** URL da logomarca já cadastrada (preview inicial). */
  defaultLogoUrl?: string;
  onSubmit: (values: CompanyValues) => void | Promise<void>;
  /** Acionado ao trocar/remover a logomarca (arquivo ou null). */
  onLogoChange?: (file: File | null) => void;
  /**
   * Acionado quando o CEP completa 8 dígitos — o app busca o endereço e
   * devolve os campos encontrados; o próprio CompanySettings os aplica ao
   * formulário (`street`/`district`/`city`/`uf`).
   */
  onCepComplete?: (
    cep: string,
  ) => Promise<{ street?: string; district?: string; city?: string; uf?: string } | null> | void;
  /**
   * Acionado quando o CPF do representante legal fica VÁLIDO — o app consulta
   * o nome (CPFHub) e devolve; o próprio CompanySettings aplica em `repName`.
   */
  onCpfComplete?: (cpf: string) => Promise<{ name?: string } | null> | void;
  /** Exibe a aba "Representante legal". */
  showLegalRep?: boolean;
  /** Exibe a aba "Contador". */
  showAccountant?: boolean;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
  /** Bloqueia a edição (ex.: usuário sem permissão de owner). */
  readOnly?: boolean;
  /** Ação ou indicador contextual exibido no cabeçalho da seção. */
  headerAside?: ReactNode;
};

export function CompanySettings({
  defaultValues,
  defaultLogoUrl,
  onSubmit,
  onLogoChange,
  onCepComplete,
  onCpfComplete,
  showLegalRep = true,
  showAccountant = true,
  loading,
  error,
  success,
  readOnly = false,
  headerAside,
}: CompanySettingsProps) {
  const form = useForm<CompanyValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      legalName: defaultValues?.legalName ?? "",
      tradeName: defaultValues?.tradeName ?? "",
      cnpj: defaultValues?.cnpj ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      whatsapp: defaultValues?.whatsapp ?? "",
      whatsappUser: defaultValues?.whatsappUser ?? "",
      cep: defaultValues?.cep ?? "",
      street: defaultValues?.street ?? "",
      number: defaultValues?.number ?? "",
      complement: defaultValues?.complement ?? "",
      district: defaultValues?.district ?? "",
      city: defaultValues?.city ?? "",
      uf: defaultValues?.uf ?? "",
      repName: defaultValues?.repName ?? "",
      repCpf: defaultValues?.repCpf ?? "",
      repRole: defaultValues?.repRole ?? "",
      repEmail: defaultValues?.repEmail ?? "",
      accountantName: defaultValues?.accountantName ?? "",
      accountantCrc: defaultValues?.accountantCrc ?? "",
      accountantEmail: defaultValues?.accountantEmail ?? "",
      accountantPhone: defaultValues?.accountantPhone ?? "",
      accountantWhatsapp: defaultValues?.accountantWhatsapp ?? "",
    },
  });

  const [tab, setTab] = useState<CompanyTab>("company");
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    defaultLogoUrl ?? null,
  );

  function pickLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) setLogoPreview(URL.createObjectURL(file));
    onLogoChange?.(file);
  }
  function removeLogo() {
    setLogoPreview(null);
    onLogoChange?.(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleCepComplete(cep: string) {
    const found = await onCepComplete?.(cep);
    if (!found) return;
    if (found.street !== undefined) form.setValue("street", found.street);
    if (found.district !== undefined) form.setValue("district", found.district);
    if (found.city !== undefined) form.setValue("city", found.city);
    if (found.uf !== undefined) form.setValue("uf", found.uf);
  }

  async function handleCpfComplete(cpf: string) {
    const found = await onCpfComplete?.(cpf);
    if (found?.name) form.setValue("repName", found.name);
  }

  return (
    <SettingsSection
      title="Dados da empresa"
      description="Identificação, contato, logomarca e responsáveis — usados no cabeçalho e na assinatura de relatórios e documentos gerados."
      headerAside={headerAside}
      footer={
        !readOnly && (
          <Button type="submit" form="company-form" loading={loading}>
            Salvar empresa
          </Button>
        )
      }
    >
      <Form
        form={form}
        id="company-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {error && (
          <Alert tone="danger" title="Não foi possível salvar">
            {error}
          </Alert>
        )}
        {success && (
          <Alert tone="success" title="Empresa atualizada">
            Os dados cadastrais foram salvos.
          </Alert>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as CompanyTab)}>
          <TabsList>
            <TabsTrigger value="company">Empresa</TabsTrigger>
            {showLegalRep && (
              <TabsTrigger value="legalRep">Representante</TabsTrigger>
            )}
            {showAccountant && (
              <TabsTrigger value="accountant">Contador</TabsTrigger>
            )}
          </TabsList>

          {/* ───────── Aba: Empresa ───────── */}
          <TabsContent value="company" className="space-y-6">
            {/* logomarca */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logomarca da empresa"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <ImageIcon
                    className="h-7 w-7 text-fg-subtle"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[0.92rem] font-medium text-fg">Logomarca</p>
                <p className="max-w-md text-[0.85rem] leading-relaxed text-fg-muted">
                  Aparece no topo dos relatórios e documentos gerados. PNG ou
                  SVG, fundo transparente, até 2&nbsp;MB.
                </p>
                {!readOnly && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg"
                      className="hidden"
                      onChange={pickLogo}
                      aria-label="Enviar logomarca"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leadingIcon={<Upload className="h-4 w-4" />}
                      onClick={() => fileRef.current?.click()}
                    >
                      {logoPreview ? "Trocar" : "Enviar logo"}
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeLogo}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-line" />

            {/* identificação + contato */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Razão social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Alpha Comércio e Serviços Ltda."
                        leadingIcon={<Building2 />}
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder="Alpha" readOnly={readOnly} {...field} />
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
                    <FormLabel required>CNPJ</FormLabel>
                    <FormControl>
                      <CnpjInput
                        hideMessage
                        readOnly={readOnly}
                        value={field.value}
                        onChange={field.onChange}
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        placeholder="contato@empresa.com.br"
                        leadingIcon={<Mail />}
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <TelefoneInput
                        readOnly={readOnly}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (número)</FormLabel>
                    <FormControl>
                      {/* NÚMERO com máscara BR — o WhatsAppInput (@) fica só p/ o @usuário. */}
                      <TelefoneInput
                        readOnly={readOnly}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>Usado nos links e códigos de assinatura.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (@usuário)</FormLabel>
                    <FormControl>
                      <WhatsAppInput
                        readOnly={readOnly}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>Nome de usuário do novo formato do WhatsApp.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="h-px bg-line" />

            {/* endereço */}
            <div className="grid gap-5 sm:grid-cols-6">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <CepInput
                        readOnly={readOnly}
                        value={field.value}
                        onChange={field.onChange}
                        onComplete={handleCepComplete}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Av. Tancredo Neves"
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="620" readOnly={readOnly} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complement"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sala 1201"
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Caminho das Árvores"
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Salvador"
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="BA"
                        maxLength={2}
                        readOnly={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ───────── Aba: Representante legal ───────── */}
          {showLegalRep && (
            <TabsContent value="legalRep" className="space-y-6">
              <p className="text-[0.85rem] leading-relaxed text-fg-muted">
                Pessoa que assina os relatórios em nome da empresa. Esses dados
                aparecem no rodapé de assinatura dos documentos gerados.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="repName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome do representante"
                          readOnly={readOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <CpfInput
                          hideMessage
                          readOnly={readOnly}
                          value={field.value}
                          onChange={field.onChange}
                          onComplete={handleCpfComplete}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sócio-administrador"
                          readOnly={readOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          inputMode="email"
                          placeholder="representante@empresa.com.br"
                          leadingIcon={<Mail />}
                          readOnly={readOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          )}

          {/* ───────── Aba: Contador ───────── */}
          {showAccountant && (
            <TabsContent value="accountant" className="space-y-6">
              <p className="text-[0.85rem] leading-relaxed text-fg-muted">
                Profissional responsável pela assinatura em relatórios
                contábeis. O CRC é o registro no Conselho Regional de
                Contabilidade.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="accountantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome do contador"
                          readOnly={readOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountantCrc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRC</FormLabel>
                      <FormControl>
                        <Input
                          mono
                          placeholder="BA-012345/O-7"
                          readOnly={readOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          inputMode="email"
                          placeholder="contador@empresa.com.br"
                          leadingIcon={<Mail />}
                          readOnly={readOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <TelefoneInput
                          readOnly={readOnly}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountantWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <WhatsAppInput
                          readOnly={readOnly}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </Form>
    </SettingsSection>
  );
}
