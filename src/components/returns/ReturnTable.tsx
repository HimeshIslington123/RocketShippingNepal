"use client";

import {
  ReturnRequest,
  ReturnStatus,
} from "@/components/shipments/types";

type ReturnTableProps = {
  returns: ReturnRequest[];

  loading?: boolean;

  onView: (returnRequest: ReturnRequest) => void;
};

// ============================================================
// STATUS
// ============================================================

function formatStatus(status?: string | null) {
  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusStyle(status: ReturnStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "ASSIGNED_TO_RIDER":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "PICKED_UP_FROM_CUSTOMER":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "IN_WAREHOUSE":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "OUT_FOR_RETURN":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "RETURNED_TO_VENDOR":
      return "bg-green-50 text-green-700 border-green-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

// ============================================================
// REASON
// ============================================================

function formatReason(reason?: string | null) {
  if (!reason) return "-";

  return reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

// ============================================================
// DATE
// ============================================================

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================
// SKELETON
// ============================================================

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {Array.from({ length: 7 }).map((_, index) => (
                <th key={index} className="px-5 py-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 6 }).map((_, row) => (
              <tr
                key={row}
                className="border-b border-gray-100 last:border-0"
              >
                {Array.from({ length: 7 }).map(
                  (_, column) => (
                    <td key={column} className="px-5 py-5">
                      <div
                        className={`h-4 animate-pulse rounded bg-gray-100 ${
                          column === 0
                            ? "w-32"
                            : "w-24"
                        }`}
                      />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 lg:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-100 p-4"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />

            <div className="mt-3 h-3 w-48 animate-pulse rounded bg-gray-100" />

            <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// EMPTY
// ============================================================

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1ef] text-xl text-[#E23C2E]">
        ↩
      </div>

      <h3 className="mt-4 text-base font-bold text-[#0b1729]">
        No return requests found
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        Return requests will appear here when vendors create
        return requests for delivered shipments.
      </p>
    </div>
  );
}

// ============================================================
// MAIN TABLE
// ============================================================

export default function ReturnTable({
  returns,
  loading = false,
  onView,
}: ReturnTableProps) {
  if (loading) {
    return <TableSkeleton />;
  }

  if (!returns.length) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">

      {/* ================================================== */}
      {/* DESKTOP TABLE */}
      {/* ================================================== */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Shipment
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Receiver
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Vendor
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Reason
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Status
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Requested
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {returns.map((item) => {
              const shipment = item.shipment;

              return (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/60"
                >
                  {/* SHIPMENT */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#0b1729]">
                        {shipment?.trackingNumber || "-"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        ID: {item.shipmentId}
                      </p>
                    </div>
                  </td>

                  {/* RECEIVER */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {shipment?.receiverName || "-"}
                      </p>

                      {shipment?.receiverPhone && (
                        <p className="mt-1 text-xs text-gray-400">
                          {shipment.receiverPhone}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* VENDOR */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {shipment?.vendor?.companyName ||
                          shipment?.vendor?.name ||
                          "-"}
                      </p>

                      {shipment?.vendor?.location && (
                        <p className="mt-1 text-xs text-gray-400">
                          {shipment.vendor.location}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* REASON */}

                  <td className="px-5 py-4">
                    <p className="max-w-[160px] text-sm text-gray-700">
                      {formatReason(item.reason)}
                    </p>
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </td>

                  {/* DATE */}

                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-600">
                      {formatDate(item.requestedAt)}
                    </p>
                  </td>

                  {/* ACTION */}

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onView(item)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#0b1729] transition hover:border-[#E23C2E]/30 hover:bg-[#fff1ef] hover:text-[#E23C2E]"
                    >
                      View
                      <span aria-hidden="true">→</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================================================== */}
      {/* MOBILE */}
      {/* ================================================== */}

      <div className="space-y-3 p-4 lg:hidden">
        {returns.map((item) => {
          const shipment = item.shipment;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-100 p-4 transition hover:border-gray-200"
            >
              {/* TOP */}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#0b1729]">
                    {shipment?.trackingNumber || "-"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(item.requestedAt)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                    item.status
                  )}`}
                >
                  {formatStatus(item.status)}
                </span>
              </div>

              {/* DETAILS */}

              <div className="mt-4 space-y-3">
                <MobileInfo
                  label="Receiver"
                  value={shipment?.receiverName}
                />

                <MobileInfo
                  label="Phone"
                  value={shipment?.receiverPhone}
                />

                <MobileInfo
                  label="Vendor"
                  value={
                    shipment?.vendor?.companyName ||
                    shipment?.vendor?.name
                  }
                />

                <MobileInfo
                  label="Reason"
                  value={formatReason(item.reason)}
                />
              </div>

              {/* ACTION */}

              <button
                onClick={() => onView(item)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1729] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14253d]"
              >
                View Return
                <span aria-hidden="true">→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MOBILE INFO
// ============================================================

function MobileInfo({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-700">
        {value || "-"}
      </span>
    </div>
  );
}