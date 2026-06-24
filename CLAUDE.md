# Preferências do Usuário

## Comunicação
- Falar em português brasileiro
- Explicar de forma simples e direta, sem termos técnicos desnecessários
- O usuário não gosta de mexer no terminal — sempre executar comandos por ele

## Fluxo de trabalho
- Sempre rodar comandos no terminal pelo Claude Code (o usuário prefere não usar terminal)
- Banco de dados: Supabase (com migrations em supabase/migrations/)
- Hospedagem de vídeos: Gumlet

## Deploy
- **Frontend**: push na branch `main` do GitHub → Cloudflare Pages faz build e publica automaticamente.
- **Edge functions Supabase**: `supabase functions deploy <nome>`
- **Migrations Supabase**: `supabase db push`

## Projeto
- **Nome**: Hubfy (hubfy.io)
- Stack: React + Vite + TypeScript + Shadcn/UI + Tailwind CSS
- Banco: Supabase (PostgreSQL)
- Dev server: `npm run dev` (porta 8080)
- Chaves configuradas em `.env.local`
- Arquitetura completa documentada em `ARCHITECTURE.md`

## Referências importantes
- **ARCHITECTURE.md** — Regras de negócio, fluxos, papéis, integrações Gumlet, edge functions, RLS, rotas
- **src/components/ui/** — 53 componentes Shadcn/UI (nunca criar duplicados)
- **src/index.css** — Design system: classes de texto (.text-title, .text-section, .text-body, .text-label, .text-support, .text-meta), cores, animações
- **tailwind.config.ts** — Cores semânticas (primary, destructive, success, warning), fonte Geist, dark-first
- **public/brand/** — Logos e ícones SVG em versões dark/light (logo-hubfy-*.svg, icon-hubfy-*.svg)
- **public/brand/favicon-dark.svg** / **favicon-light.svg** — Favicon do cubo Hubfy (branco para dark, preto para light)

## Regras ao codar
- Sempre ler o código existente antes de modificar
- Usar componentes de `src/components/ui/` — nunca criar componentes UI duplicados
- Seguir o design system existente (classes de texto, cores, espaçamentos)
- Migrations novas vão em `supabase/migrations/` com timestamp
- Edge functions vão em `supabase/functions/`
- Idioma da UI: português brasileiro (pt-BR)
- Preferir simplicidade > over-engineering
- Assets: regra XOR (video OU file, nunca ambos)
- Capas públicas (sem signed URL), conteúdo privado (signed URL 1h)
- Atualizações otimistas no frontend
- Batch operations ao invés de N+1
- Nome do projeto: **Hubfy** (nunca usar Smart Members, members-hub, smartplayer)
- localStorage key do tema: `hubfy.theme`
