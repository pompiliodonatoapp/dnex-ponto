import { useState } from "react";
import { Mail, Plus, Trash2, Users } from "lucide-react";
import { Input } from "../../components/primitives/Input";
import { Select } from "../../components/primitives/Select";
import { Button } from "../../components/primitives/Button";
import { Badge } from "../../components/primitives/Badge";
import { Alert } from "../../components/composed/Alert";
import { EmptyState } from "../../components/composed/EmptyState";
import { ROLE_LABELS } from "../settings/TeamSettings";
import type { TeamRole } from "../settings/TeamSettings";

/**
 * InviteTeamScreen — convidar a equipe no onboarding (B3): adiciona vários
 * convites (e-mail + papel) a uma lista antes de enviar; pode pular. Validação
 * de e-mail por linha (leve, só UX). Papéis RBAC via Select.
 *
 * Conteúdo ILUSTRATIVO. O envio real e o RBAC são do servidor.
 */

export type PendingInvite = { email: string; role: TeamRole };

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as TeamRole[])
  .filter((r) => r !== "owner")
  .map((r) => ({ value: r, label: ROLE_LABELS[r] }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InviteTeamScreenProps = {
  /** Envia a lista de convites. */
  onSubmit: (invites: PendingInvite[]) => void | Promise<void>;
  /** Pular o passo (convidar depois). */
  onSkip?: () => void;
  defaultRole?: TeamRole;
  loading?: boolean;
  error?: string | null;
  /** Cabeçalho próprio (quando NÃO usado dentro de um Wizard que já titula). */
  showHeader?: boolean;
};

export function InviteTeamScreen({
  onSubmit,
  onSkip,
  defaultRole = "member",
  loading,
  error,
  showHeader = true,
}: InviteTeamScreenProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>(defaultRole);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [touched, setTouched] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const duplicate = invites.some(
    (i) => i.email.toLowerCase() === email.trim().toLowerCase(),
  );

  function add() {
    setTouched(true);
    if (!emailValid || duplicate) return;
    setInvites((prev) => [...prev, { email: email.trim(), role }]);
    setEmail("");
    setRole(defaultRole);
    setTouched(false);
  }

  function remove(target: string) {
    setInvites((prev) => prev.filter((i) => i.email !== target));
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-1">
          <h2 className="font-display text-[length:var(--text-h2)] font-bold tracking-tight text-fg">
            Convide sua equipe
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-fg-muted">
            Adicione colegas por e-mail e defina o papel de cada um. Você pode
            convidar mais gente depois.
          </p>
        </div>
      )}

      {error && (
        <Alert tone="danger" title="Não foi possível enviar os convites">
          {error}
        </Alert>
      )}

      {/* linha de adição */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-1.5">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="colega@empresa.com.br"
            leadingIcon={<Mail />}
            invalid={touched && (!emailValid || duplicate)}
            aria-label="E-mail do convidado"
          />
          {touched && !emailValid && email.length > 0 && (
            <p role="alert" className="text-[0.8rem] font-medium text-[var(--color-danger)]">
              E-mail inválido.
            </p>
          )}
          {touched && duplicate && (
            <p role="alert" className="text-[0.8rem] font-medium text-[var(--color-danger)]">
              Este e-mail já está na lista.
            </p>
          )}
        </div>
        <div className="sm:w-44">
          <Select
            aria-label="Papel do convidado"
            value={role}
            onValueChange={(v) => setRole(v as TeamRole)}
            items={ROLE_OPTIONS}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={add}
          leadingIcon={<Plus className="h-4 w-4" />}
          className="sm:h-11"
        >
          Adicionar
        </Button>
      </div>

      {/* lista de convidados */}
      <div className="rounded-[var(--radius-card)] border border-line bg-[var(--surface)]">
        {invites.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="Nenhum convite na lista"
            description="Adicione e-mails acima — ou pule e convide quando quiser."
          />
        ) : (
          <ul className="divide-y divide-line">
            {invites.map((inv) => (
              <li
                key={inv.email}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="text-fg-subtle">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="truncate font-mono text-[0.85rem] text-fg">
                    {inv.email}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="action">{ROLE_LABELS[inv.role]}</Badge>
                  <button
                    type="button"
                    aria-label={`Remover ${inv.email}`}
                    onClick={() => remove(inv.email)}
                    className="grid h-8 w-8 place-items-center rounded-[8px] text-fg-subtle outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-fg focus-visible:ring-2 focus-visible:ring-[var(--action-ring)]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ações */}
      <div className="flex items-center justify-between gap-3">
        {onSkip ? (
          <Button variant="ghost" onClick={onSkip}>
            Pular por enquanto
          </Button>
        ) : (
          <span />
        )}
        <Button
          onClick={() => onSubmit(invites)}
          loading={loading}
          disabled={invites.length === 0}
        >
          {invites.length > 0
            ? `Enviar ${invites.length} convite${invites.length > 1 ? "s" : ""}`
            : "Enviar convites"}
        </Button>
      </div>
    </div>
  );
}
