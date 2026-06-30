"use client";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { useRepo } from "@/components/repo/RepoProvider";

// Shared repository bar shown at the top of Chat / Generate / Drift. It loads or
// picks the single active repo that all features operate on. GitHub connection
// is managed globally (in Settings); the picker here appears once connected.
export default function RepoBar() {
  const { repo, repoUrl, setRepoUrl, loadRepo, loadingRepo, repoErr, gh, repos } = useRepo();

  return (
    <div className="card card-pad repo-bar">
      {gh?.appConfigured && gh.connected && repos && repos.length > 0 && (
        <div className="gh-connect-row">
          <span className="gh-badge">
            <Icon.GitHub width={14} height={14} /> Connected
          </span>
          <select
            className="select gh-repo-select"
            defaultValue=""
            onChange={(e) => e.target.value && loadRepo(`https://github.com/${e.target.value}`)}
          >
            <option value="" disabled>
              Pick a repository…
            </option>
            {repos.map((r) => (
              <option key={r.full_name} value={r.full_name}>
                {r.full_name}
                {r.private ? " · private" : ""}
              </option>
            ))}
          </select>
          <Link className="faint repo-bar-manage" href="/settings">
            Manage
          </Link>
        </div>
      )}

      {gh?.appConfigured && !gh.connected && (
        <div className="gh-connect-row">
          <a className="btn btn-primary gh-connect-btn" href="/api/github/connect">
            <Icon.GitHub width={15} height={15} /> Connect GitHub
          </a>
          <span className="faint repo-bar-hint">
            Connect once to load private repos and pick from a list — manage it in Settings.
          </span>
        </div>
      )}

      <div className="repo-load-row">
        <input
          className="input"
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadRepo()}
          disabled={loadingRepo}
        />
        <button
          className="btn btn-primary"
          onClick={() => loadRepo()}
          disabled={loadingRepo || !repoUrl.trim()}
        >
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
  );
}
