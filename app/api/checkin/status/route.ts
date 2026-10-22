import { NextRequest, NextResponse } from "next/server";
import { backendUrl, readJsonSafely } from "@/lib/backend";
import { decodeSessionUser, SESSION_COOKIE, SESSION_USER_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = decodeSessionUser(request.cookies.get(SESSION_USER_COOKIE)?.value);
  if (!token || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const upstream = await fetch(
      backendUrl(`/chamcong/status/user/${user.userID}?role=${encodeURIComponent(user.userRole)}`),
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" },
    );
    const payload = await readJsonSafely(upstream) as { data?: { status?: string }; message?: string } | null;
    if (!upstream.ok) return NextResponse.json({ message: payload?.message ?? "Không tải được trạng thái chấm công." }, { status: upstream.status });
    const isCheckedIn = payload?.data?.status === "Checked-in";
    let checkinLocation: { latitude: number; longitude: number } | null = null;
    let checkinMapPlaceId: number | string | null = null;
    if (isCheckedIn) {
      const today = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
      const history = await fetch(
        backendUrl(`/chamcong/history?user=${user.userID}&date=${encodeURIComponent(today)}&role=${encodeURIComponent(user.userRole)}`),
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" },
      );
      const historyPayload = await readJsonSafely(history) as { data?: Array<{ latitude?: number; longitude?: number; mapPlaceID?: number | string }> } | null;
      const latest = historyPayload?.data?.[0];
      if (Number.isFinite(latest?.latitude) && Number.isFinite(latest?.longitude)) {
        checkinLocation = { latitude: Number(latest?.latitude), longitude: Number(latest?.longitude) };
      }
      checkinMapPlaceId = latest?.mapPlaceID ?? null;
    }
    return NextResponse.json({ isCheckedIn, checkinLocation, checkinMapPlaceId });
  } catch {
    return NextResponse.json({ message: "Không thể kết nối máy chủ chấm công." }, { status: 502 });
  }
}
