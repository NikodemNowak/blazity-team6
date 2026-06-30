"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { IngestResponse } from "@/lib/repo/types";

// One shared repository + GitHub connection for the whole app. The active repo
// is held here (and persisted), so Chat, Generate, and Drift all operate on the
// same repository — load/connect once, use everywhere.

interface GhStatus {
  connected: boolean;
  appConfigured: boolean;
}
interface RepoEntry {
  full_name: string;
  private: boolean;
}

interface RepoCtx {
  repo: IngestResponse | null;
  repoUrl: string;
  setRepoUrl: (u: string) => void;
  loadingRepo: boolean;
  repoErr: string | null;
  loadRepo: (url?: string) => Promise<void>;
  gh: GhStatus | null;
  repos: RepoEntry[] | null;
  refreshGitHub: () => void;
  disconnectGitHub: () => Promise<void>;
}

const Ctx = createContext<RepoCtx | null>(null);
const LS_URL = "repolens.repoUrl";

export function useRepo(): RepoCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRepo must be used within <RepoProvider>");
  return c;
}

export function RepoProvider({ children }: { children: ReactNode }) {
  const [repo, setRepo] = useState<IngestResponse | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [repoErr, setRepoErr] = useState<string | null>(null);
  const [gh, setGh] = useState<GhStatus | null>(null);
  const [repos, setRepos] = useState<RepoEntry[] | null>(null);

  const loadRepo = useCallback(
    async (explicit?: string) => {
      const target = (explicit ?? repoUrl).trim();
      if (!target || loadingRepo) return;
      setRepoUrl(target);
      setLoadingRepo(true);
      setRepoErr(null);
      try {
        const res = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: target }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load repo");
        setRepo(json as IngestResponse);
        try {
          localStorage.setItem(LS_URL, target);
        } catch {
          /* ignore */
        }
      } catch (e: unknown) {
        setRepoErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingRepo(false);
      }
    },
    [repoUrl, loadingRepo],
  );

  const refreshGitHub = useCallback(() => {
    fetch("/api/github/status")
      .then((r) => r.json())
      .then((s: GhStatus) => {
        setGh(s);
        if (s.connected) {
          fetch("/api/github/repos")
            .then((r) => r.json())
            .then((d) => Array.isArray(d.repos) && setRepos(d.repos))
            .catch(() => {});
        } else {
          setRepos(null);
        }
      })
      .catch(() => setGh({ connected: false, appConfigured: false }));
  }, []);

  const disconnectGitHub = useCallback(async () => {
    await fetch("/api/github/disconnect", { method: "POST" }).catch(() => {});
    setGh((g) => (g ? { ...g, connected: false } : g));
    setRepos(null);
  }, []);

  // On first mount: load GitHub status and restore the last active repo
  // (re-ingest so the server-side bundle is fresh after a restart).
  useEffect(() => {
    refreshGitHub();
    let stored = "";
    try {
      stored = localStorage.getItem(LS_URL) || "";
    } catch {
      /* ignore */
    }
    if (stored) {
      setRepoUrl(stored);
      loadRepo(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider
      value={{
        repo,
        repoUrl,
        setRepoUrl,
        loadingRepo,
        repoErr,
        loadRepo,
        gh,
        repos,
        refreshGitHub,
        disconnectGitHub,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
