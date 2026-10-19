import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "../../lib/cn";
import { Switch } from "../../components/primitives/Switch";
import { Button } from "../../components/primitives/Button";
import { Tabs, TabsList, TabsTrigger } from "../../components/composed/Tabs";
import { SettingsSection } from "./parts";
import { ROLE_LABELS } from "./TeamSettings";
import type { TeamRole } from "./TeamSettings";

/**
 * RolesPermissionsSettings (D2a) — gestão de PAPÉIS & PERMISSÕES (RBAC) do
 * workspace. Matriz módulo × ação por papel, alinhada à taxonomia de
 * `TeamSettings` (owner/admin/member/viewer). Papéis de sistema são só-leitura.
 *
 * Regra de coerência embutida: "Ver" é pré-requisito — desligar "Ver" zera o
 * módulo; ligar qualquer ação liga "Ver" junto. Conteúdo ilustrativo; o RBAC
 * final (papéis e ações reais) fica [CONFIRMAR] com o titular.
 */

export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve";
export type ModuleKey =
  | "dashboard"
  | "documents"
  | "companies"
  | "team"
  | "billing"
  | "settings";

/** Matriz papel → módulo → ações permitidas. */
export type RoleMatrix = Record<TeamRole, Record<ModuleKey, PermissionAction[]>>;

export type RolesPermissionsSettingsProps = {
  /** Matriz inicial. Se ausente, usa um exemplo coerente. */
  defaultMatrix?: RoleMatrix;
  /** Papéis protegidos (não editáveis). Default: ["owner"]. */
  systemRoles?: TeamRole[];
  /** Persiste a matriz. */
  onSave?: (matrix: RoleMatrix) => void | Promise<void>;
};

const ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: "view", label: "Ver" },
  { key: "create", label: "Criar" },
  { key: "edit", label: "Editar" },
  { key: "delete", label: "Excluir" },
  { key: "approve", label: "Aprovar" },
];

const MODULES: { key: ModuleKey; label: string; description: string }[] = [
  { key: "dashboard", label: "Dashboard", description: "Indicadores e visão geral" },
  { key: "documents", label: "Documentos", description: "Arquivos e fiscais" },
  { key: "companies", label: "Empresas", description: "Cadastro de clientes" },
  { key: "team", label: "Equipe", description: "Membros e convites" },
  { key: "billing", label: "Faturamento", description: "Plano e faturas" },
  { key: "settings", label: "Configurações", description: "Workspace e segurança" },
];

const ROLE_ORDER: TeamRole[] = ["owner", "admin", "member", "viewer"];
const ALL_ACTIONS: PermissionAction[] = ACTIONS.map((a) => a.key);

function moduleMap(
  fill: (key: ModuleKey) => PermissionAction[],
): Record<ModuleKey, PermissionAction[]> {
  return MODULES.reduce(
    (acc, m) => {
      acc[m.key] = fill(m.key);
      return acc;
    },
    {} as Record<ModuleKey, PermissionAction[]>,
  );
}

const DEFAULT_MATRIX: RoleMatrix = {
  owner: moduleMap(() => [...ALL_ACTIONS]),
  admin: moduleMap(() => [...ALL_ACTIONS]),
  member: moduleMap((k) =>
    k === "documents" || k === "companies"
      ? ["view", "create", "edit"]
      : ["view"],
  ),
  viewer: moduleMap(() => ["view"]),
};

export function RolesPermissionsSettings({
  defaultMatrix = DEFAULT_MATRIX,
  systemRoles = ["owner"],
  onSave,
}: RolesPermissionsSettingsProps) {
  const [matrix, setMatrix] = useState<RoleMatrix>(defaultMatrix);
  const [role, setRole] = useState<TeamRole>("admin");
  const [saving, setSaving] = useState(false);

  const isSystem = systemRoles.includes(role);

  function toggle(mod: ModuleKey, action: PermissionAction) {
    setMatrix((prev) => {
      const cur = prev[role][mod];
      let next: PermissionAction[];
      if (cur.includes(action)) {
        // desligar "Ver" zera o módulo; senão remove só a ação
        next = action === "view" ? [] : cur.filter((x) => x !== action);
      } else {
        // ligar qualquer ação implica "Ver"
        next = action === "view" ? [action] : [...cur, action, "view"];
      }
      // mantém a ordem canônica e remove duplicatas
      const dedup = ALL_ACTIONS.filter((a) => next.includes(a));
      return { ...prev, [role]: { ...prev[role], [mod]: dedup } };
    });
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(matrix);
    } finally {
      setSaving(false);
    }
  }

  const grant = matrix[role];

  return (
    <SettingsSection
      title="Papéis & permissões"
      description={
        <>
          Defina o que cada papel pode fazer em cada módulo do workspace. O
          conjunto final de papéis e ações é <span className="font-mono">[CONFIRMAR]</span>{" "}
          com o titular.
        </>
      }
      headerAside={
        isSystem ? (
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-line bg-[var(--surface)] px-2.5 py-1 text-[0.74rem] font-medium text-fg-muted">
            <Lock className="h-3.5 w-3.5" />
            Papel do sistema · somente leitura
          </span>
        ) : undefined
      }
      footer={
        <Button onClick={handleSave} disabled={isSystem || saving || !onSave}>
          {saving ? "Salvando…" : "Salvar permissões"}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Seletor de papel */}
        <Tabs value={role} onValueChange={(v) => setRole(v as TeamRole)}>
          <TabsList className="flex-wrap">
            {ROLE_ORDER.map((r) => (
              <TabsTrigger key={r} value={r}>
                {ROLE_LABELS[r]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Matriz módulo × ação */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="py-2.5 pr-4 text-left text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
                  Módulo
                </th>
                {ACTIONS.map((a) => (
                  <th
                    key={a.key}
                    className="px-3 py-2.5 text-center text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-fg-subtle"
                  >
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => {
                const allowed = grant[m.key];
                const canView = allowed.includes("view");
                return (
                  <tr key={m.key} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4">
                      <span className="block text-[0.9rem] font-medium text-fg">
                        {m.label}
                      </span>
                      <span className="block text-[0.78rem] text-fg-subtle">
                        {m.description}
                      </span>
                    </td>
                    {ACTIONS.map((a) => {
                      const checked = allowed.includes(a.key);
                      const lockedByView = a.key !== "view" && !canView;
                      const disabled = isSystem || lockedByView;
                      return (
                        <td key={a.key} className="px-3 py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={() => toggle(m.key, a.key)}
                              aria-label={`${m.label} — ${a.label}`}
                              className={cn(disabled && "opacity-50")}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[0.78rem] leading-relaxed text-fg-subtle">
          <span className="font-medium text-fg-muted">Ver</span> é pré-requisito:
          desligá-lo zera o módulo; ligar qualquer outra ação liga{" "}
          <span className="font-medium text-fg-muted">Ver</span> junto.
        </p>
      </div>
    </SettingsSection>
  );
}
