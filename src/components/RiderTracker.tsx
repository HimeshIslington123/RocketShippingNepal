
"use client";

import { useEffect, useState } from "react";

export default function RiderTracker() {
  const [status, setStatus] = useState("Starting GPS...");

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // ------------------------------------------------------------
    // CHECK BROWSER GEOLOCATION
    // ------------------------------------------------------------

    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by this browser");
      return;
    }

    // ------------------------------------------------------------
    // GET TOKEN FROM LOCAL STORAGE
    // ------------------------------------------------------------

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("NO AUTH TOKEN FOUND IN LOCAL STORAGE");
      setStatus("Authentication token not found. Please login again.");
      return;
    }

    console.log("AUTH TOKEN FOUND");

    // ------------------------------------------------------------
    // START WATCHING RIDER GPS
    // ------------------------------------------------------------

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("REAL RIDER GPS:", {
          latitude,
          longitude,
        });

        // ----------------------------------------------------------
        // UPDATE FRONTEND LOCATION
        // ----------------------------------------------------------

        setLocation({
          latitude,
          longitude,
        });

        setStatus("GPS active");

        // ----------------------------------------------------------
        // SEND LOCATION TO BACKEND
        // ----------------------------------------------------------

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/rider/location`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",

                // IMPORTANT
                // JWT stored in localStorage is sent here
                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                latitude,
                longitude,
              }),
            },
          );

          // --------------------------------------------------------
          // HANDLE UNAUTHORIZED
          // --------------------------------------------------------

          if (response.status === 401) {
            console.error(
              "401 UNAUTHORIZED - TOKEN WAS REJECTED BY BACKEND",
            );

            setStatus("Authentication failed. Please login again.");

            return;
          }

          // --------------------------------------------------------
          // HANDLE OTHER ERRORS
          // --------------------------------------------------------

          if (!response.ok) {
            const errorText = await response.text();

            console.error("LOCATION API ERROR:", {
              status: response.status,
              response: errorText,
            });

            throw new Error(
              `Failed to update rider location (${response.status})`,
            );
          }

          // --------------------------------------------------------
          // SUCCESS
          // --------------------------------------------------------

          const data = await response.json();

          console.log("LOCATION SENT TO BACKEND:", data);

          setStatus("GPS active • Location sent successfully");
        } catch (error) {
          console.error("LOCATION SEND ERROR:", error);

          setStatus("Failed to send location");
        }
      },

      // ------------------------------------------------------------
      // GPS ERROR
      // ------------------------------------------------------------

      (error) => {
        console.error("GPS ERROR:", error);

        setStatus(error.message);
      },

      // ------------------------------------------------------------
      // GPS OPTIONS
      // ------------------------------------------------------------

      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    // ------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // --------------------------------------------------------------
  // UI
  // --------------------------------------------------------------

  return (
    <div className="mt-4 rounded-lg bg-gray-100 p-4 text-black">
      <p className="font-semibold">{status}</p>

      {location && (
        <div className="mt-2 text-sm">
          <p>
            Latitude: {location.latitude}
          </p>

          <p>
            Longitude: {location.longitude}
          </p>
        </div>
      )}
    </div>
  );
}

