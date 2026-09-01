
"use client";

import { useEffect, useState } from "react";

// =====================================================
// TYPES
// =====================================================

type Location = {
  id: number;
  name: string;
  zone: "INSIDE_VALLEY" | "OUTSIDE_VALLEY";
  createdAt?: string;
  updatedAt?: string;
};

type DeliveryType = {
  id: number;
  name: string;
};

type LocationRate = {
  id: number;

  locationId: number;
  location: Location;

  deliveryTypeId: number;
  deliveryType: DeliveryType;

  price: number;
};

type ShipmentForm = {
  locationRateId: number;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  packageType:
    | "DOCUMENT"
    | "PARCEL"
    | "BOX"
    | "ELECTRONICS"
    | "CLOTHING"
    | "FOOD"
    | "FRAGILE"
    | "OTHER";

  weight: number;

  paymentType: "PREPAID" | "COD";

  codAmount: number;

  notes: string;
};

// =====================================================
// COMPONENT
// =====================================================

export default function CreateShipmentPage() {
  // ===================================================
  // STATES
  // ===================================================

  const [rates, setRates] = useState<LocationRate[]>([]);

  const [selectedLocationId, setSelectedLocationId] =
    useState<number>(0);

  const [loadingRates, setLoadingRates] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] = useState<ShipmentForm>({
    locationRateId: 0,

    receiverName: "",

    receiverPhone: "",

    receiverAddress: "",

    packageType: "DOCUMENT",

    weight: 1,

    paymentType: "PREPAID",

    codAmount: 0,

    notes: "",
  });

  // ===================================================
  // UPDATE FORM
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
  // LOAD LOCATION RATES
  // ===================================================

  useEffect(() => {
    async function loadRates() {
      try {
        setLoadingRates(true);

        setError("");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/locationRate/`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Failed to load location rates"
          );
        }

        console.log("LOCATION RATES:", data);

        setRates(data);
      } catch (error) {
        console.error(
          "Load rates error:",
          error
        );

        setError(
          "Failed to load delivery locations and prices."
        );
      } finally {
        setLoadingRates(false);
      }
    }

    loadRates();
  }, []);

  // ===================================================
  // UNIQUE LOCATIONS
  // ===================================================

  const locations = Array.from(
    new Map(
      rates.map((rate) => [
        rate.location.id,
        rate.location,
      ])
    ).values()
  );

  // ===================================================
  // RATES FOR SELECTED LOCATION
  // ===================================================

  const locationRates = rates.filter(
    (rate) =>
      rate.location.id === selectedLocationId
  );

  // ===================================================
  // SELECTED RATE
  // ===================================================

  const selectedRate = rates.find(
    (rate) =>
      rate.id === form.locationRateId
  );

  // ===================================================
  // CALCULATE SHIPPING CHARGE
  //
  // Example:
  //
  // price = 200
  // weight = 1
  //
  // 200 * 1 = 200
  //
  // price = 200
  // weight = 2
  //
  // 200 * 2 = 400
  // ===================================================

  const shippingCharge =
    selectedRate
      ? selectedRate.price *
        Number(form.weight || 0)
      : 0;

  // ===================================================
  // SELECT DESTINATION
  // ===================================================

  function handleLocationChange(
    locationId: number
  ) {
    setSelectedLocationId(locationId);

    // Reset delivery type
    updateField(
      "locationRateId",
      0
    );
  }

  // ===================================================
  // SELECT DELIVERY TYPE
  // ===================================================

  function handleDeliveryTypeChange(
    rateId: number
  ) {
    updateField(
      "locationRateId",
      rateId
    );
  }

  // ===================================================
  // SUBMIT
  // ===================================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    setSuccess("");

    // =================================================
    // TOKEN
    // =================================================

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "You are not logged in. Please login again."
      );

      return;
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !form.receiverName.trim()
    ) {
      setError(
        "Receiver name is required."
      );

      return;
    }

    if (
      !form.receiverPhone.trim()
    ) {
      setError(
        "Receiver phone is required."
      );

      return;
    }

    if (
      !form.receiverAddress.trim()
    ) {
      setError(
        "Receiver address is required."
      );

      return;
    }

    if (
      !selectedLocationId
    ) {
      setError(
        "Please select a destination."
      );

      return;
    }

    if (
      !form.locationRateId
    ) {
      setError(
        "Please select a delivery type."
      );

      return;
    }

    if (
      !form.weight ||
      form.weight <= 0
    ) {
      setError(
        "Weight must be greater than 0."
      );

      return;
    }

    if (
      form.paymentType === "COD" &&
      form.codAmount <= 0
    ) {
      setError(
        "Please enter a valid COD amount."
      );

      return;
    }

    // =================================================
    // CREATE SHIPMENT
    // =================================================

    try {
      setSubmitting(true);

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

          body: JSON.stringify({
            // IMPORTANT
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
              form.notes.trim() ||
              null,

            // Sending calculated charge
            shippingCharge:
              Number(shippingCharge),
          }),
        }
      );

      const data =
        await res.json();

      console.log(
        "CREATE SHIPMENT RESPONSE:",
        data
      );

      // =================================================
      // API ERROR
      // =================================================

      if (!res.ok) {
        setError(
          data.message ||
            "Failed to create shipment."
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        `Shipment created successfully. Tracking number: ${
          data.shipment
            ?.trackingNumber || ""
        }`
      );

      // =================================================
      // RESET
      // =================================================

      setSelectedLocationId(0);

      setForm({
        locationRateId: 0,

        receiverName: "",

        receiverPhone: "",

        receiverAddress: "",

        packageType: "DOCUMENT",

        weight: 1,

        paymentType: "PREPAID",

        codAmount: 0,

        notes: "",
      });
    } catch (error) {
      console.error(
        "Create shipment error:",
        error
      );

      setError(
        "Something went wrong while creating the shipment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="mx-auto max-w-5xl text-black">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-ink">
          Create Shipment
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new shipment for your customer.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
      >

        <div className="grid gap-5 md:grid-cols-2">

          {/* =============================================
              RECEIVER NAME
          ============================================= */}

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
              className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent"
            />
          </div>

          {/* =============================================
              RECEIVER PHONE
          ============================================= */}

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
              className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent"
            />
          </div>

          {/* =============================================
              RECEIVER ADDRESS
          ============================================= */}

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
              className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-accent"
            />

          </div>

          {/* =============================================
              DESTINATION
          ============================================= */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Destination
            </label>

            <select
              value={
                selectedLocationId
              }
              disabled={
                loadingRates
              }
              onChange={(e) =>
                handleLocationChange(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-accent disabled:bg-gray-100"
            >

              <option value={0}>
                {loadingRates
                  ? "Loading destinations..."
                  : "Select Destination"}
              </option>

              {locations.map(
                (location) => (
                  <option
                    key={
                      location.id
                    }
                    value={
                      location.id
                    }
                  >
                    {location.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* =============================================
              DELIVERY TYPE
          ============================================= */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Delivery Type
            </label>

            <select
              value={
                form.locationRateId
              }
              disabled={
                loadingRates ||
                !selectedLocationId
              }
              onChange={(e) =>
                handleDeliveryTypeChange(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-accent disabled:bg-gray-100"
            >

              <option value={0}>
                {!selectedLocationId
                  ? "Select destination first"
                  : "Select Delivery Type"}
              </option>

              {locationRates.map(
                (rate) => (
                  <option
                    key={rate.id}
                    value={rate.id}
                  >
                    {rate.deliveryType.name}
                    {" - Rs. "}
                    {rate.price}
                    {" / kg"}
                  </option>
                )
              )}

            </select>

          </div>

          {/* =============================================
              PACKAGE TYPE
          ============================================= */}

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
                  e.target.value as ShipmentForm["packageType"]
                )
              }
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-accent"
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

          {/* =============================================
              WEIGHT
          ============================================= */}

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
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-accent"
            />

          </div>

          {/* =============================================
              PAYMENT TYPE
          ============================================= */}

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
                  e.target.value as
                    | "PREPAID"
                    | "COD"
                )
              }
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-accent"
            >

              <option value="PREPAID">
                Prepaid
              </option>

              <option value="COD">
                Cash On Delivery
              </option>

            </select>

          </div>

          {/* =============================================
              COD
          ============================================= */}

          {form.paymentType ===
            "COD" && (

            <div>

              <label className="mb-2 block text-sm font-medium">
                COD Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
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
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-accent"
              />

            </div>

          )}

          {/* =============================================
              NOTES
          ============================================= */}

          <div className="md:col-span-2">

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
              placeholder="Optional notes about this shipment"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-accent"
            />

          </div>

        </div>

        {/* =================================================
            PRICE SUMMARY
        ================================================= */}

        {selectedRate && (

          <div className="mt-6 rounded-xl bg-gray-50 p-5">

            {/* DESTINATION */}

            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-600">
                Destination
              </span>

              <span className="font-medium">
                {
                  selectedRate
                    .location
                    .name
                }
              </span>

            </div>

            {/* ZONE */}

            <div className="mt-2 flex items-center justify-between">

              <span className="text-sm text-gray-600">
                Zone
              </span>

              <span className="font-medium">
                {
                  selectedRate
                    .location
                    .zone
                }
              </span>

            </div>

            {/* DELIVERY TYPE */}

            <div className="mt-2 flex items-center justify-between">

              <span className="text-sm text-gray-600">
                Delivery Type
              </span>

              <span className="font-medium">
                {
                  selectedRate
                    .deliveryType
                    .name
                }
              </span>

            </div>

            {/* RATE */}

            <div className="mt-2 flex items-center justify-between">

              <span className="text-sm text-gray-600">
                Rate
              </span>

              <span className="font-medium">
                Rs.{" "}
                {
                  selectedRate.price
                }{" "}
                / kg
              </span>

            </div>

            {/* WEIGHT */}

            <div className="mt-2 flex items-center justify-between">

              <span className="text-sm text-gray-600">
                Weight
              </span>

              <span className="font-medium">
                {
                  form.weight
                }{" "}
                kg
              </span>

            </div>

            {/* TOTAL */}

            <div className="mt-3 flex items-center justify-between border-t pt-3">

              <span className="font-semibold">
                Shipping Charge
              </span>

              <span className="text-xl font-bold text-accent">
                Rs.{" "}
                {
                  shippingCharge
                }
              </span>

            </div>

          </div>

        )}

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            disabled={
              submitting
            }
            className="rounded-xl border border-gray-200 px-5 py-3 font-medium transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              !form.locationRateId
            }
            className="rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >

            {submitting
              ? "Creating Shipment..."
              : "Create Shipment"}

          </button>

        </div>

      </form>

    </div>
  );
}

