import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, ReceiptText } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/form";
import { Label } from "../components/primitives/Label";
import { Button } from "../components/primitives/Button";
import { Alert } from "../components/composed/Alert";
import {
  CnpjInput,
  CpfInput,
  CepInput,
  CurrencyInput,
  PercentInput,
  DateInputBR,
} from "../components/inputs-br";
import { centsToBRL, isValidCnpj } from "../lib/br";
import { Demo } from "./parts";

/* ════════════════════════════════════════════════════════════════════════════
   C3 — VITRINE DOS INPUTS FISCAIS (estados standalone, controlados)
   ════════════════════════════════════════════════════════════════════════════
   Valores de documento abaixo são EXEMPLOS SINTÉTICOS clássicos de teste
   (529.982.247-25 / 11.222.333/0001-81) — não pertencem a nenhuma pessoa ou
   empresa real. Demais dados são ilustrativos.
   ════════════════════════════════════════════════════════════════════════════ */

function InputsBrShowcase() {
  // Pré-preenchidos com exemplos VÁLIDOS sintéticos.
  const [cnpj, setCnpj] = useState("11.222.333/0001-81");
  const [cnpjErr, setCnpjErr] = useState("11.222.333/0001-99"); // DV errado de propósito
  const [cpf, setCpf] = useState("529.982.247-25");
  const [cep, setCep] = useState("");
  const [cepOk, setCepOk] = useState(false);
  const [valor, setValor] = useState(123456); // centavos → R$ 1.234,56
  const [pct, setPct] = useState(12.34);
  const [data, setData] = useState("");

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Demo label="CurrencyInput — moeda BRL (controlado em centavos)" className="!block">
          <div className="space-y-3">
            <Label htmlFor="br-valor">Valor da nota</Label>
            <CurrencyInput
              id="br-valor"
              value={valor}
              onChange={setValor}
              aria-label="Valor da nota"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Digite só números (caixa registradora). Estado interno:{" "}
              <span className="font-mono text-fg">{valor}</span> centavos ={" "}
              <span className="font-mono text-fg">{centsToBRL(valor)}</span>.
            </p>
          </div>
        </Demo>

        <Demo label="PercentInput — alíquota / índice" className="!block">
          <div className="space-y-3">
            <Label htmlFor="br-pct">Alíquota</Label>
            <PercentInput
              id="br-pct"
              value={pct}
              onChange={setPct}
              decimals={2}
              min={0}
              max={100}
              aria-label="Alíquota"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Número exposto: <span className="font-mono text-fg">{pct}</span>.
              min/max (0–100) normalizam ao sair do campo.
            </p>
          </div>
        </Demo>

        <Demo label="CnpjInput — máscara + DV (válido)" className="!block">
          <div className="space-y-3">
            <Label htmlFor="br-cnpj">CNPJ</Label>
            <CnpjInput
              id="br-cnpj"
              value={cnpj}
              onChange={setCnpj}
              aria-label="CNPJ"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Exemplo sintético válido. Validação:{" "}
              <span className="font-mono text-fg">
                {isValidCnpj(cnpj) ? "✓ válido" : "✗ inválido"}
              </span>
              .
            </p>
          </div>
        </Demo>

        <Demo label="CnpjInput — DV incorreto (estado inválido)" className="!block">
          <div className="space-y-3">
            <Label htmlFor="br-cnpj-err">CNPJ com dígito errado</Label>
            <CnpjInput
              id="br-cnpj-err"
              value={cnpjErr}
              onChange={setCnpjErr}
              aria-label="CNPJ inválido (exemplo)"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Termina em <span className="font-mono text-fg">-99</span> de
              propósito: a borda fica em danger e surge a mensagem (role=alert).
            </p>
          </div>
        </Demo>

        <Demo label="CpfInput — máscara + DV" className="!block">
          <div className="space-y-3">
            <Label htmlFor="br-cpf">CPF</Label>
            <CpfInput
              id="br-cpf"
              value={cpf}
              onChange={setCpf}
              aria-label="CPF"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Exemplo sintético válido. Apague um dígito do fim para ver o erro.
            </p>
          </div>
        </Demo>

        <Demo label="CepInput — máscara + onComplete (sem fetch)" className="!block">
          <div className="space-y-3">
            <Label htmlFor="br-cep">CEP</Label>
            <CepInput
              id="br-cep"
              value={cep}
              onChange={setCep}
              onComplete={() => setCepOk(true)}
              aria-label="CEP"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              {cepOk
                ? "onComplete disparou — em produção o app buscaria o endereço."
                : "Complete os 8 dígitos para disparar onComplete (aqui só sinaliza)."}
            </p>
          </div>
        </Demo>

        <Demo label="DateInputBR — dd/mm/aaaa + calendário (reusa o Calendar)" className="!block">
          <div className="space-y-3">
            <Label htmlFor="br-data">Data de competência</Label>
            <DateInputBR
              id="br-data"
              value={data}
              onChange={setData}
              aria-label="Data de competência"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Digite ou abra o calendário pelo ícone. Tente{" "}
              <span className="font-mono text-fg">31/02/2024</span>: é rejeitada
              como data inexistente.
            </p>
          </div>
        </Demo>
      </div>

      <MiniFiscalForm />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Mini-form fiscal (CNPJ + valor + data) via camada Form + zod
   ════════════════════════════════════════════════════════════════════════════ */

const lancamentoSchema = z.object({
  cnpj: z
    .string()
    .min(1, "Informe o CNPJ.")
    .refine((v) => isValidCnpj(v), "CNPJ inválido (verifique os dígitos)."),
  valorCentavos: z
    .number({ invalid_type_error: "Informe o valor." })
    .int()
    .positive("O valor deve ser maior que zero."),
  data: z
    .string()
    .min(1, "Informe a data.")
    // dd/mm/aaaa completa: a validação de data real fica no input; aqui só o formato.
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato dd/mm/aaaa."),
});

type LancamentoValues = z.infer<typeof lancamentoSchema>;

function MiniFiscalForm() {
  const [submitted, setSubmitted] = useState<LancamentoValues | null>(null);

  const form = useForm<LancamentoValues>({
    resolver: zodResolver(lancamentoSchema),
    mode: "onTouched",
    defaultValues: {
      cnpj: "",
      // valorCentavos começa sem valor: o cast garante number no submit válido.
      valorCentavos: 0,
      data: "",
    },
  });

  function onSubmit(values: LancamentoValues) {
    setSubmitted(values);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h3 className="mb-1 flex items-center gap-2 font-display text-[length:var(--text-h3)] font-semibold text-fg">
          <ReceiptText className="h-5 w-5 text-[var(--tone-action-fg)]" aria-hidden="true" />
          Mini-form fiscal (CNPJ + valor + data)
        </h3>
        <p className="mb-5 max-w-2xl text-[0.92rem] leading-relaxed text-fg-muted">
          Os três inputs ligados à camada <code>Form</code> (react-hook-form +
          zod). Cada um é controlado por <code>value</code>/<code>onChange</code>;
          o erro do zod assume a mensagem (passamos <code>hideMessage</code> nos
          inputs de documento para não duplicar). Conteúdo ilustrativo.
        </p>

        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>CNPJ do emitente</FormLabel>
                <FormControl>
                  <CnpjInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    hideMessage
                  />
                </FormControl>
                <FormDescription>
                  Exemplo válido: 11.222.333/0001-81 (sintético).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valorCentavos"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Valor</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Data de competência</FormLabel>
                <FormControl>
                  <DateInputBR
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    hideMessage
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" loading={form.formState.isSubmitting}>
              Registrar lançamento
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset();
                setSubmitted(null);
              }}
            >
              Limpar
            </Button>
          </div>
        </Form>
      </div>

      <div className="space-y-4">
        {submitted ? (
          <Alert tone="success" title="Lançamento válido">
            Passou na validação. O valor vai como{" "}
            <span className="font-mono">centavos</span> (seguro, sem float):
            <pre className="mt-3 overflow-x-auto rounded-[10px] border border-line bg-[var(--surface)] p-3 font-mono text-[0.72rem] leading-relaxed text-fg-muted">
              {JSON.stringify(
                {
                  ...submitted,
                  valorFormatado: centsToBRL(submitted.valorCentavos),
                },
                null,
                2,
              )}
            </pre>
          </Alert>
        ) : (
          <Alert tone="info" title="Como testar">
            Envie vazio para ver os erros por campo. Digite um CNPJ com dígito
            final trocado: o <code>refine</code> do zod acusa. O valor é guardado
            em centavos e formatado em mono no padrão fiscal.
          </Alert>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Export — bloco completo "Inputs Fiscais (BR)"
   ════════════════════════════════════════════════════════════════════════════ */

export function InputsBrSection() {
  return (
    <div className="grid gap-10">
      <div>
        <h3 className="mb-1 flex items-center gap-2 font-display text-[length:var(--text-h3)] font-semibold text-fg">
          <Building2 className="h-5 w-5 text-[var(--tone-action-fg)]" aria-hidden="true" />
          Campos do domínio brasileiro
        </h3>
        <p className="mb-5 max-w-2xl text-[0.92rem] leading-relaxed text-fg-muted">
          Moeda, CNPJ, CPF, CEP, percentual e data — máscara e validação{" "}
          <strong className="font-semibold text-fg">próprias</strong> (sem libs),
          números em IBM Plex Mono, erros acessíveis e dark/light. Documentos são
          exemplos sintéticos de teste.
        </p>
        <InputsBrShowcase />
      </div>
    </div>
  );
}
