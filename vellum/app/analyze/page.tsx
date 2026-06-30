"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { Badge, Loading, Meter, PageHead } from "@/components/ui";
import { analyzeDoc } from "@/lib/api";
import { sampleDoc } from "@/lib/mock-data";
import type { AnalyzeResult } from "@/lib/types";

export default function AnalyzePage() {
  const [source, setSource] = useState(sampleDoc);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    const res = await analyzeDoc(source);
    setResult(res);
    setLoading(false);
  }

  return (
    <AppShell title="Analyze">
      <PageHead
        title="Analyze documentation"
        desc="Measure an existing doc: readability, coverage, structure, and consistency — plus the sections it's missing."
      />

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Document</span>
            <span className="card-sub">{source.split(/\s+/).filter(Boolean).length} words</span>
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
                <Icon.Analyze width={15} height={15} />
                {loading ? "Analyzing…" : "Analyze"}
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
              <Loading label="Measuring the document…" />
            </div>
          )}

          {!loading && !result && (
            <div className="card">
              <div className="empty">
                <Icon.Analyze className="empty-icon" width={28} height={28} />
                <div>No analysis yet</div>
                <div className="faint" style={{ fontSize: 12.5 }}>
                  Run an analysis to see scores and gaps.
                </div>
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="card card-pad">
                <div className="row-between">
                  <div>
                    <div className="stat-label">Overall health</div>
                    <div className="score" style={{ marginTop: 6 }}>
                      <span className="score-num">{result.score}</span>
                      <span className="score-max">/ 100</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }} className="faint">
                    <div style={{ fontSize: 12.5 }}>{result.wordCount} words</div>
                    <div style={{ fontSize: 12.5 }}>
                      ~{result.readingTimeMinutes} min read
                    </div>
                  </div>
                </div>
                <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
                  {result.summary}
                </p>
              </div>

              <div className="card">
                <div className="card-head">
                  <span className="card-title">Metrics</span>
                </div>
                <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 4 }}>
                  {result.metrics.map((m) => (
                    <div key={m.key} className="metric-row">
                      <div className="metric-top">
                        <span className="metric-name">{m.label}</span>
                        <span className="metric-val">{m.value}</span>
                      </div>
                      <Meter value={m.value} />
                      <span className="faint" style={{ fontSize: 12 }}>
                        {m.hint}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card card-pad">
                <div className="card-sub" style={{ marginBottom: 10 }}>
                  Missing sections
                </div>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  {result.gaps.map((g) => (
                    <Badge key={g} tone="med">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
