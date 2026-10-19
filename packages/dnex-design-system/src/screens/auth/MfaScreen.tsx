import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "../../components/primitives/Button";
import { Alert } from "../../components/composed/Alert";
import { OtpInput } from "../../components/auth/OtpInput";
import { AuthCard, AuthLink } from "./AuthCard";

/**
 * MfaScreen — desafio de 2º fator no login. O usuário digita o código de 6
 * dígitos do app autenticador (TOTP). Oferece o caminho de código de
 * recuperação (recovery) via callback. Copy sóbria, pt-BR.
 */

export type MfaScreenProps = {
  onSubmit: (code: string) => void | Promise<void>;
  /** Usar um código de recuperação no lugar do app. */
  onUseRecoveryCode?: () => void;
  onBackToLogin?: () => void;
  error?: string | null;
  loading?: boolean;
  length?: number;
};

export function MfaScreen({
  onSubmit,
  onUseRecoveryCode,
  onBackToLogin,
  error,
  loading,
  length = 6,
}: MfaScreenProps) {
  const [code, setCode] = useState("");

  return (
    <AuthCard
      media={
        <span className="grid h-14 w-14 place-items-center rounded-[var(--radius-card)] bg-[rgba(79,70,229,0.14)] text-[var(--tone-action-fg)]">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </span>
      }
      title="Verificação em duas etapas"
      description="Abra seu aplicativo autenticador e digite o código de 6 dígitos para continuar."
      footer={<AuthLink onClick={onBackToLogin}>Cancelar e voltar</AuthLink>}
    >
      <div className="space-y-5">
        {error && (
          <Alert tone="danger" title="Código incorreto">
            {error}
          </Alert>
        )}

        <div className="flex flex-col items-center gap-4">
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={onSubmit}
            length={length}
            invalid={!!error}
            disabled={loading}
            autoFocus
            aria-label="Código do aplicativo autenticador"
          />

          <Button
            onClick={() => onSubmit(code)}
            loading={loading}
            disabled={code.length < length}
            className="w-full"
          >
            Confirmar
          </Button>
        </div>

        {onUseRecoveryCode && (
          <p className="text-center text-[0.85rem] text-fg-muted">
            Sem acesso ao app?{" "}
            <AuthLink onClick={onUseRecoveryCode}>
              Usar código de recuperação
            </AuthLink>
          </p>
        )}
      </div>
    </AuthCard>
  );
}
