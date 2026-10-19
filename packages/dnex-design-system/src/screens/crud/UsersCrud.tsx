import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, ShieldCheck, User } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/form";
import { Input } from "../../components/primitives/Input";
import { Select } from "../../components/primitives/Select";
import { Avatar } from "../../components/primitives/Avatar";
import { Badge } from "../../components/primitives/Badge";
import type { BadgeTone } from "../../components/primitives/Badge";
import { ConfirmDialog } from "../../components/composed/ConfirmDialog";
import { useToast } from "../../components/composed/Toast";
import {
  CrudListTemplate,
  CrudFormTemplate,
} from "../../templates/crud";

/**
 * UsersCrud — exemplo aplicado do quarteto CRUD: usuários do workspace.
 *
 * Lista (CrudListTemplate) → criar/editar num Sheet (CrudFormTemplate + form
 * rhf+zod) → excluir (ConfirmDialog, tone="danger", com o nome do usuário).
 * Estado é local e os dados são ILUSTRATIVOS (sintéticos) — num app real, a
 * lista vem do tRPC e as mutações chamam o servidor; aqui só demonstramos a
 * composição dos templates.
 *
 * RBAC: a coluna de papel e a ação de excluir refletem permissões; o servidor
 * é a autoridade (a UI só esconde/mostra). Conteúdo marcado quando aplicável.
 */

/* ──────────────── domínio ──────────────── */

export type UserRole = "owner" | "admin" | "member" | "viewer";
export type UserStatus = "active" | "invited" | "suspended";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

const ROLE_LABEL: Record<UserRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
  viewer: "Visualizador",
};

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as UserRole[])
  // "owner" não é atribuível por formulário comum (transferência é fluxo à parte).
  .filter((r) => r !== "owner")
  .map((r) => ({ value: r, label: ROLE_LABEL[r] }));

const STATUS_META: Record<UserStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Ativo", tone: "success" },
  invited: { label: "Convidado", tone: "warning" },
  suspended: { label: "Suspenso", tone: "danger" },
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

/* dados ILUSTRATIVOS — sintéticos, não representam usuários reais. */
const SAMPLE_USERS: UserRow[] = [
  { id: "1", name: "Donato Pompilio", email: "donato@empresa.com.br", role: "owner", status: "active" },
  { id: "2", name: "Marina Alves", email: "marina@empresa.com.br", role: "admin", status: "active" },
  { id: "3", name: "Rafael Souza", email: "rafael@empresa.com.br", role: "member", status: "active" },
  { id: "4", name: "Bianca Costa", email: "bianca@empresa.com.br", role: "viewer", status: "invited" },
  { id: "5", name: "Paulo Henrique", email: "paulo@empresa.com.br", role: "member", status: "suspended" },
];

/* ──────────────── form ──────────────── */

const schema = z.object({
  name: z.string().min(2, "Informe o nome."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  role: z.enum(["admin", "member", "viewer"]),
});
type UserFormValues = z.infer<typeof schema>;

export type UsersCrudProps = {
  /** Sobrescreve os dados ilustrativos (ex.: vindos do servidor). */
  users?: UserRow[];
};

export function UsersCrud({ users: usersProp }: UsersCrudProps) {
  const { toast } = useToast();
  const formId = useId();

  const [users, setUsers] = useState<UserRow[]>(usersProp ?? SAMPLE_USERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [toDelete, setToDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", role: "member" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", email: "", role: "member" });
    setFormOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditing(u);
    form.reset({
      name: u.name,
      email: u.email,
      role: u.role === "owner" ? "admin" : u.role,
    });
    setFormOpen(true);
  }

  function handleSubmit(values: UserFormValues) {
    if (editing) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editing.id ? { ...u, ...values } : u)),
      );
      toast({ title: "Usuário atualizado", tone: "success" });
    } else {
      setUsers((prev) => [
        ...prev,
        { id: crypto.randomUUID(), status: "invited", ...values },
      ]);
      toast({
        title: "Convite enviado",
        description: `${values.email} foi convidado(a) como ${ROLE_LABEL[values.role]}.`,
        tone: "success",
      });
    }
    setFormOpen(false);
  }

  function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    // Simula a latência da mutação no servidor.
    window.setTimeout(() => {
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
      setDeleting(false);
      setToDelete(null);
      toast({ title: "Usuário removido", tone: "info" });
    }, 600);
  }

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Usuário",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar fallback={initialsOf(row.original.name)} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">{row.original.name}</p>
              <p className="truncate text-[0.8rem] text-fg-subtle">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Papel",
        cell: ({ getValue }) => (
          <Badge tone="neutral">{ROLE_LABEL[getValue<UserRole>()]}</Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const meta = STATUS_META[getValue<UserStatus>()];
          return (
            <Badge tone={meta.tone}>
              {meta.label}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <CrudListTemplate<UserRow>
        title="Usuários"
        description="Gerencie os membros do workspace, seus papéis e status."
        columns={columns}
        data={users}
        columnLabels={{ name: "Usuário", role: "Papel", status: "Status" }}
        createLabel="Convidar usuário"
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(u) => setToDelete(u)}
        rowActionLabel={(u) => u.name}
        placeholderBusca="Buscar por nome ou e-mail…"
        pageSize={8}
        emptyTitle="Nenhum usuário ainda"
        emptyDescription="Convide a equipe para colaborar neste workspace."
      />

      <CrudFormTemplate
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editing ? "edit" : "create"}
        entityLabel="usuário"
        description={
          editing
            ? "Atualize o nome, o e-mail e o papel deste membro."
            : "Envie um convite por e-mail e defina o papel inicial."
        }
        formId={formId}
        submitLabel={editing ? "Salvar" : "Enviar convite"}
      >
        <Form
          form={form}
          id={formId}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Nome</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder="Nome completo"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Papel</FormLabel>
                <FormControl>
                  <Select
                    aria-label="Papel do usuário"
                    value={field.value}
                    onValueChange={field.onChange}
                    items={ROLE_OPTIONS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-fg-subtle">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            O papel define as permissões no servidor — a interface apenas
            reflete o que o RBAC autoriza.
          </p>
        </Form>
      </CrudFormTemplate>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(next) => {
          if (!next) setToDelete(null);
        }}
        tone="danger"
        title="Remover usuário?"
        description={
          toDelete ? (
            <>
              <span className="font-medium text-fg">{toDelete.name}</span> perderá
              o acesso a este workspace. Esta ação não pode ser desfeita.
            </>
          ) : undefined
        }
        confirmLabel="Remover"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
