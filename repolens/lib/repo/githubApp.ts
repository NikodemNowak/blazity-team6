import { createSign } from "crypto";

// GitHub App authentication. We never store long-lived user tokens: we keep only
// the installation_id (in a signed cookie) and mint short-lived (1h) installation
// access tokens on demand using the App's private key (server-side env only).

function getPrivateKey(): string {
  const b64 = process.env.GITHUB_APP_PRIVATE_KEY_BASE64;
  if (b64) return Buffer.from(b64, "base64").toString("utf8");
  const raw = process.env.GITHUB_APP_PRIVATE_KEY;
  if (raw) return raw.replace(/\\n/g, "\n");
  throw new Error("GitHub App private key not configured");
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

export function isAppConfigured(): boolean {
  return Boolean(
    (process.env.GITHUB_APP_CLIENT_ID || process.env.GITHUB_APP_ID) &&
      (process.env.GITHUB_APP_PRIVATE_KEY_BASE64 || process.env.GITHUB_APP_PRIVATE_KEY) &&
      process.env.GITHUB_APP_SLUG,
  );
}

function appJwt(): string {
  const iss = process.env.GITHUB_APP_CLIENT_ID || process.env.GITHUB_APP_ID;
  if (!iss) throw new Error("GITHUB_APP_CLIENT_ID or GITHUB_APP_ID not set");
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ typ: "JWT", alg: "RS256" }));
  // iat 60s in the past (clock drift), exp < 10 min per GitHub.
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss }));
  const data = `${header}.${payload}`;
  const sig = createSign("RSA-SHA256").update(data).sign(getPrivateKey(), "base64url");
  return `${data}.${sig}`;
}

const API = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

// Cache installation tokens until ~5 min before expiry.
const tokenCache = new Map<string, { token: string; exp: number }>();

export async function getInstallationToken(installationId: string): Promise<string> {
  const cached = tokenCache.get(installationId);
  if (cached && cached.exp - 300_000 > Date.now()) return cached.token;

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    { method: "POST", headers: { Authorization: `Bearer ${appJwt()}`, ...API } },
  );
  if (!res.ok) throw new Error(`Failed to mint installation token (${res.status})`);
  const json = await res.json();
  tokenCache.set(installationId, {
    token: json.token,
    exp: new Date(json.expires_at).getTime(),
  });
  return json.token;
}

export interface InstallRepo {
  full_name: string;
  private: boolean;
}

export async function listInstallationRepos(installationId: string): Promise<InstallRepo[]> {
  const token = await getInstallationToken(installationId);
  const repos: InstallRepo[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `https://api.github.com/installation/repositories?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${token}`, ...API } },
    );
    if (!res.ok) break;
    const json = await res.json();
    const batch = (json.repositories ?? []) as { full_name: string; private: boolean }[];
    for (const r of batch) repos.push({ full_name: r.full_name, private: r.private });
    if (batch.length < 100) break;
  }
  return repos;
}
