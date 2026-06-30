import { NextRequest, NextResponse } from "next/server";
import { INSTALL_COOKIE, verifyInstallation } from "@/lib/repo/ghCookie";
import { isAppConfigured } from "@/lib/repo/githubApp";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = verifyInstallation(req.cookies.get(INSTALL_COOKIE)?.value);
  return NextResponse.json({ connected: Boolean(id), appConfigured: isAppConfigured() });
}
