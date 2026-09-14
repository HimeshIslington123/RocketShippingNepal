"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Truck,
  DollarSign,
  X,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Map as MapIcon,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

type ModalType = "location" | "deliveryType" | "rate" | null;

type LocationFilter = "ALL" | Zone;

const PAGE_SIZE = 8;

/* =========================================================
   CACHE
========================================================= */

interface PageCache {
  locations: Location[];
  deliveryTypes: DeliveryType[];
  rates: LocationRate[];
}

let pageCache: PageCache | null = null;
let pageRequest: Promise<PageCache> | null = null;

/* =========================================================
   FETCH DATA
========================================================= */

async function fetchAllData(
  force = false
): Promise<PageCache> {
  if (!force && pageCache) {
    return pageCache;
  }

  if (pageRequest) {
    return pageRequest;
  }

  const request = (async () => {
    const [
      locationsResponse,
      deliveryTypesResponse,
      ratesResponse,
    ] = await Promise.all([
      fetch(`${API_URL}/api/location`, {
        cache: "no-store",
      }),

      fetch(`${API_URL}/api/deliveryType`, {
        cache: "no-store",
      }),

      fetch(`${API_URL}/api/locationRate`, {
        cache: "no-store",
      }),
    ]);

    if (!locationsResponse.ok) {
      throw new Error("Failed to load locations");
    }

    if (!deliveryTypesResponse.ok) {
      throw new Error("Failed to load delivery types");
    }

    if (!ratesResponse.ok) {
      throw new Error("Failed to load location rates");
    }

    const [
      locationsData,
      deliveryTypesData,
      ratesData,
    ] = await Promise.all([
      locationsResponse.json(),
      deliveryTypesResponse.json(),
      ratesResponse.json(),
    ]);

    const result: PageCache = {
      locations: Array.isArray(locationsData)
        ? locationsData
        : [],

      deliveryTypes: Array.isArray(
        deliveryTypesData
      )
        ? deliveryTypesData
        : [],

      rates: Array.isArray(ratesData)
        ? ratesData
        : [],
    };

    pageCache = result;

    return result;
  })();

  pageRequest = request;

  try {
    return await request;
  } finally {
    if (pageRequest === request) {
      pageRequest = null;
    }
  }
}

/* =========================================================
   SHIMMER
========================================================= */

function Shimmer({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`management-shimmer rounded-lg ${className}`}
    />
  );
}

/* =========================================================
   PAGE SKELETON
========================================================= */

function PageSkeleton() {
  return (
    <>
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-black/5 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Shimmer className="h-8 w-60" />

            <Shimmer className="mt-3 h-4 w-80 max-w-full" />
          </div>

          <Shimmer className="h-10 w-28" />
        </div>

        {/* SUMMARY */}

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-black/5 bg-white p-4"
              >
                <Shimmer className="h-9 w-9 rounded-lg" />

                <Shimmer className="mt-4 h-3 w-24" />

                <Shimmer className="mt-2 h-7 w-16" />
              </div>
            )
          )}
        </div>

        {/* CONTENT */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 3 }).map(
            (_, sectionIndex) => (
              <div
                key={sectionIndex}
                className={`overflow-hidden rounded-2xl border border-black/5 bg-white ${
                  sectionIndex === 2
                    ? "xl:col-span-2"
                    : ""
                }`}
              >
                <div className="border-b border-black/5 p-5">
                  <div className="flex justify-between">
                    <div>
                      <Shimmer className="h-5 w-32" />

                      <Shimmer className="mt-2 h-3 w-48" />
                    </div>

                    <Shimmer className="h-9 w-24" />
                  </div>

                  <Shimmer className="mt-5 h-10 w-full" />
                </div>

                <div className="space-y-4 p-5">
                  {Array.from({
                    length: 5,
                  }).map(
                    (_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="flex items-center justify-between border-b border-black/5 pb-4"
                      >
                        <div>
                          <Shimmer className="h-4 w-36" />

                          <Shimmer className="mt-2 h-3 w-24" />
                        </div>

                        <Shimmer className="h-8 w-16" />
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes management-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .management-shimmer {
          background: linear-gradient(
            90deg,
            #eceef1 0%,
            #fafafa 45%,
            #eceef1 100%
          );
          background-size: 200% 100%;
          animation: management-shimmer 1.35s ease-in-out
            infinite;
        }
      `}</style>
    </>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[0.035] text-black/35">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-3 text-sm font-semibold text-black/60">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-black/35">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-black/5 px-4 py-3">
      <p className="text-xs text-black/40">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({
          length: totalPages,
        }).map((_, index) => {
          const pageNumber = index + 1;

          if (
            totalPages > 7 &&
            pageNumber > 2 &&
            pageNumber < totalPages - 1 &&
            Math.abs(pageNumber - page) > 1
          ) {
            if (
              pageNumber === 3 ||
              pageNumber === totalPages - 2
            ) {
              return (
                <span
                  key={pageNumber}
                  className="px-1 text-xs text-black/30"
                >
                  ...
                </span>
              );
            }

            return null;
          }

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() =>
                onPageChange(pageNumber)
              }
              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                page === pageNumber
                  ? "bg-[#0b1729] text-white"
                  : "text-black/50 hover:bg-black/5"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function LocationManagementPage() {
  /* =======================================================
     DATA
  ======================================================= */

  const [locations, setLocations] = useState<
    Location[]
  >(pageCache?.locations ?? []);

  const [deliveryTypes, setDeliveryTypes] =
    useState<DeliveryType[]>(
      pageCache?.deliveryTypes ?? []
    );

  const [rates, setRates] = useState<
    LocationRate[]
  >(pageCache?.rates ?? []);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(
    pageCache === null
  );

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] = useState(false);

  /* =======================================================
     MODAL
  ======================================================= */

  const [modal, setModal] =
    useState<ModalType>(null);

  const [editingLocation, setEditingLocation] =
    useState<Location | null>(null);

  const [
    editingDeliveryType,
    setEditingDeliveryType,
  ] = useState<DeliveryType | null>(null);

  const [editingRate, setEditingRate] =
    useState<LocationRate | null>(null);

  /* =======================================================
     FORMS
  ======================================================= */

  const [locationName, setLocationName] =
    useState("");

  const [locationZone, setLocationZone] =
    useState<Zone>("INSIDE_VALLEY");

  const [deliveryTypeName, setDeliveryTypeName] =
    useState("");

  const [rateLocationId, setRateLocationId] =
    useState("");

  const [
    rateDeliveryTypeId,
    setRateDeliveryTypeId,
  ] = useState("");

  const [ratePrice, setRatePrice] =
    useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [locationSearch, setLocationSearch] =
    useState("");

  const [locationFilter, setLocationFilter] =
    useState<LocationFilter>("ALL");

  const [deliverySearch, setDeliverySearch] =
    useState("");

  const [rateSearch, setRateSearch] =
    useState("");

  const [rateZoneFilter, setRateZoneFilter] =
    useState<LocationFilter>("ALL");

  const [
    rateDeliveryFilter,
    setRateDeliveryFilter,
  ] = useState("ALL");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [locationPage, setLocationPage] =
    useState(1);

  const [deliveryPage, setDeliveryPage] =
    useState(1);

  const [ratePage, setRatePage] = useState(1);

  /* =======================================================
     MESSAGES
  ======================================================= */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  const loadAll = useCallback(
    async (force = false) => {
      try {
        if (force) {
          setRefreshing(true);
        } else if (!pageCache) {
          setLoading(true);
        }

        setError("");

        const data = await fetchAllData(force);

        setLocations(data.locations);
        setDeliveryTypes(data.deliveryTypes);
        setRates(data.rates);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load data"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAll(false);
  }, [loadAll]);

  /* =======================================================
     SUCCESS
  ======================================================= */

  const showSuccess = (
    message: string
  ) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

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
    setSaving(false);
  };

  /* =======================================================
     LOCATION
  ======================================================= */

  const openCreateLocation = () => {
    setEditingLocation(null);
    setLocationName("");
    setLocationZone("INSIDE_VALLEY");
    setError("");
    setModal("location");
  };

  const openEditLocation = (
    location: Location
  ) => {
    setEditingLocation(location);
    setLocationName(location.name);
    setLocationZone(location.zone);
    setError("");
    setModal("location");
  };

  /* =======================================================
     SAVE LOCATION
  ======================================================= */

  const saveLocation = async () => {
    if (!locationName.trim()) {
      setError("Location name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const editing = Boolean(
        editingLocation
      );

      const url = editing
        ? `${API_URL}/api/location/${editingLocation!.id}`
        : `${API_URL}/api/location`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
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
          data.message ||
            "Failed to save location"
        );
      }

      closeModal();

      pageCache = null;

      await loadAll(true);

      showSuccess(
        editing
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

  /* =======================================================
     DELETE LOCATION
  ======================================================= */

  const deleteLocation = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this location?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/location/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete location"
        );
      }

      pageCache = null;

      await loadAll(true);

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

  /* =======================================================
     DELIVERY TYPE
  ======================================================= */

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
    setDeliveryTypeName(
      deliveryType.name
    );
    setError("");
    setModal("deliveryType");
  };

  /* =======================================================
     SAVE DELIVERY TYPE
  ======================================================= */

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

      const editing = Boolean(
        editingDeliveryType
      );

      const url = editing
        ? `${API_URL}/api/deliveryType/${editingDeliveryType!.id}`
        : `${API_URL}/api/deliveryType`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
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

      pageCache = null;

      await loadAll(true);

      showSuccess(
        editing
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

  /* =======================================================
     DELETE DELIVERY TYPE
  ======================================================= */

  const deleteDeliveryType = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery type?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deliveryType/${id}`,
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

      pageCache = null;

      await loadAll(true);

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

  /* =======================================================
     RATE
  ======================================================= */

  const openCreateRate = () => {
    setEditingRate(null);

    setRateLocationId(
      locations.length
        ? String(locations[0].id)
        : ""
    );

    setRateDeliveryTypeId(
      deliveryTypes.length
        ? String(deliveryTypes[0].id)
        : ""
    );

    setRatePrice("");
    setError("");
    setModal("rate");
  };

  const openEditRate = (
    rate: LocationRate
  ) => {
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

  /* =======================================================
     SAVE RATE
  ======================================================= */

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
      Number.isNaN(Number(ratePrice)) ||
      Number(ratePrice) < 0
    ) {
      setError("Valid price is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const editing = Boolean(
        editingRate
      );

      const url = editing
        ? `${API_URL}/api/locationRate/${editingRate!.id}`
        : `${API_URL}/api/locationRate`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: Number(
            rateLocationId
          ),
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

      pageCache = null;

      await loadAll(true);

      showSuccess(
        editing
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

  /* =======================================================
     DELETE RATE
  ======================================================= */

  const deleteRate = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rate?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/locationRate/${id}`,
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

      pageCache = null;

      await loadAll(true);

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

  /* =======================================================
     FORMAT ZONE
  ======================================================= */

  const formatZone = (zone: Zone) => {
    return zone === "INSIDE_VALLEY"
      ? "Inside Valley"
      : "Outside Valley";
  };

  /* =======================================================
     LOOKUP MAPS
     
     IMPORTANT:
     Native JS Map is used here.
     Lucide Map icon is imported as MapIcon.
  ======================================================= */

  const locationMap = useMemo(() => {
    return new Map<
      number,
      Location
    >(
      locations.map((location) => [
        location.id,
        location,
      ])
    );
  }, [locations]);

  const deliveryTypeMap = useMemo(() => {
    return new Map<
      number,
      DeliveryType
    >(
      deliveryTypes.map((deliveryType) => [
        deliveryType.id,
        deliveryType,
      ])
    );
  }, [deliveryTypes]);

  /* =======================================================
     LOCATION FILTER
  ======================================================= */

  const filteredLocations = useMemo(() => {
    const search =
      locationSearch
        .trim()
        .toLowerCase();

    return locations.filter((location) => {
      const matchesSearch =
        !search ||
        location.name
          .toLowerCase()
          .includes(search);

      const matchesZone =
        locationFilter === "ALL" ||
        location.zone === locationFilter;

      return (
        matchesSearch &&
        matchesZone
      );
    });
  }, [
    locations,
    locationSearch,
    locationFilter,
  ]);

  const locationTotalPages = Math.max(
    1,
    Math.ceil(
      filteredLocations.length /
        PAGE_SIZE
    )
  );

  const paginatedLocations =
    filteredLocations.slice(
      (locationPage - 1) * PAGE_SIZE,
      locationPage * PAGE_SIZE
    );

  /* =======================================================
     DELIVERY FILTER
  ======================================================= */

  const filteredDeliveryTypes =
    useMemo(() => {
      const search =
        deliverySearch
          .trim()
          .toLowerCase();

      return deliveryTypes.filter(
        (deliveryType) =>
          !search ||
          deliveryType.name
            .toLowerCase()
            .includes(search)
      );
    }, [
      deliveryTypes,
      deliverySearch,
    ]);

  const deliveryTotalPages = Math.max(
    1,
    Math.ceil(
      filteredDeliveryTypes.length /
        PAGE_SIZE
    )
  );

  const paginatedDeliveryTypes =
    filteredDeliveryTypes.slice(
      (deliveryPage - 1) * PAGE_SIZE,
      deliveryPage * PAGE_SIZE
    );

  /* =======================================================
     RATE FILTER
  ======================================================= */

  const filteredRates = useMemo(() => {
    const search =
      rateSearch
        .trim()
        .toLowerCase();

    return rates.filter((rate) => {
      const location =
        locationMap.get(
          rate.locationId
        );

      const deliveryType =
        deliveryTypeMap.get(
          rate.deliveryTypeId
        );

      const matchesSearch =
        !search ||
        location?.name
          .toLowerCase()
          .includes(search) ||
        deliveryType?.name
          .toLowerCase()
          .includes(search);

      const matchesZone =
        rateZoneFilter === "ALL" ||
        location?.zone ===
          rateZoneFilter;

      const matchesDelivery =
        rateDeliveryFilter === "ALL" ||
        String(
          rate.deliveryTypeId
        ) === rateDeliveryFilter;

      return (
        matchesSearch &&
        matchesZone &&
        matchesDelivery
      );
    });
  }, [
    rates,
    rateSearch,
    rateZoneFilter,
    rateDeliveryFilter,
    locationMap,
    deliveryTypeMap,
  ]);

  const rateTotalPages = Math.max(
    1,
    Math.ceil(
      filteredRates.length /
        PAGE_SIZE
    )
  );

  const paginatedRates =
    filteredRates.slice(
      (ratePage - 1) * PAGE_SIZE,
      ratePage * PAGE_SIZE
    );

  /* =======================================================
     SUMMARY
  ======================================================= */

  const insideValleyCount =
    locations.filter(
      (location) =>
        location.zone ===
        "INSIDE_VALLEY"
    ).length;

  const outsideValleyCount =
    locations.filter(
      (location) =>
        location.zone ===
        "OUTSIDE_VALLEY"
    ).length;

  /* =======================================================
     RESET PAGINATION
  ======================================================= */

  useEffect(() => {
    setLocationPage(1);
  }, [
    locationSearch,
    locationFilter,
  ]);

  useEffect(() => {
    setDeliveryPage(1);
  }, [deliverySearch]);

  useEffect(() => {
    setRatePage(1);
  }, [
    rateSearch,
    rateZoneFilter,
    rateDeliveryFilter,
  ]);

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (
    loading &&
    locations.length === 0 &&
    deliveryTypes.length === 0 &&
    rates.length === 0
  ) {
    return <PageSkeleton />;
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="mx-auto max-w-[1500px] text-[#0b1729]">
      {/* ===================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Delivery Management
            </h1>

            {refreshing && (
              <RefreshCw className="h-4 w-4 animate-spin text-[#E23C2E]" />
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
            Manage delivery locations,
            services and shipping rates
            from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            pageCache = null;
            loadAll(true);
          }}
          disabled={refreshing}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-black/65 transition hover:border-black/20 hover:bg-black/[0.025] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ===================================================
          SUCCESS
      ================================================== */}

      {success && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {/* ===================================================
          ERROR
      ================================================== */}

      {error && !modal && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================
          SUMMARY
      ================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {/* TOTAL LOCATIONS */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1729]/[0.045] text-[#0b1729]/60">
              <MapPin className="h-4 w-4" />
            </div>

            <span className="text-xs text-black/35">
              Total
            </span>
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Locations
          </p>

          <p className="mt-1 text-2xl font-bold">
            {locations.length}
          </p>
        </div>

        {/* INSIDE VALLEY */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <MapIcon className="h-4 w-4" />
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Inside Valley
          </p>

          <p className="mt-1 text-2xl font-bold">
            {insideValleyCount}
          </p>
        </div>

        {/* OUTSIDE VALLEY */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <MapIcon className="h-4 w-4" />
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Outside Valley
          </p>

          <p className="mt-1 text-2xl font-bold">
            {outsideValleyCount}
          </p>
        </div>

        {/* DELIVERY TYPES */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Truck className="h-4 w-4" />
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Delivery Types
          </p>

          <p className="mt-1 text-2xl font-bold">
            {deliveryTypes.length}
          </p>
        </div>

        {/* RATES */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-[#E23C2E]">
            <CircleDollarSign className="h-4 w-4" />
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Location Rates
          </p>

          <p className="mt-1 text-2xl font-bold">
            {rates.length}
          </p>
        </div>
      </div>

      {/* ===================================================
          CONTENT
      ================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* =================================================
            LOCATIONS
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-black/5 bg-white">
          {/* HEADER */}

          <div className="border-b border-black/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1729]/[0.045] text-[#0b1729]/65">
                  <MapPin className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-base font-bold">
                    Locations
                  </h2>

                  <p className="mt-0.5 text-xs text-black/40">
                    {filteredLocations.length}{" "}
                    matching locations
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  openCreateLocation
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-[#E23C2E] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#CE3122]"
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            </div>

            {/* SEARCH */}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                <input
                  value={locationSearch}
                  onChange={(e) =>
                    setLocationSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search locations..."
                  className="h-10 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/50 focus:ring-2 focus:ring-[#E23C2E]/10"
                />
              </div>

              <div className="relative sm:w-44">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                <select
                  value={locationFilter}
                  onChange={(e) =>
                    setLocationFilter(
                      e.target.value as LocationFilter
                    )
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#E23C2E]/50"
                >
                  <option value="ALL">
                    All zones
                  </option>

                  <option value="INSIDE_VALLEY">
                    Inside Valley
                  </option>

                  <option value="OUTSIDE_VALLEY">
                    Outside Valley
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* LOCATION TABLE */}

          {filteredLocations.length ===
          0 ? (
            <EmptyState
              icon={MapPin}
              title="No locations found"
              description="Try changing your search or zone filter."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-black/5 bg-black/[0.012] text-[11px] font-semibold uppercase tracking-wider text-black/35">
                      <th className="px-5 py-3">
                        Location
                      </th>

                      <th className="px-5 py-3">
                        Zone
                      </th>

                      <th className="px-5 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLocations.map(
                      (location) => (
                        <tr
                          key={location.id}
                          className="border-b border-black/5 transition last:border-0 hover:bg-black/[0.012]"
                        >
                          <td className="px-5 py-3.5">
                            <div className="text-sm font-semibold">
                              {location.name}
                            </div>

                            <div className="mt-0.5 text-[11px] text-black/35">
                              ID #{location.id}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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

                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditLocation(
                                    location
                                  )
                                }
                                className="rounded-lg p-2 text-black/35 transition hover:bg-black/5 hover:text-black/70"
                                title="Edit location"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteLocation(
                                    location.id
                                  )
                                }
                                className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                                title="Delete location"
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
              </div>

              <Pagination
                page={locationPage}
                totalPages={
                  locationTotalPages
                }
                onPageChange={
                  setLocationPage
                }
              />
            </>
          )}
        </section>

        {/* =================================================
            DELIVERY TYPES
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-black/5 bg-white">
          <div className="border-b border-black/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Truck className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-base font-bold">
                    Delivery Types
                  </h2>

                  <p className="mt-0.5 text-xs text-black/40">
                    {
                      filteredDeliveryTypes.length
                    }{" "}
                    matching services
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  openCreateDeliveryType
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-[#E23C2E] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#CE3122]"
              >
                <Plus className="h-4 w-4" />
                Add Type
              </button>
            </div>

            <div className="mt-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                <input
                  value={deliverySearch}
                  onChange={(e) =>
                    setDeliverySearch(
                      e.target.value
                    )
                  }
                  placeholder="Search delivery types..."
                  className="h-10 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/50 focus:ring-2 focus:ring-[#E23C2E]/10"
                />
              </div>
            </div>
          </div>

          {filteredDeliveryTypes.length ===
          0 ? (
            <EmptyState
              icon={Truck}
              title="No delivery types found"
              description="Add a delivery type or change your search."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left">
                  <thead>
                    <tr className="border-b border-black/5 bg-black/[0.012] text-[11px] font-semibold uppercase tracking-wider text-black/35">
                      <th className="px-5 py-3">
                        Delivery Type
                      </th>

                      <th className="px-5 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedDeliveryTypes.map(
                      (deliveryType) => (
                        <tr
                          key={
                            deliveryType.id
                          }
                          className="border-b border-black/5 transition last:border-0 hover:bg-black/[0.012]"
                        >
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold">
                              {
                                deliveryType.name
                              }
                            </div>

                            <div className="mt-0.5 text-[11px] text-black/35">
                              ID #
                              {
                                deliveryType.id
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditDeliveryType(
                                    deliveryType
                                  )
                                }
                                className="rounded-lg p-2 text-black/35 transition hover:bg-black/5 hover:text-black/70"
                                title="Edit delivery type"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteDeliveryType(
                                    deliveryType.id
                                  )
                                }
                                className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                                title="Delete delivery type"
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
              </div>

              <Pagination
                page={deliveryPage}
                totalPages={
                  deliveryTotalPages
                }
                onPageChange={
                  setDeliveryPage
                }
              />
            </>
          )}
        </section>

        {/* =================================================
            RATES
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-black/5 bg-white xl:col-span-2">
          <div className="border-b border-black/5 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-[#E23C2E]">
                  <DollarSign className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-base font-bold">
                    Location Rates
                  </h2>

                  <p className="mt-0.5 text-xs text-black/40">
                    {filteredRates.length}{" "}
                    matching rates
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openCreateRate}
                disabled={
                  locations.length === 0 ||
                  deliveryTypes.length === 0
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-[#E23C2E] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#CE3122] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add Rate
              </button>
            </div>

            {/* RATE SEARCH */}

            <div className="mt-5 grid gap-2 md:grid-cols-[1fr_180px_200px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                <input
                  value={rateSearch}
                  onChange={(e) =>
                    setRateSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search location or delivery type..."
                  className="h-10 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/50 focus:ring-2 focus:ring-[#E23C2E]/10"
                />
              </div>

              <select
                value={rateZoneFilter}
                onChange={(e) =>
                  setRateZoneFilter(
                    e.target.value as LocationFilter
                  )
                }
                className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#E23C2E]/50"
              >
                <option value="ALL">
                  All zones
                </option>

                <option value="INSIDE_VALLEY">
                  Inside Valley
                </option>

                <option value="OUTSIDE_VALLEY">
                  Outside Valley
                </option>
              </select>

              <select
                value={rateDeliveryFilter}
                onChange={(e) =>
                  setRateDeliveryFilter(
                    e.target.value
                  )
                }
                className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#E23C2E]/50"
              >
                <option value="ALL">
                  All delivery types
                </option>

                {deliveryTypes.map(
                  (deliveryType) => (
                    <option
                      key={deliveryType.id}
                      value={
                        deliveryType.id
                      }
                    >
                      {deliveryType.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {filteredRates.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No rates found"
              description="Try changing your filters or create a new shipping rate."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b border-black/5 bg-black/[0.012] text-[11px] font-semibold uppercase tracking-wider text-black/35">
                      <th className="px-5 py-3">
                        Location
                      </th>

                      <th className="px-5 py-3">
                        Delivery Type
                      </th>

                      <th className="px-5 py-3">
                        Zone
                      </th>

                      <th className="px-5 py-3">
                        Price
                      </th>

                      <th className="px-5 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRates.map(
                      (rate) => {
                        const location =
                          rate.location ||
                          locationMap.get(
                            rate.locationId
                          );

                        const deliveryType =
                          rate.deliveryType ||
                          deliveryTypeMap.get(
                            rate.deliveryTypeId
                          );

                        return (
                          <tr
                            key={rate.id}
                            className="border-b border-black/5 transition last:border-0 hover:bg-black/[0.012]"
                          >
                            <td className="px-5 py-4">
                              <div className="text-sm font-semibold">
                                {location?.name ||
                                  "Unknown"}
                              </div>

                              <div className="mt-0.5 text-[11px] text-black/35">
                                Location #
                                {
                                  rate.locationId
                                }
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-black/60">
                              {deliveryType?.name ||
                                "Unknown"}
                            </td>

                            <td className="px-5 py-4">
                              {location ? (
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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

                            <td className="px-5 py-4">
                              <span className="text-sm font-bold">
                                Rs.{" "}
                                {Number(
                                  rate.price
                                ).toLocaleString(
                                  "en-NP"
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditRate(
                                      rate
                                    )
                                  }
                                  className="rounded-lg p-2 text-black/35 transition hover:bg-black/5 hover:text-black/70"
                                  title="Edit rate"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteRate(
                                      rate.id
                                    )
                                  }
                                  className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                                  title="Delete rate"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={ratePage}
                totalPages={rateTotalPages}
                onPageChange={setRatePage}
              />
            </>
          )}
        </section>
      </div>

      {/* ===================================================
          MODAL
      ================================================== */}

      {modal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0b1729]/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-black/5 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold">
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
                      : "Add Location Rate")}
                </h3>

                <p className="mt-1 text-xs leading-5 text-black/40">
                  {modal === "location" &&
                    "Set the location name and delivery zone."}

                  {modal === "deliveryType" &&
                    "Create a delivery service customers can select."}

                  {modal === "rate" &&
                    "Set the shipping price for a location and service."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-black/35 transition hover:bg-black/5 hover:text-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BODY */}

            <div className="p-5">
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{error}</span>
                </div>
              )}

              {/* LOCATION */}

              {modal === "location" && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Location name
                    </label>

                    <input
                      autoFocus
                      value={locationName}
                      onChange={(event) =>
                        setLocationName(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          saveLocation();
                        }
                      }}
                      placeholder="e.g. Kathmandu"
                      className="h-11 w-full rounded-lg border border-black/10 px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Delivery zone
                    </label>

                    <select
                      value={locationZone}
                      onChange={(event) =>
                        setLocationZone(
                          event.target
                            .value as Zone
                        )
                      }
                      className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
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

              {/* DELIVERY TYPE */}

              {modal === "deliveryType" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Delivery type name
                  </label>

                  <input
                    autoFocus
                    value={deliveryTypeName}
                    onChange={(event) =>
                      setDeliveryTypeName(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        saveDeliveryType();
                      }
                    }}
                    placeholder="e.g. Express Delivery"
                    className="h-11 w-full rounded-lg border border-black/10 px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                  />
                </div>
              )}

              {/* RATE */}

              {modal === "rate" && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Location
                    </label>

                    <select
                      value={
                        rateLocationId
                      }
                      onChange={(event) =>
                        setRateLocationId(
                          event.target
                            .value
                        )
                      }
                      className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
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
                    <label className="mb-2 block text-sm font-semibold">
                      Delivery type
                    </label>

                    <select
                      value={
                        rateDeliveryTypeId
                      }
                      onChange={(event) =>
                        setRateDeliveryTypeId(
                          event.target
                            .value
                        )
                      }
                      className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
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
                    <label className="mb-2 block text-sm font-semibold">
                      Shipping price
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-black/35">
                        Rs.
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ratePrice}
                        onChange={(event) =>
                          setRatePrice(
                            event.target
                              .value
                          )
                        }
                        placeholder="150"
                        className="h-11 w-full rounded-lg border border-black/10 pl-10 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-7 flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-10 flex-1 rounded-lg border border-black/10 text-sm font-semibold text-black/55 transition hover:bg-black/[0.035] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (
                      modal === "location"
                    ) {
                      saveLocation();
                    } else if (
                      modal ===
                      "deliveryType"
                    ) {
                      saveDeliveryType();
                    } else if (
                      modal === "rate"
                    ) {
                      saveRate();
                    }
                  }}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#E23C2E] text-sm font-semibold text-white transition hover:bg-[#CE3122] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingLocation ||
                        editingDeliveryType ||
                        editingRate
                      ? "Save Changes"
                      : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          SHIMMER CSS
      ================================================== */}

      <style jsx global>{`
        @keyframes management-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .management-shimmer {
          background: linear-gradient(
            90deg,
            #eceef1 0%,
            #fafafa 45%,
            #eceef1 100%
          );
          background-size: 200% 100%;
          animation: management-shimmer 1.35s ease-in-out
            infinite;
        }
      `}</style>
    </div>
  );
}