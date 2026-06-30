# RepoLens Verification — 2026-06-30

## Scope

Verified Markdown instructions and RepoLens behavior against the current app state.
RepoLens is the active product surface; `repolens/` is an earlier scaffold/test app.

## Local Test Repositories

Cloned locally under `test_repos/` and ignored by git:

- `python-flask-hello-world` from `https://github.com/render-examples/flask-hello-world`
- `go-helloworld` from `https://github.com/go-training/helloworld`
- `rust-calculator` from `https://github.com/stijnh/rust-calculator`

## Verified Behavior

- `repolens/lib/repo/docTooling.ts` detects language documentation profiles:
  - Python → `pydoc + docstrings`
  - Go → `godoc / pkg.go.dev`
  - Rust → `rustdoc`
- Development-only ingest accepts `local:<name>` and reads from `test_repos/<name>`.
- `/api/ingest` successfully loaded all three local fixtures.
- `/api/generate-docs` reaches the generation stage and returns a clear configuration
  error when `ANTHROPIC_API_KEY` is absent, including detected language profiles.
- `npm run build` in `repolens/` passes.
- Remote changes rebased during verification added real Drift and GitHub App
  connect flow; documentation was updated to reflect those as current RepoLens
  behavior.

## Environment Limits

- No local `ANTHROPIC_API_KEY` was present, so live Claude documentation generation
  could not be completed in this environment.
- No local `GITHUB_TOKEN` was present; public GitHub ingest returned 403 from GitHub.
  The local fixture path covers demos when GitHub auth/rate limits are unavailable.
- `npm run lint` in `repolens/` still invokes deprecated `next lint` and is not a valid
  verifier until the script is replaced.
