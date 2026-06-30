import { NextRequest, NextResponse } from "next/server";
import { INSTALL_COOKIE, STATE_COOKIE, signInstallation } from "@/lib/repo/ghCookie";

export const runtime = "nodejs";

// GitHub redirects here after the user installs the App. Validates CSRF state,
// then stores the signed installation_id cookie and bounces back to /chat.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const installationId = params.get("installation_id");
  const state = params.get("state");
  const cookieState = req.cookies.get(STATE_COOKIE)?.value;

  const dest = new URL("/chat", req.nextUrl.origin);

  if (!installationId) {
    dest.searchParams.set("github", "error");
    return NextResponse.redirect(dest);
  }
  if (!state || !cookieState || state !== cookieState) {
    dest.searchParams.set("github", "state_error");
    return NextResponse.redirect(dest);
  }

  dest.searchParams.set("github", "connected");
  const res = NextResponse.redirect(dest);
  res.cookies.set(INSTALL_COOKIE, signInstallation(installationId), {
    httpOnly: true,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.delete(STATE_COOKIE);
  return res;
}
