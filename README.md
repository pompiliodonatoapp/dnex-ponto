# DNEX Ponto

Sistema de Ponto Eletrônico mobile-first, offline-first, com integração nativa ao DNEX Folha.

## Diferenciais

- **Offline-first**: Bata ponto sem internet — sincroniza automaticamente quando a conexão retornar
- **PWA instalável**: Instale na tela inicial do celular como um app nativo (iOS/Android)
- **Mobile-first**: UX otimizada para celular com botão gigante de batida e feedback imediato
- **Dark mode**: Suporte automático via `prefers-color-scheme`
- **Integração nativa**: Conecta diretamente ao DNEX Folha via Supabase (zero exportação manual)
- **Multi-método**: GPS, Wi-Fi, Face ID, QR Code, PIN, Foto
- **Acessível**: WCAG 2.2 AA, touch targets 44px+, screen reader labels

## Stack

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **PWA**: Service Workers + manifest.json + Background Sync
- **Deploy**: Vercel / Netlify / qualquer host estático

## Quick Start

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Typecheck
pnpm typecheck
```

## Estrutura

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root component
├── index.css             # Tailwind + CSS variables (dark mode)
├── lib/
│   └── supabase.ts       # Supabase client
├── components/
│   └── ui.tsx            # Design system components (Card, Button, Badge, etc.)
├── modules/
│   ├── PontoModule.tsx   # Main module with navigation
│   └── pages/
│       ├── PontoFoundation.tsx    # Types
│       ├── PaginaRegistro.tsx     # Clock in/out with geolocation
│       ├── PaginaEspelho.tsx      # Visual calendar mirror
│       ├── PaginaAjustes.tsx      # Adjustment requests
│       ├── PaginaRelatorios.tsx   # Legal reports (AFD/AEJ)
│       └── PaginaConfiguracoes.tsx # Admin settings
└── types.ts              # Shared TypeScript interfaces
public/
├── manifest.json         # PWA manifest
└── sw.js                 # Service Worker (offline + background sync)
```

## Backend (Schema `ponto` no Supabase)

As tabelas e funções PL/pgSQL estão no repositório `dnex-gestao`:

- `migrations/supabase/0022_ponto_foundation.supabase.sql` — Tabelas core
- `migrations/supabase/0023_ponto_calculation_engine.supabase.sql` — Motor de cálculo

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `ponto.employee_config` | Configuração individual (geofence, Wi-Fi, biometria) |
| `ponto.time_clock` | Batidas brutas (timestamp, GPS, tipo, fonte) |
| `ponto.adjustment_request` | Solicitações de ajuste/abono com fluxo de aprovação |
| `ponto.daily_balance` | Saldo diário calculado (worked, overtime, night shift) |

### Funções

| Função | Descrição |
|--------|-----------|
| `ponto.process_daily_clock(account_id, employee_id, date)` | Processa batidas e gera saldo diário |
| `ponto.calculate_overtime(account_id, employee_id, date, scheduled_min)` | Calcula HE 50%/100% e atrasos |
| `ponto.close_period(account_id, competencia)` | Fecha mês e exporta JSON para DNEX Folha |

## Integração com DNEX Folha

O fechamento do ponto gera um JSON consolidado por empregado/mês via `ponto.close_period()`, que alimenta a folha com:

- Horas normais
- Horas extras 50% / 100%
- Adicional noturno
- Atrasos e faltas (descontos)

## Comparativo com Concorrentes

| Capacidade | DNEX Ponto | Ponto Simples | Domínio/Ahgora | Alterdata/Questor |
|------------|------------|---------------|----------------|-------------------|
| Offline | ✅ | ❌ | ❌ |  |
| PWA instalável | ✅ | ❌ | ❌ | ❌ |
| Dark mode | ✅ | ❌ | ❌ |  |
| Mobile-first | ✅ | ⚠️ Web responsivo | ⚠️ Desktop-first | ❌ Legacy |
| Integração Folha | ✅ Nativa | ⚠️ Webhook | ✅ ERP | ⚠️ CSV |
| Custo | 💰 SaaS escalável | 💰 R$ 49,90/mês | 💰 R$ 15-40/user | 💰 Licença perpétua |

## License

Proprietary — DNEX Sistemas

## Co-Author

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>