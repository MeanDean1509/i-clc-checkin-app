import { NextRequest, NextResponse } from "next/server";
import { backendUrl, readJsonSafely } from "@/lib/backend";
import { decodeSessionUser, SESSION_COOKIE, SESSION_USER_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = decodeSessionUser(request.cookies.get(SESSION_USER_COOKIE)?.value);
  const body = await request.json().catch(() => null) as { newPassword?: string } | null;
  if (!token || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!body?.newPassword || body.newPassword.length < 6) return NextResponse.json({ message: "Mật khẩu mới cần ít nhất 6 ký tự." }, { status: 400 });
  try {
    const upstream = await fetch(backendUrl("/auth/change-password"), { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ username: user.username, userRole: user.userRole, newPassword: body.newPassword }), cache: "no-store" });
    const payload = await readJsonSafely(upstream) as { status?: string; message?: string; data?: { message?: string } } | null;
    if (!upstream.ok || payload?.status !== "success") return NextResponse.json({ message: payload?.message ?? "Không thể đổi mật khẩu." }, { status: upstream.status >= 400 ? upstream.status : 400 });
    return NextResponse.json({ message: payload.data?.message ?? "Đổi mật khẩu thành công." });
  } catch { return NextResponse.json({ message: "Không thể kết nối máy chủ chấm công." }, { status: 502 }); }
}
