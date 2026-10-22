import { NextRequest, NextResponse } from "next/server";
import { backendUrl, readJsonSafely } from "@/lib/backend";
import { decodeSessionUser, SESSION_COOKIE, SESSION_USER_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = decodeSessionUser(request.cookies.get(SESSION_USER_COOKIE)?.value);
  const requestedPage = Number(request.nextUrl.searchParams.get("page") ?? "1");
  if (!token || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  try {
    const upstream = await fetch(backendUrl(`/chamcong/history/paged?user=${user.userID}&page=${page}&pageSize=10&role=${encodeURIComponent(user.userRole)}`), { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" });
    const payload = await readJsonSafely(upstream) as { data?: { items?: unknown[]; currentPage?: number; totalPages?: number }; message?: string } | null;
    if (!upstream.ok) return NextResponse.json({ message: payload?.message ?? "Không tải được lịch sử chấm công." }, { status: upstream.status });
    return NextResponse.json({ items: payload?.data?.items ?? [], currentPage: payload?.data?.currentPage ?? page, totalPages: payload?.data?.totalPages ?? page });
  } catch { return NextResponse.json({ message: "Không thể kết nối máy chủ chấm công." }, { status: 502 }); }
}
