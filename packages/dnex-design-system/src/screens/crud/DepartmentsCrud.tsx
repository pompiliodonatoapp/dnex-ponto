import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, User, Users } from "lucide-react";

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
import { Button } from "../../components/primitives/Button";
import { ConfirmDialog } from "../../components/composed/ConfirmDialog";
import { useToast } from "../../components/composed/Toast";
import {
  CrudListTemplate,
  CrudFormTemplate,
  CrudDetailTemplate,
} from "../../templates/crud";

/**
 * DepartmentsCrud — exemplo aplicado do quarteto completo: departamentos.
 *
 * Lista → detalhe (CrudDetailTemplate, com DescriptionList) → criar/editar
 * (CrudFormTemplate em Sheet) → excluir (ConfirmDialog). Demonstra os QUATRO
 * pontos do quarteto numa só tela: ao "Ver detalhes" troca a vista para o
 * detalhe, com "Voltar". Dados ILUSTRATIVOS.
 */

export type Department = {
  id: string;
  name: string;
  lead: string;
  members: number;
};

const LEAD_OPTIONS = [
  { value: "Marina Alves", label: "Marina Alves" },
  { value: "Rafael Souza", label: "Rafael Souza" },
  { value: "Bianca Costa", label: "Bianca Costa" },
  { value: "Paulo Henrique", label: "Paulo Henrique" },
];

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

const SAMPLE: Department[] = [
  { id: "1", name: "Contábil", lead: "Marina Alves", members: 8 },
  { id: "2", name: "Fiscal", lead: "Rafael Souza", members: 6 },
  { id: "3", name: "Folha & DP", lead: "Bianca Costa", members: 4 },
  { id: "4", name: "Atendimento", lead: "Paulo Henrique", members: 5 },
];

const schema = z.object({
  name: z.string().min(2, "Informe o nome do departamento."),
  lead: z.string().min(1, "Selecione o responsável."),
});
type DeptValues = z.infer<typeof schema>;

export function DepartmentsCrud() {
  const { toast } = useToast();
  const formId = useId();

  const [items, setItems] = useState<Department[]>(SAMPLE);
  const [viewing, setViewing] = useState<Department | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [toDelete, setToDelete] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<DeptValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", lead: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", lead: "" });
    setFormOpen(true);
  }
  function openEdit(d: Department) {
    setEditing(d);
    form.reset({ name: d.name, lead: d.lead });
    setFormOpen(true);
  }
  function handleSubmit(values: DeptValues) {
    if (editing) {
      setItems((prev) =>
        prev.map((d) => (d.id === editing.id ? { ...d, ...values } : d)),
      );
      setViewing((v) => (v && v.id === editing.id ? { ...v, ...values } : v));
      toast({ title: "Departamento atualizado", tone: "success" });
    } else {
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), members: 0, ...values },
      ]);
      toast({ title: "Departamento criado", tone: "success" });
    }
    setFormOpen(false);
  }
  function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((d) => d.id !== toDelete.id));
      setViewing((v) => (v && v.id === toDelete.id ? null : v));
      setDeleting(false);
      setToDelete(null);
      toast({ title: "Departamento removido", tone: "info" });
    }, 600);
  }

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Departamento",
        cell: ({ row }) => (
          <span className="font-medium text-fg">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "lead",
        header: "Responsável",
        cell: ({ getValue }) => {
          const lead = getValue<string>();
          return (
            <div className="flex items-center gap-2.5">
              <Avatar fallback={initialsOf(lead)} size="sm" />
              <span className="text-fg-muted">{lead}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "members",
        header: "Membros",
        meta: { align: "right", mono: true },
        cell: ({ getValue }) => getValue<number>(),
      },
    ],
    [],
  );

  // Vista de DETALHE (quarteto: o detalhe do registro).
  if (viewing) {
    return (
      <>
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewing(null)}>
            ← Voltar para a lista
          </Button>
        </div>
        <CrudDetailTemplate
          title={viewing.name}
          subtitle="Departamento"
          leading={
            <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-card)] bg-[rgba(79,70,229,0.12)] text-indigo-300">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
          }
          fields={[
            { label: "Nome", value: viewing.name },
            {
              label: "Responsável",
              value: (
                <span className="inline-flex items-center gap-2">
                  <Avatar fallback={initialsOf(viewing.lead)} size="sm" />
                  {viewing.lead}
                </span>
              ),
            },
            { label: "Nº de membros", value: viewing.members, mono: true },
            {
              label: "Situação",
              value: (
                <Badge tone="success">
                  Ativo
                </Badge>
              ),
            },
          ]}
          onEdit={() => openEdit(viewing)}
          onDelete={() => setToDelete(viewing)}
        />

        <CrudFormTemplate
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={editing ? "edit" : "create"}
          entityLabel="departamento"
          formId={formId}
        >
          <DeptForm form={form} formId={formId} onSubmit={handleSubmit} />
        </CrudFormTemplate>

        <ConfirmDialog
          open={!!toDelete}
          onOpenChange={(next) => {
            if (!next) setToDelete(null);
          }}
          tone="danger"
          title="Excluir departamento?"
          description={
            toDelete ? (
              <>
                <span className="font-medium text-fg">{toDelete.name}</span> será
                removido. Os colaboradores vinculados ficam sem departamento.
              </>
            ) : undefined
          }
          confirmLabel="Excluir"
          loading={deleting}
          onConfirm={confirmDelete}
        />
      </>
    );
  }

  // Vista de LISTA.
  return (
    <>
      <CrudListTemplate<Department>
        title="Departamentos"
        description="Estrutura organizacional do workspace."
        columns={columns}
        data={items}
        columnLabels={{ name: "Departamento", lead: "Responsável", members: "Membros" }}
        createLabel="Novo departamento"
        onCreate={openCreate}
        onView={(d) => setViewing(d)}
        onEdit={openEdit}
        onDelete={(d) => setToDelete(d)}
        rowActionLabel={(d) => d.name}
        placeholderBusca="Buscar departamento…"
        emptyTitle="Nenhum departamento ainda"
        emptyDescription="Crie a estrutura para organizar os colaboradores."
      />

      <CrudFormTemplate
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editing ? "edit" : "create"}
        entityLabel="departamento"
        formId={formId}
      >
        <DeptForm form={form} formId={formId} onSubmit={handleSubmit} />
      </CrudFormTemplate>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(next) => {
          if (!next) setToDelete(null);
        }}
        tone="danger"
        title="Excluir departamento?"
        description={
          toDelete ? (
            <>
              <span className="font-medium text-fg">{toDelete.name}</span> será
              removido. Os colaboradores vinculados ficam sem departamento.
            </>
          ) : undefined
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}

/* Corpo do form extraído para reuso entre a vista de lista e a de detalhe. */
function DeptForm({
  form,
  formId,
  onSubmit,
}: {
  form: UseFormReturn<DeptValues>;
  formId: string;
  onSubmit: (values: DeptValues) => void;
}) {
  return (
    <Form
      form={form}
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
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
                placeholder="Ex.: Contábil"
                leadingIcon={<Users />}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lead"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Responsável</FormLabel>
            <FormControl>
              <Select
                aria-label="Responsável pelo departamento"
                placeholder="Selecione o responsável"
                value={field.value}
                onValueChange={field.onChange}
                items={LEAD_OPTIONS}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <p className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-fg-subtle">
        <User className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
        O nº de membros é calculado a partir dos colaboradores vinculados.
      </p>
    </Form>
  );
}
