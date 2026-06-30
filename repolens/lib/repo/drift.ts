import type { DriftFinding, RepoBundle, Severity } from "./types";

const RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

/**
 * Enforce "checked, not trusted" on raw model findings before the UI sees them:
 *  - drop any finding whose cited file is not in the bundle (we can't render the
 *    evidence snippet, so the claim is unverifiable);
 *  - clamp the cited line range to the file's real bounds (1-indexed, inclusive);
 *  - normalize an out-of-enum severity to "low";
 *  - sort high → medium → low so the worst drift surfaces first.
 *
 * Pure and bundle-driven, so it is unit-testable without the model.
 */
export function sanitizeFindings(findings: DriftFinding[], bundle: RepoBundle): DriftFinding[] {
  const lineCounts = new Map(bundle.files.map((f) => [f.path, f.content.split("\n").length]));

  const cleaned: DriftFinding[] = [];
  for (const f of findings) {
    const c = f?.contradictingCode;
    if (!c) continue;
    const lineCount = lineCounts.get(c.path);
    if (lineCount === undefined) continue; // cited file not loaded → can't show evidence

    const startLine = Math.min(Math.max(1, c.startLine), lineCount);
    const endLine = Math.min(Math.max(startLine, c.endLine), lineCount);
    const severity: Severity = severityOf(f.severity);
    cleaned.push({ ...f, severity, contradictingCode: { ...c, startLine, endLine } });
  }

  cleaned.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
  return cleaned;
}

function severityOf(s: unknown): Severity {
  return s === "high" || s === "medium" || s === "low" ? s : "low";
}

/** GitHub blob URL for a citation. Uses HEAD so it works without the branch name. */
export function githubBlobUrl(repoId: string, path: string, startLine: number, endLine: number): string {
  const range = startLine === endLine ? `L${startLine}` : `L${startLine}-L${endLine}`;
  return `https://github.com/${repoId}/blob/HEAD/${path}#${range}`;
}
