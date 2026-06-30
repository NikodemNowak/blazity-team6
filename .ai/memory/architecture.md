# Architecture

RepoLens is the active Next.js app (UI + server-side API routes). The defining
constraint: **all Claude, GitHub, and local test-repo access is server-side** so
neither the Anthropic key nor the GitHub token reaches the client.

## Data flow

```
GitHub URL or local:<fixture> → /api/ingest
           → fetch tree + files (GitHub API or ../test_repos), filter + budget
           → in-memory bundle keyed by repoId
           → /api/chat | /api/generate-docs | /api/drift
```

## Core building blocks (built first)

- **`POST /api/ingest`** `{ repoUrl }` → fetches the recursive git tree + blob
  contents via the GitHub API, filters out noise (node_modules, lockfiles, binaries,
  oversized files), enforces a token budget, stores the result in a **server-side
  in-memory `Map`** keyed by `repoId`. Returns `{ repoId, fileTree, stats }`. No DB.
- In development, `repoUrl: "local:<name>"` reads a fixture from `../test_repos/<name>`
  without leaving that directory. This supports demos when GitHub auth/rate limits
  are unavailable.
- **`getBundle(repoId)`** — shared server helper returning
  `{ tree, files: [{ path, content }], totalTokens }`.
- **`askLLM(...)` / `streamLLM(...)`** — server-side wrappers over
  `@anthropic-ai/sdk`; streaming chat separates summarized thinking from answer text.

## Feature contract (lets work proceed in parallel)

Each feature is its own API route + its own UI tab, all consuming `getBundle(repoId)`:

- **`POST /api/chat`** `{ repoId, question, history }` → NDJSON stream with
  thinking/answer chunks; citations are parsed from `{{cite:PATH|START|END}}`.
- **`POST /api/snippet`** `{ repoId, citation }` → line snippet for citation display.
- **`POST /api/generate-docs`** `{ repoId, docType, audience, tone }` →
  `{ markdown, notes, languageProfiles }`.
- **`POST /api/drift`** `{ repoId }` → docs-vs-code drift findings.

`RepoCitation` renders snippets pulled from the loaded bundle. This is the
"checked, not trusted" hook for chat and drift.

## Key decisions & rationale

- **No vector DB / RAG.** Opus 4.8's 1M-token context fits small/medium repos packed
  directly into context; RAG is a time sink for the build budget.
- **In-memory store, no persistence.** Bundle lives in a process `Map`; lost on
  restart, which is acceptable for the demo.
- **GitHub fetch via tree + blobs** (structured file list for the UI tree), throttled
  ~5–10 parallel; tarball is a fallback if rate limits bite. Avoid `/contents/{path}`
  (N+1, 1MB cap).

## UI shape

RepoLens uses routed screens: Dashboard, Chat, Generate, Analyze, Review, Documents,
and Settings. Chat and Generate have repo loaders. Settings owns theme/layout
controls. The app has top-nav and split layout modes, with mobile wrapping and
right-rail collapse.

## Unknowns (confirm as code lands)

- Analyze/Review/Documents are still mock-backed.
- Relevance pre-pass (Haiku 4.5) for large repos remains stretch.
