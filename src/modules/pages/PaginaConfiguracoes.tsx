import { Card, CardBody, PageHeader, SectionPanel, Badge, Alert } from "../../components/ui";
import { Settings2, MapPin, Wifi, Camera, Fingerprint, QrCode, WifiOff, Shield } from "lucide-react";

interface Props {
  accountId: string;
}

export function PaginaConfiguracoes({ accountId }: Props) {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Configurações" description="Gerencie regras de ponto e preferências do sistema" />
      <Alert tone="info" title="Configurações administrativas">
        Esta tela é acessível apenas por gestores e administradores. As configurações afetam todos os colaboradores da conta.
      </Alert>
      <SectionPanel title="Métodos de Marcação" icon={<Settings2 size={20} />}>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: MapPin, name: "Geolocalização", desc: "Valida se o colaborador está no local de trabalho (raio configurável)", enabled: true },
            { icon: Wifi, name: "Wi-Fi", desc: "Valida MAC address da rede da empresa", enabled: false },
            { icon: Camera, name: "Foto", desc: "Captura foto no momento da batida para auditoria", enabled: false },
            { icon: Fingerprint, name: "Biometria", desc: "Face ID / Touch ID para autenticação rápida", enabled: true },
            { icon: QrCode, name: "QR Code", desc: "Escaneie QR code fixo na recepção/escritório", enabled: false },
            { icon: WifiOff, name: "Offline", desc: "Permite bater ponto sem internet, sincroniza depois", enabled: true },
          ].map((method) => (
            <Card key={method.name}>
              <CardBody className="flex items-start gap-3">
                <method.icon size={24} className="text-[var(--tone-action-fg)] shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold" style={{ color: "var(--fg)" }}>{method.name}</h4>
                    <Badge tone={method.enabled ? "success" : "neutral"}>
                      {method.enabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--fg-muted)]">{method.desc}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Regras de Jornada" icon={<Shield size={20} />}>
        <Card>
          <CardBody>
            <div className="space-y-4">
              {[
                { title: "Tolerância de Atraso", desc: "Minutos tolerados antes de contabilizar atraso", value: "5 minutos" },
                { title: "Tolerância de Antecipação", desc: "Minutos tolerados antes do horário programado", value: "5 minutos" },
                { title: "Intervalo Mínimo", desc: "Tempo mínimo de intervalo intrajornada (art. 71 CLT)", value: "60 minutos" },
                { title: "Intervalo Interjornada", desc: "Descanso mínimo entre jornadas (art. 66 CLT)", value: "11 horas" },
              ].map((rule) => (
                <div key={rule.title} className="flex justify-between items-center p-3 rounded" style={{ background: "var(--bg-subtle)" }}>
                  <div>
                    <h4 className="font-semibold" style={{ color: "var(--fg)" }}>{rule.title}</h4>
                    <p className="text-sm text-[var(--fg-muted)]">{rule.desc}</p>
                  </div>
                  <Badge tone="action">{rule.value}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </SectionPanel>
      <Alert tone="warning" title="Funcionalidades avançadas">
        Configurações de geofence, turnos 12x36, jornada noturna e integrações webhook serão disponibilizadas nas próximas atualizações.
      </Alert>
    </div>
  );
}