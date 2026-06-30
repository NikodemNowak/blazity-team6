# Vellum

An LLM-assisted **documentation workspace** — a frontend exploration on the
"AI for content" theme. Three screens (**Generate**, **Analyze**, **Review**) plus
a dashboard and a documents list, built against a **typed mock API** so the UI can
later bind to a real Claude-backed backend with no changes.

This is a standalone app, separate from the `repolens/` project in this repo.

## Run

```bash
cd vellum
npm install
npm run dev      # → http://localhost:3000
```

Production: `npm run build && npm start`.

## What it shows

- **Generate** — draft documentation from source (code/notes) → Markdown + model notes.
- **Analyze** — health score, metrics (readability, coverage, structure…), gaps.
- **Review** — issues by severity & category, each with a suggested fix; severity filter.
- **Dashboard / Documents** — overview stats and a documents table.

## Styling

- **12 colour themes** — restrained palettes (no gradients, no glow), switchable at
  runtime and persisted to `localStorage`. Defined as `[data-theme]` blocks in
  `app/globals.css`; registry in `lib/themes.ts`.
- **2 layout variants** — **Top nav** and **Split workspace**, toggled at runtime
  (`components/layout-mode.tsx`). Layout and theme are orthogonal.

## Mock → real

All data flows through `lib/api.ts` (typed by `lib/types.ts`, backed by
`lib/mock-data.ts`). Each function is async with simulated latency and maps 1:1 to a
future endpoint — replace the body with a `fetch("/api/…")` call to go live.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · plain CSS (no Tailwind).
