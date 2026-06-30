import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl, fetchRepoFiles } from "@/lib/repo/github";
import { applyBudget } from "@/lib/repo/filter";
import { saveBundle } from "@/lib/repo/bundleStore";
import { rateLimit, clientKey } from "@/lib/repo/rateLimit";
import { INSTALL_COOKIE, verifyInstallation } from "@/lib/repo/ghCookie";
import { getInstallationToken } from "@/lib/repo/githubApp";
import type { IngestResponse, RepoBundle } from "@/lib/repo/types";

export const runtime = "nodejs"; // needs Buffer + module-level Map
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`ingest:${clientKey(req)}`, 10, 60_000)) {
      return NextResponse.json({ error: "Rate limit exceeded, slow down" }, { status: 429 });
    }
    const { repoUrl } = await req.json();
    if (!repoUrl) return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });

    const { owner, repo } = parseRepoUrl(repoUrl);

    // Token precedence: GitHub App installation token (if the user connected) >
    // GITHUB_TOKEN env PAT > unauthenticated. Installation tokens are minted
    // server-side from the App private key and never stored.
    let token: string | undefined;
    const installationId = verifyInstallation(req.cookies.get(INSTALL_COOKIE)?.value);
    if (installationId) {
      try {
        token = await getInstallationToken(installationId);
      } catch {
        /* fall back to env PAT / unauthenticated */
      }
    }

    const { branch, files, fileTree, treeTruncated } = await fetchRepoFiles(owner, repo, token);
    const { kept, truncated } = applyBudget(files);

    const bundle: RepoBundle = {
      repoId: `${owner}/${repo}`,
      owner,
      repo,
      branch,
      files: kept,
      fileTree,
      stats: {
        filesLoaded: kept.length,
        filesTotal: fileTree.length,
        totalChars: kept.reduce((n, f) => n + f.content.length, 0),
        truncated: truncated || treeTruncated,
      },
    };
    saveBundle(bundle);

    const body: IngestResponse = { repoId: bundle.repoId, fileTree, stats: bundle.stats };
    return NextResponse.json(body);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Ingest failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
