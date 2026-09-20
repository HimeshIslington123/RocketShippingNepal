"use client";

import dynamic from "next/dynamic";
import {
  useState,
} from "react";

import {
  CarFront,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

/* ============================================================
   MAP
============================================================ */

const RiderMap = dynamic(
  () => import("@/components/RiderMap"),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-[450px] w-full items-center justify-center rounded-2xl bg-gray-100">
        <Loader2
          className="h-7 w-7 animate-spin text-[#0b1729]"
        />
      </div>
    ),
  },
);

/* ============================================================
   TYPES
============================================================ */

interface TrackedRider {
  id: number;

  name: string;

  vehicleType: string | null;

  vehicleNumber: string | null;

  isAvailable: boolean;

  latitude: number | null;

  longitude: number | null;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

/* ============================================================
   PAGE
============================================================ */

export default function TrackVehiclePage() {
  /* ==========================================================
     SEARCH
  ========================================================== */

  const [vehicleNumber, setVehicleNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ==========================================================
     RESULT
  ========================================================== */

  const [rider, setRider] =
    useState<TrackedRider | null>(null);

  /* ==========================================================
     TRACK VEHICLE
  ========================================================== */

  const handleTrackVehicle = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const cleanedVehicleNumber =
      vehicleNumber.trim();

    if (!cleanedVehicleNumber) {
      setError(
        "Please enter a vehicle number.",
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      setRider(null);

      /*
       * encodeURIComponent is important because
       * vehicle numbers contain spaces.
       */

      const encodedVehicleNumber =
        encodeURIComponent(
          cleanedVehicleNumber,
        );

      const response = await fetch(
        `${API_URL}/api/rider/track/${encodedVehicleNumber}`,
        {
          method: "GET",

          cache: "no-store",

          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Vehicle not found (${response.status})`,
        );
      }

      if (!data?.rider) {
        throw new Error(
          "No rider information was returned.",
        );
      }

      setRider(data.rider);
    } catch (err) {
      console.error(
        "Track vehicle error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to track vehicle.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     CLEAR SEARCH
  ========================================================== */

  const clearSearch = () => {
    setVehicleNumber("");

    setRider(null);

    setError("");
  };

  /* ==========================================================
     PAGE
  ========================================================== */

  return (<>
  <Navbar></Navbar>
    <main className="min-h-screen bg-gray-50 px-4 pb-16 pt-28 text-[#0b1729] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mx-auto max-w-2xl text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E23C2E] text-white shadow-sm">
            <Truck size={26} />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Track Your Vehicle
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Enter your vehicle number to see
            the rider and their current
            delivery location.
          </p>

        </div>

        {/* ==================================================
            SEARCH CARD
        ================================================== */}

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

          <form
            onSubmit={
              handleTrackVehicle
            }
          >

            <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
              Vehicle Number
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <CarFront
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(
                      e.target.value,
                    )
                  }
                  placeholder="BA 12 PA 3456"
                  autoComplete="off"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    py-3.5
                    pl-11
                    pr-4
                    text-sm
                    font-medium
                    uppercase
                    outline-none
                    transition
                    placeholder:normal-case
                    placeholder:text-gray-400
                    focus:border-[#E23C2E]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-[#E23C2E]/10
                  "
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  inline-flex
                  h-[52px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#E23C2E]
                  px-7
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#CE3122]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />

                    Track Vehicle
                  </>
                )}

              </button>

            </div>

          </form>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              <XCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Vehicle not found
                </p>

                <p className="mt-0.5 text-red-600">
                  {error}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* ==================================================
            RESULT
        ================================================== */}

        {rider && (
          <div className="mt-8 space-y-5">

            {/* =================================================
                RIDER INFO
            ================================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                {/* RIDER */}

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0b1729] text-white">
                    <User size={25} />
                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Delivery Rider
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#0b1729]">
                      {rider.name}
                    </h2>

                  </div>

                </div>

                {/* STATUS */}

                <div>
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      ${
                        rider.isAvailable
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >

                    <span
                      className={`
                        h-2
                        w-2
                        rounded-full
                        ${
                          rider.isAvailable
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }
                      `}
                    />

                    {rider.isAvailable
                      ? "Available"
                      : "Currently Unavailable"}

                  </span>
                </div>

              </div>

              {/* VEHICLE DETAILS */}

              <div className="grid grid-cols-1 border-t border-gray-100 sm:grid-cols-2">

                {/* TYPE */}

                <div className="border-b border-gray-100 p-5 sm:border-r sm:border-b-0 sm:p-6">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Vehicle Type
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <CarFront
                      size={18}
                      className="text-[#E23C2E]"
                    />

                    <p className="font-semibold text-[#0b1729]">
                      {rider.vehicleType ||
                        "Not provided"}
                    </p>

                  </div>

                </div>

                {/* NUMBER */}

                <div className="p-5 sm:p-6">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Vehicle Number
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <Truck
                      size={18}
                      className="text-[#E23C2E]"
                    />

                    <p className="font-semibold uppercase text-[#0b1729]">
                      {rider.vehicleNumber ||
                        "Not provided"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                LOCATION
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              {/* MAP HEADER */}

              <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E23C2E]">
                    <MapPin size={21} />
                  </div>

                  <div>

                    <h2 className="font-bold text-[#0b1729]">
                      Current Vehicle Location
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Live location reported by
                      the rider.
                    </p>

                  </div>

                </div>

                {rider.latitude !== null &&
                  rider.longitude !==
                    null && (
                    <div className="rounded-xl bg-gray-50 px-4 py-2 text-xs text-gray-500">

                      <span className="font-medium text-[#0b1729]">
                        Coordinates:
                      </span>{" "}

                      {rider.latitude.toFixed(
                        6,
                      )}
                      ,{" "}
                      {rider.longitude.toFixed(
                        6,
                      )}

                    </div>
                  )}

              </div>

              {/* MAP */}

              <div className="p-4 sm:p-5">

                {rider.latitude !== null &&
                rider.longitude !==
                  null ? (
                  <RiderMap
                    latitude={
                      rider.latitude
                    }
                    longitude={
                      rider.longitude
                    }
                  />
                ) : (
                  <div className="flex h-[450px] flex-col items-center justify-center rounded-2xl bg-gray-100 px-6 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                      <MapPin size={25} />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#0b1729]">
                      Location unavailable
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-gray-500">
                      This rider has not sent
                      a current GPS location yet.
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                TRACK ANOTHER
            ================================================= */}

            <div className="flex justify-center pb-5">

              <button
                type="button"
                onClick={
                  clearSearch
                }
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0b1729] shadow-sm transition hover:border-[#E23C2E] hover:bg-red-50 hover:text-[#E23C2E]"
              >
                <Search size={17} />

                Track Another Vehicle

              </button>

            </div>

          </div>
        )}

      </div>
    </main>
    <Footer></Footer>
    </>
  );
}