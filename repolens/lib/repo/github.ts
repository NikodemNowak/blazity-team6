import { shouldIncludePath } from "./filter";
import type { RepoFile } from "./types";

// Build request headers for a given token. Token precedence is decided by the
// caller (GitHub App installation token > GITHUB_TOKEN env PAT > none). An empty
// `Bearer ` is rejected with 401 even for public repos, so we only attach the
// header when a token actually exists; without one, public repos still work
// unauthenticated (lower rate limit), private repos need a token.
function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const t = token || process.env.GITHUB_TOKEN;
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

// GitHub owners and repo names: alphanumerics plus -, _, . — no slashes,
// and never "." / ".." (which would let a crafted URL escape the
// /repos/{owner}/{repo} path via URL normalization → SSRF-style traversal).
const SEGMENT = /^[A-Za-z0-9._-]+$/;
function safeSegment(s: string): boolean {
  return SEGMENT.test(s) && s !== "." && s !== "..";
}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const m = url
    .trim()
    .replace(/\.git$/, "")
    .match(/github\.com[/:]([^/]+)\/([^/]+)/);
  if (!m) throw new Error("Not a GitHub repo URL");
  const owner = m[1];
  // Strip a trailing `.git` on the repo segment too (handles URLs with extra
  // path after `.git`, e.g. .../repo.git/tree/main where the outer strip misses).
  const repo = m[2].replace(/\.git$/, "");
  if (!safeSegment(owner) || !safeSegment(repo)) {
    throw new Error("Invalid repo owner/name");
  }
  return { owner, repo };
}

async function getDefaultBranch(owner: string, repo: string, token?: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: headers(token),
  });
  if (!res.ok) throw new Error(`GitHub repo lookup failed (${res.status})`);
  const json = await res.json();
  return json.default_branch as string;
}

interface TreeNode {
  type: string;
  path: string;
  sha: string;
  size?: number;
}

export async function fetchRepoFiles(
  owner: string,
  repo: string,
  token?: string,
): Promise<{ branch: string; files: RepoFile[]; fileTree: string[]; treeTruncated: boolean }> {
  const H = headers(token);
  const branch = await getDefaultBranch(owner, repo, token);
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const treeRes = await fetch(`${base}/git/trees/${branch}?recursive=1`, { headers: H });
  if (!treeRes.ok) throw new Error(`GitHub tree fetch failed (${treeRes.status})`);
  const tree = await treeRes.json();

  // GitHub truncates the tree for very large repos (~100k entries / 7MB).
  const treeTruncated = tree.truncated === true;
  const nodes = (tree.tree ?? []) as TreeNode[];
  const fileTree: string[] = nodes.filter((n) => n.type === "blob").map((n) => n.path);

  const candidates = nodes.filter(
    (n) => n.type === "blob" && (n.size ?? 0) < 100_000 && shouldIncludePath(n.path),
  );

  // Throttle blob fetches to ~8 concurrent to avoid GitHub's secondary abuse limit.
  // Each blob is fetched defensively: a failed/rate-limited blob is skipped, not
  // stored as empty content, and never aborts the whole ingest.
  const files: RepoFile[] = [];
  const queue = candidates.slice(0, 300);
  const worker = async () => {
    while (queue.length) {
      const node = queue.shift();
      if (!node) break;
      try {
        const r = await fetch(`${base}/git/blobs/${node.sha}`, { headers: H });
        if (!r.ok) continue; // 403 secondary-limit, 404, etc. — skip this file
        const b = await r.json();
        if (b.encoding !== "base64" || typeof b.content !== "string") continue;
        const content = Buffer.from(b.content, "base64").toString("utf8");
        files.push({ path: node.path, content });
      } catch {
        // network blip / non-JSON body — skip this blob, keep the rest
        continue;
      }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  files.sort((a, b) => a.path.localeCompare(b.path));

  return { branch, files, fileTree, treeTruncated };
}
