
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Truck,
  DollarSign,
  X,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5001/api";

type Zone = "INSIDE_VALLEY" | "OUTSIDE_VALLEY";

interface Location {
  id: number;
  name: string;
  zone: Zone;
}

interface DeliveryType {
  id: number;
  name: string;
}

interface LocationRate {
  id: number;
  locationId: number;
  deliveryTypeId: number;
  price: number;
  location?: Location;
  deliveryType?: DeliveryType;
}

type ModalType =
  | "location"
  | "deliveryType"
  | "rate"
  | null;

export default function LocationManagementPage() {
  // =====================================================
  // DATA
  // =====================================================

  const [locations, setLocations] = useState<Location[]>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<
    DeliveryType[]
  >([]);
  const [rates, setRates] = useState<LocationRate[]>([]);

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // MODAL
  // =====================================================

  const [modal, setModal] = useState<ModalType>(null);

  const [editingLocation, setEditingLocation] =
    useState<Location | null>(null);

  const [editingDeliveryType, setEditingDeliveryType] =
    useState<DeliveryType | null>(null);

  const [editingRate, setEditingRate] =
    useState<LocationRate | null>(null);

  // =====================================================
  // FORMS
  // =====================================================

  const [locationName, setLocationName] =
    useState("");

  const [locationZone, setLocationZone] =
    useState<Zone>("INSIDE_VALLEY");

  const [deliveryTypeName, setDeliveryTypeName] =
    useState("");

  const [rateLocationId, setRateLocationId] =
    useState("");

  const [rateDeliveryTypeId, setRateDeliveryTypeId] =
    useState("");

  const [ratePrice, setRatePrice] =
    useState("");

  // =====================================================
  // MESSAGE
  // =====================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD ALL DATA
  // =====================================================

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        locationsResponse,
        deliveryTypesResponse,
        ratesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/location`),
        fetch(`${API_URL}/deliveryType`),
        fetch(`${API_URL}/locationRate`),
      ]);

      if (!locationsResponse.ok) {
        throw new Error("Failed to load locations");
      }

      if (!deliveryTypesResponse.ok) {
        throw new Error("Failed to load delivery types");
      }

      if (!ratesResponse.ok) {
        throw new Error("Failed to load rates");
      }

      const locationsData =
        await locationsResponse.json();

      const deliveryTypesData =
        await deliveryTypesResponse.json();

      const ratesData =
        await ratesResponse.json();

      setLocations(
        Array.isArray(locationsData)
          ? locationsData
          : []
      );

      setDeliveryTypes(
        Array.isArray(deliveryTypesData)
          ? deliveryTypesData
          : []
      );

      setRates(
        Array.isArray(ratesData)
          ? ratesData
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const showSuccess = (message: string) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const closeModal = () => {
    setModal(null);

    setEditingLocation(null);
    setEditingDeliveryType(null);
    setEditingRate(null);

    setLocationName("");
    setLocationZone("INSIDE_VALLEY");

    setDeliveryTypeName("");

    setRateLocationId("");
    setRateDeliveryTypeId("");
    setRatePrice("");

    setError("");
  };

  // =====================================================
  // LOCATION MODAL
  // =====================================================

  const openCreateLocation = () => {
    setEditingLocation(null);
    setLocationName("");
    setLocationZone("INSIDE_VALLEY");
    setError("");
    setModal("location");
  };

  const openEditLocation = (location: Location) => {
    setEditingLocation(location);

    setLocationName(location.name);
    setLocationZone(location.zone);

    setError("");
    setModal("location");
  };

  // =====================================================
  // CREATE / UPDATE LOCATION
  // =====================================================

  const saveLocation = async () => {
    if (!locationName.trim()) {
      setError("Location name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingLocation
        ? `${API_URL}/location/${editingLocation.id}`
        : `${API_URL}/location`;

      const method = editingLocation
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: locationName.trim(),
          zone: locationZone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save location"
        );
      }

      closeModal();

      await loadAll();

      showSuccess(
        editingLocation
          ? "Location updated successfully"
          : "Location created successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save location"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE LOCATION
  // =====================================================

  const deleteLocation = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this location?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/location/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete location"
        );
      }

      await loadAll();

      showSuccess(
        "Location deleted successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete location"
      );
    }
  };

  // =====================================================
  // DELIVERY TYPE MODAL
  // =====================================================

  const openCreateDeliveryType = () => {
    setEditingDeliveryType(null);
    setDeliveryTypeName("");
    setError("");
    setModal("deliveryType");
  };

  const openEditDeliveryType = (
    deliveryType: DeliveryType
  ) => {
    setEditingDeliveryType(deliveryType);

    setDeliveryTypeName(deliveryType.name);

    setError("");
    setModal("deliveryType");
  };

  // =====================================================
  // CREATE / UPDATE DELIVERY TYPE
  // =====================================================

  const saveDeliveryType = async () => {
    if (!deliveryTypeName.trim()) {
      setError(
        "Delivery type name is required"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingDeliveryType
        ? `${API_URL}/deliveryType/${editingDeliveryType.id}`
        : `${API_URL}/deliveryType`;

      const method = editingDeliveryType
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: deliveryTypeName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save delivery type"
        );
      }

      closeModal();

      await loadAll();

      showSuccess(
        editingDeliveryType
          ? "Delivery type updated successfully"
          : "Delivery type created successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save delivery type"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE DELIVERY TYPE
  // =====================================================

  const deleteDeliveryType = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery type?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/deliveryType/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete delivery type"
        );
      }

      await loadAll();

      showSuccess(
        "Delivery type deleted successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete delivery type"
      );
    }
  };

  // =====================================================
  // RATE MODAL
  // =====================================================

  const openCreateRate = () => {
    setEditingRate(null);

    setRateLocationId(
      locations.length > 0
        ? String(locations[0].id)
        : ""
    );

    setRateDeliveryTypeId(
      deliveryTypes.length > 0
        ? String(deliveryTypes[0].id)
        : ""
    );

    setRatePrice("");

    setError("");
    setModal("rate");
  };

  const openEditRate = (rate: LocationRate) => {
    setEditingRate(rate);

    setRateLocationId(
      String(rate.locationId)
    );

    setRateDeliveryTypeId(
      String(rate.deliveryTypeId)
    );

    setRatePrice(String(rate.price));

    setError("");
    setModal("rate");
  };

  // =====================================================
  // CREATE / UPDATE RATE
  // =====================================================

  const saveRate = async () => {
    if (!rateLocationId) {
      setError("Location is required");
      return;
    }

    if (!rateDeliveryTypeId) {
      setError("Delivery type is required");
      return;
    }

    if (
      ratePrice === "" ||
      Number(ratePrice) < 0
    ) {
      setError("Valid price is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingRate
        ? `${API_URL}/locationRate/${editingRate.id}`
        : `${API_URL}/locationRate`;

      const method = editingRate
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: Number(rateLocationId),
          deliveryTypeId: Number(
            rateDeliveryTypeId
          ),
          price: Number(ratePrice),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save location rate"
        );
      }

      closeModal();

      await loadAll();

      showSuccess(
        editingRate
          ? "Rate updated successfully"
          : "Rate created successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save rate"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE RATE
  // =====================================================

  const deleteRate = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rate?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/locationRate/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete rate"
        );
      }

      await loadAll();

      showSuccess(
        "Location rate deleted successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete rate"
      );
    }
  };

  // =====================================================
  // FORMAT ZONE
  // =====================================================

  const formatZone = (zone: Zone) => {
    if (zone === "INSIDE_VALLEY") {
      return "Inside Valley";
    }

    return "Outside Valley";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="mx-auto max-w-7xl text-black">
      {/* HEADER */}
      <div>
        <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
          Delivery Management
        </h1>

        <p className="mt-1 text-sm text-ink/50">
          Manage locations, delivery types and
          shipping rates.
        </p>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* ERROR */}
      {error && !modal && (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* =================================================
          LOCATIONS
      ================================================== */}

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Locations
              </h2>

              <p className="text-sm text-ink/50">
                Manage delivery locations and zones.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateLocation}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          {locations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 py-10 text-center text-sm text-ink/40">
              No locations found.
            </div>
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink/40">
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Zone</th>
                  <th className="pb-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {locations.map((location) => (
                  <tr
                    key={location.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="py-4 font-semibold">
                      {location.name}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          location.zone ===
                          "INSIDE_VALLEY"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {formatZone(
                          location.zone
                        )}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditLocation(
                              location
                            )
                          }
                          className="rounded-lg p-2 text-ink/50 transition hover:bg-black/5 hover:text-ink"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            deleteLocation(
                              location.id
                            )
                          }
                          className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* =================================================
          DELIVERY TYPES
      ================================================== */}

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Delivery Types
              </h2>

              <p className="text-sm text-ink/50">
                Manage available delivery services.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateDeliveryType}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            <Plus className="h-4 w-4" />
            Add Delivery Type
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          {deliveryTypes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 py-10 text-center text-sm text-ink/40">
              No delivery types found.
            </div>
          ) : (
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink/40">
                  <th className="pb-3">
                    Delivery Type
                  </th>

                  <th className="pb-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {deliveryTypes.map(
                  (deliveryType) => (
                    <tr
                      key={deliveryType.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-4 font-semibold">
                        {deliveryType.name}
                      </td>

                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditDeliveryType(
                                deliveryType
                              )
                            }
                            className="rounded-lg p-2 text-ink/50 transition hover:bg-black/5 hover:text-ink"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              deleteDeliveryType(
                                deliveryType.id
                              )
                            }
                            className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* =================================================
          RATES
      ================================================== */}

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Location Rates
              </h2>

              <p className="text-sm text-ink/50">
                Set shipping prices by location and
                delivery type.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateRate}
            disabled={
              locations.length === 0 ||
              deliveryTypes.length === 0
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Rate
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          {rates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 py-10 text-center text-sm text-ink/40">
              No rates found.
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink/40">
                  <th className="pb-3">
                    Location
                  </th>

                  <th className="pb-3">
                    Delivery Type
                  </th>

                  <th className="pb-3">
                    Zone
                  </th>

                  <th className="pb-3">
                    Price
                  </th>

                  <th className="pb-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {rates.map((rate) => {
                  const location =
                    rate.location ||
                    locations.find(
                      (l) =>
                        l.id === rate.locationId
                    );

                  const deliveryType =
                    rate.deliveryType ||
                    deliveryTypes.find(
                      (d) =>
                        d.id ===
                        rate.deliveryTypeId
                    );

                  return (
                    <tr
                      key={rate.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-4 font-semibold">
                        {location?.name ||
                          "Unknown"}
                      </td>

                      <td className="py-4 text-ink/60">
                        {deliveryType?.name ||
                          "Unknown"}
                      </td>

                      <td className="py-4">
                        {location ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              location.zone ===
                              "INSIDE_VALLEY"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {formatZone(
                              location.zone
                            )}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="py-4 font-semibold">
                        Rs.{" "}
                        {Number(
                          rate.price
                        ).toLocaleString()}
                      </td>

                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditRate(
                                rate
                              )
                            }
                            className="rounded-lg p-2 text-ink/50 transition hover:bg-black/5 hover:text-ink"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              deleteRate(
                                rate.id
                              )
                            }
                            className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* =================================================
          MODAL
      ================================================== */}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {modal === "location" &&
                    (editingLocation
                      ? "Edit Location"
                      : "Add Location")}

                  {modal === "deliveryType" &&
                    (editingDeliveryType
                      ? "Edit Delivery Type"
                      : "Add Delivery Type")}

                  {modal === "rate" &&
                    (editingRate
                      ? "Edit Rate"
                      : "Add Rate")}
                </h3>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-ink/40 transition hover:bg-black/5 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-5">
              {/* MODAL ERROR */}

              {error && (
                <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {error}
                </div>
              )}

              {/* LOCATION FORM */}

              {modal === "location" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Location Name
                    </label>

                    <input
                      value={locationName}
                      onChange={(e) =>
                        setLocationName(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Kathmandu"
                      className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Delivery Zone
                    </label>

                    <select
                      value={locationZone}
                      onChange={(e) =>
                        setLocationZone(
                          e.target.value as Zone
                        )
                      }
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                    >
                      <option value="INSIDE_VALLEY">
                        Inside Valley
                      </option>

                      <option value="OUTSIDE_VALLEY">
                        Outside Valley
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* DELIVERY TYPE FORM */}

              {modal === "deliveryType" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Delivery Type Name
                  </label>

                  <input
                    value={deliveryTypeName}
                    onChange={(e) =>
                      setDeliveryTypeName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Same Day"
                    className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                  />
                </div>
              )}

              {/* RATE FORM */}

              {modal === "rate" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Location
                    </label>

                    <select
                      value={rateLocationId}
                      onChange={(e) =>
                        setRateLocationId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
                    >
                      <option value="">
                        Select location
                      </option>

                      {locations.map(
                        (location) => (
                          <option
                            key={location.id}
                            value={location.id}
                          >
                            {location.name} —{" "}
                            {formatZone(
                              location.zone
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Delivery Type
                    </label>

                    <select
                      value={
                        rateDeliveryTypeId
                      }
                      onChange={(e) =>
                        setRateDeliveryTypeId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
                    >
                      <option value="">
                        Select delivery type
                      </option>

                      {deliveryTypes.map(
                        (deliveryType) => (
                          <option
                            key={
                              deliveryType.id
                            }
                            value={
                              deliveryType.id
                            }
                          >
                            {
                              deliveryType.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Price
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/40">
                        Rs.
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ratePrice}
                        onChange={(e) =>
                          setRatePrice(
                            e.target.value
                          )
                        }
                        placeholder="150"
                        className="w-full rounded-lg border border-black/10 px-3 py-2.5 pl-11 text-sm outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-black/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (
                      modal === "location"
                    ) {
                      saveLocation();
                    }

                    if (
                      modal ===
                      "deliveryType"
                    ) {
                      saveDeliveryType();
                    }

                    if (modal === "rate") {
                      saveRate();
                    }
                  }}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingLocation ||
                      editingDeliveryType ||
                      editingRate
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

