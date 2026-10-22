"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import { ClipboardCheck, LocateFixed } from "lucide-react";

const CheckinMap = dynamic(() => import("./checkin-map"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-[#e7d7ea]" />,
});

type DashboardShellProps = { userName: string };

type Position = { latitude: number; longitude: number };
type CheckinPlace = Position & { id: number | string; name: string };

// A map can load without GPS. We ask for live location only from the Check In
// action, where the browser may show its permission prompt.
const DEFAULT_MAP_CENTER: Position = { latitude: 10.762622, longitude: 106.660172 };

export default function DashboardShell({ userName }: DashboardShellProps) {
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [checkinLocation, setCheckinLocation] = useState<Position | null>(null);
  const [checkinMapPlaceId, setCheckinMapPlaceId] = useState<number | string | null>(null);
  const [locations, setLocations] = useState<CheckinPlace[]>([]);

  useEffect(() => {
    fetch("/api/checkin/status", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { isCheckedIn?: boolean; checkinLocation?: Position | null; checkinMapPlaceId?: number | string | null };
        setIsCheckedIn(Boolean(result.isCheckedIn));
        setCheckinLocation(result.checkinLocation ?? null);
        setCheckinMapPlaceId(result.checkinMapPlaceId ?? null);
      })
      .finally(() => setIsLoadingStatus(false));
  }, []);

  useEffect(() => {
    fetch("/api/checkin/locations", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ locations?: CheckinPlace[] }> : null)
      .then((result) => setLocations(result?.locations ?? []))
      .catch(() => setLocations([]));

    requestMapLocation();
  }, []);

  function requestMapLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (result) => setPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 120_000 },
    );
  }

  function startAttendance() {
    if (position) {
      openCamera(position);
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("This device does not support location services.");
      return;
    }
    setLocationError("");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const nextPosition = { latitude: result.coords.latitude, longitude: result.coords.longitude };
        setPosition(nextPosition);
        setIsLocating(false);
        openCamera(nextPosition);
      },
      () => {
        setLocationError("Unable to get your location. Allow location access and try again.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }

  function openCamera(currentPosition: Position) {
    sessionStorage.setItem("checkin_position", JSON.stringify(currentPosition));
    if (checkinLocation) sessionStorage.setItem("checkin_origin", JSON.stringify(checkinLocation));
    router.push(`/attendance/camera?mode=${isCheckedIn ? "checkout" : "checkin"}`);
  }

  const mapCenter = position ?? checkinLocation ?? locations[0] ?? DEFAULT_MAP_CENTER;
  const checkinPlaceName = locations.find((location) => String(location.id) === String(checkinMapPlaceId))?.name || nearestPlaceName(checkinLocation, locations);

  return (
    <main className="min-h-dvh bg-[#f8f8ff] pb-24">
      <section className="mx-auto w-full max-w-[430px] px-4 pt-5">
        <div className="mb-4"><h2 className="text-2xl font-bold text-brand">Hello, {userName}</h2></div>
        <div className="relative h-[22rem] overflow-hidden rounded-[1.625rem] bg-[#e7d7ea] shadow-sm sm:h-[26rem]"><CheckinMap center={mapCenter} currentPosition={position} checkinLocation={checkinLocation} locations={locations} onRequestCurrentPosition={requestMapLocation} /></div>
        <section className="mt-4 rounded-[1.375rem] bg-white p-4 shadow-sm">{isCheckedIn ? <p className="mb-3 text-center text-sm text-zinc-600">Checked in at <span className="font-semibold text-zinc-900">{checkinPlaceName || "your check-in location"}</span></p> : null}{locationError ? <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{locationError}</p> : null}<button onClick={startAttendance} disabled={isLocating || isLoadingStatus} className="flex h-13 w-full items-center justify-center gap-2 rounded-[0.9375rem] bg-brand font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{position ? <ClipboardCheck size={19} aria-hidden="true" /> : <LocateFixed size={19} aria-hidden="true" />}{isLocating ? "GETTING LOCATION…" : isCheckedIn ? "CHECK OUT" : "CHECK IN"}</button></section>
      </section>
      <AppNav active="checkin" />
    </main>
  );
}

function nearestPlaceName(checkinLocation: Position | null, locations: CheckinPlace[]) {
  if (!checkinLocation || !locations.length) return null;
  return locations.reduce((nearest, location) => {
    const nearestDistance = (nearest.latitude - checkinLocation.latitude) ** 2 + (nearest.longitude - checkinLocation.longitude) ** 2;
    const locationDistance = (location.latitude - checkinLocation.latitude) ** 2 + (location.longitude - checkinLocation.longitude) ** 2;
    return locationDistance < nearestDistance ? location : nearest;
  }).name;
}

