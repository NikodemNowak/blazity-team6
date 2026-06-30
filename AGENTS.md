# Project AI Instructions

## What this repo is

`blazity-hackaton` — a Blazity hackathon project on the theme **"AI for Content"**:
a web app that uses AI to solve a real content-management pain (e.g. reformatting,
brand/tone consistency, asset hunting). The stack is **Next.js + TypeScript**,
powered by the **Claude (Anthropic)** API. No application code has landed yet, and
the concrete product use case is still open. See `.ai/memory/` for stable context.

## Structure

- `.ai/` — Atlas AI workspace. `.ai/config.json` is the source of truth for
  artifact locations (memory, vocabulary, plans, research, decisions, results).
- `AGENTS.md` / `CLAUDE.md` — agent instructions; `CLAUDE.md` imports this file.
- `.agents/`, `.claude/`, `.cursor/` — generated agent surfaces.

## Working rules

- Stack is decided (Next.js + TypeScript, Claude API) but **not yet scaffolded** —
  no `package.json` or lockfile exists. Confirm exact run/test/build commands once
  `create-next-app` (or equivalent) has run; update `.ai/memory/stack.md` then.
- When building with Claude, default to the latest models (Opus 4.8, Sonnet 4.6,
  Haiku 4.5) via the `@anthropic-ai/sdk`. Keep API keys in env, never commit them.
- The only project-specific safe command today is Atlas tooling:
  `npx --yes @blazity-atlas/core@latest doctor` checks workspace health.
- Do not edit the `<!-- BEGIN/END ATLAS -->` managed block below by hand.
- Keep durable docs depersonalized (see Atlas Documentation Rules below).

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
