# Segredos do Hub DNEX — `.env` mestre, chaves e rotação

> Como os segredos são organizados no ecossistema, quais chaves existem, o que é
> seguro no browser vs. só no servidor, e como rotacionar. **Este documento não
> contém nenhum valor real** — só nomes de chave e a estrutura.
>
> Data: 2026-07-01. Ver [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) §6.

---

## 1. O `.env` mestre — fonte única, symlinks nos produtos

Existe **um** arquivo de segredos real no ecossistema, fora dos repositórios:
**`~/.dnex-secrets/.env`**. Cada produto mantém um `.env` local como **symlink absoluto**
para esse cofre:

```
~/.dnex-secrets/.env                 ← arquivo REAL (o cofre local)
Console DNEX/.env                    → symlink → ~/.dnex-secrets/.env
DNEX - Contratos/.env                → symlink → ~/.dnex-secrets/.env
DNEX - Normas/server/.env            → symlink → ~/.dnex-secrets/.env
DNEX - Normas/client/.env            → symlink → ~/.dnex-secrets/.env
```

**Por quê**: editar uma chave num lugar propaga para todos os produtos que a
usam, sem sincronizar manualmente (a dor que motivou isso: colar a mesma
`SUPABASE_SERVICE_ROLE_KEY` em vários `.env` toda vez que mudava).

**Regras**:
- Ao adicionar uma integração nova, a chave vai numa **seção do produto** dentro
  do mestre — nunca crie um `.env` separado em outro produto.
- Cada produto mantém um **`.env.example`** versionado (template com os NOMES das
  chaves que usa, **sem valores**) para documentar o que ele espera.
- O `.env` mestre é coberto por `.gitignore` em todos os produtos — **nunca**
  vai para o git. Confirme antes de qualquer push (`git check-ignore .env`).

> ⚠️ **Fragilidade do symlink**: se o cofre (`~/.dnex-secrets/.env`) for movido ou
> apagado, todos os produtos quebram silenciosamente. Há backups
> `.env.bak-pre-symlink` em produtos que foram migrados. Ao mover o mestre,
> refaça os symlinks.

> ⚠️ **No deploy o symlink NÃO vale** (mesma razão das cópias vendorizadas, ver
> [`CONVENCOES-DNEX.md`](./CONVENCOES-DNEX.md) §2): a Vercel clona um único repo e o
> `.env` symlinkado aponta para uma pasta-irmã que não está no clone. Em produção,
> as variáveis vêm das **Environment Variables do projeto na Vercel** (Dashboard),
> não do `.env`. O `.env` mestre + symlink é conveniência de **dev local**; o
> `.env.example` do produto é o contrato do que precisa ser configurado na Vercel.

---

## 2. Vite: `envDir` aponta para a raiz do produto

O front lê o `.env` da **raiz do produto** (não de `client/`) — no `vite.config.ts`,
`envDir: path.resolve(__dirname, "..")`. Só variáveis prefixadas **`VITE_`** chegam
ao bundle do navegador (o resto fica no servidor).

---

## 3. Catálogo de chaves (por sensibilidade)

### 3.1 Client-safe (`VITE_*`, vão para o bundle) — protegidas por RLS

| Chave | O que é |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase (público). |
| `VITE_SUPABASE_ANON_KEY` | Anon key — **segura** no browser PORQUE a RLS a escopa. |
| `VITE_API_BASE` / `VITE_API_URL` | Base da API do produto. |

### 3.2 Só servidor (NUNCA no bundle)

| Chave | O que é | Risco se vazar |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypassa RLS, acesso total ao banco. | **Crítico** — acesso irrestrito a todos os schemas. |
| `DATABASE_URL` / `SUPABASE_DATABASE_URL` | Connection string do Postgres (com senha). | **Crítico** — acesso direto ao banco. |
| `HUB_SERVICE_KEY` | Segredo server-to-server (Admin ↔ produtos, header `x-hub-service-key`). | Alto — permite provisionar/curar via as rotas `/api/interno`. |
| `HUB_ADMIN_EMAILS` | Allowlist de quem opera o console Admin. | Médio — não é segredo forte, mas controla acesso admin. |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` | IA (DocuChat, embeddings, imagens). | Custo/abuso. |
| `RESEND_API_KEY` | E-mail transacional. | Envio de e-mail em nome do domínio. |
| `CPFHUB_API_KEY` | Autofill de nome por CPF. | Custo/abuso. |
| `ENCRYPTION_KEY` | Criptografia de dados sensíveis (Contratos). | **Crítico** — decifra dados protegidos. |
| `ZAPSIGN_API_TOKEN`, `ZAPI_*`, `CONTAAZUL_*`, `ZIONIC_*` | Integrações do Contratos (assinatura, WhatsApp, financeiro, CRM). | Ações em nome do titular nesses serviços. |
| `MIDIA_SECRET` | Assinatura HMAC de URLs de mídia privada (Normas). | Forjar URLs de mídia. |

> Regra mãe: **se não tem prefixo `VITE_`, é só servidor.** Nunca importe uma
> chave sem `VITE_` no código de `client/`.

---

## 4. Fronteira de chave por camada

```
Browser (bundle)         →  só VITE_* (anon key)  →  Supabase com RLS
Backend do produto       →  service_role, HUB_SERVICE_KEY, DATABASE_URL, integrações
Admin → produto (S2S)    →  HUB_SERVICE_KEY (header x-hub-service-key)
Operador do console      →  HUB_ADMIN_EMAILS (allowlist)
```

---

## 5. Rotação

| Chave | Como rotacionar | Impacto |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` / `ANON_KEY` | No Supabase Dashboard (API keys). Atualizar no `.env` mestre (propaga via symlink). | Reiniciar backends; o front reconstrói no próximo build/deploy. |
| `HUB_SERVICE_KEY` | Gerar novo (`openssl rand -hex 32`), atualizar no mestre, **reiniciar Admin E todos os produtos ao mesmo tempo** (ambos os lados leem do mesmo mestre — então trocar no mestre já sincroniza). | Janela curta: se um backend recarrega antes do outro, chamadas S2S falham (401) até todos subirem. |
| `DATABASE_URL` | Rotacionar a senha do Postgres no Supabase; atualizar no mestre. | Reiniciar quem usa Drizzle direto (Contratos). |
| Integrações (`ZAPSIGN`, `RESEND`…) | No painel do serviço; atualizar no mestre. | Reiniciar o backend que a usa. |
| `MIDIA_SECRET` | ⚠️ **Cuidado**: URLs de mídia assinadas ficam embutidas em versões imutáveis (entram no hash). Rotacionar invalida as URLs já gravadas. Ver comentário em `DNEX - Normas/server/src/lib/midia.ts`. | Mídia antiga deixa de resolver. |

> Como o mestre é único, rotacionar = editar um arquivo. Mas **reinicie os
> backends** para relerem o `process.env` (não há hot-reload de env em produção).

---

## 6. Se um segredo vazar

1. Rotacione **imediatamente** a chave no serviço de origem (Supabase/serviço).
2. Atualize o `.env` mestre.
3. Reinicie os backends afetados.
4. Se foi a `service_role` ou `DATABASE_URL`: auditar acessos no Supabase (logs).
5. Nunca "corrija" removendo do git com um commit — o valor fica no histórico;
   trate como comprometido e rotacione.

## Documentos relacionados

- [`ARQUITETURA-HUB-DNEX.md`](./ARQUITETURA-HUB-DNEX.md) · [`NOVO-PRODUTO-DNEX.md`](./NOVO-PRODUTO-DNEX.md) · [`PADRAO-DNEX-INTEGRACOES.md`](./PADRAO-DNEX-INTEGRACOES.md)
