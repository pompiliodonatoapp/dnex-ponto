import { LifeBuoy, LogOut } from "lucide-react";
import { Button } from "../../components/primitives/Button";
import { ErrorState } from "../../components/composed/ErrorState";
import { IllustrationNoPermission } from "../../components/illustrations";
import { Card } from "../../components/composed/Card";

/**
 * AccountBlockedScreen — comunica que a conta (ou o tenant) está bloqueada e
 * aponta o caminho de resolução. Dois motivos suportados:
 *  - "suspended": tenant suspenso por faturamento (billing);
 *  - "blocked": usuário bloqueado por um administrador.
 * Estático, com CTA de contato/suporte (e sair, opcional). Voz de parceiro.
 */

export type AccountBlockedReason = "suspended" | "blocked";

export type AccountBlockedScreenProps = {
  reason?: AccountBlockedReason;
  /** Sobrescreve o título/descrição padrão do motivo. */
  title?: string;
  description?: string;
  /** URL de contato/suporte. */
  supportHref?: string;
  onContactSupport?: () => void;
  onLogout?: () => void;
};

const COPY: Record<AccountBlockedReason, { title: string; description: string }> = {
  suspended: {
    title: "Acesso suspenso",
    description:
      "O acesso desta empresa está temporariamente suspenso por uma pendência de pagamento. Regularize para reativar — seus dados continuam seguros.",
  },
  blocked: {
    title: "Conta bloqueada",
    description:
      "Sua conta foi bloqueada por um administrador. Se acha que houve um engano, fale com o suporte que a gente resolve.",
  },
};

export function AccountBlockedScreen({
  reason = "blocked",
  title,
  description,
  supportHref,
  onContactSupport,
  onLogout,
}: AccountBlockedScreenProps) {
  const copy = COPY[reason];

  const contactButton = supportHref ? (
    <Button asChild leadingIcon={<LifeBuoy className="h-4 w-4" />}>
      <a href={supportHref}>Falar com o suporte</a>
    </Button>
  ) : (
    <Button
      onClick={onContactSupport}
      leadingIcon={<LifeBuoy className="h-4 w-4" />}
    >
      Falar com o suporte
    </Button>
  );

  return (
    <Card className="w-full overflow-hidden">
      <ErrorState
        illustration={<IllustrationNoPermission title="Acesso bloqueado" />}
        title={title ?? copy.title}
        description={description ?? copy.description}
        action={contactButton}
        secondaryAction={
          onLogout && (
            <Button
              variant="ghost"
              onClick={onLogout}
              leadingIcon={<LogOut className="h-4 w-4" />}
            >
              Sair
            </Button>
          )
        }
      />
    </Card>
  );
}
