import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/composed/Card";

/**
 * Blocos compartilhados das telas de Configurações (D2a). São primitivos de
 * COMPOSIÇÃO desta camada de telas (não viram componentes públicos do DS): uma
 * "seção de settings" (título + descrição + corpo + rodapé de ação) e uma
 * "linha de preferência" (rótulo à esquerda, controle à direita) — o idioma
 * visual do perfil de gosto: superfície que respira, ação com avareza.
 *
 * Tudo via tokens; zero valor mágico. Conteúdo é responsabilidade de quem usa
 * as telas — aqui só a moldura.
 */

export type SettingsSectionProps = {
  title: string;
  description?: ReactNode;
  /** Ação no topo direito do cabeçalho (ex.: badge de status). */
  headerAside?: ReactNode;
  children: ReactNode;
  /** Rodapé de ações (ex.: botão Salvar). Aparece sobre uma divisória. */
  footer?: ReactNode;
  className?: string;
};

/** Seção de configurações — um Card glass com cabeçalho, corpo e rodapé opcional. */
export function SettingsSection({
  title,
  description,
  headerAside,
  children,
  footer,
  className,
}: SettingsSectionProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {headerAside && <div className="shrink-0">{headerAside}</div>}
        </div>
      </CardHeader>
      <CardBody className="pt-5">{children}</CardBody>
      {footer && <CardFooter className="justify-end">{footer}</CardFooter>}
    </Card>
  );
}

/**
 * Linha de preferência — rótulo + descrição à esquerda, controle à direita.
 * Empilha no estreito. Base para as listas de toggles (notificações, segurança).
 */
export function SettingRow({
  label,
  description,
  control,
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5 pr-4">
        <span className="block text-[0.92rem] font-medium text-fg">{label}</span>
        {description && (
          <span className="block text-[0.82rem] leading-relaxed text-fg-subtle">
            {description}
          </span>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/** Wrapper que separa linhas de preferência por divisórias finas. */
export function SettingRows({ children }: { children: ReactNode }) {
  return <div className="-my-4 divide-y divide-line">{children}</div>;
}

/** Container de uma grade de seções (espaçamento vertical consistente). */
export function SettingsStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
