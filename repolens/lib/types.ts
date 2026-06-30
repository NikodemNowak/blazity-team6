// Domain types shared across the app.
// These mirror the shape the real Claude-backed API is expected to return,
// so swapping the mock implementation in `lib/api.ts` for real fetch calls
// requires no changes in the UI.

export type DocKind = "guide" | "reference" | "tutorial" | "readme" | "changelog";

export type DocStatus = "draft" | "review" | "published" | "stale";

export interface DocumentSummary {
  id: string;
  title: string;
  kind: DocKind;
  status: DocStatus;
  /** ISO date string. */
  updatedAt: string;
  owner: string;
  /** 0–100 health score from the last analysis, if any. */
  health: number | null;
  words: number;
}

// --- Generate ---------------------------------------------------------------

export type GenerateFormat = "readme" | "api-reference" | "how-to" | "release-notes";

export type GenerateTone = "neutral" | "concise" | "friendly" | "formal";

export interface GenerateRequest {
  source: string;
  format: GenerateFormat;
  tone: GenerateTone;
  audience: string;
}

export interface GenerateResult {
  markdown: string;
  /** High-level notes the model surfaced while drafting. */
  notes: string[];
  wordCount: number;
}

// --- Analyze ----------------------------------------------------------------

export interface Metric {
  key: string;
  label: string;
  /** 0–100. */
  value: number;
  hint: string;
}

export interface AnalyzeResult {
  /** Overall 0–100 health score. */
  score: number;
  readingTimeMinutes: number;
  wordCount: number;
  metrics: Metric[];
  /** Sections the doc is missing, e.g. "Installation", "Examples". */
  gaps: string[];
  summary: string;
}

// --- Review -----------------------------------------------------------------

export type Severity = "high" | "medium" | "low" | "info";

export type IssueCategory =
  | "clarity"
  | "consistency"
  | "accuracy"
  | "structure"
  | "links";

export interface ReviewIssue {
  id: string;
  severity: Severity;
  category: IssueCategory;
  title: string;
  detail: string;
  /** Optional excerpt the issue points at. */
  excerpt?: string;
  suggestion: string;
  /** Approximate line in the source the issue maps to. */
  line?: number;
}

export interface ReviewResult {
  issues: ReviewIssue[];
  /** Count by severity for quick summary. */
  counts: Record<Severity, number>;
  passed: boolean;
}

export interface ActivityItem {
  id: string;
  kind: "generate" | "analyze" | "review" | "drift";
  title: string;
  at: string;
  meta: string;
}

// Repo docs-vs-code drift is a real, backend-backed feature — its types live in
// lib/repo/types.ts (DriftFinding, DriftResponse) alongside the rest of the repo
// pipeline, not here in the mock-API types.
