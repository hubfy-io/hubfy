# Security Policy

Hubfy handles authentication, customer records, digital product access, payment-related workflows, file delivery, and protected video playback. Security reports are taken seriously.

## Supported Versions

The `main` branch is the active development branch.

## Reporting a Vulnerability

Please do not create a public GitHub issue for a vulnerability.

Report privately by emailing:

```text
security@hubfy.io
```

Include:

- affected route, function, or table
- reproduction steps
- expected impact
- whether customer data, tenant isolation, file access, payment flows, or video access are involved
- any suggested fix, if known

We aim to acknowledge reports within 72 hours.

## Secrets and Credentials

Never commit:

- Supabase service role keys
- payment provider secrets
- webhook signing secrets
- Gumlet API keys
- OpenAI or AI provider API keys
- customer exports or production database dumps

Supabase publishable/anon keys can appear in frontend builds, but all private data access must be protected by Row Level Security and server-side validation.

## High-Impact Areas

Security-sensitive areas include:

- Supabase RLS policies and migrations
- `supabase/functions/` edge functions
- customer authentication and invite flows
- signed URLs for private assets
- Gumlet protected playback and webhooks
- checkout, order, and gateway sync flows
- team access and workspace ownership

## Responsible Testing

Only test systems, tenants, repositories, and accounts you own or are authorized to test. Do not run destructive tests against production data.
