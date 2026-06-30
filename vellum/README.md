# Vellum

An LLM-assisted **documentation workspace** for code repositories. Vellum ingests
a GitHub repo (or a local `test_repos` fixture in development), lets you chat with
the code using citations, and generates onboarding/architecture documentation from
the loaded bundle. Drift checks compare documentation claims against code. Analyze,
Review, and Documents remain mock-backed UI surfaces.

This is the active app and demo target. `repolens/` is an earlier scaffold/test
implementation.

## Run

```bash
cd vellum
npm install
npm run dev      # → http://localhost:3000
```

Production: `npm run build && npm start`.

Required for live model calls:

```bash
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=github_pat_... # recommended for GitHub rate limits/private repos
```

GitHub App configuration can also provide per-installation tokens server-side.
Without GitHub auth, public ingest may fail with GitHub 403 rate-limit responses.
For local demos, clone examples into `../test_repos` and use inputs such as
`local:python-flask-hello-world`.

## What it shows

- **Chat** — load a repo and stream Markdown answers with cited code snippets.
- **Generate** — load a repo and draft onboarding/architecture docs → Markdown +
  model notes. Language profiles select conventions such as Python `pydoc`,
  TypeScript TypeDoc/JSDoc, Go `godoc`, Rust `rustdoc`, and Java Javadoc.
- **Drift** — load a repo and compare docs/README claims against code evidence.
- **Analyze** — health score, metrics (readability, coverage, structure…), gaps.
- **Review** — issues by severity & category, each with a suggested fix; severity filter.
- **Settings** — theme and layout controls.
- **Dashboard / Documents** — overview stats and a documents table.

## Styling

- **12 colour themes** — restrained palettes (no gradients, no glow), switchable at
  runtime and persisted to `localStorage`. Defined as `[data-theme]` blocks in
  `app/globals.css`; registry in `lib/themes.ts`.
- **2 layout variants** — **Top nav** and **Split workspace**, toggled at runtime
  (`components/layout-mode.tsx`). Layout and theme are orthogonal.
- Mobile layouts are supported; the split right rail collapses below the main
  workspace on narrower screens.

## Live and mock boundaries

- Live repo-backed routes: `/api/ingest`, `/api/chat`, `/api/snippet`,
  `/api/generate-docs`, `/api/drift`, and GitHub App connect/status endpoints.
- Mock-backed routes/screens: Analyze, Review, Documents, and dashboard activity.
- Repo bundles live in a server-side in-memory `Map`; no database or persistence.

## Local verification repos

The app supports development-only local repo inputs:

```text
local:python-flask-hello-world
local:go-helloworld
local:rust-calculator
```

These resolve to directories under `../test_repos/`. The directory is ignored by
git; clone examples there when validating language detection and generation flow.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Anthropic SDK ·
react-markdown/remark-gfm · plain CSS (no Tailwind).
