"use client";

import { useEffect, useState } from "react";

export default function RiderTracker() {
  const [status, setStatus] = useState("Starting GPS...");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("REAL RIDER GPS:", {
          latitude,
          longitude,
        });

        setLocation({
          latitude,
          longitude,
        });

        setStatus("GPS active");

        try {
          const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/rider/location`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(
              "Failed to update rider location"
            );
          }

          const data = await response.json();

          console.log(
            "LOCATION SENT TO BACKEND:",
            data
          );
        } catch (error) {
          console.error(
            "LOCATION SEND ERROR:",
            error
          );

          setStatus("Failed to send location");
        }
      },
      (error) => {
        console.error("GPS ERROR:", error);
        setStatus(error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="mt-4 rounded-lg bg-gray-100 p-4">
      <p className="font-semibold">
        Rider GPS: {status}
      </p>

      {location && (
        <div className="mt-2 text-sm">
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      )}
    </div>
  );
}