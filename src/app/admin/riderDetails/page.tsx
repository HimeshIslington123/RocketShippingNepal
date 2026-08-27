"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Loader2,
  Plus,
  X,
  UserPlus,
} from "lucide-react";
import dynamic from "next/dynamic";

const RiderMap = dynamic(() => import("@/components/RiderMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-xl">
      <Loader2 className="animate-spin" />
    </div>
  ),
});

interface Rider {
  id: number;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  isAvailable: boolean;

  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Location {
  latitude: number;
  longitude: number;
}

interface RiderForm {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<Location | null>(null);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Create loading
  const [creating, setCreating] = useState(false);

  // Form
  const [form, setForm] = useState<RiderForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // ============================================================
  // GET RIDERS
  // ============================================================

  const fetchRiders = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://evolving-tech.onrender.com/api/rider"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch riders");
      }

      const data = await res.json();

      setRiders(data);
    } catch (error) {
      console.error("Error fetching riders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  // ============================================================
  // FORM INPUT
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // CREATE RIDER
  // ============================================================

  const handleCreateRider = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setCreating(true);

      const res = await fetch(
        "https://evolving-tech.onrender.com/api/rider",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to create rider"
        );
      }

      alert("Rider created successfully!");

      // Close modal
      setShowModal(false);

      // Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      // Refresh rider table
      fetchRiders();

    } catch (error) {
      console.error("Create rider error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create rider"
      );

    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // VIEW LOCATION
  // ============================================================

  const handleViewLocation = (rider: Rider) => {
    if (
      rider.latitude === null ||
      rider.longitude === null
    ) {
      alert("Location is not available for this rider.");
      return;
    }

    setSelectedRider(rider);

    setLocation({
      latitude: rider.latitude,
      longitude: rider.longitude,
    });
  };

  return (
    <div className="p-6 space-y-6">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Riders
          </h1>

          <p className="text-gray-500">
            Manage riders and view their current locations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Add New Rider
        </button>

      </div>

      {/* ========================================================
          RIDERS TABLE
      ======================================================== */}

      <div className="overflow-x-auto rounded-xl border bg-white text-black">

        <table className="w-full text-sm">

          <thead className="border-b bg-gray-50">

            <tr>

              <th className="px-4 py-3 text-left">
                Rider
              </th>

              <th className="px-4 py-3 text-left">
                Phone
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

              <th className="px-4 py-3 text-left">
                Location
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan={4}
                  className="py-10 text-center"
                >
                  <Loader2
                    className="mx-auto animate-spin"
                    size={24}
                  />
                </td>
              </tr>

            ) : riders.length === 0 ? (

              <tr>
                <td
                  colSpan={4}
                  className="py-10 text-center text-gray-500"
                >
                  No riders found.
                </td>
              </tr>

            ) : (

              riders.map((rider) => (

                <tr
                  key={rider.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >

                  {/* RIDER */}

                  <td className="px-4 py-4">

                    <div>

                      <p className="font-medium">
                        {rider.user?.name || "Unknown Rider"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {rider.user?.email}
                      </p>

                    </div>

                  </td>

                  {/* PHONE */}

                  <td className="px-4 py-4">
                    {rider.phone}
                  </td>

                  {/* STATUS */}

                  <td className="px-4 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        rider.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {rider.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>

                  </td>

                  {/* LOCATION */}

                  <td className="px-4 py-4">

                    <button
                      onClick={() =>
                        handleViewLocation(rider)
                      }
                      disabled={
                        rider.latitude === null ||
                        rider.longitude === null
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MapPin size={16} />

                      {rider.latitude === null ||
                      rider.longitude === null
                        ? "No Location"
                        : "View Location"}
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ========================================================
          MAP
      ======================================================== */}

      {location && selectedRider && (

        <div className="rounded-2xl border bg-white p-5 text-black">

          <div className="mb-4">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  {selectedRider.user?.name}'s Location
                </h2>

                <p className="text-sm text-gray-500">
                  {location.latitude},{" "}
                  {location.longitude}
                </p>

              </div>

              <button
                onClick={() => {
                  setLocation(null);
                  setSelectedRider(null);
                }}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

          </div>

          <RiderMap
            latitude={location.latitude}
            longitude={location.longitude}
          />

        </div>

      )}

      {/* ========================================================
          ADD RIDER MODAL
      ======================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-black shadow-2xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <UserPlus size={20} />
                </div>

                <div>

                  <h2 className="text-xl font-semibold">
                    Add New Rider
                  </h2>

                  <p className="text-sm text-gray-500">
                    Create a rider account.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateRider}
              className="space-y-4"
            >

              {/* NAME */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ram Bahadur"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ram@gmail.com"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9841555676"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border px-4 py-3 font-medium transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {creating ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Rider
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}