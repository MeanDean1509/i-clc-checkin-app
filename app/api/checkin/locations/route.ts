import { NextRequest, NextResponse } from "next/server";
import { backendUrl, readJsonSafely } from "@/lib/backend";
import { SESSION_COOKIE } from "@/lib/session";

type UpstreamPlace = {
  id?: number;
  placeName?: string;
  customerName?: string;
  branchName?: string;
  latitude?: number;
  longitude?: number;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const upstream = await fetch(backendUrl("/map_place/location"), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await readJsonSafely(upstream) as { data?: UpstreamPlace[]; message?: string } | null;
    if (!upstream.ok) return NextResponse.json({ message: payload?.message ?? "Không tải được địa điểm check-in." }, { status: upstream.status });

    const locations = (payload?.data ?? [])
      .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
      .map((place) => ({
        id: place.id ?? `${place.latitude}-${place.longitude}`,
        name: place.placeName || [place.customerName, place.branchName].filter(Boolean).join(" - ") || "Địa điểm check-in",
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
      }));

    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json({ message: "Không thể kết nối máy chủ chấm công." }, { status: 502 });
  }
}
