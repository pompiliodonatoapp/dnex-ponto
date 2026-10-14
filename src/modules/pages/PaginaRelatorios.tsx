import { Card, CardBody, PageHeader, Button, SectionPanel, Alert } from "../../components/ui";
import { BarChart3, FileText, Download, Calendar, Users, TrendingUp } from "lucide-react";

interface Props {
  accountId: string;
}

export function PaginaRelatorios({ accountId }: Props) {
  const reports = [
    { id: "mirror", name: "Espelho de Ponto", icon: Calendar, description: "Relatório mensal de marcações por colaborador" },
    { id: "bank", name: "Banco de Horas", icon: TrendingUp, description: "Saldo acumulado e evolução do banco de horas" },
    { id: "audit", name: "Auditoria CLT", icon: FileText, description: "Ocorrências de conformidade (art. 58, 66, 71 CLT)" },
    { id: "absences", name: "Faltas e Atrasos", icon: Users, description: "Relatório de ausências e atrasos por período" },
    { id: "overtime", name: "Horas Extras", icon: BarChart3, description: "Consolidação de HE 50% e 100% por colaborador" },
    { id: "absenteeism", name: "Absenteísmo", icon: TrendingUp, description: "Índice de absenteísmo por equipe/departamento" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Relatórios" description="Gere relatórios legais e gerenciais de ponto" />
      <Alert tone="info" title="Relatórios em desenvolvimento">
        Os relatórios estão sendo implementados. Em breve você poderá gerar PDFs, Excel e arquivos AFD/AEJ diretamente aqui.
      </Alert>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardBody className="flex flex-col h-full">
              <div className="flex items-start gap-3 mb-4">
                <report.icon size={24} className="text-[var(--tone-action-fg)] shrink-0" />
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--fg)" }}>{report.name}</h3>
                  <p className="text-sm text-[var(--fg-muted)] mt-1">{report.description}</p>
                </div>
              </div>
              <div className="mt-auto flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" disabled>
                  <Download size={14} className="mr-1" />PDF
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" disabled>
                  <Download size={14} className="mr-1" />Excel
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <SectionPanel title="Exportações Legais" icon={<FileText size={20} />}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardBody>
              <h4 className="font-semibold mb-2" style={{ color: "var(--fg)" }}>AFD (Arquivo Fonte de Dados)</h4>
              <p className="text-sm text-[var(--fg-muted)] mb-4">
                Formato exigido pela Portaria 671/2021 MTP para fiscalização do ponto eletrônico.
              </p>
              <Button variant="secondary" disabled>
                <Download size={16} className="mr-2" />Gerar AFD
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h4 className="font-semibold mb-2" style={{ color: "var(--fg)" }}>AEJ (Arquivo de Espelho de Jornada)</h4>
              <p className="text-sm text-[var(--fg-muted)] mb-4">
                Espelho de ponto assinado digitalmente para entrega ao colaborador.
              </p>
              <Button variant="secondary" disabled>
                <Download size={16} className="mr-2" />Gerar AEJ
              </Button>
            </CardBody>
          </Card>
        </div>
      </SectionPanel>
    </div>
  );
}