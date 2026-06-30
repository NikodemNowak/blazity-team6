import { NextResponse } from "next/server";
import { INSTALL_COOKIE } from "@/lib/repo/ghCookie";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(INSTALL_COOKIE);
  return res;
}
