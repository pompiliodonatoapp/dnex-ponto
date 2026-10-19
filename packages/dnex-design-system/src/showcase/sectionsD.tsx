import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Command } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/form";
import { Input } from "../components/primitives/Input";
import { Textarea } from "../components/primitives/Textarea";
import { Combobox } from "../components/primitives/Combobox";
import { MultiSelect } from "../components/primitives/MultiSelect";
import { Switch } from "../components/primitives/Switch";
import { Slider, RangeSlider } from "../components/primitives/Slider";
import { SearchInput } from "../components/primitives/SearchInput";
import { SegmentedControl } from "../components/primitives/SegmentedControl";
import { FileUpload } from "../components/primitives/FileUpload";
import type { FileRejection } from "../components/primitives/FileUpload";
import { Button } from "../components/primitives/Button";
import { Alert } from "../components/composed/Alert";
import { Demo } from "./parts";

/* Dados ILUSTRATIVOS — opções de exemplo, não refletem cadastro real. */
const regimes = [
  { value: "simples", label: "Simples Nacional" },
  { value: "presumido", label: "Lucro Presumido" },
  { value: "real", label: "Lucro Real" },
  { value: "mei", label: "MEI", disabled: true },
];

const servicos = [
  { value: "contabil", label: "Contabilidade" },
  { value: "fiscal", label: "Apuração fiscal" },
  { value: "folha", label: "Folha & DP" },
  { value: "societario", label: "Societário" },
  { value: "consultoria", label: "Consultoria tributária" },
];

/* ════════════════════════════════════════════════════════════════════════════
   C2a — FORMULÁRIO COM VALIDAÇÃO ZOD REAL
   ════════════════════════════════════════════════════════════════════════════ */

const onboardingSchema = z.object({
  empresa: z
    .string()
    .min(2, "Informe o nome da empresa.")
    .max(80, "Máximo de 80 caracteres."),
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("E-mail inválido."),
  regime: z.string().min(1, "Selecione um regime tributário."),
  servicos: z
    .array(z.string())
    .min(1, "Escolha pelo menos um serviço."),
  observacoes: z
    .string()
    .max(280, "Máximo de 280 caracteres.")
    .optional()
    .or(z.literal("")),
  aceite: z
    .boolean()
    .refine((v) => v === true, "É preciso aceitar para continuar."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

function OnboardingForm() {
  const [submitted, setSubmitted] = useState<OnboardingValues | null>(null);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      empresa: "",
      email: "",
      regime: "",
      servicos: [],
      observacoes: "",
      aceite: false,
    },
  });

  function onSubmit(values: OnboardingValues) {
    // Sem efeito real — apenas reflete a validação no showcase.
    setSubmitted(values);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Form
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Razão social</FormLabel>
              <FormControl>
                <Input placeholder="DNEX Gestão 360 Ltda." {...field} />
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
                  placeholder="voce@empresa.com.br"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Usaremos para enviar o resumo da apuração.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regime"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Regime tributário</FormLabel>
              {/* Combobox não é input nativo: ligamos value/onChange à mão */}
              <Combobox
                options={regimes}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Selecione o regime…"
                searchPlaceholder="Buscar regime…"
                aria-label="Regime tributário"
                invalid={!!form.formState.errors.regime}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servicos"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Serviços de interesse</FormLabel>
              <MultiSelect
                options={servicos}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Selecione um ou mais…"
                aria-label="Serviços de interesse"
                invalid={!!form.formState.errors.servicos}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Algo que devemos saber? (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aceite"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-start gap-3">
                <Switch
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                  aria-label="Aceitar os termos"
                />
                <span className="text-[0.9rem] leading-relaxed text-fg">
                  Concordo com os termos de uso e a política de privacidade.
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" loading={form.formState.isSubmitting}>
            Enviar cadastro
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

      {/* Resultado / instruções */}
      <div className="space-y-4">
        {submitted ? (
          <Alert
            tone="success"
            title="Formulário válido"
          >
            Todos os campos passaram na validação zod. Em produção, este payload
            iria para a API — aqui só exibimos:
            <pre className="mt-3 overflow-x-auto rounded-[10px] border border-line bg-[var(--surface)] p-3 font-mono text-[0.72rem] leading-relaxed text-fg-muted">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </Alert>
        ) : (
          <Alert tone="info" title="Validação ao vivo">
            Tente enviar vazio, ou digitar um e-mail inválido: as mensagens
            aparecem por campo (zod), com <code>aria-invalid</code> e{" "}
            <code>aria-describedby</code> ligando rótulo, descrição e erro. O
            modo é <code>onTouched</code> — valida ao sair do campo.
          </Alert>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   C2b — VITRINE DOS INPUTS ESPECIALIZADOS (estados standalone)
   ════════════════════════════════════════════════════════════════════════════ */

function InputsShowcase() {
  const [busca, setBusca] = useState("");
  const [combo, setCombo] = useState("simples");
  const [multi, setMulti] = useState<string[]>(["contabil", "fiscal"]);
  const [vista, setVista] = useState<"lista" | "grade" | "kanban">("lista");
  const [valor, setValor] = useState(64);
  const [faixa, setFaixa] = useState<[number, number]>([20, 80]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [recusa, setRecusa] = useState<string | null>(null);

  function onReject(rejections: FileRejection[]) {
    const r = rejections[0];
    const motivo =
      r.reason === "type"
        ? "tipo não aceito"
        : r.reason === "size"
          ? "arquivo muito grande"
          : "limite de arquivos atingido";
    setRecusa(`"${r.file.name}" recusado: ${motivo}.`);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Demo label="SearchInput — lupa, limpar e atalho" className="!block">
          <div className="space-y-3">
            <SearchInput
              value={busca}
              onValueChange={setBusca}
              placeholder="Buscar lançamentos, clientes…"
              shortcut="⌘K"
              aria-label="Buscar"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              {busca
                ? `Filtrando por “${busca}” — clique no × para limpar.`
                : "Vazio mostra o atalho; ao digitar, surge o botão limpar."}
            </p>
          </div>
        </Demo>

        <Demo label="SegmentedControl — troca de visão" className="!block">
          <div className="space-y-3">
            <SegmentedControl
              aria-label="Modo de visualização"
              value={vista}
              onValueChange={setVista}
              items={[
                { value: "lista", label: "Lista" },
                { value: "grade", label: "Grade" },
                { value: "kanban", label: "Kanban" },
              ]}
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Visão atual: <span className="font-medium text-fg">{vista}</span>.
              Setas navegam; seleção sempre ativa.
            </p>
          </div>
        </Demo>

        <Demo label="Combobox — select com busca" className="!block">
          <div className="space-y-3">
            <Combobox
              options={regimes}
              value={combo}
              onValueChange={setCombo}
              placeholder="Selecione…"
              searchPlaceholder="Buscar regime…"
              aria-label="Regime (demo)"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Digite para filtrar (tolerante a acentos). ↑/↓ + Enter pelo
              teclado. “MEI” está desabilitado de propósito.
            </p>
          </div>
        </Demo>

        <Demo label="MultiSelect — chips removíveis" className="!block">
          <div className="space-y-3">
            <MultiSelect
              options={servicos}
              value={multi}
              onValueChange={setMulti}
              placeholder="Selecione serviços…"
              max={4}
              aria-label="Serviços (demo)"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Marque vários (limite 4). Backspace remove o último; o × remove o
              chip. Painel fica aberto enquanto seleciona.
            </p>
          </div>
        </Demo>

        <Demo label="Slider — valor único" className="!block">
          <div className="space-y-4 pt-6">
            <Slider
              value={valor}
              onValueChange={setValor}
              min={0}
              max={100}
              step={1}
              showValue
              valueFormatter={(v) => `${v}%`}
              aria-label="Meta de conciliação"
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Meta:{" "}
              <span className="font-mono text-fg">{valor}%</span> — badge aparece
              no hover/foco do thumb.
            </p>
          </div>
        </Demo>

        <Demo label="RangeSlider — intervalo [mín, máx]" className="!block">
          <div className="space-y-4 pt-6">
            <RangeSlider
              value={faixa}
              onValueChange={setFaixa}
              min={0}
              max={100}
              step={5}
              showValue
              valueFormatter={(v) => `R$ ${v}k`}
              thumbLabels={["Valor mínimo", "Valor máximo"]}
            />
            <p className="text-[0.8rem] text-fg-subtle">
              Faixa:{" "}
              <span className="font-mono text-fg">
                R$ {faixa[0]}k – R$ {faixa[1]}k
              </span>
              . Os thumbs não se cruzam.
            </p>
          </div>
        </Demo>
      </div>

      <Demo label="FileUpload / Dropzone — arrastar e soltar (sem upload real)" className="!block">
        <div className="space-y-3">
          <FileUpload
            files={arquivos}
            onFiles={setArquivos}
            onReject={onReject}
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
            hint="PDF, PNG ou JPG · até 10 MB cada · máximo 5 arquivos"
          />
          {recusa && (
            <Alert tone="warning" title="Arquivo recusado">
              {recusa}
            </Alert>
          )}
          <p className="text-[0.8rem] text-fg-subtle">
            Valida tipo, tamanho e contagem; emite os aceitos em{" "}
            <code>onFiles</code> e os recusados em <code>onReject</code>. Nenhum
            byte sai do navegador — é só UI.
          </p>
        </div>
      </Demo>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Export — bloco completo "Formulários & Inputs"
   ════════════════════════════════════════════════════════════════════════════ */

export function FormsSection() {
  return (
    <div className="grid gap-10">
      <div>
        <h3 className="mb-1 flex items-center gap-2 font-display text-[length:var(--text-h3)] font-semibold text-fg">
          <CheckCircle2 className="h-5 w-5 text-[var(--tone-action-fg)]" aria-hidden="true" />
          Formulário com validação (react-hook-form + zod)
        </h3>
        <p className="mb-5 max-w-2xl text-[0.92rem] leading-relaxed text-fg-muted">
          A camada <code>Form</code> liga o schema zod aos primitivos do DS.
          Erros por campo, ARIA correto e foco/teclado nativos. Conteúdo
          ilustrativo.
        </p>
        <OnboardingForm />
      </div>

      <div>
        <h3 className="mb-1 flex items-center gap-2 font-display text-[length:var(--text-h3)] font-semibold text-fg">
          <Command className="h-5 w-5 text-[var(--tone-action-fg)]" aria-hidden="true" />
          Inputs especializados
        </h3>
        <p className="mb-5 max-w-2xl text-[0.92rem] leading-relaxed text-fg-muted">
          SearchInput, SegmentedControl, Combobox, MultiSelect, Slider/RangeSlider
          e FileUpload — todos em tokens, acessíveis e com dark/light. Demos
          ilustrativas.
        </p>
        <InputsShowcase />
      </div>
    </div>
  );
}
