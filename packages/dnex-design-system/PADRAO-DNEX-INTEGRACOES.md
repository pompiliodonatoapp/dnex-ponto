# Padrão DNEX de Integrações

> Documentação técnica **permanente** — vale para todo sistema construído para o Hub DON
> (DNEX Normas, e-Conte, DNEX Gestão 360, Adon, e qualquer produto novo).
> Convenção: **⚠️ NÃO CONFIRMADO** marca todo dado que não foi verificado em fonte
> primária lida integralmente, ou cuja verificação adversarial não sustentou 100%.
> Preços e limites técnicos mudam — revalidar no painel/doc oficial antes de decisão
> de arquitetura ou de compra. Nenhum dado aqui foi inventado; onde a fonte não
> confirmou algo, isso está dito explicitamente.
>
> Pesquisado e verificado em 2026-06-30 (workflow de pesquisa + verificação
> adversarial, uma rodada por serviço). Ver "Como manter" no fim do arquivo.

## Regras obrigatórias (Regra de Ouro do Hub DON)

Todo formulário que capture os dados abaixo, em qualquer sistema do Hub DON, **deve**
usar a fonte de autopreenchimento correspondente — não digitar/inventar manualmente:

| Dado capturado | Fonte obrigatória | Por quê |
|---|---|---|
| **CPF** → nome da pessoa | **CPFHub** (`api.cpfhub.io`) | Autofill do nome ao digitar o CPF — evita o pior erro possível: errar o nome de um cliente. |
| **CNPJ** → razão social/dados da empresa | **BrasilAPI** (principal) → **ReceitaWS** (fallback) | Já é o padrão implementado; dados de origem RFB. Ver seção 2. |
| **CEP** → endereço | **BrasilAPI** (principal) → **ViaCEP** (fallback) | Não existe API oficial dos Correios gratuita e sem contrato — ver seção 3. Já é o padrão implementado. |
| **WhatsApp** de contato | Campo **próprio**, separado de "Telefone" | Ver nota "Campo WhatsApp" abaixo. |

### Campo WhatsApp (separado de Telefone)

Em 29/06/2026 a Meta abriu a reserva de **usernames** (`@usuario`) no WhatsApp
(rollout gradual, ainda em curso — [blog.whatsapp.com](https://blog.whatsapp.com/its-time-to-reserve-your-whatsapp-username)).
Quem ativa deixa de expor o número de telefone a quem manda mensagem pela primeira
vez; a Cloud API passa a expor um **BSUID (Business-Scoped User ID)** para esses
contatos em vez do `wa_id` (telefone). Por isso:

- **"WhatsApp" é um campo PRÓPRIO no schema**, distinto de "Telefone" — nem sempre
  coincidem (telefone institucional × canal de atendimento), e o identificador de
  WhatsApp já pode ser um `@usuario`, não um número.
- **Decisão de UI (Padrão DNEX)**: o campo WhatsApp usa o componente `WhatsAppInput`
  (padrão `@usuario` — prefixo `@` fixo, valor normalizado em minúsculas, alfabeto
  `[a-z0-9._]`), **não** o `TelefoneInput`. Validação de formato é **frouxa/não
  bloqueante**: fontes secundárias convergem em mínimo 3 caracteres e alfabeto
  `[a-z0-9._]`, mas divergem no máximo (30 a 35) e não há fonte primária oficial
  confirmando o número exato — a validação final é sempre a do próprio WhatsApp.
- **A coluna no banco é `text` livre, sem validação de formato** — o servidor não
  impõe regra de formato (a regra muda do lado do WhatsApp, não do Hub DON).
- Se algum sistema do Hub DON usa **telefone como chave primária** de contato num
  fluxo de WhatsApp (CRM, agente de IA de atendimento), mapear esse ponto e
  planejar suporte a BSUID como identificador alternativo antes da expansão global
  do recurso. Não é urgente hoje (rollout gradual, sem data de conclusão anunciada).

---

<!-- ===== Conteúdo pesquisado e verificado (workflow, 2026-06-30) ===== -->

# APIs e Integrações de Terceiros

> Seção do "Padrão DNEX de Integrações". Documentação técnica permanente para engenheiros que constroem qualquer sistema do Hub DON (e-Conte, DNEX Gestão 360, Adon, DNEX Normas). Cada serviço foi pesquisado em fontes primárias e depois verificado adversarialmente (reabrindo as mesmas fontes para confirmar). Onde a verificação não sustentou 100% o que foi levantado, isso está marcado explicitamente com ⚠️ NÃO CONFIRMADO — não foi omitido nem suavizado.
>
> Convenção: ⚠️ NÃO CONFIRMADO marca todo dado que não foi verificado em fonte primária lida integralmente, ou cuja verificação adversarial não sustentou 100%. Nenhum dado fora dos achados verificados foi adicionado. Preços e limites técnicos devem ser revalidados no painel/doc oficial antes de uso em produção — carimbados onde aplicável.

## 1. CPFHub (CPFHub.io)

### O que é
API REST brasileira de consulta/validação de CPF, para KYC, prevenção de fraude e onboarding de clientes. URL oficial: https://www.cpfhub.io/ (API em `api.cpfhub.io`).

### Quando usar
**Regra obrigatória do Hub DON**: sempre que um formulário captura CPF, usar o CPFHub para autopreencher o nome completo — evita erro de digitação do nome do cliente.

### Autenticação
Header `x-api-key` (API key própria) + `Accept: application/json`. **A key nunca deve ser exposta no frontend** — toda chamada passa pelo backend (mesmo padrão já usado para `buscarCnpj`/`buscarCep` no DNEX Normas).

### Endpoints-chave
`GET https://api.cpfhub.io/cpf/{cpf}` (CPF só dígitos). Resposta confirmada (blog oficial): `success`, `data.cpf`, `data.name`, `data.nameUpper`, `data.gender` (M/F), `data.birthDate`, `day`/`month`/`year` desagregados.

⚠️ NÃO CONFIRMADO: endpoint POST alternativo `https://api.cpfhub.io/api/cpf` (CPF + birthDate em JSON) — apareceu apenas em resultado de busca, sem confirmação em fonte primária aberta. Um segundo material (gist de terceiro, não oficial) mostrou uma estrutura de resposta reduzida (`cpf`, `name`, `birthDate`, `gender`), divergente do blog oficial — **validar o contrato de dados atual no dashboard antes de codar**.

### Custo
- **Grátis**: 50 consultas/mês, sem cartão de crédito.
- **Pro**: R$ 149/mês, 1.000 consultas incluídas, excedente R$ 0,15/consulta.
- **Corporativo**: preço personalizado.
- Só consultas que retornam dado válido consomem crédito (CPF não encontrado não desconta), segundo o site.

### Alertas e riscos
- ⚠️ NÃO CONFIRMADO: não existe página de documentação técnica dedicada (tipo docs.cpfhub.io) separada do site institucional — toda a doc está embutida na home e em posts de blog do próprio domínio. Atípico para API B2B madura; checar manualmente a área logada/dashboard antes de contratar.
- ⚠️ NÃO CONFIRMADO: uptime (99,9%) e latência (~150ms/~900ms) são alegações do próprio fornecedor, sem medição independente.
- ⚠️ NÃO CONFIRMADO de forma independente: alegação de que os dados são "revalidados regularmente na Receita Federal" — é afirmação de marketing do próprio fornecedor, sem evidência técnica pública sobre frequência/mecanismo real.
- **LGPD (sinalização, não parecer jurídico)**: consulta de CPF vinculada a nome de terceiro é tratamento de dado pessoal. Base legal potencialmente aplicável: legítimo interesse (art. 7º, IX) ou execução de contrato/procedimentos preliminares (art. 7º, V) — exige avaliação jurídica formal (RIPD) antes de produção, não decidir só com este documento técnico.
- Não foram lidos Termos de Uso/Política de Privacidade do CPFHub (retenção de dados, subprocessadores, DPA) — necessário antes de produção com dados de clientes PRD/Don Contabilidade.

### Fontes
- https://www.cpfhub.io/
- https://www.cpfhub.io/blog/api-consulta-cpf
- https://gist.github.com/dantetesta/e5a577655b7c641b54f5bf39858928ac

---

## 2. Consulta CNPJ (Receita Federal) — opções de API pública em 2026

### O que é
Consulta de dados cadastrais de empresa (razão social, nome fantasia, situação, CNAEs, sócios) a partir do CNPJ, com dados de origem RFB.

### Quando usar
Preenchimento automático de razão social/nome fantasia ao digitar o CNPJ em qualquer cadastro de empresa do Hub DON. **Já é o padrão implementado** (`empresa.buscarCnpj` no DNEX Normas).

### Endpoints-chave e status
| Provedor | Endpoint | Rate limit | Origem dos dados |
|---|---|---|---|
| **BrasilAPI** (recomendada — principal) | `GET https://brasilapi.com.br/api/cnpj/v1/{cnpj}` | ⚠️ NÃO CONFIRMADO em doc oficial (SPA não renderizou no fetch) | Cache/fallback de múltiplas fontes, open source, mantido pela comunidade |
| **ReceitaWS** (fallback) | `GET https://receitaws.com.br/v1/cnpj/{cnpj}` | ~3 req/min no plano grátis (recorrente em fontes secundárias, ⚠️ não confirmado em fonte primária) | Cache do site da Receita |
| Minha Receita, CNPJá | alternativas existentes | — | — |

Ambos os endpoints testados ao vivo (curl) retornaram HTTP 200 com JSON completo.

### Custo
Todas as opções gratuitas testadas são sem custo no tier básico. ⚠️ NÃO CONFIRMADO: valores exatos dos planos pagos de CNPJá e ReceitaWS (páginas de pricing retornaram HTTP 429 durante a pesquisa).

### Recomendação
**BrasilAPI como principal + ReceitaWS como fallback** — já é a escolha implementada no DNEX Normas e continua sendo a melhor opção em 2026 segundo esta pesquisa.

### Alerta regulatório (fora do escopo técnico)
A partir de julho/2026, o CNPJ passa a formato **alfanumérico** conforme divulgado pela RFB — validar se endpoints/regex de validação de CNPJ no Hub DON já suportam esse formato. `[verificar em 2026-07]`

### Fontes
Testado ao vivo via curl (brasilapi.com.br/api/cnpj/v1, receitaws.com.br/v1/cnpj) + documentação pública dos projetos.

---

## 3. Consulta de CEP (Correios) — API oficial vs. terceiros (ViaCEP / BrasilAPI)

### O que é
Consulta de endereço a partir de CEP. **Veredito confirmado**: não existe forma gratuita e sem contrato de usar a API oficial dos Correios para essa finalidade.

### Quando usar
Preenchimento automático de endereço a partir do CEP digitado em qualquer formulário do Hub DON. **Já é o padrão implementado** (`empresa.buscarCep` no DNEX Normas).

### Autenticação
- **API oficial dos Correios** ("API Busca CEP", código de serviço 86738): exige (a) conta Pessoa Jurídica no Meu Correios, (b) contrato comercial ativo contendo o serviço 86738 (exceto Clube Correios), (c) autenticação via Bearer Token obtido pela API Token dos Correios. **Não é de uso público/gratuito** — citação literal do manual: "escopo exclusivo de consulta aos dados de endereçamento pelos clientes detentores de contratos comerciais".
- **ViaCEP** e **BrasilAPI CEP v2**: sem autenticação.

### Endpoints-chave
- ViaCEP: `GET viacep.com.br/ws/{cep}/json/` → cep/logradouro/bairro/localidade/uf/ibge/ddd/siafi/gia. Base combina Correios/IBGE/GIA-ICMS/ANATEL/SIAFI.
- BrasilAPI CEP v2: `GET brasilapi.com.br/api/cep/v2/{cep}` (testado ao vivo, HTTP 200). Arquitetura multi-provedor (pacote `cep-promise`): consulta em paralelo Correios, ViaCEP e WideNet, retorna a mais rápida.

### Custo
ViaCEP e BrasilAPI: gratuitos. API oficial dos Correios: custo ⚠️ NÃO CONFIRMADO (depende do contrato comercial 86738).

### Alertas e riscos
- ViaCEP e BrasilAPI são mantidos por terceiros/comunidade — sem SLA contratual. Mitigado pela arquitetura já implementada (BrasilAPI principal + ViaCEP fallback).
- ViaCEP alerta que consultas em massa para validar bases locais podem gerar bloqueio automático.
- O campo `service` da resposta BrasilAPI v2 indica qual provedor respondeu mais rápido naquele instante — não é um valor constante.

### Recomendação
A arquitetura já implementada no Hub DON (**BrasilAPI principal, ViaCEP fallback**) é o padrão de mercado mais robusto disponível hoje — não existe alternativa mais "oficial" que seja simultaneamente pública e gratuita. **Não há caminho gratuito para a API oficial dos Correios** — só via contrato comercial de postagem.

### Fontes
- https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep
- https://www.correios.com.br/atendimento/developers
- https://viacep.com.br/
- https://brasilapi.com.br/api/cep/v2/01310100
- https://github.com/BrasilAPI/cep-promise/blob/master/README.md

---

## 4. ContaAzul API

### O que é
API REST oficial da ContaAzul (ERP financeiro/contábil brasileiro para PMEs). Portal: `developers-portal.contaazul.com` (cadastro/credenciais, novo portal lançado março/2025).

### Quando usar
Se algum cliente do Hub DON usa **ContaAzul Pro** como ERP financeiro/vendas — sincronizar cadastro de clientes, contas a pagar/receber e notas de venda para dentro do fluxo de conciliação/apuração da Don Contabilidade. **Não substitui SPED/contabilidade** — é fonte de dados operacionais do lado do cliente.

### Autenticação
OAuth 2.0, fluxo Authorization Code. Client ID/Secret gerados no Developer Portal (conta de desenvolvedor independente da conta de usuário do ERP).

⚠️ NÃO CONFIRMADO (o domínio principal `developers.contaazul.com` retornou HTTP 403 ao fetch durante a verificação): endpoint exato de token, formato do body OAuth, `expires_in=3600s`, `token_type=Bearer` — vieram de snippets de busca, não de leitura direta da doc.

**Achado relevante da verificação adversarial**: o `refresh_token`, apesar de válido por 2 semanas, **só pode ser usado UMA VEZ** (não é reutilizável como refresh contínuo padrão) — isso é operacionalmente importante e não estava no levantamento inicial. Também não há ambiente de teste — apenas produção, com contas trial de 3 dias.

### Endpoints-chave
⚠️ NÃO CONFIRMADO por leitura integral da doc (só via snippets de busca, domínio bloqueado por 403): módulos citados — Financeiro, Vendas, Clientes/Fornecedores, Produtos/Estoque, Notas Fiscais/NF-e (aparenta ser só consulta, não emissão), Contratos com faturamento recorrente.

### Custo
Documentação gratuita e aberta. Para produção, exige plano **ContaAzul Pro** ativo e pago — o plano "Conta Azul Mais" **não suporta integração via API** (citação literal confirmada: "Não é possível integrar a Conta Azul Mais com outros sistemas"). ⚠️ NÃO CONFIRMADO: cobrança adicional específica pela API além da mensalidade do Pro; valor da mensalidade do Pro em si.

### Alertas e riscos
- Existe portal "API legada" com guia de migração para a nova API (lançada março/2025) — se alguma integração antiga do Hub DON já usa ContaAzul, verificar se está na API legada (risco de descontinuação sem migração automática).
- **Sem webhooks** (confirmado textualmente na doc lida) — qualquer sincronização precisa ser por polling.

### Recomendação
Antes de decidir integrar: **revalidar manualmente no painel/doc oficial** os detalhes técnicos marcados como não confirmados (o 403 impediu leitura direta). Núcleo (dois portais, OAuth2 exclusivo, exige Pro, sem webhooks) está confirmado e pode orientar a decisão de ir adiante ou não.

### Fontes
developers-portal.contaazul.com, devdocs.contaazul.com (SPA, não renderizou via fetch), FAQ oficial.

---

## 5. ZapSign API

### O que é
Plataforma brasileira de assinatura eletrônica de documentos, API REST em JSON. Documentação oficial: https://docs.zapsign.com.br/

### Quando usar
Contratos que precisam de fluxo formal de assinatura com múltiplos signatários e trilha de auditoria própria (ex.: contratos de honorários do PRD Advogados, contratos de prestação de serviço da Don Contabilidade). **Não é o mecanismo usado no DNEX Normas** para aceite de norma (que usa assinatura eletrônica simples via login+senha, decisão de produto já tomada) — é uma opção para OUTROS fluxos de assinatura do Hub DON.

### Autenticação
Header `Authorization: Bearer {api_token}` (token estático gerado no painel). ⚠️ NÃO CONFIRMADO: menção a "JWT dinâmico" — não encontrada na página de autenticação verificada.

### Endpoints-chave (núcleo confirmado)
- `POST https://api.zapsign.com.br/api/v1/docs/` — cria documento (aceita `url_pdf`/`base64_pdf`/`url_docx`/`base64_docx`/`markdown_text` + array `signers`), retorna token, status `pending`, `sign_url` por signatário.
- `POST /api/v1/docs/{token_doc}/add-signer/` — adiciona/atualiza signatário.
- `POST /api/v1/user/company/webhook/` — cadastra webhook (`url`, `type`, `doc_token` opcional); evento `doc_signed` dispara a cada assinatura individual — confirmar status final "signed" (todos assinaram) via GET do documento, não só pelo webhook.
- Campo `auth_mode` do signatário aceita `assinaturaTela`, `tokenEmail`, `tokenSms`, `tokenWhatsapp` (assinatura eletrônica simples/avançada, base legal art. 10 §2º MP 2.200-2/2001) e `certificadoDigital` (com certificado ICP-Brasil) — **confirmado**: o ZapSign oferece as duas modalidades.

⚠️ Ajuste da verificação: a doc confirma expiração de 60 min para os links `original_file`/`signed_file` (arquivos), **não explicitamente para o `sign_url`** de assinatura.

### ⚠️ ALEGAÇÃO NÃO CONFIRMADA — NÃO USAR SEM VALIDAÇÃO
A afirmação de que "a ZapSign atua como Autoridade Certificadora credenciada ICP-Brasil e emite certificados e-CPF/e-CNPJ" **não é sustentada por nenhuma fonte citada** na verificação adversarial. O que está confirmado é apenas que `auth_mode="certificadoDigital"` permite que o **signatário** assine com certificado digital — **não** que a ZapSign seja ela própria uma AC emissora. Tratar como não verificado até nova checagem.

### Custo
⚠️ NÃO CONFIRMADO — **divergência entre as próprias fontes oficiais citadas**: o blog oficial cita plano grátis de 5 documentos/mês e planos R$29,90/R$79,90 por mês; a página de preços oficial (`zapsign.com.br/precos`) cita grátis de **3** documentos/mês; a página de funcionalidades cita limites de documentos diferentes por plano; a página internacional (`zapsign.co`) tem estrutura de planos totalmente diferente em USD. **Confirmar o valor exato e o limite do plano grátis diretamente no painel/checkout antes de qualquer decisão.**

### Recomendação
O núcleo técnico da API (autenticação, criação de documento, signatários, `auth_mode`, webhooks) está sustentado pelas fontes e pode ser usado com confiança para planejar uma integração. Antes de contratar: (a) não repetir a alegação de AC ICP-Brasil emissora; (b) confirmar preço/limite do plano grátis diretamente no painel, não por estas fontes.

### Fontes
docs.zapsign.com.br, blog.zapsign.com.br/zapsign-planos, zapsign.com.br/precos, zapsign.com.br/tabela-funcionalidades-v2, zapsign.co/plans-and-prices, clients.zapsign.com.br (páginas de ajuda).

---

## 6. Z-API (gateway não-oficial de WhatsApp)

### O que é
Gateway brasileiro de envio/recebimento de mensagens WhatsApp via automação do **WhatsApp Web/Business App** (protocolo tipo Baileys) — **NÃO é a Cloud API oficial da Meta**. Cada instância recebe um `instanceId` e um token.

### Quando usar
Automação de atendimento via WhatsApp fora do fluxo oficial de BSP certificado (Zionic, por exemplo, opera de forma diferente — ver seção 7). Avaliar caso a caso o risco abaixo antes de usar em produção crítica.

### Autenticação
`instanceId` + token, passados via header/URL. ⚠️ NÃO CONFIRMADO: termo específico "Client-Token" não apareceu nas páginas verificadas; estrutura exata de URL-base dos endpoints — validar no painel ("Instâncias") antes de codar.

### Alertas e riscos (o mais importante desta seção)
- **É um gateway não-oficial**: conecta via automação do WhatsApp Web/Business App real, não pela Cloud API da Meta. Isso carrega risco real de **banimento do número** pela Meta e instabilidade por depender de engenharia reversa do protocolo — risco estrutural do modelo, não uma falha pontual do fornecedor.
- ⚠️ NÃO CONFIRMADO: "sede no Brasil" foi inferida por sinais indiretos (preços em R$, "suporte 100% nacional") — não há declaração explícita de endereço/CNPJ nas páginas verificadas.
- ⚠️ NÃO CONFIRMADO: posição da Z-API sobre a mudança da Meta que introduz `username`/BSUID no lugar do número de telefone — nenhuma fonte primária da própria empresa foi localizada tratando do tema. Como a Z-API opera via protocolo WhatsApp Web/Business App (não a Cloud API oficial), o impacto técnico dessa mudança não está confirmado.

### Recomendação
Para qualquer fluxo de atendimento/CRM que precise de garantia contratual e menor risco de banimento, preferir um BSP oficial certificado pela Meta (ex.: o modelo do Zionic, seção 7) a um gateway não-oficial como este, especialmente para números críticos de negócio.

### Fontes
developer.z-api.io (doc introdutória e páginas de endpoints de status/envio de texto).

---

## 7. Zionic — CRM/pipeline com automação via WhatsApp (já conectado como MCP)

⚠️ Esta seção **não passou pelo mesmo processo de pesquisa web + verificação adversarial** das seções 1-6 — é descrita a partir das ferramentas reais já conectadas como MCP nesta sessão de trabalho (evidência direta de primeira mão, não pesquisa de terceiros). Para integração via REST fora do MCP, pesquisar `docs.zionic.*` separadamente antes de codar.

### O que é (observado via MCP conectado)
Plataforma de CRM/pipeline de vendas com automação via WhatsApp e uma camada de RAG (busca semântica/IA) sobre uma base de conhecimento. Capacidades observadas: gestão de leads (criar, listar, mover entre colunas/pipelines), pipelines e colunas configuráveis, tags e campos customizados (criar, sincronizar), controle de agente (IA) de atendimento, envio de mensagens, e um mecanismo de RAG (`rag_ask`, `rag_search`, `rag_status`, `list_rag_documents`) para respostas baseadas em documentos.

### Quando usar
Automação de atendimento/vendas via WhatsApp integrada a pipeline de CRM, quando o fluxo precisa de gestão de leads/funil (não apenas envio de mensagem avulsa, que seria o caso de uso do Z-API isolado).

### Fontes
Lista de ferramentas do MCP `zionic-config` já conectado ao ambiente desta sessão (evidência direta, não pesquisa externa).

---

## 8. Outras integrações já em uso no Hub DON (referência rápida)

Já documentadas no `CLAUDE.md` global do usuário — não repesquisadas aqui, listadas para completude do panorama:

- **Google Ads API** (conta `5806501419`) — gestão de campanhas de tráfego pago.
- **Supabase** — Postgres + Auth + Storage, banco de todos os SaaS do Hub DON.
- **JUIT/Rimor + acervo DNEX** — busca de jurisprudência (70M precedentes) acoplada ao acervo institucional do PRD Advogados.
- **Gmail / Calendar / Drive** — produtividade e automação de e-mail/agenda.
- **Figma / Canva** — design e geração de peças visuais.

---

## Resumo executivo por serviço

| Serviço | Confiança da pesquisa | Pronto pra usar sem mais checagem? |
|---|---|---|
| CPFHub | Alta (núcleo técnico confirmado) | Núcleo sim; validar contrato de dados exato e Termos/DPA antes de produção |
| Consulta CNPJ (BrasilAPI+ReceitaWS) | Alta | Sim — já é o padrão implementado |
| Consulta CEP (BrasilAPI+ViaCEP) | Alta | Sim — já é o padrão implementado |
| ContaAzul API | Parcial — verificação NÃO confirmou detalhes técnicos | Não — revalidar endpoints/schema em `developers.contaazul.com` manualmente |
| ZapSign API | Parcial — núcleo técnico confirmado, preços contraditórios entre fontes oficiais, uma alegação (AC ICP-Brasil) não sustentada | Núcleo técnico sim; preços e afirmação de AC não |
| Z-API | Alta na descrição técnica; risco estrutural (não-oficial) | Avaliar risco de banimento antes de produção crítica |
| Zionic | Evidência direta (MCP conectado), não pesquisa externa | Já em uso operacional nesta sessão |

## Como manter este documento

- Ao integrar qualquer um destes serviços, **revalidar** os pontos marcados ⚠️ NÃO CONFIRMADO na fonte oficial antes de codar — não confiar cegamente neste documento para detalhes técnicos não confirmados.
- Ao adicionar um serviço novo ao Hub DON, seguir o mesmo padrão: pesquisa em fonte primária + verificação adversarial (reabrir a mesma fonte e conferir), marcando explicitamente o que não foi confirmado.
- Datas de "última verificação" por seção ajudam a saber quando revalidar (preços/planos mudam).
