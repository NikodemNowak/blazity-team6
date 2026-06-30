# Stack

Decided at setup; the application is **not yet scaffolded** (no `package.json`,
lockfile, or framework config in the repo yet).

## Decided

- **Language:** TypeScript.
- **Framework:** Next.js (React, full-stack web app).
- **AI provider:** Claude (Anthropic) — use the `@anthropic-ai/sdk`, default to the
  latest models (Opus 4.8, Sonnet 4.6, Haiku 4.5). API keys live in env vars.
- **Version control:** Git.
- **AI workspace:** Atlas (`@blazity-atlas/core`); run `npx --yes @blazity-atlas/core@latest doctor`.

## To confirm once scaffolded

- Exact run/test/build commands (expected to be the standard `next dev` / `next build`
  / `next start` plus a lint and test runner, but confirm against `package.json`).
- Package manager (npm / pnpm / yarn / bun) — decided by the lockfile that lands.
- Test framework and any CI.

## Unknowns

- Hosting/deploy target (e.g. Vercel) — not yet chosen.
- Any database, storage, or third-party content APIs the product needs.
