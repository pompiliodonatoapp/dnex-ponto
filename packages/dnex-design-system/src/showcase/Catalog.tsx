import { useEffect, useState } from "react";
import {
  AlarmClock,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  Inbox,
  Loader2,
  Mail,
  Plus,
  Trash2,
  TrendingUp,
  TriangleAlert,
  User,
} from "lucide-react";

import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";
import { Textarea } from "../components/primitives/Textarea";
import { Label } from "../components/primitives/Label";
import { Select } from "../components/primitives/Select";
import { Checkbox } from "../components/primitives/Checkbox";
import { RadioGroup, RadioItem } from "../components/primitives/Radio";
import { Switch } from "../components/primitives/Switch";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import { Tooltip } from "../components/primitives/Tooltip";
import { Separator } from "../components/primitives/Separator";
import { Kbd } from "../components/primitives/Kbd";

import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/composed/Card";
import { StatCard } from "../components/composed/StatCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/composed/Tabs";
import { Accordion, AccordionItem } from "../components/composed/Accordion";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../components/composed/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/composed/DropdownMenu";
import { Alert } from "../components/composed/Alert";
import { Skeleton, SkeletonStat } from "../components/composed/Skeleton";
import { Progress } from "../components/composed/Progress";
import { Pagination } from "../components/composed/Pagination";
import { EmptyState } from "../components/composed/EmptyState";
import {
  Spinner,
  PageLoader,
  DnexLoadingMark,
} from "../components/composed/Spinner";
import { useToast } from "../components/composed/Toast";

import { color, typeScale } from "../tokens/tokens";
import { Demo, Section, Swatch } from "./parts";
import { ShowcaseIndex } from "./ShowcaseExperience";
import { ShellAnatomy } from "./ShellReference";
import { DataVizGallery } from "./DataViz";
import { DonutChartDnex } from "../components/charts/DonutChartDnex";
import { LineChartDnex } from "../components/charts/LineChartDnex";
import {
  formatPercent,
  okrFixedScaleProps,
  okrMediaMensal,
  okrProgressFixture,
  okrProgressSeries,
  okrUltimoValor,
} from "./okrProgressFixture";
import { ErrorPagesSection, DensitySection } from "./sectionsC6";
import {
  CalendarSection,
  WizardSection,
  NotificationsSection,
} from "./sectionsB";
import { IllustrationsSection, TokensFoundationsSection } from "./sectionsC";
import { FormsSection } from "./sectionsD";
import { InputsBrSection } from "./sectionsBR";
import { DadosSection } from "./sectionsDados";
import {
  OverlaysSection,
  CommandPaletteSection,
  BillingSection,
} from "./sectionsC5";
import { IconGallery } from "./IconGallery";
import { AuthScreensSection } from "./sectionsScreens";
import {
  SettingsScreensSection,
  OnboardingScreensSection,
} from "./sectionsScreens2";
import { CrudScreensSection } from "./sectionsCrud";
import { ShellV11Showcase } from "./sectionsShellV11";
import { ProductIdentitySection } from "./ProductIdentitySection";

import { navGroups } from "./navigation";

const fontLabel: Record<"display" | "sans" | "mono", string> = {
  display: "Space Grotesk",
  sans: "Plus Jakarta Sans",
  mono: "IBM Plex Mono",
};

export default function Catalog() {
  const { toast } = useToast();
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [radio, setRadio] = useState("mensal");
  const [page, setPage] = useState(3);
  const [loaderOpen, setLoaderOpen] = useState(false);
  const [motionReplay, setMotionReplay] = useState(0);

  // PageLoader de demonstração: fecha sozinho após ~2,2s (timeout limpo no unmount).
  useEffect(() => {
    if (!loaderOpen) return;
    const id = window.setTimeout(() => setLoaderOpen(false), 2200);
    return () => window.clearTimeout(id);
  }, [loaderOpen]);

  return (
    <div className="ds-library-layout">
      <ShowcaseIndex groups={navGroups} />
      <div className="ds-library-content">
        {/* ============================================================
            FOUNDATIONS
            ============================================================ */}
        <Section
          id="foundations"
          eyebrow="Fundação"
          title="Foundations"
          description="A base de tudo: cor, tipografia, raios, sombras e movimento — definidos como tokens. Nenhum valor mágico no código de componente."
        >
          <div className="grid gap-6">
            {/* cores de marca */}
            <Demo
              label="Paleta de marca — índigo (ação) + âmbar (acento)"
              className="!block"
            >
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {(["600", "500", "400", "300", "700", "950"] as const).map(
                  (k) => (
                    <Swatch
                      key={k}
                      name={`indigo-${k}`}
                      value={color.indigo[k]}
                      varName={color.indigo[k]}
                    />
                  ),
                )}
                {(["500", "400", "600", "300", "200", "100"] as const).map(
                  (k) => (
                    <Swatch
                      key={`a${k}`}
                      name={`amber-${k}`}
                      value={color.amber[k]}
                      varName={color.amber[k]}
                    />
                  ),
                )}
              </div>
            </Demo>

            {/* superfícies semânticas */}
            <Demo
              label="Superfícies semânticas (reagem ao tema)"
              className="!grid grid-cols-2 gap-2.5 sm:grid-cols-4"
            >
              <Swatch name="bg" value="var(--bg)" varName="--bg" />
              <Swatch
                name="surface"
                value="var(--surface)"
                varName="--surface"
              />
              <Swatch name="action" value="var(--action)" varName="--action" />
              <Swatch name="accent" value="var(--accent)" varName="--accent" />
            </Demo>

            {/* tipografia — escala documentada (fluida vs fixa) */}
            <Demo
              label="Escala tipográfica — fluida (clamp) reduz no mobile · fixa estável em qualquer tela"
              className="!block"
            >
              <p className="mb-5 max-w-2xl text-[length:var(--text-small)] leading-relaxed text-fg-muted">
                Os tokens de título (
                <span className="font-mono text-fg">display → h3</span>),{" "}
                <span className="font-mono text-fg">lead</span> e{" "}
                <span className="font-mono text-fg">kpi</span> são{" "}
                <strong className="font-semibold text-fg">fluidos</strong>:
                encolhem proporcionalmente no celular (≈375px) e crescem até o
                teto no desktop (≈1440px) via{" "}
                <span className="font-mono text-fg">clamp()</span>. Os de UI (
                <span className="font-mono text-fg">body · small · label</span>)
                são <strong className="font-semibold text-fg">fixos</strong> —
                tamanho previsível para leitura e formulários.
              </p>

              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
                <table className="w-full border-collapse text-left text-[length:var(--text-small)]">
                  <thead>
                    <tr className="border-b border-line [&>th]:px-4 [&>th]:py-3 [&>th]:text-[0.68rem] [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-fg-subtle">
                      <th scope="col">Amostra</th>
                      <th scope="col">Token</th>
                      <th scope="col">Fonte</th>
                      <th scope="col">Mín. (mobile) → Máx. (desktop)</th>
                      <th scope="col">Entrelinha</th>
                      <th scope="col">Uso recomendado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeScale.map((t) => (
                      <tr
                        key={t.token}
                        className="border-b border-line align-middle transition-colors last:border-0 hover:bg-[var(--surface-hover)]"
                      >
                        <td className="px-4 py-3.5">
                          {/* amostra renderizada no tamanho real do token (clamp ativo) */}
                          <span
                            className={
                              t.font === "display"
                                ? "font-display font-bold tracking-tight text-fg"
                                : t.font === "mono"
                                  ? "font-mono font-semibold tracking-tight text-fg"
                                  : t.token === "label"
                                    ? "font-medium uppercase tracking-[0.1em] text-fg"
                                    : "text-fg"
                            }
                            style={{
                              fontSize: `var(${t.cssVar})`,
                              lineHeight: t.lineHeight,
                            }}
                          >
                            {t.font === "mono"
                              ? "R$ 142.840,00"
                              : "Sob controle"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-fg">{t.token}</span>
                          <span
                            className={`ml-2 rounded-[var(--radius-pill)] px-1.5 py-0.5 text-[0.62rem] font-medium ${
                              t.fluid
                                ? "bg-[rgba(79,70,229,0.16)] text-indigo-300"
                                : "bg-[var(--surface-hover)] text-fg-subtle"
                            }`}
                          >
                            {t.fluid ? "fluido" : "fixo"}
                          </span>
                          <span className="mt-1 block font-mono text-[0.66rem] text-fg-subtle">
                            {t.cssVar}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-fg-muted">
                          {fontLabel[t.font]}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[0.78rem] text-fg-muted">
                            {t.fluid ? `${t.min} → ${t.max}` : t.min}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-fg-muted">
                          {t.lineHeight}
                        </td>
                        <td className="px-4 py-3.5 text-fg-muted">{t.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Demo>

            {/* raios e sombras */}
            <div className="grid gap-6 md:grid-cols-2">
              <Demo label="Raios (intencionais)">
                {[
                  { n: "control 10px", c: "rounded-[var(--radius-control)]" },
                  { n: "card 16px", c: "rounded-[var(--radius-card)]" },
                  { n: "hero 24px", c: "rounded-[var(--radius-hero)]" },
                  { n: "pill", c: "rounded-[var(--radius-pill)]" },
                ].map((r) => (
                  <div key={r.n} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`h-14 w-14 border border-line bg-[var(--surface)] ${r.c}`}
                    />
                    <span className="font-mono text-[0.68rem] text-fg-subtle">
                      {r.n}
                    </span>
                  </div>
                ))}
              </Demo>
              <Demo label="Sombras (tingidas de índigo)">
                {[
                  { n: "card", s: "shadow-[var(--shadow-card)]" },
                  { n: "glow", s: "shadow-[var(--shadow-glow)]" },
                  { n: "action", s: "shadow-[var(--shadow-action)]" },
                ].map((r) => (
                  <div key={r.n} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`h-14 w-14 rounded-[var(--radius-card)] bg-[var(--surface)] ${r.s}`}
                    />
                    <span className="font-mono text-[0.68rem] text-fg-subtle">
                      {r.n}
                    </span>
                  </div>
                ))}
              </Demo>
            </div>
          </div>
        </Section>

        {/* ============================================================
            TOKENS / FOUNDATIONS (C1c) — z-index, elevação, breakpoints, motion
            ============================================================ */}
        <Section
          id="tokens"
          eyebrow="Escalas documentadas"
          title="Tokens / Foundations"
          description="As escalas estruturais do DS, formalizadas em theme.css (CSS vars) e em tokens.ts (objetos para uso programático): elevação (níveis nomeados que reusam as sombras tingidas de índigo), z-index (empilhamento por papel), breakpoints (valores reais) e motion (durações + easings). Zero número mágico — tudo referencia token."
        >
          <TokensFoundationsSection />
        </Section>

        {/* ============================================================
            DENSIDADE (C6a)
            ============================================================ */}
        <Section
          id="densidade"
          eyebrow="Compactação da UI"
          title="Densidade"
          description="Dois espaçamentos para o mesmo sistema: confortável (telas que respiram) e compacto (telas densas de dado — operação fiscal, grandes tabelas). Os componentes de dado/lista (Table, DataTable, Input, Card) leem tokens de densidade. O controle global está na abertura da biblioteca; abaixo, uma demonstração local."
        >
          <DensitySection />
        </Section>

        {/* ============================================================
            PRIMITIVOS
            ============================================================ */}
        <Section
          id="primitivos"
          eyebrow="Blocos básicos"
          title="Primitivos"
          description="Os átomos da interface — acessíveis (Radix UI), com variantes e estados. Foco visível, teclado e ARIA inclusos."
        >
          <div className="grid gap-6">
            {/* botões */}
            <Demo label="Button — variantes">
              <Button>Primário</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Excluir</Button>
              <Button variant="link">Link</Button>
            </Demo>
            <Demo label="Button — tamanhos, ícone, loading, disabled">
              <Button size="sm">Pequeno</Button>
              <Button size="md">Médio</Button>
              <Button size="lg">Grande</Button>
              <Button size="icon" aria-label="Adicionar">
                <Plus className="h-4 w-4" />
              </Button>
              <Button leadingIcon={<Download className="h-4 w-4" />}>
                Baixar
              </Button>
              <Button loading>Salvando</Button>
              <Button disabled>Indisponível</Button>
            </Demo>

            {/* form fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <Demo label="Campos de formulário" className="!block">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" required>
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@empresa.com.br"
                      leadingIcon={<Mail />}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cnpj">CNPJ (mono)</Label>
                    <Input id="cnpj" mono placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="erro">Campo com erro</Label>
                    <Input id="erro" invalid defaultValue="valor inválido" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="msg">Mensagem</Label>
                    <Textarea id="msg" placeholder="Escreva aqui…" />
                  </div>
                </div>
              </Demo>

              <Demo label="Seleção e alternância" className="!block">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label>Regime tributário</Label>
                    <Select
                      aria-label="Regime tributário"
                      defaultValue="simples"
                      items={[
                        { value: "simples", label: "Simples Nacional" },
                        { value: "presumido", label: "Lucro Presumido" },
                        { value: "real", label: "Lucro Real" },
                      ]}
                    />
                  </div>
                  <label className="flex items-center gap-2.5">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => setChecked(v === true)}
                    />
                    <span className="text-[0.9rem] text-fg">
                      Receber resumo mensal
                    </span>
                  </label>
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <RadioGroup value={radio} onValueChange={setRadio}>
                      {[
                        { v: "semanal", l: "Semanal" },
                        { v: "mensal", l: "Mensal" },
                      ].map((o) => (
                        <label key={o.v} className="flex items-center gap-2.5">
                          <RadioItem value={o.v} />
                          <span className="text-[0.9rem] text-fg">{o.l}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  <label className="flex items-center gap-2.5">
                    <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                    <span className="text-[0.9rem] text-fg">
                      Notificações push
                    </span>
                  </label>
                </div>
              </Demo>
            </div>

            {/* badges / avatar / misc */}
            <Demo label="Badge / Tag — tons">
              <Badge>Neutro</Badge>
              <Badge tone="action">
                Ativo
              </Badge>
              <Badge tone="success">
                Pago
              </Badge>
              <Badge tone="warning">
                Pendente
              </Badge>
              <Badge tone="danger">
                Atrasado
              </Badge>
              <Badge tone="accent">Novo</Badge>
            </Demo>

            <Demo label="Avatar · Tooltip · Separator · Kbd">
              <Avatar fallback="DP" size="sm" />
              <Avatar fallback="DN" size="md" />
              <Avatar fallback="AU" size="lg" />
              <Tooltip content="Atalho para buscar">
                <Button variant="secondary" size="sm">
                  Passe o mouse
                </Button>
              </Tooltip>
              <Separator orientation="vertical" className="h-8" />
              <span className="inline-flex items-center gap-1 text-[0.85rem] text-fg-muted">
                Abrir busca <Kbd>⌘</Kbd> <Kbd>K</Kbd>
              </span>
            </Demo>
          </div>
        </Section>

        {/* ============================================================
            FORMULÁRIOS & INPUTS (C2)
            ============================================================ */}
        <Section
          id="formularios"
          eyebrow="Coleta de dados"
          title="Formulários & Inputs"
          description="Camada de formulário (react-hook-form + zod) costurada aos primitivos do DS — erros por campo, ARIA correto, foco e teclado nativos — mais os inputs especializados: Combobox com busca, MultiSelect com chips, Slider/RangeSlider, SearchInput, SegmentedControl e FileUpload (só UI, sem upload real). Tudo em tokens, dark/light e acessível. Conteúdo ilustrativo."
        >
          <FormsSection />
        </Section>

        {/* ============================================================
            INPUTS FISCAIS (BR) — C3
            ============================================================ */}
        <Section
          id="inputs-br"
          eyebrow="Domínio brasileiro"
          title="Inputs Fiscais (BR)"
          description="Campos especializados do dia a dia fiscal: moeda (BRL em centavos), CNPJ e CPF com validação de dígitos verificadores, CEP com onComplete, percentual e data dd/mm/aaaa que reusa o Calendar. Máscara e validação próprias (lib/br.ts), sem dependências — números em IBM Plex Mono, erros acessíveis, dark/light. Documentos abaixo são exemplos sintéticos de teste, não reais."
        >
          <InputsBrSection />
        </Section>

        {/* ============================================================
            COMPOSTOS
            ============================================================ */}
        <Section
          id="compostos"
          eyebrow="Padrões de produto"
          title="Compostos"
          description="Componentes que combinam primitivos em padrões de app: cards, navegação, feedback e dados — com estados vazio, carregando e erro desenhados."
        >
          <div className="grid gap-6">
            {/* cards + stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Receita (mês)"
                value="R$ 89,2k"
                delta={8.1}
                deltaLabel="vs. abr"
                icon={<TrendingUp />}
              />
              <StatCard
                label="Despesas"
                value="R$ 61,4k"
                delta={-3.2}
                deltaLabel="vs. abr"
                icon={<TrendingUp />}
              />
              <Card interactive>
                <CardHeader>
                  <CardTitle>Card interativo</CardTitle>
                  <CardDescription>
                    Superfície plana (sem borda/sombra); hover por cor de superfície.
                  </CardDescription>
                </CardHeader>
                <CardBody>
                  <p className="text-[0.9rem] text-fg-muted">
                    Superfície base do DS. Compose Header / Body / Footer.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button
                    size="sm"
                    trailingIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Abrir
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* StatCard horizontal — grade densa de 4 colunas */}
            <Demo
              label="StatCard horizontal — grade densa de 4 colunas (rótulo e descrição no token label, 12px)"
              className="!block"
            >
              <div
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                data-testid="statcard-horizontal-grid"
              >
                <StatCard variant="horizontal" label="Em aberto" value="128" description="na carteira" icon={<Inbox />} />
                <StatCard variant="horizontal" tone="warning" label="Vencem em 7 dias" value="23" description="prazo próximo" icon={<AlarmClock />} />
                <StatCard variant="horizontal" tone="danger" label="Atrasadas" value="6" description="exigem ação hoje" icon={<TriangleAlert />} />
                <StatCard variant="horizontal" tone="success" label="Concluídas (mês)" value="341" description="+12% vs. ago" icon={<CheckCircle2 />} />
              </div>
            </Demo>

            {/* tabs + accordion */}
            <div className="grid gap-6 md:grid-cols-2">
              <Demo label="Tabs" className="!block">
                <Tabs defaultValue="resumo">
                  <TabsList>
                    <TabsTrigger value="resumo">Resumo</TabsTrigger>
                    <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
                    <TabsTrigger value="folha">Folha</TabsTrigger>
                  </TabsList>
                  <TabsContent value="resumo">
                    <p className="text-[0.9rem] text-fg-muted">
                      Visão consolidada do mês — tudo num lugar só.
                    </p>
                  </TabsContent>
                  <TabsContent value="fiscal">
                    <p className="text-[0.9rem] text-fg-muted">
                      Obrigações e impostos a vencer.
                    </p>
                  </TabsContent>
                  <TabsContent value="folha">
                    <p className="text-[0.9rem] text-fg-muted">
                      Competência e encargos da folha.
                    </p>
                  </TabsContent>
                </Tabs>
              </Demo>

              <Demo label="Accordion" className="!block">
                <Accordion>
                  <AccordionItem value="1" question="O que é o hub DNEX?">
                    O conjunto de apps DNEX num só lugar — DON Dashboard, DON
                    Documentação e Aurora, com login e visual unificados.
                  </AccordionItem>
                  <AccordionItem
                    value="2"
                    question="Os números aparecem em mono?"
                  >
                    Sim — todo valor de dinheiro, imposto ou data usa IBM Plex
                    Mono. É a assinatura fiscal da marca.
                  </AccordionItem>
                </Accordion>
              </Demo>
            </div>

            {/* feedback: alerts */}
            <Demo
              label="Alert / Banner — tons (voz de parceiro)"
              className="!grid gap-3"
            >
              <Alert tone="info" title="Dica">
                Conecte sua conta bancária para conciliar automático.
              </Alert>
              <Alert tone="success" title="Tudo certo">
                Apuração do mês fechada sem pendências.
              </Alert>
              <Alert tone="warning" title="DAS vence em 3 dias">
                R$ 3.215,90 — gere a guia agora para não pagar juros.
              </Alert>
              <Alert
                tone="danger"
                title="Esse erro é nosso, não seu"
                action={
                  <Button size="sm" variant="secondary">
                    Tentar de novo
                  </Button>
                }
              >
                Não conseguimos sincronizar agora. Já estamos vendo isso.
              </Alert>
            </Demo>

            {/* overlays: dialog + dropdown + toast */}
            <Demo label="Overlays — Dialog · DropdownMenu · Toast">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Abrir modal</Button>
                </DialogTrigger>
                <DialogContent
                  title="Excluir lançamento?"
                  description="Esta ação não pode ser desfeita. O lançamento sai dos relatórios."
                >
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      Cancelar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leadingIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Excluir
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">Menu de ações</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Conta</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <User /> Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar /> Agenda
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive>
                    <Trash2 /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() =>
                  toast({
                    title: "Salvo com sucesso",
                    description: "Suas alterações foram aplicadas.",
                    tone: "success",
                  })
                }
              >
                Disparar toast
              </Button>
            </Demo>

            {/* loading + progress + pagination + empty */}
            <div className="grid gap-6 md:grid-cols-2">
              <Demo label="Skeleton (carregando)" className="!block">
                <div className="grid grid-cols-2 gap-3">
                  <SkeletonStat />
                  <SkeletonStat />
                </div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </Demo>

              <Demo label="Progress · Pagination" className="!block">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[0.8rem] text-fg-muted">
                      Apuração — 68%
                    </span>
                    <Progress value={68} aria-label="Apuração" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[0.8rem] text-fg-muted">
                      Indeterminado
                    </span>
                    <Progress value={null} aria-label="Carregando" />
                  </div>
                  <Pagination
                    page={page}
                    pageCount={12}
                    onPageChange={setPage}
                  />
                </div>
              </Demo>
            </div>

            <Demo
              label="EmptyState (estado vazio com voz de parceiro)"
              className="!block"
            >
              <Card>
                <EmptyState
                  icon={<Inbox />}
                  title="Ainda sem lançamentos este mês"
                  description="Quando você registrar o primeiro, ele aparece aqui — com o valor já no padrão fiscal."
                  action={
                    <Button leadingIcon={<Plus className="h-4 w-4" />}>
                      Novo lançamento
                    </Button>
                  }
                />
              </Card>
            </Demo>
          </div>
        </Section>

        {/* ============================================================
            CALENDÁRIO / DATAS (B1)
            ============================================================ */}
        <Section
          id="datas"
          eyebrow="Tempo sob controle"
          title="Calendário / Datas"
          description="Calendar e DatePicker sobre react-day-picker, tematizados 100% na marca: seleção em índigo, “hoje” em âmbar (com avareza), datas em IBM Plex Mono, locale pt-BR. Suporta data única e intervalo (range), com teclado e ARIA da própria lib. Datas abaixo são ilustrativas."
        >
          <CalendarSection />
        </Section>

        {/* ============================================================
            WIZARD / STEPPER (B2)
            ============================================================ */}
        <Section
          id="wizard"
          eyebrow="Fluxos multi-etapa"
          title="Wizard / Stepper"
          description="Stepper (horizontal e vertical, estados done/active/upcoming em mono) e Wizard multi-step com Voltar/Avançar/Concluir, barra de progresso, validação por passo (canAdvance) e transição suave que respeita reduced-motion. Abaixo, uma qualificação de lead em 4 passos. Conteúdo ilustrativo."
        >
          <WizardSection />
        </Section>

        {/* ============================================================
            CENTRAL DE NOTIFICAÇÕES (B3)
            ============================================================ */}
        <Section
          id="notificacoes"
          eyebrow="Histórico de avisos"
          title="Central de Notificações"
          description="Sino com badge de não-lidas que abre um painel com o histórico: ícone por tipo, título, descrição, tempo relativo, estado lida/não-lida, “marcar como lida” e “marcar todas”. Persistente — o oposto do Toast, que é transiente. Plugado também na Topbar do App Shell abaixo."
        >
          <NotificationsSection />
        </Section>

        {/* ============================================================
            OVERLAYS (C5a) — Sheet/Drawer · ConfirmDialog · HoverCard
            ============================================================ */}
        <Section
          id="overlays"
          eyebrow="Camadas sobre a tela"
          title="Overlays"
          description="Sheet/Drawer genérico (desliza de qualquer borda, para filtros, detalhes e formulários laterais — não confundir com o drawer de navegação do app-shell), ConfirmDialog com variante danger e estado de loading no confirmar (+ hook useConfirm para uso imperativo) e HoverCard de preview ao passar o mouse. Tudo sobre Radix: foco preso, Esc, ARIA e reduced-motion. Conteúdo ilustrativo."
        >
          <OverlaysSection />
        </Section>

        {/* ============================================================
            COMMAND PALETTE (C5b) — ⌘K estilo Linear
            ============================================================ */}
        <Section
          id="command"
          eyebrow="Tudo a um atalho"
          title="Command Palette (⌘K)"
          description="Paleta de comandos estilo Linear sobre cmdk: abre com ⌘K/Ctrl+K (atalho global), busca com ranqueamento, grupos (navegação/ações/conta), item com ícone + atalho, teclado completo (setas/Enter/Esc) e estado vazio. Montada no Dialog do DS para herdar overlay, animação e foco preso da marca. Ações ilustrativas."
        >
          <CommandPaletteSection />
        </Section>

        {/* ============================================================
            ILUSTRAÇÕES (C1b) — set duotom próprio + EmptyState/ErrorState
            ============================================================ */}
        <Section
          id="ilustracoes"
          eyebrow="Arte própria da marca"
          title="Ilustrações"
          description="Set de ilustrações próprias DNEX — duotom (índigo + âmbar), geométricas, em camadas (não flat) e com o motivo do nexo da marca. Em SVG React, reagem a dark/light pelos tokens, aceitam size/className/title. Integradas ao EmptyState (prop illustration) e a um ErrorState reutilizável para 404/500/sem-permissão/offline. Conteúdo ilustrativo."
        >
          <IllustrationsSection />
        </Section>

        {/* ============================================================
            ÍCONES (B4)
            ============================================================ */}
        <Section
          id="identidade-produtos"
          eyebrow="Branded house DNEX"
          title="Identidade dos produtos"
          description="Família oficial de glifos do ecossistema. O desenho diferencia cada produto; construção, paleta e linguagem permanecem DNEX. A chave do catálogo é o contrato estável de integração."
        >
          <ProductIdentitySection />
        </Section>

        <Section
          id="icones"
          eyebrow="Biblioteca oficial"
          title="Ícones"
          description="Grade dos ícones lucide-react curados para o ecossistema (navegação, finanças/fiscal, ações, status), com busca por nome. lucide-react é a lib oficial: tamanhos 16/20/24, stroke ~2, cor herda currentColor."
        >
          <IconGallery />
        </Section>

        {/* ============================================================
            DADOS (C4) — DataTable, DescriptionList, Timeline
            ============================================================ */}
        <Section
          id="dados"
          eyebrow="Telas de dados"
          title="Dados"
          description="Os componentes de telas com dados: DataTable avançada (ordenação, busca, seleção, paginação, visibilidade de colunas e densidade), DescriptionList para detalhes/cadastro e Timeline/Activity Feed para histórico. Números em IBM Plex Mono, dark/light e acessíveis. Os dados abaixo são ilustrativos — não representam cadastro real."
        >
          <DadosSection />
        </Section>

        {/* ============================================================
            GRÁFICOS / DATA VIZ
            ============================================================ */}
        <Section
          id="graficos"
          eyebrow="Dados sob controle"
          title="Gráficos / Data Viz"
          description="Curvas, composição, fluxo de caixa, progresso, radar e conversão. Uma linguagem visual consistente, com comparação interativa, escalas explícitas e alternativas em texto e tabela. Dados ilustrativos, sem vínculo com operações reais."
        >
          <DataVizGallery />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Demo label="DonutChart — planos/serviços contratados" className="!block">
              <DonutChartDnex
                data={[
                  { name: "Fiscal completo", value: 45, meta: "7 contratos" },
                  { name: "Contratos digitais", value: 28, meta: "4 contratos" },
                  { name: "Consultoria", value: 18, meta: "3 contratos" },
                  { name: "Serviços avulsos", value: 9, meta: "2 contratos" },
                ]}
                centerValue="100%"
                centerLabel="da carteira"
                valueFormatter={(value) => `${value}%`}
                showPercent
                legendPosition="bottom"
                ariaLabel="Composição ilustrativa de planos e serviços contratados"
              />
            </Demo>
            <Demo label="DonutChart — regimes tributários" className="!block">
              <DonutChartDnex
                data={[
                  { name: "Simples Nacional", value: 52, meta: "9 clientes" },
                  { name: "Lucro Presumido", value: 31, meta: "5 clientes" },
                  { name: "Lucro Real", value: 17, meta: "3 clientes" },
                ]}
                centerValue="17"
                centerLabel="clientes ativos"
                valueFormatter={(value) => `${value}%`}
                showPercent
                legendPosition="bottom"
                ariaLabel="Composição ilustrativa dos regimes tributários"
              />
            </Demo>
          </div>

          {/* Escala fixa e honesta: métrica limitada (0–100 %) com eixo fixo,
              ticks explícitos, meta como linha de referência e tabela ao lado. */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2" id="demo-okr-escala-fixa">
            <Demo label="Linha — escala fixa (progresso 0–100%)" className="!block">
              <figure aria-label="Progresso ilustrativo de três OKRs, janeiro a junho, em percentual de 0 a 100. Tabela com os mesmos valores ao lado.">
                <LineChartDnex
                  data={okrProgressFixture}
                  xKey="mes"
                  series={okrProgressSeries}
                  valueFormatter={formatPercent}
                  {...okrFixedScaleProps}
                />
                <figcaption className="mt-3 text-[0.82rem] leading-snug text-[var(--fg-subtle)]">
                  Percentual é métrica limitada: o eixo vai de 0 a 100 % com ticks
                  de 25, e a meta (100 %) é uma linha de referência tracejada. Em
                  abril o OKR Produto não foi medido — a linha quebra em vez de
                  inventar um valor. Dados ilustrativos.
                </figcaption>
              </figure>
            </Demo>
            <Demo label="Linha — tabela dos mesmos dados" className="!block">
              <div className="ds-viz-data w-full">
                <table>
                  <caption>Progresso ilustrativo dos OKRs por mês (%)</caption>
                  <thead>
                    <tr>
                      <th>Mês</th>
                      {okrProgressSeries.map((s) => (
                        <th key={s.dataKey}>{s.name.replace("OKR ", "")}</th>
                      ))}
                      <th>Média</th>
                    </tr>
                  </thead>
                  <tbody>
                    {okrProgressFixture.map((row) => {
                      const media = okrMediaMensal(row);
                      return (
                        <tr key={row.mes}>
                          <th scope="row">{row.mes}</th>
                          {okrProgressSeries.map((s) => {
                            const v = row[s.dataKey];
                            return <td key={s.dataKey}>{typeof v === "number" ? formatPercent(v) : "sem dado"}</td>;
                          })}
                          <td>{media == null ? "sem dado" : formatPercent(media)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Atual</th>
                      {okrProgressSeries.map((s) => {
                        const v = okrUltimoValor(s.dataKey);
                        return <td key={s.dataKey}>{v == null ? "sem dado" : formatPercent(v)}</td>;
                      })}
                      <td>meta 100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Demo>
          </div>

          {/* Par automático × fixo com a MESMA série (OKR Fiscal, 32–70 %). Com
              as três séries o eixo automático do Recharts ([0,'auto']) já
              coincidiria com 0–100 e o par não mostraria nada. */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2" id="demo-okr-auto-vs-fixo">
            <Demo label="Eixo automático — OKR Fiscal (mesmos dados)" className="!block">
              <div data-scale="auto">
                <LineChartDnex
                  data={okrProgressFixture}
                  xKey="mes"
                  series={okrProgressSeries.filter((s) => s.dataKey === "fiscal")}
                  valueFormatter={formatPercent}
                  showDots
                />
              </div>
              <p className="mt-3 text-[0.82rem] leading-snug text-[var(--fg-subtle)]">
                Sem <code>yDomain</code> o teto do eixo vira o maior valor
                arredondado: 70 % encosta no topo e parece meta batida. Dois
                cartões de OKR vizinhos ganhariam eixos diferentes e deixariam
                de ser comparáveis.
              </p>
            </Demo>
            <Demo label="Eixo fixo 0–100% — OKR Fiscal (mesmos dados)" className="!block">
              <div data-scale="fixed">
                <LineChartDnex
                  data={okrProgressFixture}
                  xKey="mes"
                  series={okrProgressSeries.filter((s) => s.dataKey === "fiscal")}
                  valueFormatter={formatPercent}
                  {...okrFixedScaleProps}
                />
              </div>
              <p className="mt-3 text-[0.82rem] leading-snug text-[var(--fg-subtle)]">
                Com <code>yDomain</code> e <code>yTicks</code> fixos, 70 % ocupa
                70 % da altura e a distância até a meta fica visível. Regra do DS:
                escala fixa e honesta onde a comparação importa (%, notas, índices).
              </p>
            </Demo>
          </div>
        </Section>

        {/* ============================================================
            LOADING / ESTADOS
            ============================================================ */}
        <Section
          id="loading"
          eyebrow="Carregando"
          title="Loading / Estados"
          description="Spinner circular (anel índigo→âmbar girando) em três tamanhos e um PageLoader full-screen com a marca DNEX animada em Motion. Acessíveis (role=status) e suaves em reduced-motion."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Demo label="Spinner — tamanhos">
              <div className="flex items-center gap-6">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
              <Separator orientation="vertical" className="h-10" />
              <Button loading>Salvando</Button>
              <span className="inline-flex items-center gap-2 text-[0.85rem] text-fg-muted">
                <Loader2 className="dnex-spin h-4 w-4 text-[var(--tone-action-fg)]" /> inline
              </span>
            </Demo>

            <Demo label="Motion DNEX — prévia contínua" className="!block">
              <div className="grid min-h-40 place-items-center p-6">
                <DnexLoadingMark key={motionReplay} forceMotion />
              </div>
              <p className="mt-4 text-[0.85rem] leading-relaxed text-fg-muted">
                Os dois chevrons respiram em sequência, o nexo âmbar responde e
                a barra indica o progresso do carregamento. Em produção, o mesmo
                motion é exibido pela página.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => setMotionReplay((value) => value + 1)}
                >
                  Reproduzir motion
                </Button>
                <span className="text-[0.78rem] text-fg-subtle">
                  A demonstração força o motion para revisão.
                </span>
              </div>
            </Demo>

            <Demo
              label="PageLoader — overlay de página"
              className="!block md:col-span-2"
            >
              <p className="mb-4 text-[0.85rem] leading-relaxed text-fg-muted">
                Cobre a página inteira enquanto a rota/dados carregam. Aqui é
                demonstrado contido neste card (
                <span className="font-mono">position="absolute"</span>),
                fechando sozinho após ~2s. Use o botão para reproduzir a tela
                real de carregamento.
              </p>
              <div className="relative h-48 overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
                <div className="grid h-full place-items-center p-4 text-center">
                  <p className="text-[0.85rem] text-fg-subtle">
                    Conteúdo da página (atrás do loader)
                  </p>
                </div>
                {loaderOpen && (
                  <PageLoader
                    position="absolute"
                    message="Carregando seus dados…"
                  />
                )}
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => setLoaderOpen(true)}
                  disabled={loaderOpen}
                >
                  {loaderOpen
                    ? "Carregando…"
                    : "Reproduzir tela de carregamento"}
                </Button>
              </div>
            </Demo>
          </div>
        </Section>

        {/* ============================================================
            BILLING (C5c) — Stripe-ready
            ============================================================ */}
        <Section
          id="billing"
          eyebrow="Planos & cobrança"
          title="Billing"
          description="Componentes prontos para Stripe: PricingCard com preço em IBM Plex Mono, toggle mensal/anual, plano em destaque (acento âmbar com parcimônia) e selo “plano atual”; UsageMeter (uso vs. limite, com estados próximo/estourado/ilimitado) e FeatureList (incluído × ausente, acessível). Planos e preços são exemplos ilustrativos — nada real."
        >
          <BillingSection />
        </Section>

        {/* ============================================================
            ERROR PAGES (C6b)
            ============================================================ */}
        <Section
          id="error-pages"
          eyebrow="Páginas de erro"
          title="Error Pages"
          description="ErrorPage de página inteira reusando o ErrorState e as ilustrações duotom DNEX: variantes 404, 500, 403 (sem permissão) e offline, com layout centralizado, logo discreto, ação primária (voltar/recarregar) e secundária opcional. Voz de parceiro — “esse erro é nosso, não seu”. Tudo sobrescrevível por prop; abaixo, contida na moldura."
        >
          <ErrorPagesSection />
        </Section>

        {/* App Shell V1.1 — fundamentos e componentes canônicos. */}
        <ShellV11Showcase />

        {/* ============================================================
            APP SHELL
            ============================================================ */}
        <Section
          id="shell"
          eyebrow="Estrutura do hub"
          title="Anatomia do App Shell"
          description="A referência visual é a experiência interativa no início desta página. Aqui, a estrutura é explicada sem introduzir outro layout concorrente. Esta direção ainda está em prévia; não altera os produtos publicados."
        >
          <ShellAnatomy />
        </Section>

        {/* ============================================================
            RESPONSIVO / MOBILE
            ============================================================ */}
        <Section
          id="responsivo"
          eyebrow="Adaptação a telas"
          title="Responsivo / Mobile"
          description="No celular, o conteúdo ocupa a largura disponível. Produtos, empresa, busca e assistência ficam em um painel de navegação; o perfil continua no topo. Cadastros viram cartões e os gráficos mantêm dados e controles acessíveis."
        >
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[length:var(--text-small)] text-fg-muted">
                Reduza a janela ou abra a prévia no celular para conferir a
                adaptação.
              </p>
              <a className="ds-reference-link" href="#experiencia">
                Ver a prévia responsiva <ArrowRight size={16} />
              </a>
            </div>

            {/* o que muda no mobile (resumo desenhado) */}
            <Demo
              label="O que adapta no estreito"
              className="!grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  t: "Produtos sempre à mão",
                  d: "O botão de menu abre os produtos com nomes e indicação do ativo, sem manter uma faixa ocupando a tela.",
                },
                {
                  t: "Menu com espaço para tocar",
                  d: "Um painel próprio reúne todas as páginas, busca, empresa, ajuda e notificações. Fechar devolve o foco à navegação.",
                },
                {
                  t: "KPIs empilham",
                  d: "Grade de StatCards vira 1 coluna; sobe a 2/3 colunas conforme a largura.",
                },
                {
                  t: "Registros se reorganizam",
                  d: "Título, informações secundárias e status se reorganizam em linhas para caber no estreito.",
                },
                {
                  t: "Catálogo acessível",
                  d: "O índice lateral dá lugar ao botão de busca no cabeçalho, com acesso a todas as seções.",
                },
                {
                  t: "Leitura confortável",
                  d: "Títulos se ajustam sem comprimir a leitura. Campos de formulário usam 16 px e ações principais mantêm área de toque confortável.",
                },
              ].map((c) => (
                <div
                  key={c.t}
                  className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)] p-4"
                >
                  <p className="font-display text-[length:var(--text-small)] font-semibold text-fg">
                    {c.t}
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-relaxed text-fg-muted">
                    {c.d}
                  </p>
                </div>
              ))}
            </Demo>
          </div>
        </Section>

        {/* ============================================================
            TELAS DE AUTH (D1c) — page templates em AuthLayout
            ============================================================ */}
        <Section
          id="telas-auth"
          eyebrow="Telas prontas"
          title="Telas de Auth"
          description="Login, cadastro, recuperação de senha, verificação, MFA, convites e bloqueio no AuthLayout real. Uma única marca, largura ajustada ao espaço disponível e rolagem interna apenas quando o formulário não cabe — sem deslocar a página horizontalmente. A prévia usa o mesmo componente dos produtos, em modo embedded. Rodapé institucional é opcional. Conteúdo ilustrativo, sem backend."
        >
          <AuthScreensSection />
        </Section>

        {/* ============================================================
            TELAS DE CONFIGURAÇÕES (D2a) — em SettingsLayout
            ============================================================ */}
        <Section
          id="telas-settings"
          eyebrow="Telas prontas"
          title="Telas de Configurações"
          description="Page templates de settings compostos sobre o SettingsLayout real — Perfil, Segurança (senha + 2FA + sessões), Empresa, Equipe (RBAC em DataTable), Notificações (matriz canal × evento), Faturamento (plano + uso + faturas), Integrações e Chaves de API. A nav lateral troca a seção como num app; cada tela recebe callbacks e desenha estados vazio/erro/sucesso. Conteúdo ilustrativo — billing marcado [CONFIRMAR]."
        >
          <SettingsScreensSection />
        </Section>

        {/* ============================================================
            TELAS DE ONBOARDING (D2b)
            ============================================================ */}
        <Section
          id="telas-onboarding"
          eyebrow="Telas prontas"
          title="Telas de Onboarding"
          description="A jornada pós-signup no AuthLayout real: criar empresa, configurar preferências e convidar a equipe. A largura acompanha a tela e os formulários longos rolam dentro da moldura, mantendo todos os campos e ações acessíveis. Sem marca repetida nem rodapé obrigatório. Conteúdo ilustrativo — o provisionamento real do tenant é do servidor."
        >
          <OnboardingScreensSection />
        </Section>

        {/* ============================================================
            TELAS CRUD (D3) — quarteto genérico no AppLayout
            ============================================================ */}
        <Section
          id="telas-crud"
          eyebrow="Telas prontas"
          title="Telas de CRUD"
          description="Usuários, colaboradores e departamentos na mesma linguagem visual da experiência. Busque, filtre, crie, edite e exclua com confirmação e opção de desfazer. No celular, os registros viram cartões. Todas as alterações são locais e temporárias; nenhum acesso real é modificado."
        >
          <CrudScreensSection />
        </Section>
      </div>
    </div>
  );
}
