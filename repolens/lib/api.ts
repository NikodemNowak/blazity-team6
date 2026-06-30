// Mock API layer.
//
// Every function here is async and returns the same shape the real
// Claude-backed endpoints are expected to return. To go live, replace each
// body with a `fetch("/api/...")` call (or a server action) — the signatures
// and return types stay the same, so no UI changes are needed.
//
// `delay()` simulates network + model latency so loading states are exercised.

import {
  activity as mockActivity,
  analyzeResult,
  buildGenerateResult,
  documents as mockDocuments,
  reviewResult,
} from "./mock-data";
import type {
  ActivityItem,
  AnalyzeResult,
  DocumentSummary,
  GenerateRequest,
  GenerateResult,
  ReviewResult,
} from "./types";

function delay<T>(value: T, ms = 900): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function listDocuments(): Promise<DocumentSummary[]> {
  return delay(mockDocuments, 400);
}

export async function getActivity(): Promise<ActivityItem[]> {
  return delay(mockActivity, 400);
}

export async function generateDoc(req: GenerateRequest): Promise<GenerateResult> {
  // Real impl: POST /api/generate with `req`, return the parsed model output.
  return delay(buildGenerateResult(req.audience || "developers"), 1100);
}

export async function analyzeDoc(_source: string): Promise<AnalyzeResult> {
  // Real impl: POST /api/analyze with the document text.
  return delay(analyzeResult, 1000);
}

export async function reviewDoc(_source: string): Promise<ReviewResult> {
  // Real impl: POST /api/review with the document text.
  return delay(reviewResult, 1100);
}

// Drift is a real feature, not mocked: see app/api/drift/route.ts and
// components/repo/RepoDrift.tsx (ingest a repo, then POST /api/drift).
