"use client";

import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { DivIcon, Icon } from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { LocateFixed } from "lucide-react";
import { MapPin } from "lucide-react";

type Position = { latitude: number; longitude: number };
type CheckinPlace = Position & { id: number | string; name: string };

const currentLocationIcon = new Icon({
  iconUrl: "/marker/marker.png",
  iconSize: [26, 26],
  iconAnchor: [13, 24],
  tooltipAnchor: [0, -22],
  className: "drop-shadow-md",
});

const checkinPlaceIcon = new DivIcon({
  html: renderToStaticMarkup(<MapPin size={30} strokeWidth={2.5} color="#662872" fill="#ffffff" />),
  className: "checkin-place-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  tooltipAnchor: [0, -25],
});

type CheckinMapProps = {
  center: Position;
  currentPosition: Position | null;
  checkinLocation: Position | null;
  locations: CheckinPlace[];
  onRequestCurrentPosition: () => void;
};

export default function CheckinMap({ center, currentPosition, checkinLocation, locations, onRequestCurrentPosition }: CheckinMapProps) {
  const coordinates: [number, number] = [center.latitude, center.longitude];

  return (
    <MapContainer center={coordinates} zoom={16} style={{ position: "absolute", inset: 0 }} zoomControl={false}>
      <MapViewport center={coordinates} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => <Marker key={location.id} position={[location.latitude, location.longitude]} icon={checkinPlaceIcon}><Tooltip>{location.name}</Tooltip></Marker>)}
      {checkinLocation ? <Marker position={[checkinLocation.latitude, checkinLocation.longitude]} icon={checkinPlaceIcon}><Tooltip>Current check-in location</Tooltip></Marker> : null}
      {currentPosition ? <Marker position={[currentPosition.latitude, currentPosition.longitude]} icon={currentLocationIcon}><Tooltip direction="top" offset={[0, -48]}>Your current location</Tooltip></Marker> : null}
      <CurrentLocationButton position={currentPosition} onRequestCurrentPosition={onRequestCurrentPosition} />
    </MapContainer>
  );
}

function CurrentLocationButton({ position, onRequestCurrentPosition }: { position: Position | null; onRequestCurrentPosition: () => void }) {
  const map = useMap();

  function focusCurrentLocation() {
    if (position) {
      map.flyTo([position.latitude, position.longitude], 16, { animate: true });
      return;
    }
    onRequestCurrentPosition();
  }

  return <button type="button" onClick={focusCurrentLocation} aria-label="Go to current location" className="absolute right-3 bottom-7 z-[1000] grid size-10 place-items-center rounded-xl bg-white text-brand shadow-md" title="Go to current location"><LocateFixed size={20} aria-hidden="true" /></button>;
}

function MapViewport({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}
