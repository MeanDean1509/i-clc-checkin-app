import { NextRequest, NextResponse } from "next/server";
import { backendUrl, readJsonSafely } from "@/lib/backend";
import { decodeSessionUser, SESSION_COOKIE, SESSION_USER_COOKIE } from "@/lib/session";

type Coordinates = { latitude: number; longitude: number };

function readCoordinates(value: FormDataEntryValue | null): Coordinates | null {
  if (typeof value !== "string") return null;
  try {
    const coordinates = JSON.parse(value) as Coordinates;
    return Number.isFinite(coordinates.latitude) && Number.isFinite(coordinates.longitude) ? coordinates : null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = decodeSessionUser(request.cookies.get(SESSION_USER_COOKIE)?.value);
  if (!token || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const incoming = await request.formData();
  const photo = incoming.get("photo");
  const mode = incoming.get("mode");
  const coordinates = readCoordinates(incoming.get("coordinates"));
  const origin = readCoordinates(incoming.get("origin"));
  const note = incoming.get("note");
  if (!(photo instanceof File) || !photo.type.startsWith("image/") || photo.size > 5 * 1024 * 1024 || !coordinates || (mode !== "checkin" && mode !== "checkout")) {
    return NextResponse.json({ message: "Dữ liệu chấm công không hợp lệ." }, { status: 400 });
  }
  if (mode === "checkout" && !origin) return NextResponse.json({ message: "Không tìm thấy vị trí check-in ban đầu." }, { status: 400 });

  const now = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().replace("Z", "");
  const form = new FormData();
  form.append("NguoiChamCong", String(user.userID));
  form.append("ThoiGian", now);
  form.append("Loai", user.userRole === "staff" ? "1" : "2");
  form.append("DiaChi", `${mode === "checkout" ? origin?.latitude : coordinates.latitude},${mode === "checkout" ? origin?.longitude : coordinates.longitude}`);
  if (mode === "checkout") form.append("DiaChiCheckout", `${coordinates.latitude},${coordinates.longitude}`);
  form.append("HinhThuc", "2");
  form.append("File", photo, "attendance-photo.jpg");
  form.append("GhiChu", typeof note === "string" ? note.slice(0, 250) : "");

  try {
    const upstream = await fetch(backendUrl("/chamcong"), { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, body: form, cache: "no-store" });
    const payload = await readJsonSafely(upstream) as { status?: string; message?: string } | null;
    if (!upstream.ok || payload?.status !== "success") return NextResponse.json({ message: payload?.message ?? "Chấm công không thành công." }, { status: upstream.status >= 400 ? upstream.status : 400 });
    return NextResponse.json({ ok: true, message: payload.message ?? "Chấm công thành công." });
  } catch { return NextResponse.json({ message: "Không thể kết nối máy chủ chấm công." }, { status: 502 }); }
}
