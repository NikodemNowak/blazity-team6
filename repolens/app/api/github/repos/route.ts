import { NextRequest, NextResponse } from "next/server";
import { INSTALL_COOKIE, verifyInstallation } from "@/lib/repo/ghCookie";
import { listInstallationRepos } from "@/lib/repo/githubApp";

export const runtime = "nodejs";

// Lists the repositories the user granted the App access to (all, or the ones
// they selected during install).
export async function GET(req: NextRequest) {
  const id = verifyInstallation(req.cookies.get(INSTALL_COOKIE)?.value);
  if (!id) return NextResponse.json({ error: "Not connected" }, { status: 401 });
  try {
    const repos = await listInstallationRepos(id);
    return NextResponse.json({ repos });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to list repositories";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
