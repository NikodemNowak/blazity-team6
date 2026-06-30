import type { NextRequest } from "next/server";

// The public origin of the app. Behind a proxy/tunnel (Cloudflare → localhost),
// req.nextUrl.origin is the INTERNAL address (e.g. http://localhost:3200), which
// must never be used for user-facing redirects. Prefer an explicit APP_BASE_URL,
// then the forwarded headers the proxy sets, and only fall back to the request
// origin for plain local dev.
export function appOrigin(req: NextRequest): string {
  const env = process.env.APP_BASE_URL;
  if (env) return env.replace(/\/+$/, "");

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
    return `${proto}://${host}`;
  }
  return req.nextUrl.origin;
}

export function isHttps(req: NextRequest): boolean {
  return appOrigin(req).startsWith("https://");
}
