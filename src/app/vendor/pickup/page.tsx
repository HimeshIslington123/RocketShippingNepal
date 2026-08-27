"use client";

import { useEffect, useState } from "react";

interface Pickup {
  id: number;
  totalPackages: number;
  pickupAddress: string;
  pickupPhone: string;
  status: "REQUESTED" | "RECEIVED" | "CANCELLED";
  notes?: string | null;
  createdAt: string;
}

export default function PickupPage() {
  const [totalPackages, setTotalPackages] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [pickups, setPickups] = useState<Pickup[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =====================================
  // GET PICKUP REQUESTS
  // =====================================

  const getPickups = async () => {
    try {
      setFetching(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pickups");
      }

      setPickups(data.pickups || []);

    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch pickup requests"
      );

    } finally {
      setFetching(false);
    }
  };


  // Load pickups when page opens
  useEffect(() => {
    getPickups();
  }, []);


  // =====================================
  // CREATE PICKUP REQUEST
  // =====================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }


      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            totalPackages: Number(totalPackages),
            pickupAddress,
            pickupPhone,
            notes,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create pickup request"
        );
      }


      setMessage("Pickup request created successfully");


      // Clear form
      setTotalPackages("");
      setPickupAddress("");
      setPickupPhone("");
      setNotes("");


      // Refresh pickup list
      getPickups();

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================
  // STATUS STYLE
  // =====================================

  const getStatusStyle = (status: Pickup["status"]) => {

    if (status === "REQUESTED") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "RECEIVED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "CANCELLED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };


  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Pickup Request
          </h1>

          <p className="mt-2 text-gray-500">
            Request a pickup for your packages.
          </p>

        </div>


        {/* FORM */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Create Pickup Request
          </h2>


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* TOTAL PACKAGES */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Total Packages
              </label>

              <input
                type="number"
                min="1"
                value={totalPackages}
                onChange={(e) =>
                  setTotalPackages(e.target.value)
                }
                placeholder="Enter total packages"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {/* PICKUP ADDRESS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pickup Address
              </label>

              <input
                type="text"
                value={pickupAddress}
                onChange={(e) =>
                  setPickupAddress(e.target.value)
                }
                placeholder="Enter pickup address"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {/* PHONE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pickup Phone
              </label>

              <input
                type="tel"
                value={pickupPhone}
                onChange={(e) =>
                  setPickupPhone(e.target.value)
                }
                placeholder="Enter pickup phone"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {/* NOTES */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Optional notes"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {/* MESSAGE */}

            {message && (
              <div className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}


            {/* ERROR */}

            {error && (
              <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Sending Request..."
                : "Request Pickup"}
            </button>

          </form>

        </div>


        {/* PICKUP HISTORY */}

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-gray-900">
              My Pickup Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View your previous pickup requests.
            </p>

          </div>


          {fetching ? (

            <p className="text-gray-500">
              Loading pickup requests...
            </p>

          ) : pickups.length === 0 ? (

            <div className="rounded-lg bg-gray-50 p-8 text-center">

              <p className="text-gray-500">
                No pickup requests yet.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      ID
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Packages
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Address
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pickups.map((pickup) => (

                    <tr
                      key={pickup.id}
                      className="border-b last:border-0"
                    >

                      <td className="px-4 py-4 font-medium">
                        #{pickup.id}
                      </td>

                      <td className="px-4 py-4">
                        {pickup.totalPackages}
                      </td>

                      <td className="px-4 py-4">
                        {pickup.pickupAddress}
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            pickup.status
                          )}`}
                        >
                          {pickup.status}
                        </span>

                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500">

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