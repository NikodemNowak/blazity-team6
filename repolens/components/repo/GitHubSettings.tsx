"use client";
import { Icon } from "@/components/icons";
import { useRepo } from "@/components/repo/RepoProvider";

// Global GitHub connection management, shown in Settings. The connection is a
// single per-session install token used by every feature's ingest call.
export default function GitHubSettings() {
  const { gh, repos, disconnectGitHub } = useRepo();

  return (
    <section className="card">
      <div className="card-head">
        <span className="card-title">GitHub</span>
        {gh?.connected && (
          <span className="gh-badge">
            <Icon.GitHub width={14} height={14} /> Connected
          </span>
        )}
      </div>
      <div className="card-pad stack">
        {gh == null && <p className="muted">Checking connection…</p>}

        {gh && !gh.appConfigured && (
          <p className="muted">
            No GitHub App configured. Public repositories work via URL; configure a GitHub
            App in the environment to connect private repos in one click.
          </p>
        )}

        {gh?.appConfigured && !gh.connected && (
          <>
            <p className="muted">
              Connect GitHub once to load private repositories and pick from a list across
              Chat, Generate, and Drift.
            </p>
            <a className="btn btn-primary gh-connect-btn" href="/api/github/connect">
              <Icon.GitHub width={15} height={15} /> Connect GitHub
            </a>
          </>
        )}

        {gh?.connected && (
          <>
            <div className="row-between">
              <span className="muted">Repositories you granted access to</span>
              <button className="btn btn-ghost btn-sm" onClick={disconnectGitHub}>
                Disconnect
              </button>
            </div>
            <div className="theme-list">
              {repos && repos.length > 0 ? (
                repos.map((r) => (
                  <div key={r.full_name} className="theme-row">
                    <span className="cell-title">{r.full_name}</span>
                    {r.private && <span className="faint">private</span>}
                  </div>
                ))
              ) : (
                <div className="faint">No repositories yet (or still loading)…</div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
