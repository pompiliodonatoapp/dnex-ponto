import type { ReactNode } from "react";
import { Home, RotateCw } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";
import { Logo } from "../brand/Logo";
import { ErrorState } from "./ErrorState";
import {
  Illustration404,
  Illustration500,
  IllustrationNoConnection,
  IllustrationNoPermission,
} from "../illustrations";

/**
 * ErrorPage — página de erro INTEIRA (não um bloco). Reusa o ErrorState e as
 * ilustrações duotom DNEX, centralizadas em viewport cheio, com logo discreto
 * no topo, atmosfera da página e até duas ações. As variantes (404/500/403/
 * offline) trazem ilustração, código, título e descrição já na voz de parceiro
 * do Manual ("esse erro é nosso, não seu"). Tudo sobrescrevível por prop.
 *
 * Para usar dentro de uma área já moldada (ex.: contido num card de demo),
 * passe `inline` — troca o `min-h-screen` por `min-h-full` e remove o logo.
 *
 * Acessível: a ilustração carrega seu próprio role=img/título; a página usa
 * <main>. Reage a dark/light e densidade por tokens.
 */

export type ErrorPageVariant = "404" | "500" | "403" | "offline";

export type ErrorPageProps = {
  /** Preset de erro. Default: "404". */
  variant?: ErrorPageVariant;
  /** Sobrescreve o título do preset. */
  title?: string;
  /** Sobrescreve a descrição do preset. */
  description?: string;
  /** Sobrescreve o código exibido (use "" para esconder). */
  code?: string;
  /** Sobrescreve a ilustração do preset. */
  illustration?: ReactNode;
  /** Ação primária. Sem isto, usa a ação padrão do preset (ex.: "Início"). */
  action?: ReactNode;
  /** Ação secundária opcional. */
  secondaryAction?: ReactNode;
  /** Renderiza contido (min-h-full, sem logo) em vez de viewport cheio. */
  inline?: boolean;
  /** Esconde o logo do topo (ignorado quando inline). */
  hideLogo?: boolean;
  className?: string;
};

type Preset = {
  code: string;
  illustration: ReactNode;
  title: string;
  description: string;
  defaultAction: ReactNode;
};

const presets: Record<ErrorPageVariant, Preset> = {
  "404": {
    code: "404",
    illustration: <Illustration404 title="Página não encontrada" />,
    title: "Essa página saiu do mapa",
    description:
      "O endereço pode ter mudado ou nunca existiu. Vamos te levar de volta ao começo.",
    defaultAction: (
      <Button asChild leadingIcon={<Home className="h-4 w-4" />}>
        <a href="/">Voltar ao início</a>
      </Button>
    ),
  },
  "500": {
    code: "500",
    illustration: <Illustration500 title="Erro do servidor" />,
    title: "Esse erro é nosso, não seu",
    description:
      "Algo quebrou do nosso lado e já estamos vendo isso. Tente de novo em instantes.",
    defaultAction: (
      <Button
        leadingIcon={<RotateCw className="h-4 w-4" />}
        onClick={() => window.location.reload()}
      >
        Tentar de novo
      </Button>
    ),
  },
  "403": {
    code: "403",
    illustration: <IllustrationNoPermission title="Acesso restrito" />,
    title: "Você não tem acesso a esta área",
    description:
      "Sua conta não tem permissão para abrir esta página. Fale com o administrador da conta para liberar.",
    defaultAction: (
      <Button asChild leadingIcon={<Home className="h-4 w-4" />}>
        <a href="/">Voltar ao início</a>
      </Button>
    ),
  },
  offline: {
    code: "",
    illustration: <IllustrationNoConnection title="Sem conexão" />,
    title: "Você está sem conexão",
    description:
      "Verifique sua internet — assim que voltar, sincronizamos tudo automaticamente.",
    defaultAction: (
      <Button
        leadingIcon={<RotateCw className="h-4 w-4" />}
        onClick={() => window.location.reload()}
      >
        Reconectar
      </Button>
    ),
  },
};

export function ErrorPage({
  variant = "404",
  title,
  description,
  code,
  illustration,
  action,
  secondaryAction,
  inline = false,
  hideLogo = false,
  className,
}: ErrorPageProps) {
  const preset = presets[variant];
  const resolvedCode = code !== undefined ? code : preset.code;

  return (
    <main
      className={cn(
        "relative flex flex-col items-center justify-center px-6 py-16",
        inline ? "min-h-full" : "min-h-screen",
        className,
      )}
    >
      {!inline && !hideLogo && (
        <div className="absolute left-1/2 top-8 -translate-x-1/2 sm:left-8 sm:translate-x-0">
          <Logo height={24} />
        </div>
      )}

      <ErrorState
        illustration={illustration ?? preset.illustration}
        code={resolvedCode || undefined}
        title={title ?? preset.title}
        description={description ?? preset.description}
        action={action ?? preset.defaultAction}
        secondaryAction={secondaryAction}
        className="max-w-lg"
      />
    </main>
  );
}
