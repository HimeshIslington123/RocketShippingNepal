"use client";

import { useEffect, useState } from "react";

interface Vendor {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
}

interface Pickup {
  id: number;
  totalPackages: number;
  pickupAddress: string;
  pickupPhone: string;
  status: "REQUESTED" | "RECEIVED" | "CANCELLED";
  notes?: string | null;
  createdAt: string;
  vendor: Vendor;
}

export default function StaffPickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==============================
  // GET ALL PICKUP REQUESTS
  // ==============================

  const getAllPickups = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups/all`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch pickup requests"
        );
      }

      setPickups(data.pickups || []);

    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pickup requests"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getAllPickups();
  }, []);


  // ==============================
  // STATUS STYLE
  // ==============================

  const getStatusStyle = (status: Pickup["status"]) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-700";

      case "RECEIVED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Pickup Requests
          </h1>

          <p className="mt-2 text-gray-500">
            View pickup requests submitted by vendors.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}


        {/* TABLE CARD */}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex items-center justify-between border-b px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                All Pickup Requests
              </h2>

              <p className="text-sm text-gray-500">
                {pickups.length} request
                {pickups.length !== 1 ? "s" : ""}
              </p>

            </div>


            <button
              onClick={getAllPickups}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="px-6 py-12 text-center text-gray-500">
              Loading pickup requests...
            </div>

          ) : pickups.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <p className="text-gray-500">
                No pickup requests found.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr className="border-b">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Pickup
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Vendor
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Packages
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Pickup Address
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Requested
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pickups.map((pickup) => (

                    <tr
                      key={pickup.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >

                      {/* PICKUP ID */}

                      <td className="whitespace-nowrap px-6 py-5">

                        <span className="font-semibold text-gray-900">
                          #{pickup.id}
                        </span>

                      </td>


                      {/* VENDOR */}

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-medium text-gray-900">
                            {pickup.vendor.companyName}
                          </p>

                          <p className="text-sm text-gray-500">
                            Vendor #{pickup.vendor.id}
                          </p>

                        </div>

                      </td>


                      {/* PACKAGES */}

                      <td className="px-6 py-5">

                        <span className="font-semibold text-gray-900">
                          {pickup.totalPackages}
                        </span>

                      </td>


                      {/* ADDRESS */}

                      <td className="max-w-xs px-6 py-5">

                        <p className="truncate text-sm text-gray-700">
                          {pickup.pickupAddress}
                        </p>

                      </td>


                      {/* PHONE */}

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                        {pickup.pickupPhone}
                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            pickup.status
                          )}`}
                        >
                          {pickup.status}
                        </span>

                      </td>


                      {/* DATE */}

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">

                        {new Date(
                          pickup.createdAt
                        ).toLocaleDateString()}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}