"use client";

import { useState } from "react";
import {
  MapPin,
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";

type Rate = {
  id: number;
  location: string;
  province: string;
  standard: number;

  status: "Active" | "Inactive";
};

const initialRates: Rate[] = [
  {
    id: 1,
    location: "Kathmandu",
    province: "Bagmati",
    standard: 200,

    status: "Active",
  },
  {
    id: 2,
    location: "Pokhara",
    province: "Gandaki",
    standard: 250,

    status: "Active",
  },
  {
    id: 3,
    location: "Biratnagar",
    province: "Koshi",
    standard: 300,
  
    status: "Active",
  },
];

export default function LocationRatePage() {
  const [rates] = useState(initialRates);
  const [search, setSearch] = useState("");

  const filtered = rates.filter((r) =>
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Location Rates
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage delivery rates by location.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-dark">
          <Plus className="h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

        <input
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-accent"
        />
      </div>

      {/* Mobile */}
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

                <p className="mt-1 text-sm text-gray-500">
                  {item.province}
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {item.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Standard</p>
                <p className="font-semibold">
                  Rs. {item.standard}
                </p>
              </div>

              
            </div>

            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-lg bg-blue-600 py-2 text-white">
                Edit
              </button>

              <button className="flex-1 rounded-lg bg-red-600 py-2 text-white">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="mt-6 hidden overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:block">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr className="text-sm text-gray-500">
              <th className="p-4">Location</th>
              <th className="p-4">Province</th>
              <th className="p-4">Standard Rate</th>
          
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="p-4 font-medium">
                  {item.location}
                </td>

                <td className="p-4">{item.province}</td>

                <td className="p-4">
                  Rs. {item.standard}
                </td>

               

                <td className="p-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {item.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700">
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}