import { Alert, PageHeader, SectionPanel } from "../../components/ui";
import { Settings2, Shield } from "lucide-react";

interface Props { accountId: string; }

export function PaginaConfiguracoes({ accountId: _accountId }: Props) {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Configurações" description="Regras de ponto e preferências do sistema" />
      <Alert tone="info" title="Configurações não integradas">
        Ainda não é possível consultar ou alterar as configurações da empresa nesta tela.
      </Alert>
      <SectionPanel title="Métodos de Marcação" icon={<Settings2 size={20} />}>
        <p className="text-sm text-[var(--fg-muted)]">Disponibilidade e estado dos métodos de marcação não informados.</p>
      </SectionPanel>
      <SectionPanel title="Regras de Jornada" icon={<Shield size={20} />}>
        <p className="text-sm text-[var(--fg-muted)]">As regras de jornada da empresa ainda não estão disponíveis nesta tela.</p>
      </SectionPanel>
    </div>
  );
}
