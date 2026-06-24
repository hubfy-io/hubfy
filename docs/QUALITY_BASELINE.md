# Quality Baseline

Hubfy's first public open-source release has a working production build and passing unit tests, but the stricter lint and typecheck baselines still need cleanup.

## Passing Checks

Last verified locally:

```bash
npm run test
npm run build
```

Results:

- 92 unit tests passed
- Vite production build completed successfully

## Known Findings

The following checks currently report existing findings:

```bash
npm run lint
npm run typecheck
```

Current categories:

- explicit `any` cleanup in seller, API, and edge-function code
- Supabase generated type drift around RPCs and selected rows
- React hook dependency warnings
- Fast Refresh warnings from shared exports in component files
- a few component prop union mismatches

## Maintainer Policy

- New pull requests should not add new lint or typecheck findings.
- Security-sensitive changes should include tests even if they do not fully clear the baseline.
- Type and lint cleanup should be merged in focused pull requests by area.
- CI currently gates on unit tests and production build while the baseline is being paid down.

## Cleanup Order

1. Regenerate Supabase types after confirming the target project schema.
2. Fix seller onboarding and superadmin RPC type mismatches.
3. Replace broad `any` usage in shared edge-function utilities.
4. Move shared constants out of component files that trigger Fast Refresh warnings.
5. Tighten React hook dependencies where behavior is stable.
