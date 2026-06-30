"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { Loading, PageHead } from "@/components/ui";
import { generateDoc } from "@/lib/api";
import type { GenerateFormat, GenerateResult, GenerateTone } from "@/lib/types";

const SAMPLE_SOURCE = `POST /v1/charges  -> create a charge { amount, currency, customer }
GET  /v1/charges/:id -> fetch a charge
auth: Bearer <api-key>
errors: 4xx client, 5xx server`;

export default function GeneratePage() {
  const [source, setSource] = useState(SAMPLE_SOURCE);
  const [format, setFormat] = useState<GenerateFormat>("api-reference");
  const [tone, setTone] = useState<GenerateTone>("concise");
  const [audience, setAudience] = useState("backend developers");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    const res = await generateDoc({ source, format, tone, audience });
    setResult(res);
    setLoading(false);
  }

  function copy() {
    if (!result) return;
    navigator.clipboard?.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AppShell title="Generate">
      <PageHead
        title="Generate documentation"
        desc="Turn rough source — code, notes, a changelog — into a structured draft. The model returns Markdown plus notes on what it inferred."
      />

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Source</span>
          </div>
          <div className="card-pad stack">
            <div className="toolbar">
              <div className="field">
                <label className="label">Format</label>
                <select
                  className="select"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as GenerateFormat)}
                >
                  <option value="readme">README</option>
                  <option value="api-reference">API reference</option>
                  <option value="how-to">How-to guide</option>
                  <option value="release-notes">Release notes</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Tone</label>
                <select
                  className="select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as GenerateTone)}
                >
                  <option value="neutral">Neutral</option>
                  <option value="concise">Concise</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="label">Audience</label>
                <input
                  className="input"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. backend developers"
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Source material</label>
              <textarea
                className="textarea"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="row">
              <button
                className="btn btn-primary"
                onClick={run}
                disabled={loading || !source.trim()}
              >
                <Icon.Generate width={15} height={15} />
                {loading ? "Generating…" : "Generate draft"}
              </button>
              <span className="faint" style={{ fontSize: 12 }}>
                Mock · ~1s
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">Draft</span>
            {result && (
              <button className="btn btn-sm btn-ghost" onClick={copy}>
                {copied ? <Icon.Check width={14} height={14} /> : <Icon.Copy width={14} height={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {loading && <Loading label="Drafting documentation…" />}

          {!loading && !result && (
            <div className="empty">
              <Icon.Doc className="empty-icon" width={28} height={28} />
              <div>No draft yet</div>
              <div className="faint" style={{ fontSize: 12.5 }}>
                Add source material and generate a draft.
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="md-preview">{result.markdown}</div>
              <div className="card-pad" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <span className="card-sub">Model notes</span>
                  <span className="faint" style={{ fontSize: 12 }}>
                    {result.wordCount} words
                  </span>
                </div>
                <ul className="notes">
                  {result.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
