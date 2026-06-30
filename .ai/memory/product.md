# Product

**Vellum / RepoLens** — a Blazity "AI for Content" hackathon web app. The active
product surface is `vellum/`; the "content" is a codebase and its docs. Full
concept and build plan: `docs/CONCEPT.md`.

## The pain

Understanding an unfamiliar codebase takes hours, and READMEs/docs drift out of
sync with the code they describe — so they mislead the reader.

## What it does

Paste a **GitHub repo URL** or development-only `local:<fixture>`; Vellum ingests
the repo (file tree + contents) and offers repo-backed features over the same
in-memory bundle:

- **Chat with the repo** — implemented in Vellum; ask questions, get Markdown
  answers with citations and rendered snippets.
- **Generate docs** — implemented in Vellum; onboarding/architecture overview
  written from the actual code using language-specific documentation profiles.
- **Drift check** — implemented in Vellum; compares README/docs against the code,
  flags stale claims and cites the contradicting code.

## Why AI earns its place

"What does this project do" and "do the docs match the code" need understanding,
not rules. **"Checked, not trusted" is the core principle:** every answer and every
flag points at a concrete `file:line` whose snippet is rendered next to it, so a
human verifies the evidence rather than trusting the model blindly.

## Demo / success criteria

Load a real repo live, ask a cited question, and generate docs from the same bundle.
If GitHub auth is unavailable, use local `test_repos` fixtures to demonstrate
ingest and language-profile selection. Run Drift to show docs-vs-code checks.

## Explicitly NOT building (YAGNI)

Vector DB / embeddings, user accounts, persistence across restarts, multi-repo
history, writing generated docs back to GitHub, syntax-perfect diffing.

## Implementation note

`vellum/` is the active demo target. `repolens/` is an earlier scaffold/test app and
should not receive frontend product work unless explicitly requested.
