import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Mail, MoreHorizontal, Pencil, UserPlus } from "lucide-react";
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
import { Avatar } from "../../components/primitives/Avatar";
import { Badge } from "../../components/primitives/Badge";
import { Select } from "../../components/primitives/Select";
import type { BadgeTone } from "../../components/primitives/Badge";
import { DataTable } from "../../components/composed/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/composed/DropdownMenu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetClose,
} from "../../components/composed/Sheet";
import { ConfirmDialog } from "../../components/composed/ConfirmDialog";
import { EmptyState } from "../../components/composed/EmptyState";
import { SettingsSection } from "./parts";

/**
 * TeamSettings — membros do workspace (C1/D4): tabela com nome, e-mail, papel
 * (RBAC), departamento e status; convidar via Sheet (e-mail + papel +
 * departamento); editar (nome/e-mail/papel/departamento) via Sheet; alterar
 * papel direto na linha; regenerar senha e remover via ConfirmDialog. A UI só
 * REFLETE permissões — a autoridade é o servidor (rbac-controle-acesso).
 * Papéis: owner/admin/member/viewer.
 *
 * Conteúdo ILUSTRATIVO — membros, e-mails e departamentos são exemplos.
 */

export type TeamRole = "owner" | "admin" | "member" | "viewer";
export type MemberStatus = "active" | "invited" | "suspended";

/** Departamento ao qual o membro está vinculado (ex.: Fiscal, Contábil). */
export type Department = { id: string; name: string };

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  /** Departamento vinculado (id de `departments`). Opcional. */
  departmentId?: string;
};

export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
  viewer: "Visualizador",
};

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

/** Papéis atribuíveis pela UI (owner é protegido — transferência é outro fluxo). */
const ASSIGNABLE_ROLE_OPTIONS = ROLE_OPTIONS.filter((o) => o.value !== "owner");

const STATUS_META: Record<
  MemberStatus,
  { label: string; tone: BadgeTone }
> = {
  active: { label: "Ativo", tone: "success" },
  invited: { label: "Convidado", tone: "warning" },
  suspended: { label: "Suspenso", tone: "danger" },
};

/* ---------- Convite ---------- */

const inviteSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  role: z.enum(["owner", "admin", "member", "viewer"]),
  departmentId: z.string().optional(),
});

export type InviteValues = z.infer<typeof inviteSchema>;

/* ---------- Edição ---------- */

const editSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  role: z.enum(["owner", "admin", "member", "viewer"]),
  departmentId: z.string().optional(),
});

export type EditMemberValues = z.infer<typeof editSchema>;

export type TeamSettingsProps = {
  members?: TeamMember[];
  /** Departamentos disponíveis para vincular a membros. */
  departments?: Department[];
  /** Convidar um novo membro. */
  onInvite?: (values: InviteValues) => void | Promise<void>;
  /** Salvar a edição de um membro existente. */
  onEdit?: (id: string, values: EditMemberValues) => void | Promise<void>;
  /** Alterar o papel de um membro. */
  onChangeRole?: (id: string, role: TeamRole) => void | Promise<void>;
  /** Remover um membro do workspace. */
  onRemove?: (id: string) => void | Promise<void>;
  /** Regenerar a senha de acesso de um membro. */
  onResetPassword?: (member: TeamMember) => void | Promise<void>;
  /** Reenviar convite a um membro pendente. */
  onResendInvite?: (id: string) => void;
  inviteLoading?: boolean;
  inviteError?: string | null;
  editLoading?: boolean;
  editError?: string | null;
  /** Esconde ações de gestão (usuário sem permissão). */
  canManage?: boolean;
};

export function TeamSettings({
  members = [],
  departments = [],
  onInvite,
  onEdit,
  onChangeRole,
  onRemove,
  onResetPassword,
  onResendInvite,
  inviteLoading,
  inviteError,
  editLoading,
  editError,
  canManage = true,
}: TeamSettingsProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [resetTarget, setResetTarget] = useState<TeamMember | null>(null);

  // Mapa id→nome para exibir o departamento na tabela sem varrer o array.
  const departmentName = useMemo(() => {
    const map = new Map(departments.map((d) => [d.id, d.name]));
    return (id?: string) => (id ? map.get(id) : undefined);
  }, [departments]);

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments],
  );

  const inviteForm = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member", departmentId: "" },
  });

  const editForm = useForm<EditMemberValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", email: "", role: "member", departmentId: "" },
  });

  // Ao abrir a edição, carrega os dados do membro selecionado no form.
  useEffect(() => {
    if (editTarget) {
      editForm.reset({
        name: editTarget.name,
        email: editTarget.email,
        role: editTarget.role,
        departmentId: editTarget.departmentId ?? "",
      });
    }
  }, [editTarget, editForm]);

  function submitInvite(values: InviteValues) {
    void onInvite?.({
      ...values,
      departmentId: values.departmentId || undefined,
    });
    inviteForm.reset();
    setInviteOpen(false);
  }

  function submitEdit(values: EditMemberValues) {
    if (!editTarget) return;
    void onEdit?.(editTarget.id, {
      ...values,
      departmentId: values.departmentId || undefined,
    });
    setEditTarget(null);
  }

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        id: "member",
        header: "Membro",
        accessorFn: (row) => `${row.name} ${row.email}`,
        cell: ({ row }) => {
          const m = row.original;
          const initials = m.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join("");
          return (
            <div className="flex items-center gap-3">
              <Avatar fallback={initials || "?"} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">{m.name}</p>
                <p className="truncate font-mono text-[0.78rem] text-fg-subtle">
                  {m.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "department",
        header: "Departamento",
        accessorFn: (row) => departmentName(row.departmentId) ?? "",
        cell: ({ row }) => {
          const name = departmentName(row.original.departmentId);
          return name ? (
            <span className="text-[0.88rem] text-fg-muted">{name}</span>
          ) : (
            <span className="text-[0.88rem] text-fg-subtle">—</span>
          );
        },
      },
      {
        id: "role",
        header: "Papel",
        accessorKey: "role",
        cell: ({ row }) => {
          const m = row.original;
          // Owner não muda de papel por aqui (transferência é outro fluxo).
          if (!canManage || m.role === "owner") {
            return (
              <span className="text-[0.88rem] text-fg-muted">
                {ROLE_LABELS[m.role]}
              </span>
            );
          }
          return (
            <Select
              aria-label={`Papel de ${m.name}`}
              value={m.role}
              onValueChange={(v) => onChangeRole?.(m.id, v as TeamRole)}
              items={ASSIGNABLE_ROLE_OPTIONS}
              className="h-9 max-w-[12rem] text-[0.88rem]"
            />
          );
        },
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const meta = STATUS_META[row.original.status];
          return (
            <Badge tone={meta.tone}>
              {meta.label}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Ações</span>,
        enableSorting: false,
        enableHiding: false,
        size: 56,
        cell: ({ row }) => {
          const m = row.original;
          if (!canManage || m.role === "owner") return null;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Ações de ${m.name}`}
                    className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-fg-subtle outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditTarget(m)}>
                    <Pencil /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setResetTarget(m)}>
                    <KeyRound /> Regenerar senha
                  </DropdownMenuItem>
                  {m.status === "invited" && (
                    <DropdownMenuItem onSelect={() => onResendInvite?.(m.id)}>
                      <Mail /> Reenviar convite
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    onSelect={() => setRemoveTarget(m)}
                  >
                    Remover do workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [canManage, departmentName, onChangeRole, onResendInvite],
  );

  return (
    <SettingsSection
      title="Equipe"
      description="Membros do workspace, departamentos e papéis. As permissões são aplicadas no servidor."
      headerAside={
        canManage && (
          <Button
            size="sm"
            leadingIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setInviteOpen(true)}
          >
            Convidar
          </Button>
        )
      }
    >
      <DataTable
        columns={columns}
        data={members}
        columnLabels={{
          member: "Membro",
          department: "Departamento",
          role: "Papel",
          status: "Status",
        }}
        placeholderBusca="Buscar por nome ou e-mail…"
        enableDensity={false}
        pageSize={8}
        empty={
          <EmptyState
            icon={<UserPlus />}
            title="Ninguém na equipe ainda"
            description="Convide colegas por e-mail e defina o papel de cada um."
            action={
              canManage && (
                <Button
                  size="sm"
                  leadingIcon={<UserPlus className="h-4 w-4" />}
                  onClick={() => setInviteOpen(true)}
                >
                  Convidar membro
                </Button>
              )
            }
          />
        }
      />

      {/* ---------- Sheet de convite ---------- */}
      <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
        <SheetContent side="right" size="md">
          <SheetHeader
            title="Convidar para a equipe"
            description="Enviaremos um convite por e-mail. O papel define o que a pessoa pode fazer."
          />
          <Form
            form={inviteForm}
            onSubmit={inviteForm.handleSubmit(submitInvite)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <SheetBody className="space-y-5">
              {inviteError && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-control)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-3.5 py-2.5 text-[0.85rem] text-[#f87171]"
                >
                  {inviteError}
                </p>
              )}

              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="off"
                        placeholder="colega@empresa.com.br"
                        leadingIcon={<Mail />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Papel</FormLabel>
                    <FormControl>
                      <Select
                        aria-label="Papel do convidado"
                        value={field.value}
                        onValueChange={field.onChange}
                        items={ASSIGNABLE_ROLE_OPTIONS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {departmentOptions.length > 0 && (
                <FormField
                  control={inviteForm.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Select
                          aria-label="Departamento do convidado"
                          placeholder="Selecione um departamento…"
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          items={departmentOptions}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </SheetBody>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </SheetClose>
              <Button type="submit" loading={inviteLoading}>
                Enviar convite
              </Button>
            </SheetFooter>
          </Form>
        </SheetContent>
      </Sheet>

      {/* ---------- Sheet de edição ---------- */}
      <Sheet
        open={editTarget !== null}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <SheetContent side="right" size="md">
          <SheetHeader
            title="Editar membro"
            description="Atualize o nome, o contato, o papel e o departamento. As permissões valem após salvar."
          />
          <Form
            form={editForm}
            onSubmit={editForm.handleSubmit(submitEdit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <SheetBody className="space-y-5">
              {editError && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-control)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-3.5 py-2.5 text-[0.85rem] text-[#f87171]"
                >
                  {editError}
                </p>
              )}

              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="off"
                        placeholder="colega@empresa.com.br"
                        leadingIcon={<Mail />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Papel</FormLabel>
                    <FormControl>
                      <Select
                        aria-label="Papel do membro"
                        value={field.value}
                        onValueChange={field.onChange}
                        items={ASSIGNABLE_ROLE_OPTIONS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {departmentOptions.length > 0 && (
                <FormField
                  control={editForm.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Select
                          aria-label="Departamento do membro"
                          placeholder="Selecione um departamento…"
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          items={departmentOptions}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </SheetBody>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </SheetClose>
              <Button type="submit" loading={editLoading}>
                Salvar alterações
              </Button>
            </SheetFooter>
          </Form>
        </SheetContent>
      </Sheet>

      {/* ---------- Confirmar regeneração de senha ---------- */}
      <ConfirmDialog
        open={resetTarget !== null}
        onOpenChange={(o) => !o && setResetTarget(null)}
        title="Regenerar a senha deste membro?"
        description={
          resetTarget
            ? `Uma nova senha será gerada para ${resetTarget.name} e a senha atual deixará de funcionar imediatamente.`
            : undefined
        }
        confirmLabel="Regenerar senha"
        onConfirm={() => {
          if (resetTarget) void onResetPassword?.(resetTarget);
          setResetTarget(null);
        }}
      />

      {/* ---------- Confirmar remoção ---------- */}
      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        tone="danger"
        title="Remover este membro?"
        description={
          removeTarget
            ? `${removeTarget.name} perderá o acesso a este workspace imediatamente.`
            : undefined
        }
        confirmLabel="Remover"
        onConfirm={() => {
          if (removeTarget) void onRemove?.(removeTarget.id);
          setRemoveTarget(null);
        }}
      />
    </SettingsSection>
  );
}
