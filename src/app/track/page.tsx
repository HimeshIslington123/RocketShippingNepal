"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TrackPage() {
  const router = useRouter();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const tracking = trackingNumber.trim();

    if (!tracking) {
      setError("Please enter a tracking number.");
      return;
    }

    setError("");

    router.push(
      `/track/${encodeURIComponent(tracking)}`
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F5F6F8] px-6 pb-20 pt-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center">

          {/* Heading */}
          <h1 className="text-center text-4xl font-bold text-slate-900">
            Track Your Shipment
          </h1>

          <p className="mt-3 text-center text-slate-500">
            Enter your tracking number to view the latest shipment status.
          </p>

          {/* Tracking Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <label
              htmlFor="trackingNumber"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Tracking Number
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="trackingNumber"
                type="text"
                value={trackingNumber}
                onChange={(e) => {
                  setTrackingNumber(e.target.value);
                  setError("");
                }}
                placeholder="e.g. RC-1788241519362-261"
                className="h-12 flex-1 rounded-xl border border-slate-300 px-4 text-sm text-slate-900 outline-none transition focus:border-[#0F2A4A] focus:ring-2 focus:ring-[#0F2A4A]/10"
              />

              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B5321F] px-6 text-sm font-semibold text-white transition hover:bg-[#9c2a1a]"
              >
                <Search className="h-4 w-4" />
                Track
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </form>

          {/* Help Text */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Enter the tracking number provided when your shipment was created.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}