# Hubfy

Hubfy is an open-source platform for creator-owned learning portals and digital product delivery. It combines course hosting, customer access, checkout flows, media asset management, email workflows, and integrations in a single multi-tenant application.

The project is built for independent educators, creator businesses, and small teams that need transparent infrastructure instead of a closed membership platform.

## Why This Project Matters

Many creators depend on closed platforms for course delivery, checkout, customer access, and media hosting. Hubfy gives maintainers and contributors a public, inspectable implementation of those workflows:

- multi-tenant portals with Supabase Row Level Security
- customer and team access management
- product, checkout, and order flows
- course, module, lesson, file, and video delivery
- Gumlet-backed video processing and protected playback
- gateway and marketing integrations
- public documentation of database migrations and edge functions

Hubfy is currently an early public open-source release. We are documenting the architecture, contribution process, security model, and maintainer workflows so the project can grow with external contributors.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS + Shadcn/UI
- Supabase Postgres, Auth, Storage, RLS, and Edge Functions
- Gumlet for video hosting and processing
- Vitest, ESLint, and TypeScript checks

## Repository Map

```text
src/                    React app, hooks, contexts, pages, UI components
src/components/ui/      Shadcn/UI component layer
supabase/migrations/    Database schema and RLS history
supabase/functions/     Supabase Edge Functions
public/brand/           Hubfy logos, icons, favicons, and brand assets
docs/                   Architecture notes and maintainer documentation
ARCHITECTURE.md         Business rules, flows, roles, integrations, storage
AGENTS.md               Codex working instructions for this repository
```

## Getting Started

Requirements:

- Node.js compatible with `.nvmrc`
- npm
- a Supabase project for local development or staging
- optional Gumlet credentials for video workflows

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the app:

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:8080
```

## Environment Variables

Frontend variables are prefixed with `VITE_`.

Supabase publishable keys are safe to expose in the browser when Row Level Security is correctly enforced. Service role keys, webhook secrets, provider API keys, and payment secrets must never be committed.

See [.env.example](.env.example) for the expected local variables.

## Quality Checks

```bash
npm run test
npm run build
```

The current required CI path runs unit tests and production build. `npm run lint` and `npm run typecheck` are available for hardening work, but the first public release still has known baseline findings. See [docs/QUALITY_BASELINE.md](docs/QUALITY_BASELINE.md).

## Supabase

Database changes belong in:

```text
supabase/migrations/
```

Edge Functions belong in:

```text
supabase/functions/
```

Deployment commands used by maintainers:

```bash
supabase db push
supabase functions deploy <function-name>
```

## Open Source Maintenance

The project has public contribution and security guidance:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [docs/MAINTAINER_WORKFLOWS.md](docs/MAINTAINER_WORKFLOWS.md)
- [docs/QUALITY_BASELINE.md](docs/QUALITY_BASELINE.md)

We use Codex for maintenance-oriented work such as pull request review, issue triage, migration review, security hardening, and release preparation. See [docs/CODEX_FOR_OSS_APPLICATION.md](docs/CODEX_FOR_OSS_APPLICATION.md) for the application notes prepared for the OpenAI Codex for Open Source program.

## License

Hubfy is released under the [MIT License](LICENSE).
