# Sellers — Guia completo do onboarding

Receita de bolo para implementar o fluxo de criação de conta de vendedor (seller) integrado ao payment provider **Chargefy**. Cobre wizard frontend, validações, APIs externas, edge functions, webhook e banco de dados.

---

## 1. Visão geral

O tenant (escola/produtor) precisa criar uma conta de vendedor para receber pagamentos. O fluxo coleta dados pessoais, empresariais (se PJ), documentos KYC e dados bancários, depois envia tudo ao Chargefy que faz a análise e retorna o resultado via webhook.

### Fluxo de status

```
draft → pending → approved
                → rejected → (editar e reenviar) → pending
         approved → disabled
         * → deleted (soft delete)
```

### Tipos de seller

| Tipo | Descrição | Steps do wizard |
|------|-----------|-----------------|
| `individual` (PF) | Pessoa física | type → personal → documents → bank → review |
| `business` (PJ) | Pessoa jurídica | type → business → personal → documents → bank → review |

---

## 2. Wizard (frontend)

Componente principal: `src/components/seller/SellerWizard.tsx`

O wizard é um formulário multi-step. Cada step salva seus dados via `saveDraft()` ao avançar. O seller é criado como `draft` no step 1 e só é enviado ao Chargefy no step final (review).

### Step 1 — Tipo (`SellerTypeStep`)

**Dados coletados:**
- `type`: `individual` ou `business`
- `taxpayer_id` (CPF, se PF) ou `ein` (CNPJ, se PJ)
- País (sempre Brasil)

**Validações no frontend:**
- **CPF**: Algoritmo de Luhn com checksum de 2 dígitos verificadores
- **CNPJ**: Checksum com pesos `[5,4,3,2,9,8,7,6,5,4,3,2]` e `[6,5,4,3,2,9,8,7,6,5,4,3,2]`

**Comportamento:**
- Ao confirmar, chama `createSeller(type, document)` que cria o registro na tabela `sellers`
- Se PJ: antes de inserir, chama a API CNPJA para enriquecer dados automaticamente
- Após criação, o step fica read-only (locked)

### Step 2 — Empresa (`SellerBusinessStep`) — somente PJ

**Dados coletados:**
- `business_name` — razão social (auto-preenchido pela CNPJA)
- `business_opening_date` — data de abertura
- `business_email` — e-mail comercial
- `business_phone` — telefone comercial
- `business_description` — descrição do negócio
- `revenue` — faturamento anual (armazenado como texto formatado, parseado como número)
- `main_activity` — atividade principal CNAE (auto-preenchida ou selecionada manualmente)
- `business_website` — website (opcional)
- Endereço comercial completo (`business_address_*`)

**APIs externas chamadas:**
- **CNPJA** (na criação do seller): auto-preenche razão social, telefone, e-mail, data de abertura, CNAE e endereço
- **BrasilAPI CEP**: ao digitar o CEP, busca rua, bairro, cidade e estado

**CNAE/MCC:**
- Se a CNPJA retornou dados CNAE, exibe read-only
- Senão, carrega opções da tabela `cnae_mcc` do Supabase em um popover com busca
- O MCC é resolvido automaticamente no backend via lookup `cnae_mcc`

### Step 3 — Dados pessoais (`SellerPersonalStep`)

**Dados coletados:**
- `first_name`, `last_name`
- `email` — e-mail pessoal
- `phone_number` — telefone (via componente PhoneInput, armazena só dígitos com DDI: `5511999999999`)
- `birthdate` — data de nascimento
- `taxpayer_id` — CPF do responsável (PJ) ou titular (PF)
- Endereço pessoal completo (`address_*`)

**APIs externas chamadas:**
- **BrasilAPI CEP**: mesmo comportamento do step de empresa

**Validações no frontend:**
- Idade mínima: 18 anos
- CPF: checksum Luhn
- Todos os campos de endereço obrigatórios (exceto complemento)

### Step 4 — Documentos (`SellerDocumentsStep`)

**Sistema de combos de identidade:**

O seller escolhe um combo e deve enviar todos os documentos daquele combo:

| Combo (`identity_doc_type`) | Documentos obrigatórios |
|-----------------------------|------------------------|
| `selfie_cnh_full` | selfie + CNH completa (1 arquivo) |
| `selfie_cnh_front_back` | selfie + CNH frente + CNH verso |
| `selfie_rg_front_back` | selfie + RG frente + RG verso |

**Constraints de arquivo:**
- Tamanho máximo: **5 MB** (frontend) / **3 MB** (backend)
- Formatos aceitos: PNG, JPEG, BMP, WebP, HEIC, HEIF
- PDF aceito **apenas** para `cnh_full`

**Comportamento:**
- Ao completar um combo, os outros ficam desabilitados (combo locking)
- Suporta drag-and-drop
- Ao fazer upload, chama `uploadDocument()` que:
  1. Chama edge function `seller-upload-document` para obter signed URL
  2. Faz PUT do arquivo na signed URL
- Ao remover documento, deleta do Storage e da tabela `seller_documents`

### Step 5 — Dados bancários (`SellerBankStep`)

**Dados coletados:**
- `bank_code` — código do banco (selecionado via popover com busca, formatado como `### - Nome do Banco`)
- `bank_account_type` — `checking` (corrente) ou `savings` (poupança)
- `bank_agency` — agência (só dígitos, sem hífen)
- `bank_account` — conta (só dígitos, sem hífen)

**Fonte dos bancos:** hook `useBrazilianBanks` (lista de bancos brasileiros)

### Step 6 — Revisão (`SellerReviewStep`)

**Comportamento:**
- Exibe todos os dados em 4 seções: Empresa (PJ), Pessoal, Documentos, Banco
- Cada seção mostra badge de erro se houver campos faltando
- Campos faltando aparecem em vermelho com estilo de erro
- Botão "Editar" em cada seção volta ao step correspondente
- Checkbox de aceite de termos obrigatório
- Diálogo de confirmação antes do envio
- Ao confirmar, chama `submitSeller()` → edge function `seller-submit`

---

## 3. APIs externas

### CNPJA (consulta de CNPJ)

- **URL**: `https://open.cnpja.com/office/{cnpj_14_digitos}`
- **Método**: GET (API pública, sem autenticação)
- **Timeout**: 3 segundos
- **Quando**: Na criação do seller PJ (step 1, antes do INSERT)
- **Falha silenciosa**: Se der erro ou timeout, ignora e continua
- **Dados retornados usados**:

| Campo CNPJA | Campo seller |
|-------------|-------------|
| `company.name` | `business_name` |
| `founded` (primeiros 10 chars) | `business_opening_date` |
| `phones[0]` (`55` + area + number) | `business_phone` |
| `emails[0].address` | `business_email` |
| `mainActivity` | `cnae.main` (JSONB) + `main_activity` |
| `sideActivities[]` | `cnae.side` (JSONB) |
| `address.*` | `business_address_*` |
| `company.members[]` | `first_name` + `last_name` (representante legal) |

**Extração do representante legal (auto-preenche step de dados pessoais):**

A API retorna sócios em `company.members[]`. O sistema identifica o representante legal pela prioridade de role:

| Prioridade | Role ID | Descrição |
|------------|---------|-----------|
| 1 | 49 | Sócio-Administrador |
| 2 | 5 | Administrador |
| 3 | 65 | Titular PF |
| 4 | 16 | Presidente |
| 5 | 10 | Diretor |
| 6 | 31 | Sócio Ostensivo |

- Filtra apenas pessoas físicas (`person.type === "NATURAL"`)
- Ordena por prioridade de role, pega o primeiro
- **Empresário Individual** (natureza jurídica 2135): não retorna sócios, então extrai o nome do campo `company.name` removendo o prefixo numérico (ex: `"56.125.769 SANDY ALVES DA SILVA"` → Nome: Sandy, Sobrenome: Alves da Silva)
- Nomes são convertidos de CAPS para Title Case (partículas da/de/do/dos/das ficam minúsculas)
- Primeiro token → `first_name`, restante → `last_name`

### BrasilAPI (consulta de CEP)

- **URL**: `https://brasilapi.com.br/api/cep/v1/{cep_8_digitos}`
- **Método**: GET (API pública)
- **Debounce**: 500ms (evita chamadas excessivas durante digitação)
- **Quando**: Steps de empresa e pessoal, ao preencher CEP
- **Dados retornados usados**:

| Campo BrasilAPI | Campo seller |
|----------------|-------------|
| `street` | `address_line1` / `business_address_line1` |
| `neighborhood` | `address_neighborhood` / `business_address_neighborhood` |
| `city` | `address_city` / `business_address_city` |
| `state` | `address_state` / `business_address_state` |

### Chargefy (payment provider)

- **Base URL**: `https://api.chargefy.io`
- **Autenticação**: `Bearer {CHARGEFY_API_KEY}`
- **Env vars**: `CHARGEFY_API_KEY`, `SELLER_WEBHOOK_SECRET`

Endpoints usados:

| Endpoint | Método | Quando |
|----------|--------|--------|
| `/v1/organizations` | POST | `seller-submit` — cria sub-organização |
| `/v1/organizations/{id}/kyc/documents` | POST | `seller-submit` — envia docs KYC |
| Webhook (recebido) | POST | `seller-update-webhook` — recebe mudanças de status |

---

## 4. Validações

### Frontend (sellerValidation.ts)

Cada função retorna array de campos faltando (vazio = OK):

**`validateBusiness(seller)`** — 11 campos obrigatórios para PJ:
- `business_name`, `ein`, `business_email`, `business_phone`, `business_opening_date`
- `business_description`, `main_activity`
- `business_address_line1`, `business_address_city`, `business_address_state`, `business_address_postal_code`

**`validatePersonal(seller)`** — 10 campos obrigatórios (PF e PJ):
- `first_name`, `last_name`, `email`, `phone_number`, `birthdate`, `taxpayer_id`
- `address_line1`, `address_city`, `address_state`, `address_postal_code`

**`validateDocuments(seller)`**:
- Verifica se `identity_doc_type` foi selecionado
- Verifica se todos os docs do combo selecionado foram enviados

**`validateBank(seller)`** — 3 campos obrigatórios:
- `bank_code`, `bank_agency`, `bank_account`

### Backend (seller-submit edge function)

Mesmos campos, validados novamente no servidor:

**Campos comuns (PF e PJ):**
`first_name`, `last_name`, `email`, `phone_number`, `taxpayer_id`, `birthdate`, `address_line1`, `address_city`, `address_state`, `address_postal_code`, `bank_code`, `bank_agency`, `bank_account`

**Campos adicionais para PJ:**
`ein`, `business_name`, `business_phone`, `business_email`, `business_opening_date`, `business_description`, `main_activity`, `business_address_line1`, `business_address_city`, `business_address_state`, `business_address_postal_code`

---

## 5. Edge Functions

### seller-upload-document

**Arquivo**: `supabase/functions/seller-upload-document/index.ts`

Gera signed URL para upload de documento KYC e registra metadados.

**Request:**
```json
POST /functions/v1/seller-upload-document
Authorization: Bearer <JWT>

{
  "tenant_id": "uuid",
  "seller_id": "uuid",
  "category": "selfie" | "cnh_full" | "cnh_front" | "cnh_back" | "rg_front" | "rg_back",
  "identity_sub_type": "front" | "back" | "full",  // opcional
  "filename": "foto.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 123456  // opcional
}
```

**Response (200):**
```json
{
  "document_id": "uuid",
  "upload_url": "https://...signed-url...",
  "upload_token": "token",
  "object_path": "tenant/{tenant_id}/{seller_id}/{category}_{timestamp}_{filename}"
}
```

**Fluxo interno:**
1. Valida JWT e verifica `is_tenant_editor()`
2. Valida categoria, MIME type e tamanho (max 3MB)
3. Busca seller e verifica status (`draft` ou `rejected`)
4. Remove documento anterior da mesma categoria (se existir) do Storage e da tabela
5. Gera path: `tenant/{tenant_id}/{seller_id}/{category}_{timestamp}_{safe_filename}`
6. Cria signed upload URL via `storage.createSignedUploadUrl()`
7. Insere registro na tabela `seller_documents`
8. Retorna URL e token para o frontend fazer PUT do arquivo

**Categorias válidas:** `selfie`, `identity`, `cnh_full`, `cnh_front`, `cnh_back`, `rg_front`, `rg_back`

**MIME types aceitos:** `image/png`, `image/jpeg`, `image/bmp`, `image/webp`, `image/heic`, `image/heif` + `application/pdf` (apenas `cnh_full`)

---

### seller-submit

**Arquivo**: `supabase/functions/seller-submit/index.ts`

Valida todos os dados, marca seller como `pending` e dispara evento para integração assíncrona com o Chargefy.

**Request:**
```json
POST /functions/v1/seller-submit
Authorization: Bearer <JWT>

{
  "tenant_id": "uuid",
  "seller_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "seller_id": "uuid"
}
```

**Fluxo interno:**
1. Valida JWT e verifica `is_tenant_editor()`
2. Busca seller — **idempotência**: se já está `pending`, retorna sucesso sem reprocessar
3. Valida que status permite submissão (`draft` ou `rejected`)
4. Valida campos obrigatórios (diferentes para PF/PJ)
5. Valida documentos: `identity_doc_type` deve estar definido e todos os docs do combo devem existir
6. **Auto-resolve MCC**: busca na tabela `cnae_mcc` pelo `cnae.main.id` do seller → salva `mcc` se encontrar
7. Atualiza status para `pending`, seta `submitted_at`, limpa `rejected_at` e `rejection_reason`
8. Cria evento `tenant_submitted` na tabela `seller_events` → **trigger pg_net dispara async** `seller-provider-submit`

---

### seller-provider-submit

**Arquivo**: `supabase/functions/seller-provider-submit/index.ts`

Edge function assíncrona que faz a integração com o Chargefy. Disparada automaticamente via trigger pg_net quando um evento `tenant_submitted` é inserido na tabela `seller_events`.

**Request (disparado pelo trigger pg_net, não pelo frontend):**
```json
POST /functions/v1/seller-provider-submit
Authorization: Bearer <anon_key>

{
  "seller_id": "uuid",
  "tenant_id": "uuid",
  "event_id": "uuid"
}
```

**Fluxo interno:**
1. **Idempotência**: se já existe evento `provider_submitted` para o seller, pula
2. Se `CHARGEFY_API_KEY` não está configurada, pula silenciosamente
3. Busca seller e tenant
4. **Cria sub-organização no Chargefy**: `POST /v1/organizations` com payload mapeado
   - **Idempotência**: se `external_suborganization_id` já existe, pula criação
5. Salva `external_suborganization_id` (ID da suborganization retornado pela Chargefy)
6. **Upload KYC**: para cada doc do combo selecionado:
   - Baixa do Supabase Storage → converte para base64
   - Envia para `POST /v1/organizations/{id}/kyc/documents`
   - Falha de KYC **não bloqueia** (log e continua)
7. Loga evento `provider_submitted` (ou `provider_submission_failed` em caso de erro)

**Payload Chargefy (mapeamento):**

```
{
  organization: {
    name: tenant.name,
    slug: tenant.id,
    email: business_email (PJ) ou email (PF)
  },
  invite_email: email,
  seller_type: "individual" | "business",
  fee_percent: 0,
  bank_account: {
    holder_name: "first_name last_name",
    taxpayer_id: ein (PJ) ou taxpayer_id (PF) — só dígitos,
    bank_code: bank_code padStart(3, "0"),
    routing_number: bank_agency — só dígitos,
    account_number: bank_account,
    account_type: bank_account_type
  },

  // Se PF:
  individual: {
    full_name, email, phone (só dígitos), cpf (só dígitos),
    birth_date, address, mcc (se existir), statement_descriptor (se existir)
  },

  // Se PJ:
  business: {
    cnpj (só dígitos), business_name, trading_name,
    business_email, business_phone (só dígitos), business_opening_date,
    mcc, statement_descriptor, business_address,
    owner: { full_name, email, phone, cpf, birth_date, address }
  }
}
```

**Mapeamento de docs Hubfy → Chargefy:**

| Categoria Hubfy | Tipo Chargefy |
|----------------|--------------|
| `selfie` | `SELFIE` |
| `cnh_full` | `CNH_FULL` |
| `cnh_front` | `CNH_FRONT` |
| `cnh_back` | `CNH_BACK` |
| `rg_front` | `RG_FRONT` |
| `rg_back` | `RG_BACK` |

---

### seller-update-webhook

**Arquivo**: `supabase/functions/seller-update-webhook/index.ts`

Recebe webhooks do Chargefy quando o status da organização muda.

**Request (recebido do Chargefy):**
```
POST /functions/v1/seller-update-webhook
webhook-id: <id>
webhook-timestamp: <timestamp>
webhook-signature: v1,<base64_hmac_sha256>

{
  "type": "sub_organization.updated",
  "data": {
    "id": "chargefy_org_id",
    "status": "active",
    "fee_percent": 3.5,
    "rejection_reason": "..."
  }
}
```

**Verificação de assinatura (Standard Webhooks):**
1. Extrai `webhook-id`, `webhook-timestamp`, `webhook-signature` dos headers
2. Remove prefixo do secret: `chargefy_whs_` ou `whsec_`
3. Calcula: `HMAC-SHA256(secret, "{webhook-id}.{webhook-timestamp}.{body}")`
4. Compara com assinatura(s) recebida(s) — suporta múltiplas separadas por espaço
5. Fallback: header `x-webhook-secret` legado (comparação direta)

**Mapeamento de status Chargefy → interno:**

| Status Chargefy | Status interno |
|----------------|---------------|
| `created` | — (ignorado, só loga como `provider_created`) |
| `onboarding_started` | `pending` |
| `under_review` | `pending` |
| `active` | `approved` |
| `denied` | `rejected` |
| `suspended` | `disabled` |
| `blocked` | `disabled` |

**Fluxo interno:**
1. Verifica assinatura do webhook (Standard Webhooks: HMAC-SHA256)
2. Filtra: só processa `suborganization.created` e `suborganization.updated`
3. Busca seller por `external_suborganization_id`
4. Atualiza status + timestamps:
   - Se `approved`: seta `approved_at`, limpa `rejected_at` e `rejection_reason`
   - Se `rejected`: seta `rejected_at`, captura `rejection_reason` do payload
5. Se `approved`: upsert na tabela `seller_fees` com `fee_percent` do payload
6. Loga evento na tabela `seller_events`

**Response (200):**
```json
{
  "received": true,
  "status": "processed",
  "internal_status": "approved"
}
```

---

## 6. Hook: useSeller

**Arquivo**: `src/hooks/useSeller.ts`

Hook React (TanStack Query) que gerencia todo o estado do seller no frontend.

**Query:**
- Key: `["seller", tenantId]`
- Stale time: 5 minutos
- Busca: `sellers` com join `seller_documents(*)` filtrado por `tenant_id`

**Funções:**

| Função | O que faz |
|--------|-----------|
| `createSeller(type, document)` | Cria seller draft. Se PJ, chama CNPJA antes (enriquece dados da empresa + nome do representante legal). |
| `saveDraft(updates)` | Salva campos no seller (só se draft/rejected). |
| `submitSeller()` | Invoca edge function `seller-submit`. |
| `requestReapproval()` | Muda approved → pending (para re-análise). |
| `uploadDocument(category, file, subType?)` | Upload em 2 passos: signed URL → PUT. |
| `removeDocument(documentId)` | Remove do Storage e da tabela. |

**Flags computadas:**
- `canEdit`: `status === "draft" || "rejected"`
- `isApproved`, `isPending`, `isRejected`

---

## 7. Banco de dados

### Enums

| Enum | Valores |
|------|---------|
| `seller_status` | `draft`, `pending`, `approved`, `rejected`, `disabled`, `deleted` |
| `seller_type` | `individual`, `business` |
| `seller_document_category` | `selfie`, `cnh_full`, `cnh_front`, `cnh_back`, `rg_front`, `rg_back` |

### Tabela: `sellers`

1 seller por tenant (constraint `sellers_tenant_id_unique`).

#### Core

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `tenant_id` | UUID | — | FK → `tenants(id)` CASCADE. Unique. |
| `type` | `seller_type` | — | `individual` (PF) ou `business` (PJ) |
| `status` | `seller_status` | `'draft'` | Status atual |

#### Dados pessoais (PF) / Sócio responsável (PJ)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `first_name` | TEXT | Nome |
| `last_name` | TEXT | Sobrenome |
| `email` | TEXT | E-mail pessoal |
| `phone_number` | TEXT | Telefone (só dígitos com DDI: `5511999999999`) |
| `taxpayer_id` | TEXT | CPF (11 dígitos, sem pontuação) |
| `birthdate` | DATE | Data de nascimento (mínimo 18 anos) |

#### Endereço pessoal

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `address_line1` | TEXT | Rua |
| `address_line2` | TEXT | Número |
| `address_line3` | TEXT | Complemento |
| `address_neighborhood` | TEXT | Bairro |
| `address_city` | TEXT | Cidade |
| `address_state` | TEXT | UF (2 letras, ex: SP) |
| `address_postal_code` | TEXT | CEP (8 dígitos, sem hífen) |
| `address_country_code` | TEXT | Default: `'BR'` |

#### Negócio / Comercial

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `statement_descriptor` | TEXT | Nome fantasia (aparece na fatura) |
| `revenue` | BIGINT | Faturamento anual em centavos |
| `mcc` | TEXT | Merchant Category Code (auto-resolvido via `cnae_mcc` no submit) |
| `cnae` | JSONB | CNAEs da CNPJA: `{ main: { id, text }, side: [{ id, text }] }` |
| `main_activity` | TEXT | Atividade principal selecionada |

#### Dados empresa (somente PJ)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `business_name` | TEXT | Razão social |
| `ein` | TEXT | CNPJ (14 dígitos, sem pontuação) |
| `business_phone` | TEXT | Telefone comercial |
| `business_email` | TEXT | E-mail comercial |
| `business_description` | TEXT | Descrição do negócio |
| `business_website` | TEXT | Website |
| `business_opening_date` | DATE | Data de abertura |

#### Endereço empresa (somente PJ)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `business_address_line1` | TEXT | Rua |
| `business_address_line2` | TEXT | Número |
| `business_address_line3` | TEXT | Complemento |
| `business_address_neighborhood` | TEXT | Bairro |
| `business_address_city` | TEXT | Cidade |
| `business_address_state` | TEXT | UF |
| `business_address_postal_code` | TEXT | CEP |
| `business_address_country_code` | TEXT | Default: `'BR'` |

#### Dados bancários

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `bank_code` | TEXT | — | Código do banco (ex: `341`) |
| `bank_agency` | TEXT | — | Agência (só dígitos) |
| `bank_account` | TEXT | — | Conta (só dígitos) |
| `bank_account_type` | TEXT | `'checking'` | `checking` ou `savings`. CHECK constraint. |

#### Documentos de identidade

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `identity_doc_type` | TEXT | Combo selecionado: `selfie_cnh_full`, `selfie_cnh_front_back` ou `selfie_rg_front_back`. CHECK constraint. |

#### Integração externa (Chargefy)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `external_suborganization_id` | TEXT | ID da suborganization na Chargefy |

#### Controle de fluxo

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `submitted_at` | TIMESTAMPTZ | Quando foi enviado para análise |
| `approved_at` | TIMESTAMPTZ | Quando foi aprovado |
| `rejected_at` | TIMESTAMPTZ | Quando foi rejeitado |
| `rejection_reason` | TEXT | Motivo da rejeição (vem do webhook Chargefy) |

#### Auditoria

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `created_at` | TIMESTAMPTZ | `now()` | Criação |
| `updated_at` | TIMESTAMPTZ | `now()` | Última atualização (trigger automático) |
| `created_by` | UUID | — | FK → `auth.users(id)` |

#### Índices

| Nome | Coluna(s) | Filtro |
|------|-----------|--------|
| `idx_sellers_status` | `status` | — |
| `idx_sellers_external_suborg_id` | `external_suborganization_id` | `WHERE external_suborganization_id IS NOT NULL` |

#### RLS

| Operação | Regra |
|----------|-------|
| SELECT | `is_tenant_editor(tenant_id)` OR `is_admin()` |
| INSERT | `is_tenant_editor(tenant_id)` |
| UPDATE | `is_tenant_editor(tenant_id)` OR `is_admin()` |
| DELETE | Não permitido (soft delete via `status = 'deleted'`) |

---

### Tabela: `seller_documents`

Documentos KYC enviados pelo seller. Armazenados no bucket `seller-docs` do Supabase Storage.

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `seller_id` | UUID | — | FK → `sellers(id)` CASCADE |
| `category` | `seller_document_category` | — | `selfie`, `cnh_full`, `cnh_front`, `cnh_back`, `rg_front`, `rg_back` |
| `identity_sub_type` | TEXT | — | `'front'`, `'back'` ou `'full'`. CHECK constraint. |
| `bucket` | TEXT | `'seller-docs'` | Bucket no storage |
| `object_path` | TEXT | — | Caminho do arquivo no bucket |
| `original_filename` | TEXT | — | Nome original do arquivo |
| `mime_type` | TEXT | — | Tipo MIME |
| `size_bytes` | INTEGER | — | Tamanho em bytes |
| `created_at` | TIMESTAMPTZ | `now()` | Data do upload |

**RLS:** SELECT/INSERT/DELETE para `is_tenant_editor()` via join com seller. Admins podem SELECT.

---

### Tabela: `seller_events`

Log de eventos e webhooks para rastreabilidade.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `seller_id` | UUID | FK → `sellers(id)` SET NULL |
| `tenant_id` | UUID | FK → `tenants(id)` SET NULL |
| `event_type` | TEXT | Ex: `submitted`, `status_updated`, `webhook_error`, `chargefy_create_failed` |
| `external_status` | TEXT | Status vindo do Chargefy |
| `internal_status` | TEXT | Status mapeado internamente |
| `raw_payload` | JSONB | Payload completo do webhook |
| `error_message` | TEXT | Mensagem de erro |
| `created_at` | TIMESTAMPTZ | Quando ocorreu |

**RLS:** SELECT somente para `is_admin()`. INSERT via service role.

---

### Tabela: `seller_fees`

Taxa por seller, criada automaticamente quando aprovado (via webhook).

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `seller_id` | UUID | — | FK → `sellers(id)` CASCADE. **Unique**. |
| `fee_percent` | NUMERIC(5,2) | `0` | Taxa em %. Range: 0–50. |
| `created_at` | TIMESTAMPTZ | `now()` | Criação |
| `updated_at` | TIMESTAMPTZ | `now()` | Última atualização (trigger) |

**RLS:** SELECT para membros do tenant. INSERT/UPDATE apenas via service role.

---

### Tabela: `cnae_mcc`

Tabela de lookup com 1410 registros mapeando CNAE brasileiro para MCC (Merchant Category Code).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | PK |
| `cnae` | TEXT | Código CNAE (ex: `5231101`) |
| `cnae_activity` | TEXT | Descrição da atividade CNAE |
| `mcc` | TEXT | Código MCC (ex: `7299`) |
| `mcc_activity` | TEXT | Descrição da atividade MCC |
| `status` | TEXT | `regular`, `restrict`, `incentivized`, `prohibited` |

**RLS:** SELECT público (qualquer um pode consultar).
**Índices:** `cnae`, `mcc`, `status`

---

### Storage: bucket `seller-docs`

Bucket **privado** no Supabase Storage.

| Operação | Regra |
|----------|-------|
| INSERT (upload) | `authenticated` + owner/editor do tenant + tenant_id no path |
| SELECT (download) | `is_admin()` OR (`authenticated` + owner/editor do tenant) |
| DELETE | `authenticated` + owner/editor do tenant |

**Path pattern:** `tenant/{tenant_id}/{seller_id}/{category}_{timestamp}_{filename}`

---

## 8. Env vars necessárias

| Variável | Onde | Descrição |
|----------|------|-----------|
| `CHARGEFY_API_KEY` | Supabase Edge Functions | API key do Chargefy |
| `SELLER_WEBHOOK_SECRET` | Supabase Edge Functions | Secret para verificar assinatura do webhook |
| `SUPABASE_URL` | Automática | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Automática | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Automática | Service role key |

---

## 9. Migrations

| Arquivo | O que faz |
|---------|-----------|
| `20260317000000_create_sellers.sql` | Cria `sellers`, `seller_documents`, `seller_events`, RLS, storage, triggers |
| `20260317100000_sellers_add_cnpja_fields.sql` | Adiciona `ncm`, `main_activity`, `bank_code`, `bank_agency`, `bank_account` |
| `20260317110000_sellers_drop_social_fields.sql` | Remove `business_facebook`, `business_twitter` |
| `20260318100000_sellers_chargefy_integration.sql` | Adiciona `bank_account_type`, `identity_doc_type`, `external_suborganization_id`, `identity_sub_type`, cria `seller_fees` |
| `20260319100000_sellers_identity_doc_type_combos.sql` | Migra `identity_doc_type` de `cnh`/`rg` para combos (`selfie_cnh_full`, etc.) |
| `20260319200000_create_cnae_mcc.sql` | Cria tabela `cnae_mcc` com 1410 registros de lookup |
| `20260319300000_rename_ncm_to_cnae_jsonb.sql` | Renomeia `ncm` → `cnae` (JSONB), migra dados existentes |
| `20260319400000_seller_async_provider_flow.sql` | Cria trigger pg_net em `seller_events` para disparar `seller-provider-submit` async via `on_tenant_submitted()`. Armazena `supabase_url` e `supabase_anon_key` no Vault. |

---

## 10. TypeScript types

Definidos em `src/types/seller.ts`:

- **`SellerType`**: `"individual"` | `"business"`
- **`SellerStatus`**: `"draft"` | `"pending"` | `"approved"` | `"rejected"` | `"disabled"` | `"deleted"`
- **`SellerDocumentCategory`**: `"selfie"` | `"cnh_full"` | `"cnh_front"` | `"cnh_back"` | `"rg_front"` | `"rg_back"` (+ tipos legados: `"identity"`, `"ssn"`, `"itin"`, `"eidas"`, `"ueid_card"`)
- **`IdentityDocType`**: `"selfie_cnh_full"` | `"selfie_cnh_front_back"` | `"selfie_rg_front_back"`
- **`IdentitySubType`**: `"front"` | `"back"` | `"full"`
- **`SellerDocument`**: Interface com 10 campos (id, seller_id, category, identity_sub_type, bucket, object_path, original_filename, mime_type, size_bytes, created_at)
- **`Seller`**: Interface com todos os campos da tabela + `seller_documents` (join)
- **`SellerFormData`**: `Omit<Seller, campos_sistema>` — campos editáveis no formulário

---

## 11. Arquivos do projeto

| Arquivo | Descrição |
|---------|-----------|
| `src/types/seller.ts` | Types TypeScript |
| `src/hooks/useSeller.ts` | Hook principal (query + mutations) |
| `src/components/seller/SellerWizard.tsx` | Componente wizard (controle de steps) |
| `src/components/seller/SellerTypeStep.tsx` | Step 1 — tipo e documento |
| `src/components/seller/SellerBusinessStep.tsx` | Step 2 — dados da empresa (PJ) |
| `src/components/seller/SellerPersonalStep.tsx` | Step 3 — dados pessoais |
| `src/components/seller/SellerDocumentsStep.tsx` | Step 4 — documentos KYC |
| `src/components/seller/SellerBankStep.tsx` | Step 5 — dados bancários |
| `src/components/seller/SellerReviewStep.tsx` | Step 6 — revisão e envio |
| `src/components/seller/SellerSummary.tsx` | Resumo read-only (pós-envio) |
| `src/components/seller/sellerValidation.ts` | Funções de validação por seção |
| `src/components/admin/settings/SellerSettingsTab.tsx` | Tab de settings do admin |
| `supabase/functions/seller-submit/index.ts` | Edge function — validação e submissão (muda status para pending) |
| `supabase/functions/seller-provider-submit/index.ts` | Edge function — integração async Chargefy (cria org + KYC) |
| `supabase/functions/seller-upload-document/index.ts` | Edge function — upload de docs |
| `supabase/functions/seller-update-webhook/index.ts` | Edge function — webhook |
