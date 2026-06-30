"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Badge, SeverityBadge } from "@/components/ui";
import RepoCitation from "@/components/repo/RepoCitation";
import { githubBlobUrl } from "@/lib/repo/drift";
import type { DriftFinding, DriftResponse, IngestResponse, Severity } from "@/lib/repo/types";

const SEVERITIES: Severity[] = ["high", "medium", "low"];
const TONE = { high: "high", medium: "med", low: "low" } as const;

export default function RepoDrift() {
  const [repo, setRepo] = useState<IngestResponse | null>(null);
  const [url, setUrl] = useState("");
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [repoErr, setRepoErr] = useState<string | null>(null);

  const [findings, setFindings] = useState<DriftFinding[] | null>(null);
  const [running, setRunning] = useState(false);
  const [driftErr, setDriftErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  async function loadRepo() {
    if (!url.trim() || loadingRepo) return;
    setLoadingRepo(true);
    setRepoErr(null);
    setFindings(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load repo");
      setRepo(json as IngestResponse);
    } catch (e: unknown) {
      setRepoErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingRepo(false);
    }
  }

  async function runDrift(refresh = false) {
    if (!repo || running) return;
    setRunning(true);
    setDriftErr(null);
    if (refresh) setFindings(null);
    setFilter("all");
    setDismissed(new Set());
    try {
      const res = await fetch("/api/drift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: repo.repoId, refresh }),
      });
      const json = (await res.json()) as DriftResponse & { error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? `Request failed (${res.status})`);
      setFindings(json.findings ?? []);
    } catch (e: unknown) {
      setDriftErr(e instanceof Error ? e.message : "Drift check failed");
    } finally {
      setRunning(false);
    }
  }

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
    findings?.forEach((f) => (c[f.severity] += 1));
    return c;
  }, [findings]);

  const visible = useMemo(() => {
    if (!findings) return [];
    return findings
      .map((f, i) => ({ f, i }))
      .filter(({ f, i }) => (filter === "all" || f.severity === filter) && !dismissed.has(i));
  }, [findings, filter, dismissed]);

  return (
    <div className="repo-chat">
      {/* Repo loader */}
      <div className="card card-pad">
        <div className="repo-load-row">
          <input
            className="input"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadRepo()}
            disabled={loadingRepo}
          />
          <button className="btn btn-primary" onClick={loadRepo} disabled={loadingRepo || !url.trim()}>
            {loadingRepo ? "Loading…" : repo ? "Reload" : "Load repo"}
          </button>
        </div>
        {repoErr && <div className="repo-load-err">{repoErr}</div>}
        {repo && (
          <div className="repo-load-meta">
            <Icon.Docs width={14} height={14} />
            <span className="cell-title">{repo.repoId}</span>
            <span className="faint">
              · {repo.stats.filesLoaded}/{repo.stats.filesTotal} files
              {repo.stats.truncated ? " (truncated)" : ""}
            </span>
          </div>
        )}
      </div>

      {!repo ? (
        <div className="empty chat-empty">
          <Icon.Doc className="empty-icon" />
          <div>Load a GitHub repository to check its docs against the code.</div>
        </div>
      ) : (
        <>
          <div className="card card-pad">
            <div className="row-between">
              <div className="row" style={{ gap: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => runDrift(findings != null)}
                  disabled={running}
                >
                  <Icon.Drift width={15} height={15} />
                  {running ? "Checking…" : findings ? "Re-run drift check" : "Run drift check"}
                </button>
                {findings && !driftErr && (
                  <span className="muted" style={{ fontSize: 13 }}>
                    {findings.length === 0 ? "Docs match the code" : `${findings.length} findings`}
                  </span>
                )}
              </div>
              {findings && findings.length > 0 && (
                <div className="row" style={{ gap: 6 }}>
                  {SEVERITIES.map((s) => (
                    <Badge key={s} tone={TONE[s]}>
                      {counts[s]} {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {driftErr && <div className="repo-load-err">{driftErr}</div>}
          </div>

          {findings && findings.length > 0 && (
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
                {visible.map(({ f, i }) => (
                  <div key={i} className="issue">
                    <div className="issue-head">
                      <SeverityBadge severity={f.severity} />
                      <span className="issue-title">{f.claim}</span>
                      <Badge tone="neutral">{f.docFile}</Badge>
                      <button
                        className="issue-line"
                        style={{ background: "none", border: 0, cursor: "pointer" }}
                        onClick={() => setDismissed((s) => new Set(s).add(i))}
                      >
                        dismiss
                      </button>
                    </div>
                    <div className="issue-detail">{f.explanation}</div>
                    <RepoCitation repoId={repo.repoId} citation={f.contradictingCode} />
                    <div className="issue-suggestion">
                      <b>Evidence</b>
                      <a
                        className="muted"
                        href={githubBlobUrl(
                          repo.repoId,
                          f.contradictingCode.path,
                          f.contradictingCode.startLine,
                          f.contradictingCode.endLine,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on GitHub ↗
                      </a>
                    </div>
                  </div>
                ))}
                {visible.length === 0 && (
                  <div className="empty">
                    <Icon.Check className="empty-icon" width={24} height={24} />
                    <div>No findings at this severity (or all dismissed)</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
