import { NextResponse } from "next/server";
import { backendUrl, readJsonSafely } from "@/lib/backend";
import { encodeSessionUser, SESSION_COOKIE, SESSION_USER_COOKIE, type SessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null;

  if (!body?.username?.trim() || !body.password) {
    return NextResponse.json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu." }, { status: 400 });
  }

  try {
    const upstream = await fetch(backendUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username: body.username.trim(), password: body.password }),
      cache: "no-store",
    });
    const payload = await readJsonSafely(upstream) as {
      status?: string;
      message?: string;
      data?: { token?: string; user?: Partial<SessionUser>; role?: string };
    } | null;

    if (!upstream.ok || payload?.status !== "success" || !payload.data?.token) {
      return NextResponse.json(
        { message: payload?.message ?? "Không thể đăng nhập. Vui lòng thử lại." },
        { status: upstream.status >= 400 ? upstream.status : 401 },
      );
    }

    const sourceUser = payload.data.user;
    const user: SessionUser = {
      userID: Number(sourceUser?.userID),
      userRole: payload.data.role ?? sourceUser?.userRole ?? "teacher",
      name: sourceUser?.name ?? "",
      username: sourceUser?.username ?? body.username.trim(),
      phone: sourceUser?.phone ?? "",
      email: sourceUser?.email ?? "",
    };
    if (!Number.isFinite(user.userID) || user.userID <= 0) {
      return NextResponse.json({ message: "Phản hồi đăng nhập không hợp lệ." }, { status: 502 });
    }

    const response = NextResponse.json({ user });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: payload.data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    response.cookies.set({
      name: SESSION_USER_COOKIE,
      value: encodeSessionUser(user),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ message: "Không thể kết nối máy chủ chấm công." }, { status: 502 });
  }
}
