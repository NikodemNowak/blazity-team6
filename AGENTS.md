# Project AI Instructions

## What this repo is

`blazity-hackaton` — **RepoLens**, a Blazity "AI for Content" hackathon
web app. The active product is `repolens/`: paste a GitHub repo URL or a local
`test_repos` fixture, ingest the repo, chat with it, and generate documentation
from code. The content is a codebase and its docs. Stack: **Next.js + TypeScript**
powered by **Claude (Anthropic)** API routes. Concept/build plan:
`docs/CONCEPT.md`; stable context in `.ai/memory/`.

## Structure

- `.ai/` — Atlas AI workspace. `.ai/config.json` is the source of truth for
  artifact locations (memory, vocabulary, plans, research, decisions, results).
- `repolens/` — the single active app and demo target. Next.js 16 + React 19 +
  TypeScript, plain CSS themes, repo chat, repo ingest, citation snippets, settings,
  and docs generation via `/api/generate-docs`, plus drift checking via `/api/drift`.
  All frontend work targets `repolens/`.
- `test_repos/` — local cloned demo repositories for verification. Ignored by git.
- `docs/` — concept and build-plan notes (`docs/CONCEPT.md`).
- `AGENTS.md` / `CLAUDE.md` — agent instructions; `CLAUDE.md` imports this file.
- `.agents/`, `.claude/`, `.cursor/` — generated agent surfaces.

## Working rules

- Run RepoLens from `repolens/`: `npm install`, `npm run dev`, `npm run build`,
  `npm start`. `npm run lint` currently uses deprecated `next lint` and is not a
  reliable verification command until the script is updated.
- When building with Claude, default to the latest models via the `@anthropic-ai/sdk`:
  Sonnet 4.6 for interactive chat, Opus 4.8 for drift/docs reasoning, Haiku 4.5 for a
  stretch relevance pre-pass.
- **All Claude and GitHub calls are server-side.** `ANTHROPIC_API_KEY` and
  `GITHUB_TOKEN` live in env (never `NEXT_PUBLIC_*`, never committed). GitHub App
  installation tokens are minted server-side when configured. The browser calls our
  API routes, which call the providers. No DB — repo bundles live in a server-side
  in-memory `Map` keyed by `repoId`.
- Atlas health from repo root: `npx --yes @blazity-atlas/core@latest doctor`.
- Do not edit the `<!-- BEGIN/END ATLAS -->` managed block below by hand.
- Keep durable docs depersonalized (see Atlas Documentation Rules below).

## RepoLens frontend (`repolens/`)

RepoLens is now the working product surface. It has live repo routes under
`repolens/app/api`: `/api/ingest`, `/api/chat`, `/api/snippet`, and
`/api/generate-docs`, `/api/drift`, and GitHub App connect/status routes.
Analyze/Review/Documents still use the typed mock layer in `repolens/lib/api.ts`.
Styling uses 12 `[data-theme]` palettes in
`repolens/app/globals.css` and 2 layout variants (top-nav / split workspace).

Bartek-owned work should be treated as: RepoLens UI shell, Settings/theme/layout
controls, mobile responsiveness, citation/snippet presentation, and the Docs
generation surface. Docs generation selects documentation conventions by detected
language (`pydoc` for Python, TypeDoc/JSDoc for TS/JS, godoc, rustdoc, Javadoc,
etc.) before asking Claude.

<!-- BEGIN ATLAS: artifact-paths -->
## Atlas Artifact Paths

`.ai/config.json` is the source of truth for AI artifact locations in this repository.
Before writing plans, research, decisions, ADRs, results, memory, vocabulary, or skill outputs, resolve the destination through `artifactRoot`, `paths`, and `pathAliases`.
If an imported skill, template, or instruction mentions a different path, map it through `.ai/config.json` before reading or writing files.
Do not create new documentation roots unless `.ai/config.json` explicitly allows them.

## Atlas Documentation Rules

Durable documentation records needs, decisions, and reasons — never individuals or internal process.
Write "memory was needed to persist context across runs", not "<name> wanted memory".
Keep personal names, private schedules, internal-only references, and absolute local paths out of workspace artifacts.
<!-- END ATLAS: artifact-paths -->
