"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { Badge, Loading, PageHead, SeverityBadge } from "@/components/ui";
import { reviewDoc } from "@/lib/api";
import { sampleDoc } from "@/lib/mock-data";
import type { ReviewResult, Severity } from "@/lib/types";

const SEVERITIES: Severity[] = ["high", "medium", "low", "info"];
const TONE = { high: "high", medium: "med", low: "low", info: "info" } as const;

export default function ReviewPage() {
  const [source, setSource] = useState(sampleDoc);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");

  async function run() {
    setLoading(true);
    setResult(null);
    setFilter("all");
    const res = await reviewDoc(source);
    setResult(res);
    setLoading(false);
  }

  const issues =
    result?.issues.filter((i) => filter === "all" || i.severity === filter) ?? [];

  return (
    <AppShell title="Review">
      <PageHead
        title="Review documentation"
        desc="Check a doc for issues — accuracy, consistency, structure, clarity, and broken links — each with a severity and a suggested fix."
      />

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Document</span>
          </div>
          <div className="card-pad stack">
            <div className="field">
              <label className="label">Paste the document text</label>
              <textarea
                className="textarea"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{ minHeight: 320 }}
              />
            </div>
            <div className="row">
              <button
                className="btn btn-primary"
                onClick={run}
                disabled={loading || !source.trim()}
              >
                <Icon.Review width={15} height={15} />
                {loading ? "Reviewing…" : "Run review"}
              </button>
              <span className="faint" style={{ fontSize: 12 }}>
                Mock · ~1s
              </span>
            </div>
          </div>
        </div>

        <div className="stack">
          {loading && (
            <div className="card">
              <Loading label="Reviewing the document…" />
            </div>
          )}

          {!loading && !result && (
            <div className="card">
              <div className="empty">
                <Icon.Review className="empty-icon" width={28} height={28} />
                <div>No review yet</div>
                <div className="faint" style={{ fontSize: 12.5 }}>
                  Run a review to see issues and fixes.
                </div>
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="card card-pad">
                <div className="row-between">
                  <div className="row">
                    {result.passed ? (
                      <Badge tone="success" dot>
                        Passed
                      </Badge>
                    ) : (
                      <Badge tone="high" dot>
                        Needs work
                      </Badge>
                    )}
                    <span className="muted" style={{ fontSize: 13 }}>
                      {result.issues.length} issues
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
                  <span className="card-title">Issues</span>
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
                  {issues.map((issue) => (
                    <div key={issue.id} className="issue">
                      <div className="issue-head">
                        <SeverityBadge severity={issue.severity} />
                        <span className="issue-title">{issue.title}</span>
                        <Badge tone="neutral">{issue.category}</Badge>
                        {issue.line != null && (
                          <span className="issue-line">line {issue.line}</span>
                        )}
                      </div>
                      <div className="issue-detail">{issue.detail}</div>
                      {issue.excerpt && (
                        <div className="issue-excerpt">{issue.excerpt}</div>
                      )}
                      <div className="issue-suggestion">
                        <b>Fix</b>
                        <span className="muted">{issue.suggestion}</span>
                      </div>
                    </div>
                  ))}
                  {issues.length === 0 && (
                    <div className="empty">
                      <Icon.Check className="empty-icon" width={24} height={24} />
                      <div>No issues at this severity</div>
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
