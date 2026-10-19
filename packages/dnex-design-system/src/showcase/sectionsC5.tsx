import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Command as CommandIcon,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Trash2,
  User,
} from "lucide-react";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetClose,
  ConfirmDialog,
  ConfirmProvider,
  useConfirm,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  CommandPalette,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  PricingCard,
  UsageMeter,
  FeatureList,
} from "../index";
import type { FeatureItem, SheetSide } from "../index";

import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";
import { Label } from "../components/primitives/Label";
import { Avatar } from "../components/primitives/Avatar";
import { Badge } from "../components/primitives/Badge";
import { Kbd } from "../components/primitives/Kbd";
import { SegmentedControl } from "../components/primitives/SegmentedControl";
import { useToast } from "../components/composed/Toast";
import { Demo } from "./parts";

/* ════════════════════════════════════════════════════════════════════════════
   C5a — OVERLAYS (Sheet · ConfirmDialog · HoverCard)
   ════════════════════════════════════════════════════════════════════════════ */

function SheetDemo() {
  const [side, setSide] = useState<SheetSide>("right");
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[length:var(--text-small)] text-fg-muted">
          Escolha a borda de origem e abra o painel:
        </p>
        <SegmentedControl
          aria-label="Lado do painel"
          value={side}
          onValueChange={setSide}
          size="sm"
          items={[
            { value: "right", label: "Direita" },
            { value: "left", label: "Esquerda" },
            { value: "top", label: "Topo" },
            { value: "bottom", label: "Base" },
          ]}
        />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary">Abrir painel de filtros</Button>
        </SheetTrigger>
        <SheetContent side={side} size="md">
          <SheetHeader
            title="Filtrar lançamentos"
            description="Refine a lista por período, status e categoria. Conteúdo ilustrativo."
          />
          <SheetBody>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="sheet-busca">Buscar</Label>
                <Input id="sheet-busca" placeholder="Descrição ou valor…" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="success">
                    Pago
                  </Badge>
                  <Badge tone="warning">
                    Pendente
                  </Badge>
                  <Badge tone="danger">
                    Atrasado
                  </Badge>
                </div>
              </div>
              <p className="text-[0.8rem] leading-relaxed text-fg-subtle">
                O painel prende o foco, fecha no <span className="font-mono">Esc</span>{" "}
                ou no overlay e desliza a partir da borda escolhida (respeita
                reduced-motion).
              </p>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="ghost" size="sm">
                Limpar
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button size="sm">Aplicar filtros</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ConfirmDemo() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleConfirm() {
    setLoading(true);
    // simula uma ação assíncrona (ex.: chamada de API)
    window.setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast({
        title: "Exclusão simulada",
        description: "Nenhum dado real foi alterado nesta demonstração.",
        tone: "success",
      });
    }, 1200);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="danger" onClick={() => setOpen(true)}>
        Excluir com confirmação
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="Excluir cliente?"
        subject="EMPRESA EXEMPLO LTDA."
        subjectLabel="Cliente selecionado"
        description="O cliente será removido da carteira ativa. A exclusão será bloqueada se houver contratos ou propostas vinculados."
        confirmLabel="Excluir cliente"
        loading={loading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/** Demonstra o uso imperativo via ConfirmProvider + useConfirm. */
function ImperativeConfirm() {
  const confirm = useConfirm();
  const { toast } = useToast();

  async function handleClick() {
    const ok = await confirm({
      title: "Encerrar a sessão?",
      description: "Você precisará entrar de novo no hub DNEX.",
      confirmLabel: "Encerrar",
      tone: "danger",
    });
    if (ok) {
      toast({ title: "Sessão encerrada", tone: "info" });
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick}>
      useConfirm() imperativo
    </Button>
  );
}

/** Mini-cartão de preview de usuário para o HoverCard. */
function UserPreview() {
  return (
    <div className="flex gap-3">
      <Avatar fallback="DP" size="md" />
      <div className="min-w-0">
        <p className="font-display text-[0.95rem] font-semibold text-fg">
          Donato Pompilio
        </p>
        <p className="text-[0.8rem] text-fg-muted">Administrador · DON</p>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-fg-subtle">
          Acesso total ao hub. Último acesso há 2 min. (Dados ilustrativos.)
        </p>
      </div>
    </div>
  );
}

export function OverlaysSection() {
  return (
    // ConfirmProvider envolve só esta seção para demonstrar o useConfirm.
    <ConfirmProvider>
      <div className="grid gap-6">
        <Demo label="Sheet / Drawer — painel lateral genérico (filtros, detalhes, formulários)" className="!block">
          <SheetDemo />
        </Demo>

        <div className="grid gap-6 md:grid-cols-2">
          <Demo label="ConfirmDialog — confirmação sólida · DS 1.2 RC" className="!block">
            <div className="space-y-4">
              <ConfirmDemo />
              <p className="text-[0.8rem] leading-relaxed text-fg-subtle">
                Superfície opaca, registro separado do título e foco inicial em
                Cancelar. Ações de 44 px, empilhadas no celular. Durante o
                carregamento, bloqueia os botões e o fechamento por{" "}
                <span className="font-mono">Esc</span>/overlay. Exemplo fictício.
              </p>
            </div>
          </Demo>

          <Demo label="useConfirm() — API imperativa (promise) via ConfirmProvider" className="!block">
            <div className="space-y-4">
              <ImperativeConfirm />
              <p className="text-[0.8rem] leading-relaxed text-fg-subtle">
                <span className="font-mono">const ok = await confirm(&#123;…&#125;)</span>{" "}
                — sem montar JSX. Resolve <span className="font-mono">true</span>/
                <span className="font-mono">false</span>.
              </p>
            </div>
          </Demo>
        </div>

        <Demo label="HoverCard — preview ao passar o mouse (ou focar) — só leitura">
          <span className="text-[0.9rem] text-fg-muted">
            Atribuído a{" "}
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="font-medium text-[var(--tone-action-fg)] underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  @donato
                </button>
              </HoverCardTrigger>
              <HoverCardContent>
                <UserPreview />
              </HoverCardContent>
            </HoverCard>{" "}
            nesta competência.
          </span>
        </Demo>
      </div>
    </ConfirmProvider>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   C5b — COMMAND PALETTE (⌘K)
   ════════════════════════════════════════════════════════════════════════════ */

export function CommandPaletteSection() {
  // O atalho global pertence à busca da vitrine; esta paleta é um exemplo local.
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  function run(label: string) {
    setOpen(false);
    toast({ title: label, tone: "info" });
  }

  return (
    <div className="grid gap-6">
      <Demo label="Command Palette — demonstração local">
        <Button
          variant="secondary"
          leadingIcon={<CommandIcon className="h-4 w-4" />}
          onClick={() => setOpen(true)}
        >
          Abrir paleta
        </Button>
        <span className="inline-flex items-center gap-1 text-[0.85rem] text-fg-muted">
          <Kbd>⌘</Kbd> <Kbd>K</Kbd> abre a busca do design system
        </span>
      </Demo>

      <p className="text-[0.8rem] leading-relaxed text-fg-subtle">
        Estilo Linear: busca com ranqueamento (cmdk), grupos, navegação completa
        por teclado (setas/Enter/Esc), ícones + atalhos por item e estado vazio.
        Ações abaixo são ilustrativas.
      </p>

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandGroup heading="Navegação">
          <CommandItem
            icon={<LayoutDashboard />}
            shortcut="G D"
            keywords={["painel", "inicio", "home"]}
            onSelect={() => run("Ir para Dashboard")}
          >
            Ir para Dashboard
          </CommandItem>
          <CommandItem
            icon={<Building2 />}
            keywords={["empresa", "cliente"]}
            onSelect={() => run("Abrir Empresas")}
          >
            Abrir Empresas
          </CommandItem>
          <CommandItem
            icon={<FileText />}
            keywords={["nota", "fiscal", "documento"]}
            onSelect={() => run("Ver Documentos")}
          >
            Ver Documentos
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Ações">
          <CommandItem
            icon={<Plus />}
            shortcut="N"
            keywords={["novo", "criar", "adicionar"]}
            onSelect={() => run("Novo lançamento")}
          >
            Novo lançamento
          </CommandItem>
          <CommandItem
            icon={<CreditCard />}
            keywords={["plano", "assinatura", "cobranca"]}
            onSelect={() => run("Gerenciar assinatura")}
          >
            Gerenciar assinatura
          </CommandItem>
          <CommandItem
            icon={<Settings />}
            shortcut="G S"
            onSelect={() => run("Configurações")}
          >
            Configurações
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Conta">
          <CommandItem
            icon={<User />}
            onSelect={() => run("Meu perfil")}
          >
            Meu perfil
          </CommandItem>
          <CommandItem
            icon={<Trash2 />}
            destructive
            keywords={["remover", "excluir"]}
            onSelect={() => run("Excluir conta")}
          >
            Excluir conta
          </CommandItem>
          <CommandItem
            icon={<LogOut />}
            onSelect={() => run("Sair")}
          >
            Sair
          </CommandItem>
        </CommandGroup>
      </CommandPalette>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   C5c — BILLING (Stripe-ready)
   ════════════════════════════════════════════════════════════════════════════ */

/* Planos ILUSTRATIVOS — preços e limites de exemplo. NÃO representam a oferta
   real de nenhum produto do ecossistema DNEX. [CONFIRMAR] preços/limites reais. */
const planFeatures: Record<"essencial" | "pro" | "max", FeatureItem[]> = {
  essencial: [
    { label: "Até 3 empresas", hint: "3" },
    { label: "Dashboard fiscal" },
    { label: "Conciliação manual" },
    { label: "Suporte por e-mail" },
    { label: "Integração bancária", included: false },
    { label: "Usuários ilimitados", included: false },
  ],
  pro: [
    { label: "Até 15 empresas", hint: "15" },
    { label: "Dashboard fiscal" },
    { label: "Conciliação automática" },
    { label: "Integração bancária" },
    { label: "Suporte prioritário" },
    { label: "Usuários ilimitados", included: false },
  ],
  max: [
    { label: "Empresas ilimitadas", hint: "∞" },
    { label: "Dashboard fiscal" },
    { label: "Conciliação automática" },
    { label: "Integração bancária" },
    { label: "Suporte dedicado + SLA" },
    { label: "Usuários ilimitados" },
  ],
};

export function BillingSection() {
  const [period, setPeriod] = useState<"mensal" | "anual">("mensal");
  const { toast } = useToast();

  // preços ILUSTRATIVOS (anual = ~2 meses grátis)
  const preco = {
    essencial: period === "mensal" ? "R$ 0" : "R$ 0",
    pro: period === "mensal" ? "R$ 149" : "R$ 124",
    max: period === "mensal" ? "R$ 349" : "R$ 291",
  };

  // anual mostra o preço mensal equivalente, cobrado uma vez ao ano
  const periodo = "/mês";
  const nota = period === "anual" ? "cobrado anualmente" : "sem fidelidade";

  return (
    <div className="grid gap-8">
      {/* toggle mensal/anual */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl
          aria-label="Periodicidade da cobrança"
          value={period}
          onValueChange={setPeriod}
          items={[
            { value: "mensal", label: "Mensal" },
            { value: "anual", label: "Anual" },
          ]}
        />
        <Badge tone="accent">2 meses grátis no anual</Badge>
      </div>

      {/* grade de planos */}
      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        <PricingCard
          name="Essencial"
          description="Para quem está começando a organizar a casa."
          price={preco.essencial}
          pricePeriod={periodo}
          priceNote={nota}
          period={period}
          current
          features={planFeatures.essencial}
          ctaLabel="Começar grátis"
          onCtaClick={() => toast({ title: "Plano Essencial", tone: "info" })}
        />
        <PricingCard
          name="Pro"
          description="O ponto ideal para a maioria dos escritórios."
          price={preco.pro}
          pricePeriod={periodo}
          priceNote={nota}
          period={period}
          highlighted
          features={planFeatures.pro}
          ctaLabel="Assinar Pro"
          onCtaClick={() => toast({ title: "Assinar Pro", tone: "success" })}
        />
        <PricingCard
          name="Max"
          description="Escala, integrações e suporte dedicado."
          price={preco.max}
          pricePeriod={periodo}
          priceNote={nota}
          period={period}
          features={planFeatures.max}
          ctaLabel="Falar com vendas"
          onCtaClick={() => toast({ title: "Falar com vendas", tone: "info" })}
        />
      </div>

      {/* medidores de uso */}
      <div className="grid gap-6 md:grid-cols-2">
        <Demo label="UsageMeter — uso vs. limite (normal · próximo · estourado · ilimitado)" className="!block">
          <div className="space-y-5">
            <UsageMeter label="Empresas" value={2} limit={3} unit="empresas" />
            <UsageMeter label="Notas fiscais (mês)" value={8420} limit={10000} unit="NFs" />
            <UsageMeter label="Armazenamento" value={9.6} limit={10} unit="GB" />
            <UsageMeter label="Chamadas de API" value={11200} limit={10000} />
            <UsageMeter label="Usuários" value={12} limit={null} unit="usuários" />
          </div>
        </Demo>

        <Demo label="FeatureList — comparação de inclusos / não inclusos" className="!block">
          <FeatureList items={planFeatures.pro} />
          <p className="mt-5 text-[0.8rem] leading-relaxed text-fg-subtle">
            Reutilizada dentro do PricingCard. Check índigo para incluído, traço
            apagado (riscado) para ausente — estado também anunciado a leitores de
            tela. <span className="font-mono">hint</span> em mono para limites.
          </p>
        </Demo>
      </div>

      <p className="text-center text-[0.78rem] text-fg-subtle">
        Planos, preços e limites são <strong className="font-semibold">exemplos ilustrativos</strong>{" "}
        para demonstrar os componentes — não representam a oferta real de nenhum
        produto do ecossistema. <span className="font-mono">[CONFIRMAR]</span>
      </p>

      <div className="flex justify-center">
        <Button trailingIcon={<ArrowRight className="h-4 w-4" />}>
          Ver detalhes do plano
        </Button>
      </div>
    </div>
  );
}
