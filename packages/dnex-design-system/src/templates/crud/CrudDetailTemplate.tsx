import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../../components/primitives/Button";
import {
  DescriptionList,
  DescriptionItem,
} from "../../components/composed/DescriptionList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/composed/Card";

/**
 * CrudDetailTemplate — o "detalhe" do quarteto CRUD genérico.
 *
 * Cartão de detalhe com cabeçalho (título + subtítulo + ações Editar/Excluir),
 * corpo com DescriptionList (pares rótulo/valor) montado a partir de `fields`,
 * e slots para blocos extras (antes e depois da grade) — ex.: timeline de
 * atividade, anexos, sub-listas.
 *
 * Não recria nada: compõe Card, DescriptionList e Button do DS. Os valores são
 * do consumidor; números/datas/documentos pedem `mono` no campo.
 */

export type CrudDetailField = {
  /** Rótulo apagado (uppercase) do par. */
  label: ReactNode;
  /** Valor — texto ou nó (Badge, link…). */
  value: ReactNode;
  /** Valor em IBM Plex Mono (dinheiro, CNPJ, data). */
  mono?: boolean;
  /** Ocupa a largura toda (endereço, observação). */
  full?: boolean;
};

export type CrudDetailTemplateProps = {
  /** Título do registro (ex.: nome do usuário). */
  title: string;
  /** Subtítulo apagado (ex.: e-mail, código). */
  subtitle?: ReactNode;
  /** Elemento à esquerda do título (ex.: <Avatar>). */
  leading?: ReactNode;

  /** Pares rótulo/valor exibidos na DescriptionList. */
  fields: CrudDetailField[];
  /** Colunas da grade de campos. Default: 2. */
  columns?: 1 | 2 | 3;

  /** Editar o registro (esconde o botão se ausente). */
  onEdit?: () => void;
  /** Excluir o registro (abre confirmação no consumidor). */
  onDelete?: () => void;
  /** Ações extras à direita do cabeçalho, antes de Editar/Excluir. */
  extraActions?: ReactNode;

  /** Bloco antes da grade de campos (ex.: banner, status). */
  beforeFields?: ReactNode;
  /** Blocos após a grade (ex.: <Timeline>, anexos). */
  children?: ReactNode;

  className?: string;
};

export function CrudDetailTemplate({
  title,
  subtitle,
  leading,
  fields,
  columns = 2,
  onEdit,
  onDelete,
  extraActions,
  beforeFields,
  children,
  className,
}: CrudDetailTemplateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {leading}
            <div className="min-w-0">
              <CardTitle>{title}</CardTitle>
              {subtitle && (
                <p className="mt-0.5 truncate text-[0.85rem] text-fg-muted">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {(extraActions || onEdit || onDelete) && (
            <div className="flex shrink-0 items-center gap-2">
              {extraActions}
              {onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<Pencil className="h-4 w-4" />}
                  onClick={onEdit}
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  leadingIcon={<Trash2 className="h-4 w-4" />}
                  onClick={onDelete}
                >
                  Excluir
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardBody className="space-y-6">
          {beforeFields}
          <DescriptionList columns={columns}>
            {fields.map((f, i) => (
              <DescriptionItem
                key={i}
                label={f.label}
                mono={f.mono}
                full={f.full}
              >
                {f.value}
              </DescriptionItem>
            ))}
          </DescriptionList>
        </CardBody>
      </Card>

      {children}
    </div>
  );
}
