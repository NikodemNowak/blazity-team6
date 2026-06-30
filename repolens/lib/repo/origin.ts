import type { NextRequest } from "next/server";

// Hosts we trust to appear in a forwarded Host header. APP_BASE_URL's host is
// always trusted; extra hosts can be added via ALLOWED_HOSTS (comma-separated).
function allowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const base = process.env.APP_BASE_URL;
  if (base) {
    try {
      hosts.add(new URL(base).host);
    } catch {
      /* ignore malformed APP_BASE_URL */
    }
  }
  for (const h of (process.env.ALLOWED_HOSTS ?? "").split(",")) {
    const t = h.trim();
    if (t) hosts.add(t);
  }
  return hosts;
}

// The public origin of the app, used for user-facing redirects (GitHub connect).
// Order: (1) explicit, trusted APP_BASE_URL; (2) a forwarded host ONLY if it is
// allowlisted (prevents Host-header injection / open redirect); (3) the internal
// request origin for plain local dev. Never trust raw request headers otherwise.
export function appOrigin(req: NextRequest): string {
  const env = process.env.APP_BASE_URL;
  if (env) return env.replace(/\/+$/, "");

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host && allowedHosts().has(host)) {
    const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
    return `${proto}://${host}`;
  }

  return req.nextUrl.origin;
}

export function isHttps(req: NextRequest): boolean {
  return appOrigin(req).startsWith("https://");
}
