"use client";

import { useEffect, useMemo, useState } from "react";

// =====================================================
// TYPES
// =====================================================

type Vendor = {
  id: number;
  companyName: string;
  location?: string;
};

type LocationRate = {
  id: number;
  price: number;

  location: {
    id: number;
    name: string;
    zone: string;
  };

  deliveryType: {
    id: number;
    name: string;
  };
};

type ShipmentForm = {
  vendorId: number;
  locationRateId: number;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  packageType: string;

  weight: number;

  paymentType: "PREPAID" | "COD";

  codAmount: number;

  notes: string;
};

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm: ShipmentForm = {
  vendorId: 0,
  locationRateId: 0,

  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",

  packageType: "DOCUMENT",

  weight: 1,

  paymentType: "PREPAID",

  codAmount: 0,

  notes: "",
};

// =====================================================
// CLIENT-SIDE CACHE
//
// These survive normal Next.js client-side navigation.
//
// Browser refresh/F5/Cmd+R:
// JavaScript runtime restarts -> cache becomes null
// -> API requests happen again.
//
// This is intentionally NOT localStorage.
// =====================================================

let vendorsCache: Vendor[] | null = null;
let locationRatesCache: LocationRate[] | null = null;

// Prevent duplicate requests during React Strict Mode
// or if the page is mounted again while a request is running.
let vendorsRequest: Promise<Vendor[]> | null = null;
let locationRatesRequest: Promise<LocationRate[]> | null = null;

// =====================================================
// SHIMMER
// =====================================================

function ShipmentFormSkeleton() {
  return (
    <>
      <style jsx global>{`
        @keyframes shipment-skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .shipment-skeleton-shimmer {
          background-image: linear-gradient(
            90deg,
            #e5e7eb 0%,
            #f8fafc 45%,
            #ffffff 50%,
            #f8fafc 55%,
            #e5e7eb 100%
          );

          background-size: 200% 100%;

          animation:
            shipment-skeleton-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 lg:px-0">
        {/* =================================================
            HEADER SKELETON
        ================================================= */}

        <div>
          <div className="shipment-skeleton-shimmer h-8 w-52 rounded-lg" />

          <div className="shipment-skeleton-shimmer mt-3 h-4 w-80 max-w-full rounded" />
        </div>

        {/* =================================================
            FORM SKELETON
        ================================================= */}

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
          {/* =================================================
              VENDOR
          ================================================= */}

          <SkeletonSectionTitle />

          <div className="grid gap-5 md:grid-cols-2">
            <SkeletonField />
            <SkeletonField />
          </div>

          <SkeletonDivider />

          {/* =================================================
              RECEIVER
          ================================================= */}

          <SkeletonSectionTitle />

          <div className="grid gap-5 md:grid-cols-2">
            <SkeletonField />
            <SkeletonField />

            <div className="md:col-span-2">
              <SkeletonField height="h-24" />
            </div>
          </div>

          <SkeletonDivider />

          {/* =================================================
              DELIVERY
          ================================================= */}

          <SkeletonSectionTitle />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <SkeletonField />
            </div>

            <SkeletonField />
            <SkeletonField />

            <SkeletonField />
            <SkeletonField />

            <SkeletonField />
            <SkeletonField />
          </div>

          <SkeletonDivider />

          {/* =================================================
              PAYMENT
          ================================================= */}

          <SkeletonSectionTitle />

          <div className="grid gap-5 md:grid-cols-2">
            <SkeletonField />
            <SkeletonField />
          </div>

          <SkeletonDivider />

          {/* =================================================
              NOTES
          ================================================= */}

          <SkeletonField height="h-28" />

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-8 rounded-2xl bg-gray-100 p-5">
            <div className="shipment-skeleton-shimmer h-5 w-40 rounded" />

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <SkeletonSummary />
              <SkeletonSummary />
              <SkeletonSummary />
              <SkeletonSummary />
            </div>
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <div className="shipment-skeleton-shimmer h-12 w-full rounded-xl sm:w-28" />

            <div className="shipment-skeleton-shimmer h-12 w-full rounded-xl sm:w-44" />
          </div>
        </div>
      </div>
    </>
  );
}

// =====================================================
// SKELETON HELPERS
// =====================================================

function SkeletonSectionTitle() {
  return (
    <div className="mb-5">
      <div className="shipment-skeleton-shimmer h-5 w-40 rounded" />

      <div className="shipment-skeleton-shimmer mt-2 h-4 w-72 max-w-full rounded" />
    </div>
  );
}

function SkeletonField({
  height = "h-12",
}: {
  height?: string;
}) {
  return (
    <div>
      <div className="shipment-skeleton-shimmer mb-2 h-4 w-28 rounded" />

      <div
        className={`shipment-skeleton-shimmer w-full rounded-xl ${height}`}
      />
    </div>
  );
}

function SkeletonSummary() {
  return (
    <div>
      <div className="shipment-skeleton-shimmer h-3 w-16 rounded" />

      <div className="shipment-skeleton-shimmer mt-2 h-5 w-28 rounded" />
    </div>
  );
}

function SkeletonDivider() {
  return <div className="my-8 border-t border-gray-100" />;
}

// =====================================================
// PAGE
// =====================================================

export default function StaffCreateShipmentPage() {
  // ===================================================
  // STATE
  // ===================================================

  const [vendors, setVendors] = useState<Vendor[]>(
    vendorsCache ?? []
  );

  const [locationRates, setLocationRates] =
    useState<LocationRate[]>(
      locationRatesCache ?? []
    );

  const [loading, setLoading] = useState(
    vendorsCache === null ||
      locationRatesCache === null
  );

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState<ShipmentForm>(initialForm);

  // ===================================================
  // UPDATE FIELD
  // ===================================================

  function updateField<K extends keyof ShipmentForm>(
    key: K,
    value: ShipmentForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // ===================================================
  // FETCH VENDORS
  // ===================================================

  async function fetchVendors(
    force = false
  ): Promise<Vendor[]> {
    if (!force && vendorsCache !== null) {
      return vendorsCache;
    }

    if (!force && vendorsRequest) {
      return vendorsRequest;
    }

    const request = (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/getvendor`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load vendors"
        );
      }

      const data = await res.json();

      const result: Vendor[] =
        Array.isArray(data)
          ? data
          : data.vendors || [];

      vendorsCache = result;

      return result;
    })();

    vendorsRequest = request;

    try {
      return await request;
    } finally {
      if (vendorsRequest === request) {
        vendorsRequest = null;
      }
    }
  }

  // ===================================================
  // FETCH LOCATION RATES
  // ===================================================

  async function fetchLocationRates(
    force = false
  ): Promise<LocationRate[]> {
    if (
      !force &&
      locationRatesCache !== null
    ) {
      return locationRatesCache;
    }

    if (
      !force &&
      locationRatesRequest
    ) {
      return locationRatesRequest;
    }

    const request = (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locationRate`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load location rates"
        );
      }

      const data = await res.json();

      const result: LocationRate[] =
        Array.isArray(data)
          ? data
          : data.locationRates ||
            data.rates ||
            [];

      locationRatesCache = result;

      return result;
    })();

    locationRatesRequest = request;

    try {
      return await request;
    } finally {
      if (
        locationRatesRequest === request
      ) {
        locationRatesRequest = null;
      }
    }
  }

  // ===================================================
  // LOAD DATA
  // ===================================================

  async function loadData(
    force = false
  ) {
    try {
      setError("");

      // Only show skeleton when we don't already
      // have usable cached data.
      if (
        !force &&
        vendorsCache !== null &&
        locationRatesCache !== null
      ) {
        setVendors(vendorsCache);
        setLocationRates(
          locationRatesCache
        );
        setLoading(false);
        return;
      }

      setLoading(true);

      const [
        vendorsData,
        locationRatesData,
      ] = await Promise.all([
        fetchVendors(force),
        fetchLocationRates(force),
      ]);

      setVendors(vendorsData);
      setLocationRates(
        locationRatesData
      );
    } catch (err) {
      console.error(
        "LOAD STAFF SHIPMENT DATA ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // INITIAL LOAD
  //
  // Cache exists:
  // no API request.
  //
  // Cache doesn't exist:
  // API request + shimmer.
  // ===================================================

  useEffect(() => {
    loadData();
  }, []);

  // ===================================================
  // SELECTED VENDOR
  // ===================================================

  const selectedVendor = useMemo(() => {
    return vendors.find(
      (vendor) =>
        vendor.id === form.vendorId
    );
  }, [
    vendors,
    form.vendorId,
  ]);

  // ===================================================
  // SELECTED LOCATION RATE
  // ===================================================

  const selectedRate = useMemo(() => {
    return locationRates.find(
      (rate) =>
        rate.id === form.locationRateId
    );
  }, [
    locationRates,
    form.locationRateId,
  ]);

  // ===================================================
  // SHIPPING CHARGE
  // ===================================================

  const shippingCharge = selectedRate
    ? Number(selectedRate.price) *
      Number(form.weight || 0)
    : 0;

  // ===================================================
  // SUBMIT
  // ===================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!form.vendorId) {
      setError(
        "Please select a vendor."
      );
      return;
    }

    if (!form.locationRateId) {
      setError(
        "Please select destination and delivery type."
      );
      return;
    }

    if (!form.receiverName.trim()) {
      setError(
        "Receiver name is required."
      );
      return;
    }

    if (!form.receiverPhone.trim()) {
      setError(
        "Receiver phone is required."
      );
      return;
    }

    if (!form.receiverAddress.trim()) {
      setError(
        "Receiver address is required."
      );
      return;
    }

    if (
      !form.weight ||
      Number(form.weight) <= 0
    ) {
      setError(
        "Weight must be greater than 0."
      );
      return;
    }

    if (
      form.paymentType === "COD" &&
      Number(form.codAmount) <= 0
    ) {
      setError(
        "Please enter a valid COD amount."
      );
      return;
    }

    try {
      setSubmitting(true);

      // ---------------------------------------------
      // GET AUTH TOKEN
      // ---------------------------------------------

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in. Please login again."
        );

        return;
      }

      // ---------------------------------------------
      // REQUEST BODY
      // ---------------------------------------------

      const payload = {
        vendorId:
          form.vendorId,

        locationRateId:
          form.locationRateId,

        receiverName:
          form.receiverName.trim(),

        receiverPhone:
          form.receiverPhone.trim(),

        receiverAddress:
          form.receiverAddress.trim(),

        packageType:
          form.packageType,

        weight:
          Number(form.weight),

        paymentType:
          form.paymentType,

        codAmount:
          form.paymentType === "COD"
            ? Number(form.codAmount)
            : 0,

        notes:
          form.notes.trim() || null,
      };

      // ---------------------------------------------
      // CREATE SHIPMENT
      // ---------------------------------------------

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shipment`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to create shipment"
        );
      }

      // ---------------------------------------------
      // SUCCESS
      // ---------------------------------------------

      setSuccess(
        `Shipment ${
          data.shipment
            ?.trackingNumber || ""
        } created successfully.`
      );

      // ---------------------------------------------
      // RESET FORM
      // ---------------------------------------------

      setForm(initialForm);
    } catch (err) {
      console.error(
        "CREATE STAFF SHIPMENT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ===================================================
  // CANCEL
  // ===================================================

  function handleCancel() {
    setForm(initialForm);

    setError("");

    setSuccess("");
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return <ShipmentFormSkeleton />;
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      {/* =================================================
          SHIMMER STYLES
      ================================================= */}

      <style jsx global>{`
        @keyframes shipment-skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .shipment-skeleton-shimmer {
          background-image: linear-gradient(
            90deg,
            #e5e7eb 0%,
            #f8fafc 45%,
            #ffffff 50%,
            #f8fafc 55%,
            #e5e7eb 100%
          );

          background-size: 200% 100%;

          animation:
            shipment-skeleton-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 pb-10 text-black sm:px-6 lg:px-0">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">
              Create Shipment
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a shipment on behalf of a vendor.
            </p>
          </div>

          {/* =================================================
              RELOAD DATA
          ================================================= */}

          {error &&
            !submitting && (
              <button
                type="button"
                onClick={() =>
                  loadData(true)
                }
                className="w-fit rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reload Data
              </button>
            )}
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
        >
          {/* =================================================
              VENDOR SECTION
          ================================================= */}

          <div>
            <div className="mb-5">
              <h2 className="text-base font-bold">
                Vendor Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the vendor for this shipment.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* VENDOR */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Vendor
                </label>

                <select
                  value={
                    form.vendorId
                  }
                  onChange={(e) =>
                    updateField(
                      "vendorId",
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value={0}>
                    Select Vendor
                  </option>

                  {vendors.map(
                    (vendor) => (
                      <option
                        key={
                          vendor.id
                        }
                        value={
                          vendor.id
                        }
                      >
                        {
                          vendor.companyName
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* VENDOR LOCATION */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Vendor Location
                </label>

                <input
                  type="text"
                  value={
                    selectedVendor?.location ||
                    ""
                  }
                  readOnly
                  placeholder="Vendor location"
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-100" />

          {/* =================================================
              RECEIVER
          ================================================= */}

          <div>
            <div className="mb-5">
              <h2 className="text-base font-bold">
                Receiver Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the customer's delivery details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Receiver Name
                </label>

                <input
                  type="text"
                  value={
                    form.receiverName
                  }
                  onChange={(e) =>
                    updateField(
                      "receiverName",
                      e.target.value
                    )
                  }
                  placeholder="Enter receiver name"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Receiver Phone
                </label>

                <input
                  type="tel"
                  value={
                    form.receiverPhone
                  }
                  onChange={(e) =>
                    updateField(
                      "receiverPhone",
                      e.target.value
                    )
                  }
                  placeholder="Enter receiver phone"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>

              {/* ADDRESS */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Receiver Address
                </label>

                <textarea
                  rows={3}
                  value={
                    form.receiverAddress
                  }
                  onChange={(e) =>
                    updateField(
                      "receiverAddress",
                      e.target.value
                    )
                  }
                  placeholder="Enter complete delivery address"
                  className="w-full resize-none rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-100" />

          {/* =================================================
              DELIVERY INFORMATION
          ================================================= */}

          <div>
            <div className="mb-5">
              <h2 className="text-base font-bold">
                Delivery Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select destination, delivery type and package details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* DESTINATION + DELIVERY TYPE */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Destination & Delivery Type
                </label>

                <select
                  value={
                    form.locationRateId
                  }
                  onChange={(e) =>
                    updateField(
                      "locationRateId",
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value={0}>
                    Select Destination
                  </option>

                  {locationRates.map(
                    (rate) => (
                      <option
                        key={
                          rate.id
                        }
                        value={
                          rate.id
                        }
                      >
                        {
                          rate.location
                            .name
                        }
                        {" — "}
                        {
                          rate
                            .deliveryType
                            .name
                        }
                        {" — Rs. "}
                        {Number(
                          rate.price
                        ).toLocaleString()}
                        /kg
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DESTINATION */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Destination
                </label>

                <input
                  value={
                    selectedRate
                      ?.location
                      ?.name || ""
                  }
                  readOnly
                  placeholder="Select destination"
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-600"
                />
              </div>

              {/* DELIVERY TYPE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Delivery Type
                </label>

                <input
                  value={
                    selectedRate
                      ?.deliveryType
                      ?.name || ""
                  }
                  readOnly
                  placeholder="Select delivery type"
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-600"
                />
              </div>

              {/* ZONE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Zone
                </label>

                <input
                  value={
                    selectedRate
                      ?.location
                      ?.zone || ""
                  }
                  readOnly
                  placeholder="Zone"
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-600"
                />
              </div>

              {/* PACKAGE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Package Type
                </label>

                <select
                  value={
                    form.packageType
                  }
                  onChange={(e) =>
                    updateField(
                      "packageType",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value="DOCUMENT">
                    Document
                  </option>

                  <option value="PARCEL">
                    Parcel
                  </option>

                  <option value="BOX">
                    Box
                  </option>

                  <option value="ELECTRONICS">
                    Electronics
                  </option>

                  <option value="CLOTHING">
                    Clothing
                  </option>

                  <option value="FOOD">
                    Food
                  </option>

                  <option value="FRAGILE">
                    Fragile
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              {/* WEIGHT */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={
                    form.weight
                  }
                  onChange={(e) =>
                    updateField(
                      "weight",
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>

              {/* RATE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Rate / kg
                </label>

                <input
                  type="text"
                  value={
                    selectedRate
                      ? `Rs. ${Number(
                          selectedRate.price
                        ).toLocaleString()}`
                      : ""
                  }
                  readOnly
                  placeholder="Select destination"
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-600"
                />
              </div>

              {/* TOTAL SHIPPING */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Shipping Charge
                </label>

                <div className="flex min-h-[50px] items-center rounded-xl border border-gray-200 bg-gray-100 px-4">
                  <span className="text-lg font-bold">
                    Rs.{" "}
                    {Number(
                      shippingCharge
                    ).toLocaleString()}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Rate × Weight
                </p>
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-100" />

          {/* =================================================
              PAYMENT
          ================================================= */}

          <div>
            <div className="mb-5">
              <h2 className="text-base font-bold">
                Payment
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* PAYMENT TYPE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Payment Type
                </label>

                <select
                  value={
                    form.paymentType
                  }
                  onChange={(e) =>
                    updateField(
                      "paymentType",
                      e.target
                        .value as
                        | "PREPAID"
                        | "COD"
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value="PREPAID">
                    Prepaid
                  </option>

                  <option value="COD">
                    Cash On Delivery
                  </option>
                </select>
              </div>

              {/* COD */}

              {form.paymentType ===
                "COD" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    COD Amount
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      form.codAmount
                    }
                    onChange={(e) =>
                      updateField(
                        "codAmount",
                        Number(
                          e.target.value
                        )
                      )
                    }
                    placeholder="Enter COD amount"
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="my-8 border-t border-gray-100" />

          {/* =================================================
              NOTES
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Notes
            </label>

            <textarea
              rows={4}
              value={
                form.notes
              }
              onChange={(e) =>
                updateField(
                  "notes",
                  e.target.value
                )
              }
              placeholder="Any additional shipment notes..."
              className="w-full resize-none rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-8 rounded-2xl bg-gray-50 p-5">
            <div className="mb-4">
              <h3 className="font-bold">
                Shipment Summary
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* VENDOR */}

              <div>
                <p className="text-xs text-gray-500">
                  Vendor
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedVendor
                    ?.companyName ||
                    "Not selected"}
                </p>
              </div>

              {/* DESTINATION */}

              <div>
                <p className="text-xs text-gray-500">
                  Destination
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedRate
                    ?.location
                    ?.name ||
                    "Not selected"}
                </p>
              </div>

              {/* WEIGHT */}

              <div>
                <p className="text-xs text-gray-500">
                  Weight
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {form.weight} kg
                </p>
              </div>

              {/* CHARGE */}

              <div>
                <p className="text-xs text-gray-500">
                  Shipping Charge
                </p>

                <p className="mt-1 text-lg font-bold">
                  Rs.{" "}
                  {Number(
                    shippingCharge
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                handleCancel
              }
              disabled={
                submitting
              }
              className="rounded-xl border border-gray-200 px-6 py-3 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="rounded-xl bg-accent px-7 py-3 font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Creating Shipment..."
                : "Create Shipment"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}