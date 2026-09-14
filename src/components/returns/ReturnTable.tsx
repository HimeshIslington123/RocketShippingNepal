"use client";

import {
  ReturnRequest,
  ReturnStatus,
} from "@/components/shipments/types";

type ReturnTableProps = {
  returns: ReturnRequest[];

  loading?: boolean;

  error?: string;

  onRefresh?: () => void | Promise<void>;

  onOpenReturn: (
    returnRequest: ReturnRequest
  ) => void | Promise<void>;
};

// ============================================================
// STATUS
// ============================================================

function formatStatus(status?: string | null) {
  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

// ============================================================
// SKELETON
// ============================================================

function TableSkeleton() {
  return (
    <div className="overflow-hidden bg-white">
      {/* DESKTOP */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-[#edf0f3] bg-[#fafbfc]">
              {Array.from({
                length: 7,
              }).map((_, index) => (
                <th
                  key={index}
                  className="px-5 py-4"
                >
                  <div className="h-3 w-20 animate-pulse rounded bg-[#e9edf1]" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({
              length: 6,
            }).map((_, row) => (
              <tr
                key={row}
                className="border-b border-[#edf0f3] last:border-0"
              >
                {Array.from({
                  length: 7,
                }).map((_, column) => (
                  <td
                    key={column}
                    className="px-5 py-5"
                  >
                    <div
                      className={`h-4 animate-pulse rounded bg-[#f0f2f4] ${
                        column === 0
                          ? "w-32"
                          : "w-24"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}

      <div className="space-y-3 p-4 lg:hidden">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#edf0f3] p-4"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-[#f0f2f4]" />

            <div className="mt-3 h-3 w-48 animate-pulse rounded bg-[#f0f2f4]" />

            <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-[#f0f2f4]" />

            <div className="mt-4 space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-[#f0f2f4]" />

              <div className="h-3 w-4/5 animate-pulse rounded bg-[#f0f2f4]" />

              <div className="h-3 w-3/5 animate-pulse rounded bg-[#f0f2f4]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({
  error,
  onRefresh,
}: {
  error: string;
  onRefresh?: () => void | Promise<void>;
}) {
  return (
    <div className="px-5 py-12 sm:px-6">
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-[#fff8f7] px-6 py-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1ef]">
          <span className="text-lg font-bold text-[#e23c2e]">
            !
          </span>
        </div>

        <h3 className="mt-4 text-base font-bold text-[#0b1729]">
          Unable to load returns
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-[#64748b]">
          {error}
        </p>

        {onRefresh && (
          <button
            type="button"
            onClick={() => onRefresh()}
            className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[#0b1729] px-4 text-sm font-semibold text-white transition hover:bg-[#17263b]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EMPTY
// ============================================================

function EmptyState() {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1ef] text-xl text-[#e23c2e]">
        ↩
      </div>

      <h3 className="mt-4 text-base font-bold text-[#0b1729]">
        No return requests found
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#64748b]">
        Return requests will appear here when
        vendors create return requests for
        delivered shipments.
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
  error = "",
  onRefresh,
  onOpenReturn,
}: ReturnTableProps) {
  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return <TableSkeleton />;
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && returns.length === 0) {
    return (
      <ErrorState
        error={error}
        onRefresh={onRefresh}
      />
    );
  }

  // ==========================================================
  // EMPTY
  // ==========================================================

  if (!returns.length) {
    return <EmptyState />;
  }

  // ==========================================================
  // TABLE
  // ==========================================================

  return (
    <div className="overflow-hidden bg-white">

      {/* ================================================== */}
      {/* BACKGROUND REFRESH ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="border-b border-red-200 bg-[#fff8f7] px-5 py-3.5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0b1729]">
                Refresh failed
              </p>

              <p className="mt-0.5 text-xs text-[#64748b]">
                Showing the previously loaded
                return data.
              </p>
            </div>

            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-semibold text-[#0b1729] transition hover:border-[#0b1729] hover:bg-[#f8fafc]"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* DESKTOP TABLE */}
      {/* ================================================== */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px]">

          {/* HEADER */}

          <thead>
            <tr className="border-b border-[#edf0f3] bg-[#fafbfc] text-left">

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Shipment
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Receiver
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Vendor
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Reason
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Status
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Requested
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Action
              </th>
            </tr>
          </thead>

          {/* BODY */}

          <tbody>
            {returns.map((item) => {
              const shipment =
                item.shipment;

              return (
                <tr
                  key={item.id}
                  className="border-b border-[#edf0f3] transition last:border-0 hover:bg-[#fafbfc]"
                >

                  {/* ====================================== */}
                  {/* SHIPMENT */}
                  {/* ====================================== */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#0b1729]">
                        {shipment?.trackingNumber ||
                          "-"}
                      </p>

                      <p className="mt-1 text-xs text-[#94a3b8]">
                        ID:{" "}
                        {item.shipmentId ||
                          "-"}
                      </p>
                    </div>
                  </td>

                  {/* ====================================== */}
                  {/* RECEIVER */}
                  {/* ====================================== */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-[#334155]">
                        {shipment?.receiverName ||
                          "-"}
                      </p>

                      {shipment?.receiverPhone && (
                        <p className="mt-1 text-xs text-[#94a3b8]">
                          {
                            shipment.receiverPhone
                          }
                        </p>
                      )}
                    </div>
                  </td>

                  {/* ====================================== */}
                  {/* VENDOR */}
                  {/* ====================================== */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-[#334155]">
                        {shipment?.vendor
                          ?.companyName ||
                          shipment?.vendor
                            ?.name ||
                          "-"}
                      </p>

                      {shipment?.vendor
                        ?.location && (
                        <p className="mt-1 text-xs text-[#94a3b8]">
                          {
                            shipment.vendor
                              .location
                          }
                        </p>
                      )}
                    </div>
                  </td>

                  {/* ====================================== */}
                  {/* REASON */}
                  {/* ====================================== */}

                  <td className="px-5 py-4">
                    <p className="max-w-[180px] text-sm text-[#475569]">
                      {formatReason(
                        item.reason
                      )}
                    </p>
                  </td>

                  {/* ====================================== */}
                  {/* STATUS */}
                  {/* ====================================== */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {formatStatus(
                        item.status
                      )}
                    </span>
                  </td>

                  {/* ====================================== */}
                  {/* DATE */}
                  {/* ====================================== */}

                  <td className="px-5 py-4">
                    <p className="text-sm text-[#64748b]">
                      {formatDate(
                        item.requestedAt
                      )}
                    </p>
                  </td>

                  {/* ====================================== */}
                  {/* ACTION */}
                  {/* ====================================== */}

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenReturn(
                          item
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 py-2 text-sm font-semibold text-[#0b1729] transition hover:border-[#e23c2e]/30 hover:bg-[#fff1ef] hover:text-[#e23c2e]"
                    >
                      View

                      <span aria-hidden="true">
                        →
                      </span>
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
          const shipment =
            item.shipment;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#edf0f3] bg-white p-4 transition hover:border-[#dfe3e8]"
            >

              {/* ========================================== */}
              {/* TOP */}
              {/* ========================================== */}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">

                  <p className="truncate font-bold text-[#0b1729]">
                    {shipment?.trackingNumber ||
                      "-"}
                  </p>

                  <p className="mt-1 text-xs text-[#94a3b8]">
                    {formatDate(
                      item.requestedAt
                    )}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                    item.status
                  )}`}
                >
                  {formatStatus(
                    item.status
                  )}
                </span>
              </div>

              {/* ========================================== */}
              {/* DETAILS */}
              {/* ========================================== */}

              <div className="mt-4 space-y-3">

                <MobileInfo
                  label="Receiver"
                  value={
                    shipment?.receiverName
                  }
                />

                <MobileInfo
                  label="Phone"
                  value={
                    shipment?.receiverPhone
                  }
                />

                <MobileInfo
                  label="Vendor"
                  value={
                    shipment?.vendor
                      ?.companyName ||
                    shipment?.vendor
                      ?.name
                  }
                />

                <MobileInfo
                  label="Reason"
                  value={formatReason(
                    item.reason
                  )}
                />
              </div>

              {/* ========================================== */}
              {/* ACTION */}
              {/* ========================================== */}

              <button
                type="button"
                onClick={() =>
                  onOpenReturn(item)
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1729] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14253d]"
              >
                View Return

                <span aria-hidden="true">
                  →
                </span>
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
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-[#475569]">
        {value || "-"}
      </span>
    </div>
  );
}