import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase, User } from "lucide-react";

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
import { DateInputBR } from "../../components/inputs-br/DateInputBR";
import { ConfirmDialog } from "../../components/composed/ConfirmDialog";
import { useToast } from "../../components/composed/Toast";
import { isValidDateBR } from "../../lib/br";
import {
  CrudListTemplate,
  CrudFormTemplate,
} from "../../templates/crud";

/**
 * CollaboratorsCrud — exemplo aplicado do quarteto: colaboradores (RH).
 *
 * Lista → criar/editar (Sheet, com DateInputBR de admissão e Select de
 * departamento) → excluir (ConfirmDialog). Datas em IBM Plex Mono (assinatura
 * fiscal). Dados ILUSTRATIVOS — pessoas sintéticas, não cadastro real.
 */

export type Collaborator = {
  id: string;
  name: string;
  role: string;
  department: string;
  admittedAt: string; // dd/mm/aaaa
};

const DEPARTMENTS = [
  { value: "Contábil", label: "Contábil" },
  { value: "Fiscal", label: "Fiscal" },
  { value: "Folha & DP", label: "Folha & DP" },
  { value: "Atendimento", label: "Atendimento" },
];

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

const SAMPLE: Collaborator[] = [
  { id: "1", name: "Marina Alves", role: "Contadora", department: "Contábil", admittedAt: "12/03/2021" },
  { id: "2", name: "Rafael Souza", role: "Analista Fiscal", department: "Fiscal", admittedAt: "05/08/2022" },
  { id: "3", name: "Bianca Costa", role: "Analista de DP", department: "Folha & DP", admittedAt: "20/01/2023" },
  { id: "4", name: "Paulo Henrique", role: "Atendimento", department: "Atendimento", admittedAt: "14/06/2020" },
  { id: "5", name: "Camila Dias", role: "Auxiliar Contábil", department: "Contábil", admittedAt: "02/02/2024" },
];

const schema = z.object({
  name: z.string().min(2, "Informe o nome."),
  role: z.string().min(2, "Informe o cargo."),
  department: z.string().min(1, "Selecione o departamento."),
  admittedAt: z
    .string()
    .min(1, "Informe a data de admissão.")
    .refine(isValidDateBR, "Data inválida."),
});
type CollabValues = z.infer<typeof schema>;

export function CollaboratorsCrud() {
  const { toast } = useToast();
  const formId = useId();

  const [items, setItems] = useState<Collaborator[]>(SAMPLE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [toDelete, setToDelete] = useState<Collaborator | null>(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<CollabValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", role: "", department: "", admittedAt: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", role: "", department: "", admittedAt: "" });
    setFormOpen(true);
  }
  function openEdit(c: Collaborator) {
    setEditing(c);
    form.reset({
      name: c.name,
      role: c.role,
      department: c.department,
      admittedAt: c.admittedAt,
    });
    setFormOpen(true);
  }
  function handleSubmit(values: CollabValues) {
    if (editing) {
      setItems((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...values } : c)),
      );
      toast({ title: "Colaborador atualizado", tone: "success" });
    } else {
      setItems((prev) => [...prev, { id: crypto.randomUUID(), ...values }]);
      toast({ title: "Colaborador cadastrado", tone: "success" });
    }
    setFormOpen(false);
  }
  function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((c) => c.id !== toDelete.id));
      setDeleting(false);
      setToDelete(null);
      toast({ title: "Colaborador removido", tone: "info" });
    }, 600);
  }

  const columns = useMemo<ColumnDef<Collaborator>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Colaborador",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar fallback={initialsOf(row.original.name)} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">{row.original.name}</p>
              <p className="truncate text-[0.8rem] text-fg-subtle">
                {row.original.role}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: "Departamento",
        cell: ({ getValue }) => (
          <Badge tone="neutral">{getValue<string>()}</Badge>
        ),
      },
      {
        accessorKey: "admittedAt",
        header: "Admissão",
        meta: { align: "right", mono: true },
        cell: ({ getValue }) => getValue<string>(),
      },
    ],
    [],
  );

  return (
    <>
      <CrudListTemplate<Collaborator>
        title="Colaboradores"
        description="Cadastro de pessoas da operação — cargo, departamento e admissão."
        columns={columns}
        data={items}
        columnLabels={{
          name: "Colaborador",
          department: "Departamento",
          admittedAt: "Admissão",
        }}
        createLabel="Novo colaborador"
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(c) => setToDelete(c)}
        rowActionLabel={(c) => c.name}
        placeholderBusca="Buscar por nome ou cargo…"
        emptyTitle="Nenhum colaborador ainda"
        emptyDescription="Cadastre as pessoas da operação para vinculá-las aos departamentos."
      />

      <CrudFormTemplate
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editing ? "edit" : "create"}
        entityLabel="colaborador"
        formId={formId}
        sheetSize="lg"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Cargo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Analista Fiscal"
                      leadingIcon={<Briefcase />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Departamento</FormLabel>
                  <FormControl>
                    <Select
                      aria-label="Departamento"
                      placeholder="Selecione"
                      value={field.value}
                      onValueChange={field.onChange}
                      items={DEPARTMENTS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="admittedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Data de admissão</FormLabel>
                <FormControl>
                  <DateInputBR
                    hideMessage
                    value={field.value}
                    onChange={field.onChange}
                    disabledDays={{ after: new Date() }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CrudFormTemplate>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(next) => {
          if (!next) setToDelete(null);
        }}
        tone="danger"
        title="Remover colaborador?"
        description={
          toDelete ? (
            <>
              <span className="font-medium text-fg">{toDelete.name}</span> será
              removido do cadastro. Esta ação não pode ser desfeita.
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
