import { forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "../primitives/Input";

/**
 * WhatsAppInput — identificador do WhatsApp no estilo `@usuario` (a Meta abriu
 * a reserva de usernames no WhatsApp em 29/06/2026, opcional e em rollout
 * gradual — passa a poder substituir o número de telefone como identificador
 * de contato exibido). Padrão DNEX: "WhatsApp" é um campo PRÓPRIO, distinto de
 * "Telefone" — ver `empresas.whatsapp` no schema do servidor.
 * -----------------------------------------------------------------------------
 * Controlado em STRING SEM o prefixo `@` (o `@` é decoração visual fixa do
 * campo). Normaliza em tempo real: minúsculas, remove caracteres fora de
 * [a-z0-9._], remove `@` se o usuário digitar.
 *
 * NÃO valida tamanho/regras completas do WhatsApp de forma bloqueante: fontes
 * secundárias convergem em mínimo 3 caracteres e alfabeto [a-z0-9._], mas
 * divergem no máximo (30 a 35) e não há fonte primária oficial confirmando o
 * número exato — a validação final é sempre a do próprio WhatsApp no momento
 * de reservar o nome. Aqui só corta em 30 (o menor valor visto) como limite
 * de digitação, sem bloquear submit.
 */
export type WhatsAppInputProps = {
  /** Username sem o prefixo `@` (ex.: "pompiliodonato"). */
  value?: string;
  /** Recebe o valor já normalizado a cada digitação. */
  onChange?: (username: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">;

function normalizar(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 30);
}

export const WhatsAppInput = forwardRef<HTMLInputElement, WhatsAppInputProps>(
  function WhatsAppInput({ value = "", onChange, className, ...props }, ref) {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      onChange?.(normalizar(e.target.value));
    }

    return (
      <Input
        ref={ref}
        mono
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        leadingIcon={<span aria-hidden="true" className="font-semibold">@</span>}
        // Normaliza também na EXIBIÇÃO (idempotente): valor salvo antes da normalização
        // pode vir do banco com "@" — mostrado cru, duplicava com o @ decorativo.
        value={normalizar(value)}
        onChange={handleChange}
        placeholder="seuusuario"
        className={className}
        {...props}
      />
    );
  },
);
