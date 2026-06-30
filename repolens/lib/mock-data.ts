// Static mock data used by the mock API layer.
// Replace `lib/api.ts` internals with real calls; this file can then go away.

import type {
  ActivityItem,
  AnalyzeResult,
  DocumentSummary,
  GenerateResult,
  ReviewResult,
} from "./types";

export const documents: DocumentSummary[] = [
  {
    id: "doc-auth",
    title: "Authentication Guide",
    kind: "guide",
    status: "published",
    updatedAt: "2026-06-24",
    owner: "Platform",
    health: 88,
    words: 1840,
  },
  {
    id: "doc-api-billing",
    title: "Billing API Reference",
    kind: "reference",
    status: "review",
    updatedAt: "2026-06-28",
    owner: "Payments",
    health: 71,
    words: 3120,
  },
  {
    id: "doc-quickstart",
    title: "Quickstart Tutorial",
    kind: "tutorial",
    status: "published",
    updatedAt: "2026-06-19",
    owner: "DevRel",
    health: 94,
    words: 980,
  },
  {
    id: "doc-readme",
    title: "Project README",
    kind: "readme",
    status: "stale",
    updatedAt: "2026-04-02",
    owner: "Core",
    health: 52,
    words: 640,
  },
  {
    id: "doc-changelog",
    title: "Changelog 2026.Q2",
    kind: "changelog",
    status: "draft",
    updatedAt: "2026-06-29",
    owner: "Core",
    health: null,
    words: 410,
  },
  {
    id: "doc-webhooks",
    title: "Webhooks Reference",
    kind: "reference",
    status: "published",
    updatedAt: "2026-06-11",
    owner: "Platform",
    health: 79,
    words: 2210,
  },
];

export const activity: ActivityItem[] = [
  {
    id: "act-1",
    kind: "review",
    title: "Billing API Reference",
    at: "2026-06-29T14:20:00Z",
    meta: "4 issues found · 1 high",
  },
  {
    id: "act-2",
    kind: "generate",
    title: "Changelog 2026.Q2",
    at: "2026-06-29T11:05:00Z",
    meta: "Drafted from 18 commits",
  },
  {
    id: "act-3",
    kind: "analyze",
    title: "Project README",
    at: "2026-06-28T16:42:00Z",
    meta: "Health 52 · 3 gaps",
  },
  {
    id: "act-4",
    kind: "review",
    title: "Webhooks Reference",
    at: "2026-06-27T09:15:00Z",
    meta: "Passed · 1 low",
  },
];

export function buildGenerateResult(audience: string): GenerateResult {
  const markdown = `# Payments API

A concise reference for integrating with the Payments API.

## Overview

The Payments API lets you create charges, manage customers, and reconcile
payouts. All requests are authenticated with a bearer token and scoped to a
single workspace.

## Authentication

Send your API key in the \`Authorization\` header:

\`\`\`http
Authorization: Bearer <your-api-key>
\`\`\`

## Create a charge

\`\`\`http
POST /v1/charges
Content-Type: application/json

{
  "amount": 4200,
  "currency": "usd",
  "customer": "cus_12345"
}
\`\`\`

A successful request returns the created charge with a \`status\` of
\`succeeded\` or \`requires_action\`.

## Errors

The API uses conventional HTTP status codes. \`4xx\` codes indicate a problem
with the request; \`5xx\` codes indicate a problem on the server.
`;

  return {
    markdown,
    notes: [
      `Tailored for the "${audience}" audience.`,
      "Inferred endpoint shapes from the provided source; verify field names.",
      "Added an Errors section that was missing from the source.",
    ],
    wordCount: markdown.split(/\s+/).filter(Boolean).length,
  };
}

export const analyzeResult: AnalyzeResult = {
  score: 73,
  readingTimeMinutes: 9,
  wordCount: 1840,
  summary:
    "Solid structure and good coverage of the happy path. Weakest on examples and error handling, and a few terms drift from the project glossary.",
  metrics: [
    { key: "readability", label: "Readability", value: 81, hint: "Grade 9 reading level" },
    { key: "coverage", label: "Coverage", value: 68, hint: "Key topics mostly present" },
    { key: "structure", label: "Structure", value: 90, hint: "Clear heading hierarchy" },
    { key: "consistency", label: "Term consistency", value: 64, hint: "3 terms drift from glossary" },
    { key: "examples", label: "Examples", value: 55, hint: "Few runnable snippets" },
    { key: "freshness", label: "Freshness", value: 70, hint: "Last touched 6 weeks ago" },
  ],
  gaps: ["Error handling", "Rate limits", "Migration notes"],
};

export const reviewResult: ReviewResult = {
  passed: false,
  counts: { high: 1, medium: 2, low: 1, info: 1 },
  issues: [
    {
      id: "iss-1",
      severity: "high",
      category: "accuracy",
      title: "Endpoint path is outdated",
      detail:
        "The doc references `POST /charges`, but the current API uses the versioned `POST /v1/charges`.",
      excerpt: "Send a POST request to /charges to create a charge.",
      suggestion: "Update the path to `/v1/charges` and note the version prefix once near the top.",
      line: 42,
    },
    {
      id: "iss-2",
      severity: "medium",
      category: "consistency",
      title: 'Mixed terms: "API key" vs "token"',
      detail:
        'The document uses "API key" and "access token" interchangeably for the same value.',
      suggestion: 'Standardise on "API key" per the project glossary.',
      line: 18,
    },
    {
      id: "iss-3",
      severity: "medium",
      category: "structure",
      title: "Missing Errors section",
      detail:
        "There is no section describing error responses, which readers need to handle failures.",
      suggestion: "Add an Errors section covering common 4xx/5xx responses.",
    },
    {
      id: "iss-4",
      severity: "low",
      category: "links",
      title: "Broken link to rate-limit guide",
      detail: "The link to `/docs/rate-limits` returns 404.",
      excerpt: "See the [rate limits guide](/docs/rate-limits).",
      suggestion: "Point the link to `/docs/platform/rate-limits` or remove it.",
      line: 96,
    },
    {
      id: "iss-5",
      severity: "info",
      category: "clarity",
      title: "Intro could state the audience",
      detail:
        "The overview jumps into details without saying who the guide is for.",
      suggestion: "Add one sentence naming the intended reader.",
      line: 3,
    },
  ],
};

export const sampleDoc = `# Payments Guide

Send a POST request to /charges to create a charge. You will need an access
token, which you can find in your dashboard.

## Creating a charge

Provide an amount and a currency. The API key is passed in the Authorization
header.

See the rate limits guide for throughput details.
`;
