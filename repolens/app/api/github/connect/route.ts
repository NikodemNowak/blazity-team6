import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { STATE_COOKIE } from "@/lib/repo/ghCookie";

export const runtime = "nodejs";

// Starts the GitHub App install/authorize flow: CSRF state cookie + redirect to
// the App's installation page (where the user picks all or specific repos).
export async function GET(req: NextRequest) {
  const slug = process.env.GITHUB_APP_SLUG;
  if (!slug) {
    return NextResponse.json({ error: "GitHub App not configured" }, { status: 500 });
  }
  const state = randomBytes(16).toString("hex");
  const dest = `https://github.com/apps/${slug}/installations/new?state=${state}`;
  const res = NextResponse.redirect(dest);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 600,
  });
  return res;
}
