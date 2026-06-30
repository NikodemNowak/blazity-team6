# Stack

The active application is scaffolded in `repolens/`.

## Decided

- **Language:** TypeScript.
- **Framework:** Next.js 16 (App Router) + React 19 in `repolens/`.
- **AI provider:** Claude (Anthropic) via `@anthropic-ai/sdk`, server-side only.
  Model choice by task: **Sonnet 4.6** for interactive chat, **Opus 4.8** for the
  heavier drift/docs reasoning (its 1M context fits whole small/medium repos), and a
  possible **Haiku 4.5** relevance pre-pass as a stretch.
- **External API:** GitHub REST API for repo ingestion (git trees + blobs). Local
  development can use `local:<fixture>` from `test_repos/`.
- **GitHub auth:** GitHub App installation token flow is available when configured;
  `GITHUB_TOKEN` PAT remains a fallback.
- **Secrets (env, never `NEXT_PUBLIC_*`, never committed):** `ANTHROPIC_API_KEY` and
  `GITHUB_TOKEN` (a fine-grained PAT, Contents: Read-only, scoped to the demo repo).
- **State:** server-side in-memory `Map` keyed by `repoId`. No database, no persistence.
- **Markdown rendering:** `react-markdown` + `remark-gfm`.
- **Version control:** Git.
- **AI workspace:** Atlas (`@blazity-atlas/core`); run `npx --yes @blazity-atlas/core@latest doctor`.

## Commands

Run from `repolens/`:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm start`

`npm run lint` currently invokes deprecated `next lint` and fails under Next 16;
do not treat it as a working verifier until the script is replaced.

## Unknowns

- Hosting/deploy target is not fully confirmed in code.
- No dedicated test runner is configured for RepoLens yet.

## RepoLens app (`repolens/`)

`repolens/` is the single active app and frontend product target, with its own
package and tests.
