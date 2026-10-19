import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy, KeyRound, Plus } from "lucide-react";
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
import { Table } from "../../components/composed/Table";
import type { Column } from "../../components/composed/Table";
import { EmptyState } from "../../components/composed/EmptyState";
import { Dialog, DialogContent } from "../../components/composed/Dialog";
import { ConfirmDialog } from "../../components/composed/ConfirmDialog";
import { Alert } from "../../components/composed/Alert";
import { SettingsSection } from "./parts";

/**
 * ApiKeysSettings — chaves de API do workspace (D8, enterprise): lista com chave
 * mascarada, criação (mostra a chave em texto puro UMA vez) e revogação via
 * ConfirmDialog. Feature normalmente gated por plano — a UI só reflete.
 *
 * Conteúdo ILUSTRATIVO — chaves são exemplos sintéticos rotulados, nunca reais.
 */

export type ApiKey = {
  id: string;
  name: string;
  /** Prefixo + final mascarado (ex.: "dnex_live_••••3f9a"). */
  masked: string;
  createdAt: string;
  lastUsed?: string;
};

const createSchema = z.object({
  name: z.string().min(2, "Dê um nome à chave (ex.: Integração Faturas)."),
});

export type CreateKeyValues = z.infer<typeof createSchema>;

export type ApiKeysSettingsProps = {
  keys?: ApiKey[];
  /**
   * Cria a chave e RETORNA o segredo em texto puro (mostrado 1×). O app gera o
   * valor no servidor; aqui só exibimos uma vez.
   */
  onCreate?: (values: CreateKeyValues) => Promise<string> | string;
  onRevoke?: (id: string) => void | Promise<void>;
  /** Sem a feature no plano → exibe aviso no lugar da gestão. */
  hasFeature?: boolean;
  createLoading?: boolean;
};

export function ApiKeysSettings({
  keys = [],
  onCreate,
  onRevoke,
  hasFeature = true,
  createLoading,
}: ApiKeysSettingsProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [revealKey, setRevealKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  const form = useForm<CreateKeyValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "" },
  });

  async function submitCreate(values: CreateKeyValues) {
    const secret = await onCreate?.(values);
    form.reset();
    setCreateOpen(false);
    if (secret) {
      setRevealKey(secret);
      setCopied(false);
    }
  }

  function copySecret() {
    if (!revealKey) return;
    void navigator.clipboard?.writeText(revealKey).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  const columns: Column<ApiKey>[] = [
    {
      key: "name",
      header: "Nome",
      cell: (r) => (
        <span className="flex items-center gap-2.5">
          <span className="text-fg-subtle">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-medium text-fg">{r.name}</span>
        </span>
      ),
    },
    { key: "masked", header: "Chave", cell: (r) => r.masked, mono: true },
    { key: "createdAt", header: "Criada em", cell: (r) => r.createdAt, mono: true },
    {
      key: "lastUsed",
      header: "Último uso",
      mono: true,
      cell: (r) => r.lastUsed ?? "—",
    },
    {
      key: "actions",
      header: <span className="sr-only">Ações</span>,
      align: "right",
      cell: (r) => (
        <Button size="sm" variant="ghost" onClick={() => setRevokeTarget(r)}>
          Revogar
        </Button>
      ),
    },
  ];

  if (!hasFeature) {
    return (
      <SettingsSection
        title="Chaves de API"
        description="Acesse o hub programaticamente via API."
      >
        <Alert tone="info" title="Disponível em planos superiores">
          As chaves de API fazem parte de um plano com a feature{" "}
          <span className="font-mono">api-publica</span>. Faça upgrade para
          habilitar. <span className="font-mono">[CONFIRMAR: planos]</span>
        </Alert>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Chaves de API"
      description="Autentique integrações com o hub. Trate as chaves como senhas."
      headerAside={
        <Button
          size="sm"
          leadingIcon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Nova chave
        </Button>
      }
    >
      {keys.length === 0 ? (
        <EmptyState
          icon={<KeyRound />}
          title="Nenhuma chave criada"
          description="Crie uma chave para conectar suas integrações ao hub."
          action={
            <Button
              size="sm"
              leadingIcon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateOpen(true)}
            >
              Criar chave
            </Button>
          }
        />
      ) : (
        <Table columns={columns} data={keys} rowKey={(r) => r.id} />
      )}

      {/* ---------- Criar chave ---------- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          title="Nova chave de API"
          description="Dê um nome que ajude a identificar onde a chave é usada."
        >
          <Form
            form={form}
            onSubmit={form.handleSubmit(submitCreate)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nome da chave</FormLabel>
                  <FormControl>
                    <Input placeholder="Integração Faturas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={createLoading}>
                Criar chave
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---------- Revelar a chave 1× ---------- */}
      <Dialog
        open={revealKey !== null}
        onOpenChange={(o) => !o && setRevealKey(null)}
      >
        <DialogContent
          title="Copie sua chave agora"
          description="Esta é a única vez que a chave aparece por completo. Guarde-a num lugar seguro."
        >
          <div className="space-y-4">
            <Alert tone="warning" title="Mostrada apenas uma vez">
              Por segurança, não armazenamos a chave em texto puro. Se a perder,
              gere uma nova.
            </Alert>
            <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-[var(--surface)] p-2 pl-3.5">
              <code className="min-w-0 flex-1 truncate font-mono text-[0.85rem] text-fg">
                {revealKey}
              </code>
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={
                  copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
                onClick={copySecret}
              >
                {copied ? "Copiada" : "Copiar"}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setRevealKey(null)}>Concluí, fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Revogar ---------- */}
      <ConfirmDialog
        open={revokeTarget !== null}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        tone="danger"
        title="Revogar esta chave?"
        description={
          revokeTarget
            ? `Qualquer integração usando "${revokeTarget.name}" deixará de funcionar imediatamente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Revogar chave"
        onConfirm={() => {
          if (revokeTarget) void onRevoke?.(revokeTarget.id);
          setRevokeTarget(null);
        }}
      />
    </SettingsSection>
  );
}
