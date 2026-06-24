# Contributing to Hubfy

Thanks for helping improve Hubfy. The project is an early public open-source release, so clear issues, focused pull requests, and careful review are especially valuable.

## Good First Contributions

- improve documentation in `README.md`, `ARCHITECTURE.md`, or `docs/`
- add tests around hooks, lesson flows, customer access, and Supabase edge cases
- improve accessibility and responsive behavior in existing components
- harden Supabase RLS policies and edge function validation
- reduce duplication while keeping the existing Shadcn/UI design system

## Development Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs at:

```text
http://localhost:8080
```

## Pull Request Checklist

Before opening a pull request, run the required checks:

```bash
npm run test
npm run build
```

For type and lint hardening work, also run:

```bash
npm run lint
npm run typecheck
```

The first public release has known lint and typecheck baseline findings. Please do not introduce new ones. See [docs/QUALITY_BASELINE.md](docs/QUALITY_BASELINE.md).

For database changes:

- add a timestamped migration in `supabase/migrations/`
- keep RLS policies explicit
- document important behavior in `ARCHITECTURE.md`

For edge functions:

- place code in `supabase/functions/`
- validate inputs with clear errors
- do not log secrets or sensitive customer data
- prefer batch operations over N+1 queries

For frontend work:

- use existing components from `src/components/ui/`
- keep UI text in Brazilian Portuguese where the app is user-facing
- follow the design tokens and text classes in `src/index.css`
- do not introduce duplicate UI primitives

## Commit Style

Use short, descriptive messages. Conventional commit prefixes are welcome:

```text
feat: add customer import validation
fix: prevent duplicate lesson assets
docs: document Gumlet webhook setup
```

## Security

Please do not open public issues for vulnerabilities. Follow [SECURITY.md](SECURITY.md).
