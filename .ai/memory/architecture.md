# Architecture

No application architecture exists yet. The repository contains project metadata
(README, LICENSE) and the Atlas AI workspace under `.ai/`. The chosen stack
(Next.js + TypeScript, Claude API) implies a shape but no code has landed.

## Current layout

- `.ai/` — Atlas AI workspace (config, memory, vocabulary, plans, research,
  decisions, results, skills). `.ai/config.json` is the source of truth for
  artifact locations.
- `AGENTS.md` / `CLAUDE.md` — agent instructions. `CLAUDE.md` imports `AGENTS.md`.
- `.agents/`, `.claude/`, `.cursor/` — generated agent surfaces.

## Expected shape once scaffolded (not yet built — do not assume)

- A Next.js app (App Router likely) holding both UI and server-side API routes.
- Calls to the Claude API made **server-side** so the API key stays off the client.

## Unknowns (fill once code lands)

- App Router vs Pages Router; client/server component boundaries.
- Where AI calls live (route handlers, server actions, edge vs node runtime).
- Persistence, content storage, and any external content APIs.
- Architectural invariants and constraints.
