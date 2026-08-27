"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

type RiderMapProps = {
  latitude: number;
  longitude: number;
};

const riderIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 42px;
      height: 42px;
      background: #2563eb;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 3px 12px rgba(0,0,0,0.30);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

export default function RiderMap({
  latitude,
  longitude,
}: RiderMapProps) {
  const [locationName, setLocationName] =
    useState("Finding location...");

  useEffect(() => {
    const getLocationName = async () => {
      try {
       const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/locationRate/reverse?lat=${latitude}&lon=${longitude}`
);
        if (!response.ok) {
          throw new Error("Failed to get location");
        }

        const data = await response.json();

        setLocationName(
          data.displayName || "Unknown location"
        );
      } catch (error) {
        console.error("Reverse geocoding error:", error);

        setLocationName("Location unavailable");
      }
    };

    getLocationName();
  }, [latitude, longitude]);

  return (
    <div className="relative h-[450px] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-lg">

      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={true}
        zoomControl={true}
        className="h-full w-full"
      >

        {/* LIGHT MAP */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* LOCATION ACCURACY CIRCLE */}
        <Circle
          center={[latitude, longitude]}
          radius={80}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.10,
            weight: 1,
          }}
        />

        {/* RIDER */}
        <Marker
          position={[latitude, longitude]}
          icon={riderIcon}
        >
          {/* HOVER LOCATION */}
          <Tooltip
            direction="top"
            offset={[0, -20]}
            opacity={1}
            sticky
          >
            <div className="px-1 py-1">
              <div className="font-semibold">
                🚴 Rider
              </div>

              <div className="mt-1 text-sm">
                📍 {locationName}
              </div>
            </div>
          </Tooltip>
        </Marker>

      </MapContainer>

      {/* ONLINE STATUS */}
      <div className="absolute left-4 top-4 z-[1000] rounded-xl bg-white px-4 py-3 shadow-md border border-gray-200">

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />

          <span className="text-sm font-semibold text-gray-800">
            Rider Location
          </span>
        </div>

        <div className="mt-1 text-xs text-gray-500">
          {locationName}
        </div>

      </div>

    </div>
  );
}