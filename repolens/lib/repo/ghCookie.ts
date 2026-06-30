import { createHmac, timingSafeEqual } from "crypto";

// The installation_id is not a secret, but we HMAC-sign the cookie so a client
// can't forge an arbitrary installation_id. The real auth power (the App private
// key) never leaves the server.
export const INSTALL_COOKIE = "rl_gh_install";
export const STATE_COOKIE = "rl_gh_state";

function secret(): string {
  const s = process.env.GITHUB_COOKIE_SECRET || process.env.COOKIE_SECRET;
  if (!s) {
    // Fail closed in production: a known fallback secret would let anyone forge
    // a signed installation cookie. Dev convenience only.
    if (process.env.NODE_ENV === "production") {
      throw new Error("GITHUB_COOKIE_SECRET is required in production");
    }
    return "repolens-dev-secret";
  }
  return s;
}

export function signInstallation(installationId: string): string {
  const sig = createHmac("sha256", secret()).update(installationId).digest("base64url");
  return `${installationId}.${sig}`;
}

export function verifyInstallation(value: string | undefined): string | null {
  if (!value) return null;
  const i = value.lastIndexOf(".");
  if (i < 0) return null;
  const id = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(id).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return id;
  } catch {
    /* fall through */
  }
  return null;
}
