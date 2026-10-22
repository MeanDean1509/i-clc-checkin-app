import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/backend";
import { SESSION_COOKIE, SESSION_USER_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.match(/(?:^|; )checkin_session=([^;]+)/)?.[1];
  if (token) {
    await fetch(backendUrl("/auth/logout"), {
      method: "POST",
      headers: { Authorization: `Bearer ${decodeURIComponent(token)}` },
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
  response.cookies.set({ name: SESSION_USER_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
