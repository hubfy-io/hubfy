# Hubfy — Arquitetura & Regras de Negócio
> Documento de referência técnica para o projeto Hubfy (hubfy.io).
> Atualizado em: 2026-03-12 (rev. 6 — remoção Zoop/delivery emails, portal magic link)
---
## Visão Geral
Hubfy é uma plataforma B2B2C de área de membros (estilo Hotmart/Circle) para infoprodutores gerenciarem e venderem produtos digitais e cursos online.
**Stack**: React + Vite + Tailwind CSS + TypeScript + Supabase + Gumlet
---
## 1. Multi-Tenancy
- Isolamento por `tenant_id` + Row Level Security (RLS) em todas as tabelas de conteúdo.
- URL pública via slug: `hubfy.io/:slug`.
- Um usuário pode ter múltiplos papéis simultaneamente.
---
## 2. Hierarquia de Papéis

### Camada Global (`user_roles`)
| Role       | Descrição                          |
| ---------- | ---------------------------------- |
| `admin`    | Equipe interna da Hubfy            |
| `tenant`   | Infoprodutor / dono do negócio     |
| `customer` | Cliente do infoprodutor            |

### Camada Local — Equipe (`tenant_users`)
Apenas membros da equipe de gestão. **Clientes não ficam nessa tabela.**

| Role     | Descrição                              |
| -------- | -------------------------------------- |
| `owner`  | Superadmin do tenant (pode haver mais de 1) |
| `editor` | Colaborador com permissão de edição    |

### Camada Local — Clientes (`customers`)
Tabela dedicada, separada de `tenant_users`. Um cliente pertence a um tenant.

| Campo                    | Tipo              | Descrição                          |
| ------------------------ | ----------------- | ---------------------------------- |
| `tenant_id`              | UUID (FK)         | Tenant ao qual pertence            |
| `user_id`                | UUID (FK)         | Conta no auth.users                |
| `name`                   | TEXT              | Nome do cliente                    |
| `email`                  | TEXT (NOT NULL)   | Email (unique por tenant)          |
| `phone`                  | TEXT              | Telefone                           |
| `city`                   | TEXT              | Cidade                             |
| `region`                 | TEXT              | Estado / região                    |
| `country`                | TEXT              | País                               |
| `email_marketing_status` | ENUM              | `subscribed`, `unsubscribed`, `archived`, `requires_verification`, `invalid_email`, `bounced` |
| `total_revenue_cents`    | INTEGER           | Receita total (em centavos)        |
| `mrr_cents`              | INTEGER           | Receita recorrente mensal (centavos) |
| `currency`               | TEXT              | Moeda (ex: `BRL`, `USD`)          |

**RPCs**: `get_tenant_customers`, `update_tenant_customer`, `delete_tenant_customer`
**Edge function**: `add-customer` (cria user no auth + registro em customers)
**Hook**: `useCustomers()` — CRUD completo com React Query
---
## 3. Signup & Workspace

### Signup diferenciado (trigger `handle_new_user`)
O campo `signup_as` nos metadados do usuário define o fluxo:
- **`tenant`** (default): cria perfil → atribui role `tenant`. Não cria tenant automaticamente.
- **`customer`**: cria perfil → atribui role `customer` → insere na tabela `customers` usando o `customer_tenant_id` fornecido nos metadados.
- **`team_member`**: cria perfil → atribui role `tenant` → vincula em `tenant_users` como `editor` no tenant do convite.

> **Nota**: O campo `is_creator` nos metadados do signup foi removido (era dead code — a trigger ignora completamente). A nomenclatura "creator" foi substituída por "tenant" em todo o projeto.

### Criação de workspace (`/admin/new-workspace`)
- `ProtectedRoute` redireciona usuários com role `tenant` sem workspace para `/admin/new-workspace`.
- A tela valida slug com debounce consultando somente `tenants`.
- Ao criar workspace, insere em `tenants (name, slug, created_by)`.
- O trigger `handle_new_tenant` cria automaticamente:
  - vínculo owner em `tenant_users`
  - linha default em `tenant_settings`
---
## 4. Modelo de Conteúdo
```
Curso → Módulo → Aula
```
- Curso criado gera **módulo default** automático (trigger `handle_new_course`).
- Slugs auto-gerados.
- Limites de caracteres: nome (200), descrição (300).
- Capas verticais travadas em 4:5 (180×225px).
- Cursos possuem `category` (enum `course_category`) e flags `is_published`.
---
## 5. Sistema de Assets
### Regra XOR (enforced por triggers)
Um asset é **`video` OU `file`**, nunca ambos:
- `validate_asset_file_xor`: impede inserção em `asset_files` se já existe `asset_videos`.
- `validate_asset_video_xor`: impede inserção em `asset_videos` se já existe `asset_files`.
### Ciclo de vida
- Status: `uploading` → `processing` → `ready` | `failed` | `deleted`
- Soft delete via status `deleted` para manter integridade histórica.
### Vínculo com aulas
- Tabela `lesson_assets_link` com `UNIQUE(lesson_id, asset_id)` impede duplicatas.
- Trigger `validate_lesson_asset_tenant` garante que asset e aula pertencem ao mesmo tenant.
### Upload unificado
- Botão único ("Upload arquivos") identifica tipo automaticamente.
- Vídeos → pipeline Gumlet (`asset-upload-video`).
- Outros formatos → Supabase Storage (`asset-upload-file` + `asset-confirm-upload`).
- Processamento de um arquivo por vez para estabilidade.
- Atualizações otimistas: asset aparece na lista imediatamente.
---
## 6. Storage (Supabase)
| Bucket    | Público | Uso                                              |
| --------- | ------- | ------------------------------------------------ |
| `covers`  | ✅ Sim  | Capas de cursos (vertical/horizontal)             |
| `avatars` | ✅ Sim  | Fotos de perfil e ícones de tenant                |
| `assets`  | ❌ Não  | Arquivos de aula (PDFs, imagens do editor, etc.)  |
### Regras de acesso
- **Capas e avatares**: URL pública direta via `getCoversPublicUrl()`. Sem signed URL.
- **Assets privados**: Signed URLs com TTL de 1 hora. Listagens usam `createSignedUrls` em batch para evitar N+1.
---
## 7. Integração Gumlet (Vídeo)
### Arquitetura
- **1 conta Gumlet** com API key global (`GUMLET_API_KEY`).
- **1 workspace por tenant** — criado just-in-time no primeiro upload via `POST /v1/video/workspaces`.
- O `workspace_id` é salvo em `tenants.gumlet_workspace_id` e passado como `collection_id` nas chamadas de upload.
### Fluxo de upload
1. Frontend chama edge function `asset-upload-video`.
2. Edge function cria asset no DB + chama Gumlet API → retorna `asset_id` + `upload_url`.
3. Frontend faz upload direto para Gumlet (TUS/PUT).
### Processamento
- Polling ativo via `gumlet-poll-progress` (intervalo de 5s).
- Sincroniza: `progress_pct`, `width`, `height`, `fps`, `aspect_ratio`, `original_size_bytes`.
- Proteção contra retrocesso de progresso.
- `thumbnail_url` e `playback_url` só são capturados quando status = `ready`.
### Webhook (`asset-webhook-gumlet`)
- Identifica tenant pelo `workspace_id` extraído do path da `source_url`.
- Verificação de assinatura via `GUMLET_SIGNING_SECRET`.
### Player
- **Admin**: iframe simples `play.gumlet.io/embed/${gumlet_asset_id}`.
- **Área do cliente**: reservado para `@gumlet/react-embed-player` (controle programático futuro).
### Secrets
| Secret                  | Uso                                |
| ----------------------- | ---------------------------------- |
| `GUMLET_API_KEY`        | Autenticação com API Gumlet        |
| `GUMLET_SIGNING_SECRET` | Verificação de webhooks            |
| `GUMLET_SOURCE_ID`      | Identificador de source na Gumlet  |
---
## 8. Showcases (Vitrines)

### Modelo de acesso
O controle de acesso a conteúdo é **por vitrine**, não por curso individual.

- **Vitrine pública** (`is_public = true`): qualquer customer do tenant acessa automaticamente todos os cursos da vitrine.
- **Vitrine privada** (`is_public = false`): apenas customers listados em `showcase_customers` podem acessar os cursos.

A tabela `showcase_courses` liga vitrines a cursos. A tabela `showcase_customers` controla quem tem acesso a vitrines privadas.

### Função `is_enrolled_in_course()`
Usada em 7 RLS policies (modules, lessons, lesson_progress, lesson_blocks, lesson_assets, lesson_videos, lesson_assets_link). Verifica se o user pode acessar um curso:
1. User está em `showcase_customers` de alguma vitrine que contém o curso, **OU**
2. O curso está em uma vitrine pública e o user é customer do tenant

### Visual
- Configuração visual persistida como colunas: `theme`, `grid_columns` (3-6), `cover_format` (Poster 3:4 ou Banner 16:10).
- Assets visuais: `hero_url`, `bg_dark_url`, `bg_light_url`.
- Função `can_view_showcase` controla visibilidade (editor OR admin OR customer do tenant com vitrine pública ou listado em showcase_customers).
---
## 9. Edge Functions
| Função                   | JWT  | Descrição                                                  |
| ------------------------ | ---- | ---------------------------------------------------------- |
| `add-customer`           | ❌   | Cria cliente (auth user + registro em customers)           |
| `asset-upload-video`     | ❌   | Cria asset de vídeo + inicia upload na Gumlet              |
| `asset-upload-file`      | ❌   | Gera signed URL para upload de arquivo                     |
| `asset-confirm-upload`   | ❌   | Confirma upload e marca asset como `ready`                 |
| `asset-delete`           | ❌   | Remove asset do storage e DB                               |
| `asset-webhook-gumlet`   | ❌   | Recebe webhooks da Gumlet                                  |
| `gumlet-poll-progress`   | ❌   | Polling de progresso de processamento                       |
| `process-checkout`       | ❌   | Processa checkout: cria order + customer + acesso (ver seção 15) |
| `customer-auth-start`    | ❌   | Envia magic link de acesso ao portal via Resend            |
| `setup-tenant`           | ❌   | Setup inicial do tenant                                    |
| `subscribe-free`         | ❌   | Cria apenas Stripe Customer para plano Free (síncrono)     |
| `stripe-checkout`        | ❌   | Cria Stripe Checkout Session para plano Pro                |
| `stripe-portal`          | ❌   | Gera link para Stripe Customer Portal                      |
| `stripe-webhook`         | ❌   | Recebe webhooks do Stripe (invoice, subscription, etc.)    |
---
## 10. Integrações Externas
- **Supabase**: Auth, DB (Postgres), Storage, Edge Functions.
- **Gumlet**: Vídeo (upload, processamento, player, CDN).
- **Stripe**: Pagamentos e assinaturas (checkout, portal, webhooks). Ver seção 14.
- **Resend**: Envio de emails transacionais (magic link de acesso ao portal). Domínio: `noreply@notifications.hubfy.io`.
- **Não há**: OAuth social.
- **Analytics**: Google Tag Manager (GTM-T3BTSKXL) carregado apenas em `/admin/signup` e apenas em produção.
---
## 11. Preferências de UX
- **Capas públicas, conteúdo privado** — sem signed URL para thumbnails/covers.
- **Simplicidade > Over-engineering** — soluções diretas, sem drama.
- **Upload unificado** — botão único que identifica tipo automaticamente.
- **Atualizações otimistas** — assets aparecem na lista imediatamente.
- **Batch over N+1** — listagens usam operações em lote.
- **Player leve no admin** — iframe simples, sem SDK pesado.
- **Idioma**: Português brasileiro (pt-BR) como padrão, inglês (en) como segunda língua. Ver seção 19.
---
## 12. Rotas Principais
### Admin (protegidas, requerem workspace)
| Rota                                              | Página                |
| ------------------------------------------------- | --------------------- |
| `/admin/new-workspace`                            | Criação de workspace  |
| `/admin`                                          | Dashboard             |
| `/admin/courses`                                  | Lista de cursos       |
| `/admin/courses/new`                              | Criar curso           |
| `/admin/courses/:courseId`                              | Estrutura do curso    |
| `/admin/courses/:courseId/modules/new`                  | Criar módulo          |
| `/admin/courses/:courseId/modules/:moduleId/lessons/new` | Criar aula           |
| `/admin/products`                                 | Produtos              |
| `/admin/checkouts`                                | Checkouts             |
| `/admin/checkouts/:smartId/edit`                  | Editar checkout       |
| `/admin/orders`                                   | Pedidos               |
| `/admin/orders/:orderId`                          | Detalhe do pedido     |
| `/admin/customers`                                | Clientes              |
| `/admin/assets`                                   | Repositório de assets |
| `/admin/showcase`                                 | Vitrines              |
| `/admin/design`                                   | Design & Marca        |
| `/admin/settings`                                 | Configurações         |
| `/admin/profile`                                  | Perfil                |
### Públicas
| Rota                       | Página                      |
| -------------------------- | --------------------------- |
| `/:slug`                   | Página pública do tenant    |
| `/:slug/login`             | Login de cliente            |
| `/:slug/signup`            | Signup de cliente           |
| `/club/:slug`              | Showcase público            |
| `/checkout/:checkoutSlug`  | Checkout público            |
---
## 13. Segurança (RLS)
- Todas as tabelas de conteúdo possuem RLS habilitado.
- Funções helper:
  - `is_tenant_customer()` — checa se user é owner/editor (via tenant_users) OU customer (via customers) do tenant
  - `is_tenant_member()` — alias para `is_tenant_customer()` (backward compatibility)
  - `is_tenant_editor()`, `is_tenant_owner()`, `is_admin()`
  - `is_enrolled_in_course()` — checa acesso via showcases (user em showcase_customers OU curso em vitrine pública + user é customer do tenant)
  - `can_view_showcase()` — checa se user pode ver a vitrine
- Customers **nunca** acessam rotas `/admin` (enforced no `ProtectedRoute`).
- Storage: escrita restrita por autenticação + contexto de tenant.
---
## 14. Stripe & Assinaturas

### Planos
| Plano | Preço    | Price ID (env)                | Descrição                     |
| ----- | -------- | ----------------------------- | ----------------------------- |
| Free  | R$ 0/mês | `VITE_STRIPE_FREE_PRICE_ID`  | Até 50 clientes, 1 curso      |
| Pro   | R$ 97/mês| `VITE_STRIPE_PRO_PRICE_ID`   | Clientes e cursos ilimitados   |

### Tabela `subscriptions`
Armazena a assinatura ativa de cada tenant. Campos principais:
- `tenant_id` (unique) — FK para `tenants`
- `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`
- `status` (`active`, `past_due`, `canceled`, `incomplete`, etc.)
- `current_period_start`, `current_period_end`, `cancel_at_period_end`

### Fluxo Free (síncrono, sem Checkout)
1. Frontend chama edge function `subscribe-free` (sem `price_id`).
2. Edge function: valida auth → busca tenant → busca nome do perfil → cria Stripe Customer com `name`, `email` e `metadata` (tenant_id, user_id).
3. Retorna `{ success: true, customer_id }`.
4. Frontend marca `is_completed = true` e redireciona para `/admin`.

### Fluxo Pro (via Stripe Checkout)
1. Frontend chama `stripe-checkout` com `price_id`.
2. Edge function: valida auth → busca tenant → get/create Stripe customer → cria Checkout Session → retorna `{ url }`.
3. Frontend redireciona para Stripe Checkout.
4. Após pagamento, Stripe dispara webhook → `stripe-webhook` processa evento e faz upsert na tabela `subscriptions`.
5. User retorna à URL de sucesso (`/admin?checkout=success`).
6. Frontend detecta `?checkout=success` e segue o fluxo de pós-checkout da tela que iniciou a assinatura.

### Edge function `stripe-checkout`
- URLs de retorno padrão: `success_url` → `/admin?checkout=success`, `cancel_url` → `/admin?checkout=canceled`.
- Cria ou reutiliza Stripe Customer existente (busca na tabela `subscriptions`).

### Webhook (`stripe-webhook`)
Eventos tratados:
- `checkout.session.completed` — upsert subscription
- `invoice.paid` — atualiza status
- `invoice.payment_failed` — marca como `past_due`
- `customer.subscription.updated` — sincroniza mudanças
- `customer.subscription.deleted` — marca como `canceled`

Verificação de assinatura via `STRIPE_WEBHOOK_SIGNING_SECRET`.

### Hook `useSubscription`
- Mapeia `stripe_price_id` → nome do plano (`"Free"`, `"Pro"`).
- Expõe: `subscription`, `isActive`, `isPastDue`, `isCanceled`, `willCancel`, `plan`, `refetch`.
- Usa React Query com `staleTime: 30s`.

### Secrets
| Secret                          | Uso                                     |
| ------------------------------- | --------------------------------------- |
| `STRIPE_SECRET_KEY`             | Autenticação com API Stripe (server)    |
| `STRIPE_WEBHOOK_SIGNING_SECRET` | Verificação de webhooks                 |
| `VITE_STRIPE_FREE_PRICE_ID`    | Price ID do plano Free (frontend)       |
| `VITE_STRIPE_PRO_PRICE_ID`     | Price ID do plano Pro (frontend)        |
---
## 15. Commerce — Produtos, Checkouts & Pedidos

### Pipeline
```
Produto → Preço → Checkout → Pedido
```

### Tabela `products`
| Campo          | Tipo           | Descrição                                  |
| -------------- | -------------- | ------------------------------------------ |
| `tenant_id`    | UUID (FK)      | Tenant dono                                |
| `name`         | TEXT           | Nome do produto                            |
| `description`  | TEXT           | Descrição                                  |
| `cover_url`    | TEXT           | Capa do produto                            |
| `status`       | ENUM           | `draft`, `active`, `archived` (default: `draft`) |
| `unit_amount`  | INTEGER        | Preço em centavos                          |
| `currency`     | TEXT           | Moeda (default: `BRL`)                     |
| `benefit`      | ENUM           | `files`, `showcase`, `null` — tipo de entrega (imutável após criação) |
| `test_mode`    | BOOLEAN        | Modo teste                                 |

**Tabelas junction**:
- `product_assets(product_id, asset_id, sort_order)` — arquivos entregues (máx 10)
- `product_showcases(product_id, showcase_id)` — vitrine de acesso (máx 1)

Ao criar um produto, é auto-criado um registro em `prices` com `unit_amount: 0` (v1 — apenas free).

### Tabela `prices`
| Campo                       | Tipo    | Descrição                              |
| --------------------------- | ------- | -------------------------------------- |
| `product_id`                | UUID    | FK para products                       |
| `category`                  | ENUM    | `one_time`, `subscription`, `lead_magnet` |
| `unit_amount`               | INTEGER | Preço em centavos                      |
| `currency`                  | TEXT    | Moeda                                  |
| `renewal_interval_unit`     | TEXT    | Unidade de recorrência (mês, ano)      |
| `renewal_interval_quantity` | INTEGER | Quantidade de intervalos               |

### Tabela `checkouts`
| Campo                     | Tipo      | Descrição                                  |
| ------------------------- | --------- | ------------------------------------------ |
| `tenant_id`               | UUID      | Tenant dono                                |
| `product_id`              | UUID      | FK para products                           |
| `price_id`                | UUID      | FK para prices                             |
| `smart_id`                | TEXT      | Auto-gerado por trigger DB (global, não por tenant) |
| `title`, `description`    | TEXT      | Texto do checkout                          |
| `cover_url`               | TEXT      | Capa do checkout                           |
| `status`                  | ENUM      | `draft`, `active`, `inactive`              |
| `collect_phone`           | BOOLEAN   | Coletar telefone                           |
| `collect_address`         | BOOLEAN   | Coletar endereço                           |
| `collect_fiscal_id`       | BOOLEAN   | Coletar CPF/CNPJ                           |
| `allow_discount_codes`    | BOOLEAN   | Permitir cupons (v1: UI only)              |
| `expires_at`              | TIMESTAMP | Data de expiração                          |
| `success_url`             | TEXT      | URL de redirecionamento pós-compra         |
| `confirmation_message`    | TEXT      | Mensagem de confirmação                    |
| `total_orders`            | INTEGER   | Contador de pedidos (via RPC)              |
| Design: `checkout_use_brand_colors`, `checkout_bg_color`, `checkout_button_color`, `checkout_button_style`, `checkout_font_family` |

### Tabela `orders`
| Campo               | Tipo      | Descrição                              |
| ------------------- | --------- | -------------------------------------- |
| `tenant_id`         | UUID      | Tenant                                 |
| `customer_id`       | UUID      | FK para customers                      |
| `product_id`        | UUID      | FK para products                       |
| `checkout_id`       | UUID      | FK para checkouts                      |
| `price_id`          | UUID      | FK para prices                         |
| `order_number`      | INTEGER   | Número sequencial                      |
| `type`              | ENUM      | `one_time`, `subscription`             |
| `status`            | ENUM      | `pending`, `completed`, `refunded`, `cancelled` |
| `subscription_status` | ENUM    | `trialing`, `active`, `past_due`, `paused`, `cancelled`, `expired`, `null` |
| `unit_amount`       | INTEGER   | Valor em centavos                      |
| `currency`          | TEXT      | Moeda                                  |
| `idempotency_key`   | TEXT      | Previne pedidos duplicados             |

**Orders são read-only no frontend** — criados exclusivamente pela edge function `process-checkout`.

### Edge function `process-checkout`
Endpoint público (sem auth), rate-limited por IP (5 req/min).
1. Verifica idempotency key → retorna cache se já existe
2. Valida checkout (status `active`, produto `active`, `unit_amount: 0`)
3. Find-or-create auth user + registro em `customers`
4. Cria order + incrementa `total_orders` + incrementa `total_revenue_cents`
5. Se benefit = `showcase`: upsert em `showcase_customers`
6. Dispara `customer-auth-start` (fire-and-forget) — envia magic link de acesso ao portal

### RPCs
- `get_public_checkout(p_checkout_smart_id)` — retorna dados públicos do checkout (sem auth, para renderizar a página)
- `increment_checkout_orders(p_checkout_id)` — incrementa contador atômico
- `increment_customer_revenue(p_customer_id, p_amount, p_currency)` — incrementa receita do cliente

### Hooks
- `useProducts()` — CRUD de produtos + gerenciamento de assets e showcases vinculados
- `useCheckouts()` — CRUD de checkouts
- `useOrders()` — Listagem read-only com join de customer + product
- `useOrderDetail(orderId)` — Detalhe de pedido individual

### Utilitários (`src/lib/checkout-utils.ts`)
- `formatCurrency(cents, currency)` — formatação pt-BR
- `contrastColor(hex)` — retorna `#000` ou `#FFF` baseado em luminância
- `getPriceLabel(params)` — string unificada de preço (free, assinatura, avulso)
- `buttonRadius(style)` / `buttonRadiusClass(style)` — mapeia estilo de botão para CSS
---
## 16. Checkout Público

### Rota: `/checkout/:checkoutSmartId`
Página de checkout acessível sem autenticação, com branding do tenant.

### Otimizações de bundle
- **Sem Supabase SDK** — usa `fetch()` direto (economia de ~46KB gzip)
- **Sem lucide-react** — SVGs inline (economia de ~13KB gzip)
- **Sem sonner** — toast via DOM (economia de ~4KB gzip)

### Dados via RPC
Chama `get_public_checkout` (sem auth) que retorna:
- Dados do checkout (título, descrição, campos opcionais, design)
- Dados do produto (nome, capa, status)
- Branding do tenant (nome, slug, ícone, cor, tema)
- Dados de preço (valor, moeda, categoria, intervalo)

### Funcionalidades
- **Idempotência**: gera UUID no mount, enviado no submit para prevenir pedidos duplicados
- **Campos condicionais**: telefone, endereço, CPF/CNPJ renderizados apenas se habilitados no checkout
- **Branding dinâmico**: favicon muda para ícone do tenant; Google Font carregada se necessário
- **Produto arquivado**: botão desabilitado com "Produto indisponível"
- **Tela de sucesso**: mostra mensagem de confirmação + link para portal do cliente (`/:slug`)
---
## 17. Acesso ao Portal (Magic Link)

### Fluxo
```
Pedido criado → customer-auth-start → Resend API → Email com magic link
                                                     ↓
                                              Cliente acessa portal → produtos liberados
```

### Edge function `customer-auth-start`
- **Dois modos**: AUTO (chamada interna via service_role) e MANUAL (login pelo portal público)
- Modo AUTO: recebe `customer_id` + `tenant_id`, busca customer e tenant, gera magic link, envia email
- Modo MANUAL: recebe `tenant_slug` + `email`, rate-limited (1/min por email, 5/5min por IP), find-or-create auth user
- URL do magic link via `resolvePublicSiteUrl()` (centralizada em `_shared/site-url.ts`)
- Remetente: `${email_sender_name || tenant.name} <noreply@notifications.hubfy.io>`
- Toggle `enable_sale_emails` em `tenant_settings` controla disparo automático pós-venda

### Secrets
| Secret                        | Uso                                     |
| ----------------------------- | --------------------------------------- |
| `RESEND_API_KEY`              | Autenticação com API Resend             |
---
## 18. Design & Marca do Tenant

### Rota: `/admin/design` (fullscreen, sem sidebar)
Editor visual com preview ao vivo em desktop/mobile.

### Tabs
| Tab      | Status        | Descrição                                |
| -------- | ------------- | ---------------------------------------- |
| Geral    | ✅ Implementada | Ícone, cor primária, tema (dark/light) |
| Checkout | ✅ Implementada | Cores, estilo de botão, fonte            |
| Portal   | 🔜 Em breve   | Placeholder                              |
| Email    | 🔜 Em breve   | Placeholder                              |

### Tab Geral — Campos persistidos em `tenant_settings`
- `icon_url` — Ícone quadrado (mín 128×128, máx 512KB). Quando presente, o grid de ícones fica muted (opacity)
- `icon_name` — Nome do ícone Lucide (fallback quando `icon_url` é nulo). Default: `Rocket`
- `icon_color` — Cor do ícone/avatar (uma das 29 cores da paleta). Sincronizado com `primary_color`
- `primary_color` — Cor primária (hex) — sempre igual a `icon_color`
- `theme_mode` — `light` ou `dark`

### Tab Checkout — Campos persistidos em `tenants`
- `checkout_use_brand_colors` — Quando ON, checkout herda cor primária + fundo do tema automaticamente
- `checkout_bg_color` — Cor de fundo (hex, só quando use_brand_colors = OFF)
- `checkout_button_color` — Cor do botão CTA (hex, só quando use_brand_colors = OFF)
- `checkout_button_style` — `rectangular`, `rounded` ou `pill`
- `checkout_font_family` — Fonte (v1: travado em `Inter`)

### Preview
- `BrowserChrome` wrapper simulando navegador
- Toggle desktop (820px) / mobile (320px)
- Preview aplica todas as configurações em tempo real
---
## 19. Internacionalização (i18n)

### Setup
- **Biblioteca**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Idiomas**: `pt-BR` (default/fallback), `en`
- **Chave localStorage**: `hubfy.language`
- **Detecção**: localStorage → navegador (browser)
- **Arquivos**: `src/i18n/locales/pt-BR.json`, `src/i18n/locales/en.json`

### Uso
```tsx
const { t } = useTranslation();
// Simples
t("common.save")
// Interpolação
t("courseStructure.moduleCount", { count: 3 })
```

### Seções de tradução (~1.150 chaves por idioma)
`common`, `auth`, `nav`, `sidebar`, `dashboard`, `courses`, `courseStructure`, `customers`, `assets`, `showcases`, `products`, `checkouts`, `orders`, `designPage`, `settings`, `onboarding`, `subscription`, `tenant`

### Regra para novos fluxos
Sempre usar `useTranslation()` e adicionar chaves em **ambos** os arquivos JSON simultaneamente.
---
## 20. Theme (Dark/Light)

### ThemeContext (`src/contexts/ThemeContext.tsx`)
- Gerencia tema `dark | light` com localStorage key `hubfy.theme` (default: `light`)
- `setTheme(next)` — atualização otimista local + persist async em `profiles.preferences.theme` no Supabase
- `hydrateUserTheme(userId)` — ao login, lê tema do Supabase e aplica (com version guard contra races)
- `hydratePublicTheme()` — ao logout, reseta para `light`
- Inline script em `index.html` aplica tema antes do React hidratar (evita flash de tema errado)
- Toggle de classe `dark` no `<html>`
