"use client";

import RiderTracker from "@/components/RiderTracker";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const RiderMap = dynamic(
  () => import("@/components/RiderMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-2xl bg-gray-100 flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
);

export default function RiderLocationPage() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const getRiderLocation = async () => {
      try {
       const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/rider/location`
);

        if (!response.ok) {
          throw new Error(
            "Failed to get rider location"
          );
        }

        const data = await response.json();

        console.log(
          "LOCATION FROM BACKEND:",
          data
        );

        setLocation({
          latitude: data.rider.latitude,
          longitude: data.rider.longitude,
        });
      } catch (error) {
        console.error(
          "Failed to get rider location:",
          error
        );
      }
    };

    getRiderLocation();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Rider Location
      </h1>

      <div className="mt-6">
        {location ? (
          <RiderMap
            latitude={location.latitude}
            longitude={location.longitude}
          />
        ) : (
          <div>
            Finding rider location...
          </div>
        )}
      </div>

      <RiderTracker />
    </div>
  );
}