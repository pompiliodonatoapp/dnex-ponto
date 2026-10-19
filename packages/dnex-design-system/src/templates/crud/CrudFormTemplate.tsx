import type { ReactNode } from "react";
import { Button } from "../../components/primitives/Button";
import { Alert } from "../../components/composed/Alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
} from "../../components/composed/Sheet";
import type { SheetSize } from "../../components/composed/Sheet";
import {
  Dialog,
  DialogContent,
} from "../../components/composed/Dialog";

/**
 * CrudFormTemplate — a "moldura de formulário" do quarteto CRUD genérico.
 *
 * Hospeda o form de criar/editar num <Sheet> (lateral, default) OU num
 * <Dialog> (modal) — escolha por prop `surface`. O CONTEÚDO do form (os campos
 * + o próprio <Form id={formId}> rhf+zod) é `children` do consumidor; este
 * template só provê o cromo: título por modo (create/edit), barra de ações
 * (Salvar/Cancelar), estado de loading (bloqueia e mostra spinner no Salvar) e
 * um Alert de erro do servidor no topo.
 *
 * Padrão de submit: o consumidor renderiza <Form id={formId} onSubmit={…}> com
 * os campos; o botão "Salvar" do rodapé é type="submit" + form={formId}, então
 * dispara a validação/submit do RHF mesmo morando fora do <form> (Radix porta o
 * conteúdo). Por isso `formId` é obrigatório.
 *
 * Não recria nada: compõe Sheet/Dialog, Button e Alert do DS.
 */

export type CrudFormMode = "create" | "edit";
export type CrudFormSurface = "sheet" | "dialog";

export type CrudFormTemplateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Onde o form vive: "sheet" (lateral, default) ou "dialog" (modal). */
  surface?: CrudFormSurface;
  /** create → "Novo …" · edit → "Editar …". Compõe o título. */
  mode: CrudFormMode;
  /** Nome da entidade no singular (ex.: "usuário") para o título automático. */
  entityLabel: string;
  /** Sobrescreve o título automático, se quiser. */
  title?: string;
  description?: string;

  /**
   * Id do <form> rhf que o consumidor renderiza nos children. O botão "Salvar"
   * usa `form={formId}` para submeter de fora do <form> (Radix porta o painel).
   */
  formId: string;
  /** Campos do form (o consumidor monta <Form id={formId}>…campos…</Form>). */
  children: ReactNode;

  submitLabel?: string;
  cancelLabel?: string;
  /** Bloqueia ambos os botões e mostra spinner no Salvar. */
  loading?: boolean;
  /** Erro do servidor exibido como Alert no topo do corpo. */
  error?: string | null;

  /** Tamanho do Sheet (ignorado no modo dialog). Default: "md". */
  sheetSize?: SheetSize;
};

export function CrudFormTemplate({
  open,
  onOpenChange,
  surface = "sheet",
  mode,
  entityLabel,
  title,
  description,
  formId,
  children,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  loading = false,
  error = null,
  sheetSize = "md",
}: CrudFormTemplateProps) {
  const resolvedTitle =
    title ?? (mode === "create" ? `Novo ${entityLabel}` : `Editar ${entityLabel}`);

  const errorBlock = error ? (
    <Alert tone="danger" title="Não foi possível salvar" className="mb-5">
      {error}
    </Alert>
  ) : null;

  const footerActions = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => onOpenChange(false)}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" form={formId} size="sm" loading={loading}>
        {submitLabel}
      </Button>
    </>
  );

  if (surface === "dialog") {
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (loading && !next) return;
          onOpenChange(next);
        }}
      >
        <DialogContent title={resolvedTitle} description={description}>
          {errorBlock}
          {children}
          <div className="mt-6 flex justify-end gap-2">{footerActions}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (loading && !next) return;
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        size={sheetSize}
        // Não fecha por Esc/overlay enquanto salva.
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
        onInteractOutside={(e) => loading && e.preventDefault()}
      >
        <SheetHeader title={resolvedTitle} description={description} />
        <SheetBody>
          {errorBlock}
          {children}
        </SheetBody>
        <SheetFooter>{footerActions}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
