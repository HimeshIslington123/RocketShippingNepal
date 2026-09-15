"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  UserRound,
  X,
  Package,
  MapPin,
  Phone,
  User,
  ChevronRight,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

type Vendor = {
  id: number;
  companyName: string;
  location?: string;
  contactId?: string;
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

type CreationMode = "VENDOR" | "UNREGISTERED" | null;

type ShipmentForm = {
  vendorId: number;

  senderName: string;
  senderPhone: string;
  senderAddress: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  locationRateId: number;

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
// INITIAL FORM
// =====================================================

const initialForm: ShipmentForm = {
  vendorId: 0,

  senderName: "",
  senderPhone: "",
  senderAddress: "",

  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",

  locationRateId: 0,

  packageType: "PARCEL",

  weight: 1,

  paymentType: "PREPAID",

  codAmount: 0,

  notes: "",
};

// =====================================================
// COMPONENT
// =====================================================

export default function StaffCreateShipmentPage() {
  // ===================================================
  // STATE
  // ===================================================

  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [locationRates, setLocationRates] =
    useState<LocationRate[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [mode, setMode] =
    useState<CreationMode>(null);

  const [form, setForm] =
    useState<ShipmentForm>(initialForm);

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const [
        vendorsRes,
        locationRatesRes,
      ] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/getvendor`,
          {
            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : undefined,
          }
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/locationRate`,
          {
            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : undefined,
          }
        ),
      ]);

      if (!vendorsRes.ok) {
        throw new Error(
          "Failed to load vendors."
        );
      }

      if (!locationRatesRes.ok) {
        throw new Error(
          "Failed to load location rates."
        );
      }

      const vendorsData =
        await vendorsRes.json();

      const ratesData =
        await locationRatesRes.json();

      setVendors(
        Array.isArray(vendorsData)
          ? vendorsData
          : vendorsData.vendors || []
      );

      setLocationRates(
        Array.isArray(ratesData)
          ? ratesData
          : ratesData.locationRates ||
              ratesData.rates ||
              []
      );
    } catch (err) {
      console.error(
        "LOAD CREATE SHIPMENT DATA ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load shipment data."
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // FIELD UPDATE
  // ===================================================

  function updateField<K extends keyof ShipmentForm>(
    key: K,
    value: ShipmentForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  // ===================================================
  // SELECTED VENDOR
  // ===================================================

  const selectedVendor = useMemo(() => {
    return vendors.find(
      (vendor) =>
        vendor.id === form.vendorId
    );
  }, [vendors, form.vendorId]);

  // ===================================================
  // SELECTED RATE
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

  const shippingCharge =
    selectedRate
      ? Number(selectedRate.price) *
        Number(form.weight || 0)
      : 0;

  // ===================================================
  // OPEN VENDOR MODAL
  // ===================================================

  function openVendorModal() {
    setError("");
    setSuccess("");
    setMode("VENDOR");

    setForm((previous) => ({
      ...previous,
      senderName: "",
      senderPhone: "",
      senderAddress: "",
    }));
  }

  // ===================================================
  // OPEN UNREGISTERED MODAL
  // ===================================================

  function openUnregisteredModal() {
    setError("");
    setSuccess("");
    setMode("UNREGISTERED");

    setForm((previous) => ({
      ...previous,
      vendorId: 0,
    }));
  }

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  function closeModal() {
    if (submitting) return;

    setMode(null);
    setError("");
  }

  // ===================================================
  // VALIDATION
  // ===================================================

  function validateForm() {
    if (mode === "VENDOR") {
      if (!form.vendorId) {
        return "Please select a vendor.";
      }
    }

    if (mode === "UNREGISTERED") {
      if (!form.senderName.trim()) {
        return "Sender name is required.";
      }

      if (!form.senderPhone.trim()) {
        return "Sender phone is required.";
      }

      if (!form.senderAddress.trim()) {
        return "Sender address is required.";
      }
    }

    if (!form.receiverName.trim()) {
      return "Receiver name is required.";
    }

    if (!form.receiverPhone.trim()) {
      return "Receiver phone is required.";
    }

    if (!form.receiverAddress.trim()) {
      return "Receiver address is required.";
    }

    if (!form.locationRateId) {
      return "Please select destination and delivery type.";
    }

    if (
      !form.weight ||
      Number(form.weight) <= 0
    ) {
      return "Weight must be greater than 0.";
    }

    if (
      form.paymentType === "COD" &&
      Number(form.codAmount) <= 0
    ) {
      return "Please enter a valid COD amount.";
    }

    return null;
  }

  // ===================================================
  // CREATE SHIPMENT
  // ===================================================

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      // =================================================
      // PAYLOAD
      // =================================================

      const payload = {
        // Registered vendor only
        vendorId:
          mode === "VENDOR"
            ? form.vendorId
            : null,

        // STAFF or VENDOR
        origin:
          mode === "VENDOR"
            ? "VENDOR"
            : "STAFF",

        // Sender
        senderName:
          mode === "VENDOR"
            ? selectedVendor?.companyName || ""
            : form.senderName.trim(),

        senderPhone:
          mode === "VENDOR"
            ? selectedVendor?.contactId || ""
            : form.senderPhone.trim(),

        senderAddress:
          mode === "VENDOR"
            ? selectedVendor?.location || ""
            : form.senderAddress.trim(),

        // Receiver
        receiverName:
          form.receiverName.trim(),

        receiverPhone:
          form.receiverPhone.trim(),

        receiverAddress:
          form.receiverAddress.trim(),

        // Delivery
        locationRateId:
          form.locationRateId,

        // Package
        packageType:
          form.packageType,

        weight:
          Number(form.weight),

        // Payment
        paymentType:
          form.paymentType,

        codAmount:
          form.paymentType === "COD"
            ? Number(form.codAmount)
            : 0,

        notes:
          form.notes.trim() || null,
      };

      // =================================================
      // API
      // =================================================

      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shipment`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(payload),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create shipment."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      const trackingNumber =
        data.shipment?.trackingNumber ||
        data.trackingNumber ||
        "";

      setSuccess(
        trackingNumber
          ? `Shipment ${trackingNumber} created successfully.`
          : "Shipment created successfully."
      );

      setMode(null);

      setForm(initialForm);
    } catch (err) {
      console.error(
        "CREATE SHIPMENT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ===================================================
  // RESET
  // ===================================================

  function resetForm() {
    if (submitting) return;

    setForm(initialForm);
    setMode(null);
    setError("");
    setSuccess("");
  }

  // ===================================================
  // LOADING SKELETON
  // ===================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-black">
        <div className="animate-pulse">

          <div className="h-8 w-64 rounded-lg bg-gray-200" />

          <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-200" />

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <div className="h-48 rounded-2xl bg-gray-200" />

            <div className="h-48 rounded-2xl bg-gray-200" />

          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">

            <div className="grid gap-5 md:grid-cols-3">

              <div className="h-14 rounded-xl bg-gray-100" />
              <div className="h-14 rounded-xl bg-gray-100" />
              <div className="h-14 rounded-xl bg-gray-100" />

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="mx-auto max-w-6xl text-black">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white">
            <Truck size={22} />
          </div>

          <div>

            <h1 className="text-2xl font-bold tracking-tight">
              Create Shipment
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a shipment for a registered
              vendor or an unregistered customer.
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">

          <CheckCircle2
            className="mt-0.5 shrink-0 text-green-600"
            size={20}
          />

          <div>

            <p className="font-semibold text-green-800">
              Shipment Created
            </p>

            <p className="mt-1 text-sm text-green-700">
              {success}
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          GLOBAL ERROR
      ================================================= */}

      {error && !mode && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

          <AlertCircle
            className="mt-0.5 shrink-0 text-red-600"
            size={20}
          />

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

        </div>
      )}

      {/* =================================================
          CREATION OPTIONS
      ================================================= */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* =================================================
            REGISTERED VENDOR
        ================================================= */}

        <button
          type="button"
          onClick={openVendorModal}
          className="group text-left"
        >

          <div className="h-full rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">

                <Building2 size={27} />

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 transition group-hover:bg-accent group-hover:text-white">

                <ChevronRight size={18} />

              </div>

            </div>

            <div className="mt-7">

              <h2 className="text-lg font-bold">
                Registered Vendor
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                Create a shipment for a vendor
                officially registered with
                RocketShipping.
              </p>

            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent">

              <span>
                Select Vendor
              </span>

              <ChevronRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />

            </div>

          </div>

        </button>

        {/* =================================================
            UNREGISTERED
        ================================================= */}

        <button
          type="button"
          onClick={openUnregisteredModal}
          className="group text-left"
        >

          <div className="h-full rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">

                <UserRound size={27} />

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 transition group-hover:bg-accent group-hover:text-white">

                <ChevronRight size={18} />

              </div>

            </div>

            <div className="mt-7">

              <h2 className="text-lg font-bold">
                Unregistered Customer
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                Create a shipment for a walk-in
                customer who is not registered as
                a vendor.
              </p>

            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent">

              <span>
                Enter Sender Details
              </span>

              <ChevronRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />

            </div>

          </div>

        </button>

      </div>

      {/* =================================================
          INFO
      ================================================= */}

      <div className="mt-6 rounded-2xl bg-gray-50 p-5">

        <div className="flex gap-3">

          <div className="mt-0.5 shrink-0 text-gray-500">
            <Package size={20} />
          </div>

          <div>

            <p className="text-sm font-semibold">
              How shipment creation works
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Registered vendor shipments are
              linked to the vendor account. For
              walk-in customers, sender details
              are stored directly on the shipment.
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {mode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">

                  {mode === "VENDOR" ? (
                    <Building2 size={22} />
                  ) : (
                    <UserRound size={22} />
                  )}

                </div>

                <div>

                  <h2 className="text-lg font-bold">
                    {mode === "VENDOR"
                      ? "Registered Vendor Shipment"
                      : "Unregistered Customer Shipment"}
                  </h2>

                  <p className="text-xs text-gray-500">
                    Fill in the shipment information
                    below.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-black disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(92vh-80px)] overflow-y-auto"
            >

              <div className="p-6">

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                    <AlertCircle
                      className="mt-0.5 shrink-0 text-red-600"
                      size={19}
                    />

                    <p className="text-sm font-medium text-red-700">
                      {error}
                    </p>

                  </div>
                )}

                {/* =================================================
                    SENDER
                ================================================= */}

                <section>

                  <SectionTitle
                    icon={
                      mode === "VENDOR"
                        ? <Building2 size={18} />
                        : <User size={18} />
                    }
                    title="Sender Information"
                    description={
                      mode === "VENDOR"
                        ? "Select the registered vendor sending this shipment."
                        : "Enter the details of the person sending this shipment."
                    }
                  />

                  {mode === "VENDOR" ? (

                    <div className="space-y-5">

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Vendor
                        </label>

                        <select
                          value={form.vendorId}
                          onChange={(event) => {
                            updateField(
                              "vendorId",
                              Number(
                                event.target.value
                              )
                            );
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent"
                        >

                          <option value={0}>
                            Select Vendor
                          </option>

                          {vendors.map(
                            (vendor) => (
                              <option
                                key={vendor.id}
                                value={vendor.id}
                              >
                                {vendor.companyName}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      {selectedVendor && (
                        <div className="grid gap-4 md:grid-cols-2">

                          <ReadonlyField
                            label="Company"
                            value={
                              selectedVendor.companyName
                            }
                          />

                          <ReadonlyField
                            label="Location"
                            value={
                              selectedVendor.location ||
                              "Not available"
                            }
                          />

                        </div>
                      )}

                    </div>

                  ) : (

                    <div className="grid gap-5 md:grid-cols-2">

                      <InputField
                        label="Sender Name"
                        placeholder="Enter sender name"
                        value={
                          form.senderName
                        }
                        onChange={(value) =>
                          updateField(
                            "senderName",
                            value
                          )
                        }
                        icon={
                          <User size={16} />
                        }
                      />

                      <InputField
                        label="Sender Phone"
                        placeholder="Enter sender phone"
                        type="tel"
                        value={
                          form.senderPhone
                        }
                        onChange={(value) =>
                          updateField(
                            "senderPhone",
                            value
                          )
                        }
                        icon={
                          <Phone size={16} />
                        }
                      />

                      <div className="md:col-span-2">

                        <TextAreaField
                          label="Sender Address"
                          placeholder="Enter complete sender address"
                          value={
                            form.senderAddress
                          }
                          onChange={(value) =>
                            updateField(
                              "senderAddress",
                              value
                            )
                          }
                          icon={
                            <MapPin size={16} />
                          }
                        />

                      </div>

                    </div>

                  )}

                </section>

                <Divider />

                {/* =================================================
                    RECEIVER
                ================================================= */}

                <section>

                  <SectionTitle
                    icon={
                      <UserRound size={18} />
                    }
                    title="Receiver Information"
                    description="Enter the customer's delivery details."
                  />

                  <div className="grid gap-5 md:grid-cols-2">

                    <InputField
                      label="Receiver Name"
                      placeholder="Enter receiver name"
                      value={
                        form.receiverName
                      }
                      onChange={(value) =>
                        updateField(
                          "receiverName",
                          value
                        )
                      }
                    />

                    <InputField
                      label="Receiver Phone"
                      placeholder="Enter receiver phone"
                      type="tel"
                      value={
                        form.receiverPhone
                      }
                      onChange={(value) =>
                        updateField(
                          "receiverPhone",
                          value
                        )
                      }
                    />

                    <div className="md:col-span-2">

                      <TextAreaField
                        label="Receiver Address"
                        placeholder="Enter complete delivery address"
                        value={
                          form.receiverAddress
                        }
                        onChange={(value) =>
                          updateField(
                            "receiverAddress",
                            value
                          )
                        }
                      />

                    </div>

                  </div>

                </section>

                <Divider />

                {/* =================================================
                    DELIVERY
                ================================================= */}

                <section>

                  <SectionTitle
                    icon={
                      <MapPin size={18} />
                    }
                    title="Delivery Information"
                    description="Select destination, delivery type and package information."
                  />

                  <div className="grid gap-5 md:grid-cols-2">

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-sm font-medium">
                        Destination & Delivery Type
                      </label>

                      <select
                        value={
                          form.locationRateId
                        }
                        onChange={(event) =>
                          updateField(
                            "locationRateId",
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent"
                      >

                        <option value={0}>
                          Select Destination
                        </option>

                        {locationRates.map(
                          (rate) => (
                            <option
                              key={rate.id}
                              value={rate.id}
                            >
                              {rate.location.name}
                              {" — "}
                              {
                                rate.deliveryType.name
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

                    <ReadonlyField
                      label="Destination"
                      value={
                        selectedRate
                          ?.location.name ||
                        ""
                      }
                      placeholder="Select destination"
                    />

                    <ReadonlyField
                      label="Delivery Type"
                      value={
                        selectedRate
                          ?.deliveryType.name ||
                        ""
                      }
                      placeholder="Select delivery type"
                    />

                    <ReadonlyField
                      label="Zone"
                      value={
                        selectedRate
                          ?.location.zone ||
                        ""
                      }
                      placeholder="Select destination"
                    />

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Package Type
                      </label>

                      <select
                        value={
                          form.packageType
                        }
                        onChange={(event) =>
                          updateField(
                            "packageType",
                            event.target
                              .value as ShipmentForm["packageType"]
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent"
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

                    <InputField
                      label="Weight (kg)"
                      type="number"
                      value={
                        String(form.weight)
                      }
                      onChange={(value) =>
                        updateField(
                          "weight",
                          Number(value)
                        )
                      }
                    />

                    <ReadonlyField
                      label="Rate / kg"
                      value={
                        selectedRate
                          ? `Rs. ${Number(
                              selectedRate.price
                            ).toLocaleString()}`
                          : ""
                      }
                      placeholder="Select destination"
                    />

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Shipping Charge
                      </label>

                      <div className="flex min-h-[50px] items-center rounded-xl bg-gray-50 px-4 ring-1 ring-gray-200">

                        <span className="text-lg font-bold">
                          Rs.{" "}
                          {shippingCharge.toLocaleString()}
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Rate × Weight
                      </p>

                    </div>

                  </div>

                </section>

                <Divider />

                {/* =================================================
                    PAYMENT
                ================================================= */}

                <section>

                  <SectionTitle
                    icon={
                      <Package size={18} />
                    }
                    title="Payment"
                    description="Select how this shipment will be paid."
                  />

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Payment Type
                      </label>

                      <select
                        value={
                          form.paymentType
                        }
                        onChange={(event) =>
                          updateField(
                            "paymentType",
                            event.target
                              .value as
                              | "PREPAID"
                              | "COD"
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent"
                      >

                        <option value="PREPAID">
                          Prepaid
                        </option>

                        <option value="COD">
                          Cash On Delivery
                        </option>

                      </select>

                    </div>

                    {form.paymentType ===
                      "COD" && (
                      <InputField
                        label="COD Amount"
                        type="number"
                        placeholder="Enter COD amount"
                        value={
                          String(
                            form.codAmount
                          )
                        }
                        onChange={(value) =>
                          updateField(
                            "codAmount",
                            Number(value)
                          )
                        }
                      />
                    )}

                  </div>

                </section>

                <Divider />

                {/* =================================================
                    NOTES
                ================================================= */}

                <section>

                  <TextAreaField
                    label="Notes"
                    placeholder="Any additional shipment notes..."
                    value={form.notes}
                    onChange={(value) =>
                      updateField(
                        "notes",
                        value
                      )
                    }
                  />

                </section>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="mt-8 rounded-2xl bg-gray-50 p-5">

                  <div className="mb-5">

                    <p className="text-sm font-bold">
                      Shipment Summary
                    </p>

                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <SummaryItem
                      label="Sender"
                      value={
                        mode === "VENDOR"
                          ? selectedVendor?.companyName ||
                            "Not selected"
                          : form.senderName ||
                            "Not entered"
                      }
                    />

                    <SummaryItem
                      label="Receiver"
                      value={
                        form.receiverName ||
                        "Not entered"
                      }
                    />

                    <SummaryItem
                      label="Destination"
                      value={
                        selectedRate
                          ?.location.name ||
                        "Not selected"
                      }
                    />

                    <SummaryItem
                      label="Shipping Charge"
                      value={`Rs. ${shippingCharge.toLocaleString()}`}
                      strong
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={17}
                      />

                      Create Shipment
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

// =====================================================
// SECTION TITLE
// =====================================================

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
        {icon}
      </div>

      <div>

        <h3 className="text-base font-bold">
          {title}
        </h3>

        <p className="mt-0.5 text-xs text-gray-500">
          {description}
        </p>

      </div>

    </div>
  );
}

// =====================================================
// DIVIDER
// =====================================================

function Divider() {
  return (
    <div className="my-8 border-t border-gray-100" />
  );
}

// =====================================================
// INPUT
// =====================================================

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 flex items-center gap-2 text-sm font-medium">

        {icon && (
          <span className="text-gray-400">
            {icon}
          </span>
        )}

        {label}

      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={
          type === "number"
            ? "0.1"
            : undefined
        }
        step={
          type === "number"
            ? "0.1"
            : undefined
        }
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none transition placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/10"
      />

    </div>
  );
}

// =====================================================
// TEXTAREA
// =====================================================

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 flex items-center gap-2 text-sm font-medium">

        {icon && (
          <span className="text-gray-400">
            {icon}
          </span>
        )}

        {label}

      </label>

      <textarea
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 outline-none transition placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/10"
      />

    </div>
  );
}

// =====================================================
// READONLY
// =====================================================

function ReadonlyField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        value={value}
        readOnly
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-600 outline-none"
      />

    </div>
  );
}

// =====================================================
// SUMMARY
// =====================================================

function SummaryItem({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? "text-lg font-bold"
            : "text-sm font-semibold"
        }`}
      >
        {value}
      </p>

    </div>
  );
}