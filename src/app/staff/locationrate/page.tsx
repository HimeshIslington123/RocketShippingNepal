"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
} from "lucide-react";
import axios from "axios";

type Rate = {
  id: number;
  location: string;
  price: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LocationRatePage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);

  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  // =========================
  // GET ALL LOCATIONS
  // =========================
  const fetchLocations = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/locationRate/getlocation`
      );

      setRates(res.data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // =========================
  // OPEN CREATE MODAL
  // =========================
  const handleAdd = () => {
    setEditingRate(null);
    setLocation("");
    setPrice("");
    setIsModalOpen(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const handleEdit = (item: Rate) => {
    setEditingRate(item);
    setLocation(item.location);
    setPrice(String(item.price));
    setIsModalOpen(true);
  };

  // =========================
  // CREATE OR UPDATE
  // =========================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!location || !price) {
      alert("Location and price are required");
      return;
    }

    try {
      setSubmitting(true);

      if (editingRate) {
        // UPDATE
        await axios.put(
          `${API_URL}/api/locationRate/${editingRate.id}`,
          {
            location,
            price: Number(price),
          }
        );
      } else {
        // CREATE
        await axios.post(
          `${API_URL}/api/locationRate/createLocation`,
          {
            location,
            price: Number(price),
          }
        );
      }

      await fetchLocations();

      setIsModalOpen(false);
      setLocation("");
      setPrice("");
      setEditingRate(null);

    } catch (error: any) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this location?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/api/locationRate/${id}`
      );

      setRates((prev) =>
        prev.filter((item) => item.id !== id)
      );

    } catch (error: any) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete location"
      );
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filtered = rates.filter((r) =>
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl text-black">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="font-display text-2xl font-bold">
            Location Rates
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage delivery rates by location.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-dark"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </button>

      </div>

      {/* SEARCH */}
      <div className="relative mt-6">

        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

        <input
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-accent"
        />

      </div>

      {/* LOADING */}
      {loading && (
        <div className="py-10 text-center text-gray-500">
          Loading locations...
        </div>
      )}

      {/* MOBILE */}
      {!loading && (
        <div className="mt-6 space-y-4 lg:hidden">

          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >

              <div className="flex justify-between">

                <div>
                  <h3 className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-accent" />
                    {item.location}
                  </h3>
                </div>

              </div>

              <div className="mt-5">

                <p className="text-xs text-gray-500">
                  Delivery Rate
                </p>

                <p className="font-semibold">
                  Rs. {item.price}
                </p>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  onClick={() => handleEdit(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* DESKTOP */}
      {!loading && (
        <div className="mt-6 hidden overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:block">

          <table className="w-full text-left">

            <thead className="border-b">
              <tr className="text-sm text-gray-500">

                <th className="p-4">Location</th>

                <th className="p-4">
                  Delivery Rate
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0"
                >

                  <td className="p-4 font-medium">
                    {item.location}
                  </td>

                  <td className="p-4">
                    Rs. {item.price}
                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </td>

                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-gray-500"
                  >
                    No locations found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">

                {editingRate
                  ? "Edit Location"
                  : "Add Location"}

              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >

              {/* LOCATION */}
              <div>

                <label className="mb-1 block text-sm font-medium">
                  Location
                </label>

                <input
                  type="text"
                  placeholder="e.g. Kathmandu"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-accent"
                />

              </div>

              {/* PRICE */}
              <div>

                <label className="mb-1 block text-sm font-medium">
                  Delivery Price
                </label>

                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-accent"
                />

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-accent px-5 py-2 font-semibold text-white disabled:opacity-50"
                >

                  {submitting
                    ? "Saving..."
                    : editingRate
                    ? "Update Location"
                    : "Create Location"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}