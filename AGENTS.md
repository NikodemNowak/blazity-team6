# Project AI Instructions

## What this repo is

`blazity-hackaton` — **RepoLens**, a Blazity "AI for Content" hackathon web app.
Paste a GitHub repo URL and it ingests the repo, then lets you **chat with it**
(answers cited to `file:line`), **generate docs** from the code, and **drift-check**
README/docs against the code. The "content" is a codebase and its docs. Stack:
**Next.js + TypeScript** powered by the **Claude (Anthropic)** API. No application
code has landed yet. Concept/build plan: `docs/CONCEPT.md`; stable context in
`.ai/memory/`.

## Structure

- `.ai/` — Atlas AI workspace. `.ai/config.json` is the source of truth for
  artifact locations (memory, vocabulary, plans, research, decisions, results).
- `repolens/` — the RepoLens Next.js app (UI + API routes, `src/lib`, tests).
- `vellum/` — a standalone frontend exploration (mock data, no backend); see
  "Vellum frontend" below and `vellum/README.md`.
- `docs/` — concept and build-plan notes (`docs/CONCEPT.md`).
- `AGENTS.md` / `CLAUDE.md` — agent instructions; `CLAUDE.md` imports this file.
- `.agents/`, `.claude/`, `.cursor/` — generated agent surfaces.

## Working rules

- Stack is decided (Next.js + TypeScript, Claude API) but **not yet scaffolded** —
  no `package.json` or lockfile exists. Confirm exact run/test/build commands once
  `create-next-app` (or equivalent) has run; update `.ai/memory/stack.md` then.
- When building with Claude, default to the latest models via the `@anthropic-ai/sdk`:
  Sonnet 4.6 for interactive chat, Opus 4.8 for drift/docs reasoning, Haiku 4.5 for a
  stretch relevance pre-pass.
- **All Claude and GitHub calls are server-side.** `ANTHROPIC_API_KEY` and
  `GITHUB_TOKEN` live in env (never `NEXT_PUBLIC_*`, never committed); the browser
  calls our API routes, which call the providers. No DB — repo bundles live in a
  server-side in-memory `Map` keyed by `repoId`.
- The only project-specific safe command today is Atlas tooling:
  `npx --yes @blazity-atlas/core@latest doctor` checks workspace health.
- Do not edit the `<!-- BEGIN/END ATLAS -->` managed block below by hand.
- Keep durable docs depersonalized (see Atlas Documentation Rules below).

## Vellum frontend (`vellum/`)

A separate UI exploration of the same "AI for content / documentation" theme,
kept apart from the canonical RepoLens app. It is a self-contained **Next.js 16 +
React 19 + TypeScript** app with **plain-CSS theming** (no Tailwind) and a **typed
mock API** (`vellum/lib/api.ts`) — no real model calls. It offers Generate /
Analyze / Review screens, **12 colour themes** (`[data-theme]` blocks) and **2
layout variants** (top-nav / split workspace) toggled at runtime. Run it from the
`vellum/` directory (`npm install && npm run dev`); it shares nothing with
`repolens/` at the code level. Treat its mock layer as the contract a real
backend (e.g. RepoLens routes) could later satisfy.

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
