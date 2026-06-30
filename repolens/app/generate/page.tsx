"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import Markdown from "@/components/repo/Markdown";
import RepoBar from "@/components/repo/RepoBar";
import { useRepo } from "@/components/repo/RepoProvider";
import { Badge, Loading, PageHead } from "@/components/ui";
import type { DocType, DocsResponse } from "@/lib/repo/types";

type Tone = "concise" | "neutral" | "formal";

export default function GeneratePage() {
  const { repo } = useRepo();

  const [docType, setDocType] = useState<DocType>("onboarding");
  const [tone, setTone] = useState<Tone>("concise");
  const [audience, setAudience] = useState("developers new to this repository");
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docErr, setDocErr] = useState<string | null>(null);
  const [result, setResult] = useState<DocsResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Clear the draft when the active repository changes.
  useEffect(() => {
    setResult(null);
    setDocErr(null);
  }, [repo?.repoId]);

  async function generate() {
    if (!repo || loadingDoc) return;
    setLoadingDoc(true);
    setDocErr(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: repo.repoId, docType, tone, audience }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate documentation");
      setResult(json as DocsResponse);
    } catch (e: unknown) {
      setDocErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingDoc(false);
    }
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
        desc="Load a GitHub repository and draft documentation from code. RepoLens selects documentation conventions by detected language, such as pydoc for Python and TypeDoc/JSDoc for TypeScript."
      />

      <RepoBar />

      <div className="grid grid-2 generate-workspace">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <span className="card-title">Draft settings</span>
            </div>
            <div className="card-pad stack">
              <div className="toolbar">
                <div className="field">
                  <label className="label">Document type</label>
                  <select
                    className="select"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocType)}
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="architecture">Architecture</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Tone</label>
                  <select
                    className="select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                  >
                    <option value="concise">Concise</option>
                    <option value="neutral">Neutral</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Audience</label>
                <input
                  className="input"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. backend developers"
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={generate}
                disabled={!repo || loadingDoc}
              >
                <Icon.Generate width={15} height={15} />
                {loadingDoc ? "Generating…" : "Generate from repo"}
              </button>
              {docErr && <div className="repo-load-err">{docErr}</div>}
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

          {loadingDoc && <Loading label="Drafting documentation from repository…" />}

          {!loadingDoc && !result && (
            <div className="empty">
              <Icon.Doc className="empty-icon" width={28} height={28} />
              <div>No generated documentation yet</div>
              <div className="faint" style={{ fontSize: 12.5 }}>
                Load a repository, then generate an onboarding or architecture draft.
              </div>
            </div>
          )}

          {!loadingDoc && result && (
            <>
              <div className="doc-profile-strip">
                {result.languageProfiles.map((profile) => (
                  <Badge key={`${profile.language}-${profile.tooling}`} tone="info">
                    {profile.language} · {profile.tooling} · {profile.files} files
                  </Badge>
                ))}
              </div>
              <div className="md-preview">
                <Markdown>{result.markdown}</Markdown>
              </div>
              <div className="card-pad" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <span className="card-sub">Generation notes</span>
                  <span className="faint" style={{ fontSize: 12 }}>
                    {result.markdown.split(/\s+/).filter(Boolean).length} words
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
