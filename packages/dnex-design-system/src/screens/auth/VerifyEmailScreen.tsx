import { useState } from "react";
import { Button } from "../../components/primitives/Button";
import { Alert } from "../../components/composed/Alert";
import { IllustrationOnboarding } from "../../components/illustrations";
import { OtpInput } from "../../components/auth/OtpInput";
import { AuthCard, AuthLink } from "./AuthCard";

/**
 * VerifyEmailScreen — confirma o e-mail por código de 6 dígitos (OtpInput).
 * Mostra o e-mail de destino, permite reenviar (com cooldown opcional exposto
 * via prop) e trata erro de código inválido. `onVerify` recebe o código quando
 * completo; o app valida no servidor.
 */

export type VerifyEmailScreenProps = {
  /** E-mail para onde o código foi enviado. */
  email?: string;
  onVerify: (code: string) => void | Promise<void>;
  onResend?: () => void;
  onBackToLogin?: () => void;
  error?: string | null;
  loading?: boolean;
  /** Segundos restantes para reenviar (0 = pode reenviar). */
  resendIn?: number;
  /** Tamanho do código. Default 6. */
  length?: number;
};

export function VerifyEmailScreen({
  email,
  onVerify,
  onResend,
  onBackToLogin,
  error,
  loading,
  resendIn = 0,
  length = 6,
}: VerifyEmailScreenProps) {
  const [code, setCode] = useState("");
  const canResend = resendIn <= 0;

  return (
    <AuthCard
      media={<IllustrationOnboarding size={88} />}
      title="Confirme seu e-mail"
      description={
        <>
          Enviamos um código de {length} dígitos para{" "}
          <span className="font-medium text-fg">{email || "seu e-mail"}</span>.
          Digite-o abaixo para ativar sua conta.
        </>
      }
      footer={<AuthLink onClick={onBackToLogin}>Usar outro e-mail</AuthLink>}
    >
      <div className="space-y-5">
        {error && (
          <Alert tone="danger" title="Código inválido">
            {error}
          </Alert>
        )}

        <div className="flex flex-col items-center gap-4">
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={onVerify}
            length={length}
            invalid={!!error}
            disabled={loading}
            autoFocus
            aria-label="Código de verificação do e-mail"
          />

          <Button
            onClick={() => onVerify(code)}
            loading={loading}
            disabled={code.length < length}
            className="w-full"
          >
            Verificar e-mail
          </Button>
        </div>

        <p className="text-center text-[0.85rem] text-fg-muted">
          Não recebeu o código?{" "}
          {canResend ? (
            <AuthLink onClick={onResend}>Reenviar</AuthLink>
          ) : (
            <span className="font-mono text-fg-subtle">
              Reenviar em {resendIn}s
            </span>
          )}
        </p>
      </div>
    </AuthCard>
  );
}
