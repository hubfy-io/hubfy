# Maintainer Workflows

This document describes how Hubfy maintainers review, triage, release, and secure the project.

## Review Priorities

1. Tenant isolation and Supabase RLS safety
2. Authentication and customer access correctness
3. Checkout, order, and gateway data integrity
4. Private file and video access controls
5. Frontend regressions in creator and customer workflows
6. Documentation and migration accuracy

## Pull Request Review

For every meaningful pull request, maintainers check:

- whether the change matches `ARCHITECTURE.md`
- whether migrations are reversible or clearly forward-only
- whether edge functions validate inputs and avoid leaking secrets
- whether frontend changes reuse `src/components/ui/`
- whether tests cover the changed behavior
- whether customer-visible text is in Brazilian Portuguese

Codex can help summarize diffs, identify risky files, draft review comments, and propose tests before a maintainer makes the final decision.

## Issue Triage

Issues should be labeled by area:

- `area:frontend`
- `area:supabase`
- `area:edge-functions`
- `area:security`
- `area:docs`
- `area:integrations`

Priority labels:

- `priority:critical`
- `priority:high`
- `priority:normal`
- `priority:low`

Codex can help cluster duplicate reports, turn bug reports into reproduction steps, and suggest likely code owners.

## Release Checklist

Before a production release:

```bash
npm run test
npm run build
```

Then verify:

- migrations are in `supabase/migrations/`
- edge functions that changed are deployed intentionally
- release notes mention user-visible changes
- secrets are configured outside the repository
- Cloudflare Pages build is green after merge to `main`
- lint and typecheck baseline did not get worse

## Security Maintenance

High-risk changes require extra review when they touch:

- `supabase/migrations/`
- `supabase/functions/`
- auth flows
- signed URLs
- payment gateway integrations
- video playback protection
- team membership and ownership logic

Codex Security access would be used for deeper review of these areas, especially RLS policies, edge functions, and access-control regressions.

## API Credit Use

OpenAI API credits would support maintenance work, not product resale:

- automated pull request summaries and risk maps
- issue triage and duplicate detection
- release note drafts from merged PRs
- migration and RLS review assistance
- security-focused code review of edge functions
- test generation for access-control paths

Maintainers remain responsible for final review, merge, release, and security decisions.
