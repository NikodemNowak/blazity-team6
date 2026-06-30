"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { Badge, Loading, PageHead, SeverityBadge } from "@/components/ui";
import { checkDrift } from "@/lib/api";
import { sampleRepoUrl } from "@/lib/mock-data";
import type { DriftFinding, DriftResult, Severity } from "@/lib/types";

const SEVERITIES: Severity[] = ["high", "medium", "low", "info"];
const TONE = { high: "high", medium: "med", low: "low", info: "info" } as const;

function githubUrl(repo: string, f: DriftFinding): string {
  const { path, startLine, endLine } = f.contradictingCode;
  const range = startLine === endLine ? `L${startLine}` : `L${startLine}-L${endLine}`;
  return `https://github.com/${repo}/blob/HEAD/${path}#${range}`;
}

export default function DriftPage() {
  const [repoUrl, setRepoUrl] = useState(sampleRepoUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DriftResult | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");

  async function run() {
    setLoading(true);
    setResult(null);
    setFilter("all");
    const res = await checkDrift(repoUrl);
    setResult(res);
    setLoading(false);
  }

  const findings =
    result?.findings.filter((f) => filter === "all" || f.severity === filter) ?? [];

  return (
    <AppShell title="Drift">
      <PageHead
        title="Docs vs. code drift"
        desc="Point at a GitHub repo and find where its docs claim something the code contradicts — each flag cites the contradicting code, so you verify the evidence rather than trust the model."
      />

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Repository</span>
          </div>
          <div className="card-pad stack">
            <div className="field">
              <label className="label">GitHub repo URL</label>
              <input
                className="input"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
              />
            </div>
            <div className="row">
              <button
                className="btn btn-primary"
                onClick={run}
                disabled={loading || !repoUrl.trim()}
              >
                <Icon.Drift width={15} height={15} />
                {loading ? "Checking…" : "Check drift"}
              </button>
              <span className="faint" style={{ fontSize: 12 }}>
                Mock · ~1s
              </span>
            </div>
            <p className="faint" style={{ fontSize: 12 }}>
              Reads the repo&apos;s docs and source, then flags stale claims. No data is stored.
            </p>
          </div>
        </div>

        <div className="stack">
          {loading && (
            <div className="card">
              <Loading label="Comparing docs against the code…" />
            </div>
          )}

          {!loading && !result && (
            <div className="card">
              <div className="empty">
                <Icon.Drift className="empty-icon" width={28} height={28} />
                <div>No drift check yet</div>
                <div className="faint" style={{ fontSize: 12.5 }}>
                  Run a check to see where the docs and code disagree.
                </div>
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="card card-pad">
                <div className="row-between">
                  <div className="row">
                    {result.findings.length === 0 ? (
                      <Badge tone="success" dot>
                        In sync
                      </Badge>
                    ) : (
                      <Badge tone="high" dot>
                        Drift found
                      </Badge>
                    )}
                    <span className="muted" style={{ fontSize: 13 }}>
                      {result.repo} · {result.checkedFiles} files · {result.findings.length} findings
                    </span>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    {SEVERITIES.map((s) => (
                      <Badge key={s} tone={TONE[s]}>
                        {result.counts[s]} {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <span className="card-title">Findings</span>
                  <select
                    className="select"
                    style={{ width: "auto", padding: "5px 28px 5px 10px" }}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as Severity | "all")}
                  >
                    <option value="all">All severities</option>
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  {findings.map((f) => (
                    <div key={f.id} className="issue">
                      <div className="issue-head">
                        <SeverityBadge severity={f.severity} />
                        <span className="issue-title">{f.claim}</span>
                        <Badge tone="neutral">{f.docFile}</Badge>
                      </div>
                      <div className="issue-detail">{f.explanation}</div>
                      <div className="issue-excerpt">
                        <div
                          className="faint"
                          style={{ fontSize: 11, marginBottom: 6 }}
                        >
                          {f.contradictingCode.path}:{f.contradictingCode.startLine}-
                          {f.contradictingCode.endLine}
                        </div>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {f.contradictingCode.excerpt}
                        </pre>
                      </div>
                      <div className="issue-suggestion">
                        <b>Evidence</b>
                        <a
                          className="muted"
                          href={githubUrl(result.repo, f)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on GitHub ↗
                        </a>
                      </div>
                    </div>
                  ))}
                  {findings.length === 0 && (
                    <div className="empty">
                      <Icon.Check className="empty-icon" width={24} height={24} />
                      <div>
                        {result.findings.length === 0
                          ? "Docs match the code"
                          : "No findings at this severity"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
