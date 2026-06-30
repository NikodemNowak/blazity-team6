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

// --- Drift -------------------------------------------------------------------
// Docs-vs-code drift: where a repo's docs claim something the code contradicts.
// Maps to the RepoLens `POST /api/drift` contract; the citation excerpt is the
// "checked, not trusted" evidence rendered next to each claim.

export interface DriftCitation {
  path: string;
  startLine: number;
  endLine: number;
  /** The contradicting source lines, ready to render. */
  excerpt: string;
}

export interface DriftFinding {
  id: string;
  severity: Severity;
  /** Where the stale claim lives (e.g. README.md). */
  docFile: string;
  /** The doc text that is wrong/outdated. */
  claim: string;
  explanation: string;
  contradictingCode: DriftCitation;
}

export interface DriftResult {
  /** owner/repo that was checked. */
  repo: string;
  findings: DriftFinding[];
  counts: Record<Severity, number>;
  checkedFiles: number;
}
