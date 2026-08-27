"use client";

import RiderDeliveryTable from "@/components/RiderDeliveryTable";

export default function RiderPage() {
  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Deliveries
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage your assigned deliveries.
        </p>
      </div>

      <RiderDeliveryTable />

    </div>
  );
}