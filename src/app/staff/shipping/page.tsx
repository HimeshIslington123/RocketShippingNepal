"use client";

import { useState, useEffect } from "react";

type Vendor = {
  id: number;
  companyName: string;
  location: string;
};

type LocationPrice = {
  id: number;
  location: string;
  price: number;
};

type ShipmentForm = {
  vendorId: number;
  priceLocationId: number;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  packageType: string;

  weight: number;

  paymentType: "PREPAID" | "COD";

  shippingCharge: number;

  codAmount: number;

  notes: string;
};

export default function CreateShipmentPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [locations, setLocations] = useState<LocationPrice[]>([]);
  const [vendorLocation, setVendorLocation] = useState("");

  const [form, setForm] = useState<ShipmentForm>({
    vendorId: 0,
    priceLocationId: 0,

    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",

    packageType: "DOCUMENT",

    weight: 1,

    paymentType: "PREPAID",

    shippingCharge: 0,

    codAmount: 0,

    notes: "",
  });

  function updateField<K extends keyof ShipmentForm>(
    key: K,
    value: ShipmentForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    async function load() {
      try {
const vendorsRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/getvendor`
);
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);

       const locationRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/locationRate/getlocation`
);
        const locationData = await locationRes.json();
        setLocations(locationData);
      } catch (err) {
        console.error("Failed to load vendors/locations", err);
      }
    }

    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create shipment");
        return;
      }

      alert("Shipment Created");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the shipment");
    }
  }

  return (
    <div className="mx-auto max-w-5xl text-black">
      <div>
        <h1 className="text-2xl font-bold text-ink">Create Shipment</h1>

        <p className="mt-1 text-sm text-gray-500">
          Fill in shipment details below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {/* Receiver Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Receiver Name
            </label>

            <input
              type="text"
              value={form.receiverName}
              onChange={(e) => updateField("receiverName", e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:border-accent"
            />
          </div>

          {/* Receiver Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Receiver Phone
            </label>

            <input
              type="tel"
              value={form.receiverPhone}
              onChange={(e) => updateField("receiverPhone", e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:border-accent"
            />
          </div>

          {/* Receiver Address */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Receiver Address
            </label>

            <textarea
              rows={3}
              value={form.receiverAddress}
              onChange={(e) => updateField("receiverAddress", e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:border-accent"
            />
          </div>

          {/* Package Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Package Type
            </label>

            <select
              value={form.packageType}
              onChange={(e) => updateField("packageType", e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:border-accent"
            >
              <option value="DOCUMENT">Document</option>
              <option value="PARCEL">Parcel</option>
              <option value="FRAGILE">Fragile</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="mb-2 block text-sm font-medium">Vendor</label>

            <select
              value={form.vendorId}
              onChange={(e) => {
                const id = Number(e.target.value);
                updateField("vendorId", id);

                const vendor = vendors.find((v) => v.id === id);
                setVendorLocation(vendor?.location || "");
              }}
              className="w-full rounded-xl border p-3"
            >
              <option value={0}>Select Vendor</option>

              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Location (read-only) */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Vendor Location
            </label>

            <input
              value={vendorLocation}
              readOnly
              className="w-full rounded-xl border bg-gray-100 p-3"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Destination
            </label>

            <select
              value={form.priceLocationId}
              onChange={(e) => {
                const id = Number(e.target.value);
                updateField("priceLocationId", id);

                const selected = locations.find((x) => x.id === id);
                if (selected) {
                  updateField("shippingCharge", selected.price);
                }
              }}
              className="w-full rounded-xl border p-3"
            >
              <option value={0}>Select Destination</option>

              {locations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.location}
                </option>
              ))}
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Weight (kg)
            </label>

            <input
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => updateField("weight", Number(e.target.value))}
              className="w-full rounded-xl border p-3 outline-none focus:border-accent"
            />
          </div>

          {/* Shipping Charge (read-only, auto-filled from destination) */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Shipping Charge
            </label>

            <input
              type="number"
              value={form.shippingCharge}
              readOnly
              className="w-full rounded-xl border bg-gray-100 p-3"
            />
          </div>

          {/* Payment Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Payment Type
            </label>

            <select
              value={form.paymentType}
              onChange={(e) =>
                updateField(
                  "paymentType",
                  e.target.value as "PREPAID" | "COD"
                )
              }
              className="w-full rounded-xl border p-3"
            >
              <option value="PREPAID">Prepaid</option>
              <option value="COD">Cash On Delivery</option>
            </select>
          </div>

          {/* COD Amount (only when payment type is COD) */}
          {form.paymentType === "COD" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                COD Amount
              </label>

              <input
                type="number"
                value={form.codAmount}
                onChange={(e) =>
                  updateField("codAmount", Number(e.target.value))
                }
                className="w-full rounded-xl border p-3"
              />
            </div>
          )}

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Notes</label>

            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" className="rounded-xl border px-5 py-3 font-medium">
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark"
          >
            Create Shipment
          </button>
        </div>
      </form>
    </div>
  );
}