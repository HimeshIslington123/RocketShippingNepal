"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  X,
  UserPlus,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

interface Vendor {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
  userId: number;

  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };

  createdAt: string;
  updatedAt: string;
}

interface VendorForm {
  name: string;
  email: string;
  password: string;
  companyName: string;
  contactId: string;
  location: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<VendorForm>({
    name: "",
    email: "",
    password: "",
    companyName: "",
    contactId: "",
    location: "",
  });

  // ============================================================
  // GET VENDORS
  // ============================================================

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://evolving-tech.onrender.com/api/vendor/getvendor"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await res.json();

      setVendors(data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // ============================================================
  // FORM CHANGE
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
  // CREATE VENDOR
  // ============================================================

  const handleCreateVendor = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setCreating(true);

      const res = await fetch(
        "https://evolving-tech.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,

            // IMPORTANT
            role: "VENDOR",

            companyName: form.companyName,
            contactId: form.contactId,
            location: form.location,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to create vendor"
        );
      }

      alert("Vendor created successfully!");

      // Close modal
      setShowModal(false);

      // Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        companyName: "",
        contactId: "",
        location: "",
      });

      // Refresh vendor table
      fetchVendors();

    } catch (error) {
      console.error("Create vendor error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create vendor"
      );
    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (creating) return;

    setShowModal(false);

    setForm({
      name: "",
      email: "",
      password: "",
      companyName: "",
      contactId: "",
      location: "",
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
            Vendors
          </h1>

          <p className="text-gray-500">
            Manage your vendors and their information.
          </p>
        </div>

        {/* ADD VENDOR BUTTON */}

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />

          Add New Vendor
        </button>

      </div>

      {/* ========================================================
          VENDOR TABLE
      ======================================================== */}

      <div className="overflow-x-auto rounded-xl border bg-white text-black">

        <table className="w-full text-sm">

          <thead className="border-b bg-gray-50">

            <tr>

              <th className="px-4 py-3 text-left">
                Company
              </th>

              <th className="px-4 py-3 text-left">
                Contact
              </th>

              <th className="px-4 py-3 text-left">
                Location
              </th>

              <th className="px-4 py-3 text-left">
                Email
              </th>

              <th className="px-4 py-3 text-left">
                Created
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={5}
                  className="py-10 text-center"
                >

                  <Loader2
                    className="mx-auto animate-spin"
                    size={24}
                  />

                </td>

              </tr>

            ) : vendors.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500"
                >
                  No vendors found.
                </td>

              </tr>

            ) : (

              vendors.map((vendor) => (

                <tr
                  key={vendor.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >

                  {/* COMPANY */}

                  <td className="px-4 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Building2 size={18} />
                      </div>

                      <div>

                        <p className="font-medium">
                          {vendor.companyName}
                        </p>

                        <p className="text-xs text-gray-500">
                          {vendor.user?.name}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* CONTACT */}

                  <td className="px-4 py-4">

                    <div className="flex items-center gap-2">

                      <Phone
                        size={15}
                        className="text-gray-400"
                      />

                      <span>
                        {vendor.contactId}
                      </span>

                    </div>

                  </td>

                  {/* LOCATION */}

                  <td className="px-4 py-4">

                    <div className="flex items-center gap-2">

                      <MapPin
                        size={15}
                        className="text-gray-400"
                      />

                      <span>
                        {vendor.location}
                      </span>

                    </div>

                  </td>

                  {/* EMAIL */}

                  <td className="px-4 py-4">

                    <div className="flex items-center gap-2">

                      <Mail
                        size={15}
                        className="text-gray-400"
                      />

                      <span>
                        {vendor.user?.email}
                      </span>

                    </div>

                  </td>

                  {/* CREATED */}

                  <td className="px-4 py-4 text-gray-500">

                    {new Date(
                      vendor.createdAt
                    ).toLocaleDateString()}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ========================================================
          ADD VENDOR MODAL
      ======================================================== */}

      {showModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-black shadow-2xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <UserPlus size={20} />
                </div>

                <div>

                  <h2 className="text-xl font-semibold">
                    Add New Vendor
                  </h2>

                  <p className="text-sm text-gray-500">
                    Create a new vendor account.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateVendor}
              className="space-y-4"
            >

              {/* COMPANY NAME */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Company Name
                </label>

                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="BrandKTM"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
                />

              </div>

              {/* CONTACT PERSON */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Contact Person
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ram Bahadur"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
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
                  placeholder="brandktm@gmail.com"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
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
                  className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
                />

              </div>

              {/* CONTACT ID */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Contact ID
                </label>

                <input
                  type="text"
                  name="contactId"
                  value={form.contactId}
                  onChange={handleChange}
                  placeholder="9841555676"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
                />

              </div>

              {/* LOCATION */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Kathmandu"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-4">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="flex-1 rounded-lg border px-4 py-3 font-medium transition hover:bg-gray-50 disabled:opacity-50"
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

                      Create Vendor
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